#!/usr/bin/env python3
"""Build data/smoke.json for Smoke PDX.

This script IS the provenance. Deterministic, lives next to its output, and
every record it writes was fetched and counted. See SOURCES.md.

Three layers, all keyless, all fetched fresh:

  monitor    EPA AirNow hourly files -> NowCast PM2.5 -> US AQI
  wind       Open-Meteo 10m wind on a two-density grid
  perimeter  NIFC WFIGS current wildfire perimeters (GeoJSON, generalized)

Re-run:  python3 _build.py
"""
import csv
import io
import json
import math
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "smoke.json")

# Fetch extent = the whole Pacific Northwest smoke shed. The map OPENS on the
# metro but you can zoom out, so the data has to already be there. Portland's
# August smoke arrives from Northern California, Idaho, and western Montana, so
# stopping at the state line would hide the source of what people are breathing.
# Leaflet order: [[S,W],[N,E]]. Keep in sync with place.ts.
REGION = ((40.0, -125.2), (49.5, -113.0))
# Where the map opens. Every AirNow monitor we draw sits inside this.
METRO = ((45.25, -123.10), (45.80, -122.15))

UA = "masons-world/smoke-pdx (design experiment; github.com/optimusjames)"


def get(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def get_json(url, params=None, timeout=60):
    if params:
        url = url + ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    return json.loads(get(url, timeout))


def inside(box, lat, lng):
    (s, w), (n, e) = box
    return s <= lat <= n and w <= lng <= e


# ===========================================================================
# 1. AirNow monitors -> NowCast -> AQI
# ===========================================================================
#
# AirNow publishes plain hourly files with no API key. Two of them matter:
#   monitoring_site_locations.dat  site metadata incl. lat/lon (12-digit AQSID)
#   HourlyData_YYYYMMDDHH.dat      one row per site/parameter (9-digit AQSID)
# Join on the last 9 characters of the AQSID.

AIRNOW = "https://files.airnowtech.org/airnow/today/"

print("fetching AirNow site locations...")
sites = {}
raw = get(AIRNOW + "monitoring_site_locations.dat").decode("utf-8", "replace")
for line in raw.splitlines():
    p = line.split("|")
    if len(p) < 21 or p[1] != "PM2.5":
        continue
    try:
        lat, lng = float(p[8]), float(p[9])
    except ValueError:
        continue
    # Every monitor in the whole smoke shed, not just the metro. Sparse outside
    # Portland, but sparse real readings beat empty map, and they show smoke
    # arriving upwind before it reaches town.
    if not inside(REGION, lat, lng):
        continue
    sites[p[0][-9:]] = {
        "name": p[3],
        "active": p[4] == "Active",
        "agency": p[6],
        "lat": lat,
        "lng": lng,
        "state": p[20],
        "metro": inside(METRO, lat, lng),
    }
metro_n = sum(1 for s in sites.values() if s["metro"])
print(f"  {len(sites)} PM2.5 sites in the region ({metro_n} in the metro box, "
      f"{sum(1 for s in sites.values() if s['active'])} active)")

# --- 24 hours of readings ---
#
# The first 12 feed NowCast: AirNow's published AQI runs the last 12 hours
# through a decay-weighted average before hitting the breakpoint table. Mapping
# a single raw hourly reading through the 24-hour breakpoints and calling it
# "AQI" would be wrong, so we do the real thing.
#
# Hours 13-24 exist only to answer "when did this station last say anything?"
# for monitors with no valid NowCast, so a quiet dot can still carry a number
# and an age instead of nothing.
LOOKBACK_HOURS = 24
NOWCAST_HOURS = 12

now = datetime.now(timezone.utc)


def hourly_url(t):
    """`today/` only holds the current day; older hours live in the dated
    archive at /airnow/YYYY/YYYYMMDD/."""
    if t.date() == now.date():
        return AIRNOW + f"HourlyData_{t:%Y%m%d%H}.dat"
    return f"https://files.airnowtech.org/airnow/{t:%Y}/{t:%Y%m%d}/HourlyData_{t:%Y%m%d%H}.dat"


# A complete national hourly file carries roughly 1,300-1,400 PM2.5 rows. AirNow
# writes them progressively, so the newest file on the server is often a stub
# with a hundred rows. Anchoring to a stub makes the whole country look offline.
MIN_PM25_ROWS = 800


def read_hour(t):
    """Return {aqsid: value} for our sites, or None if the hour is unusable
    (missing, or still being written)."""
    try:
        text = get(hourly_url(t)).decode("utf-8", "replace")
    except Exception:
        return None
    total = 0
    vals = {}
    for line in text.splitlines():
        p = line.split("|")
        if len(p) < 9 or p[5] != "PM2.5":
            continue
        total += 1
        if p[2] in sites:
            try:
                vals[p[2]] = float(p[7])
            except ValueError:
                pass
    if total < MIN_PM25_ROWS:
        return None  # partial file, still being written
    return vals


# Anchor to the newest COMPLETE hour, not the current clock hour and not merely
# the newest file that exists. AirNow publishes with a lag, so anchoring to
# `now` leaves the newest slots empty and every site fails EPA's "2 of the 3
# most recent hours" rule.
print("finding the newest complete hour...")
anchor = None
anchor_vals = None
for back in range(8):
    t = (now - timedelta(hours=back)).replace(minute=0, second=0, microsecond=0)
    vals = read_hour(t)
    if vals is not None:
        anchor, anchor_vals = t, vals
        break
if anchor is None:
    raise SystemExit("no complete AirNow hourly file in the last 8 hours; aborting "
                     "rather than writing a map that claims everything is offline")
print(f"  newest complete hour is {anchor:%Y-%m-%d %H}:00Z "
      f"({int((now - anchor).total_seconds() // 3600)}h behind now)")

print(f"fetching {LOOKBACK_HOURS} hours of readings...")
# Index i == hours back from the anchor, so NowCast's decay weights stay
# time-correct even when the middle of the window has holes.
series = {aqsid: [None] * LOOKBACK_HOURS for aqsid in sites}
# Which slots we actually got a usable file for. A missing FILE is our gap, not
# the monitor's silence, so the validity rule below is evaluated over available
# hours only. Otherwise a server-side gap makes every station look dead.
available = [False] * LOOKBACK_HOURS
for back in range(LOOKBACK_HOURS):
    vals = anchor_vals if back == 0 else read_hour(anchor - timedelta(hours=back))
    if vals is None:
        continue
    available[back] = True
    for aqsid in sites:
        series[aqsid][back] = vals.get(aqsid)
print(f"  {sum(available)} of {LOOKBACK_HOURS} hours usable "
      f"({LOOKBACK_HOURS - sum(available)} missing or partial upstream)")


def nowcast(vals, usable):
    """EPA NowCast for PM2.5. `vals` is newest-first indexed by hours back from
    the anchor and may contain None. `usable` marks which of those hours we
    actually retrieved a complete file for.

    Returns None when fewer than 2 of the 3 most recent hours have data, which
    is EPA's own validity rule. We honor it rather than showing a number we
    cannot stand behind.

    The rule is applied over the 3 most recent hours we could READ, not the 3
    most recent clock hours. EPA's rule is about whether the monitor reported;
    holes in AirNow's own file publishing are our problem, not evidence that a
    station went quiet, and conflating the two blanks the entire map.
    """
    present = [v for v in vals if v is not None]
    if len(present) < 2:
        return None
    recent = [vals[i] for i in range(len(vals)) if usable[i]][:3]
    if sum(1 for v in recent if v is not None) < 2:
        return None
    lo, hi = min(present), max(present)
    if hi <= 0:
        return 0.0
    w = max(1 - (hi - lo) / hi, 0.5)
    num = den = 0.0
    for i, v in enumerate(vals):
        if v is None:
            continue
        num += (w ** i) * v
        den += w ** i
    return round(num / den, 1) if den else None


# EPA AQI breakpoints for PM2.5, as revised in the 2024 NAAQS update.
# (conc_low, conc_high, aqi_low, aqi_high, category)
PM25_BREAKPOINTS = [
    (0.0, 9.0, 0, 50, "Good"),
    (9.1, 35.4, 51, 100, "Moderate"),
    (35.5, 55.4, 101, 150, "Unhealthy for Sensitive Groups"),
    (55.5, 125.4, 151, 200, "Unhealthy"),
    (125.5, 225.4, 201, 300, "Very Unhealthy"),
    (225.5, 325.4, 301, 500, "Hazardous"),
]


def to_aqi(conc):
    if conc is None:
        return None, None
    c = math.floor(conc * 10) / 10  # EPA truncates to 1 decimal first
    for lo, hi, alo, ahi, cat in PM25_BREAKPOINTS:
        if c <= hi:
            c = max(c, lo)
            return round((ahi - alo) / (hi - lo) * (c - lo) + alo), cat
    return 500, "Hazardous"


features = []
reporting = 0
stale_with_value = 0
for aqsid, site in sites.items():
    conc = nowcast(series[aqsid][:NOWCAST_HOURS], available[:NOWCAST_HOURS])
    aqi, category = to_aqi(conc)
    stale_hours = None

    if aqi is None:
        # No valid NowCast. Fall back to the most recent single reading in the
        # lookback window, so a quiet station shows a number and its age rather
        # than nothing. Reported as "last reading", never as current AQI.
        for i, v in enumerate(series[aqsid]):
            if v is not None:
                stale_hours = i
                aqi, category = to_aqi(v)
                conc = v
                stale_with_value += 1
                break

    if aqi is None:
        # Nothing at all in the window. Drawn anyway, as a hollow ring, because
        # silently hiding an offline station makes the network look healthier
        # than it is.
        detail = [{"label": "Reading", "value": f"Nothing in {LOOKBACK_HOURS}h"}]
    elif stale_hours is not None:
        detail = [
            {"label": "Last reading", "value": f"{conc} µg/m³"},
            {"label": "Category", "value": category},
            {"label": "Measured", "value": f"{stale_hours}h ago"},
        ]
    else:
        reporting += 1
        detail = [
            {"label": "PM2.5 (NowCast)", "value": f"{conc} µg/m³"},
            {"label": "Category", "value": category},
        ]
    detail.append({"label": "Operated by", "value": site["agency"]})

    features.append({
        "id": f"monitor-{aqsid}",
        "layer": "monitor",
        "lat": round(site["lat"], 5),
        "lng": round(site["lng"], 5),
        "value": aqi,
        # Hours since the reading. 0/absent = current. Drives the "stale" style,
        # so an old number can never be mistaken for a live one.
        "staleHours": stale_hours,
        # Metro monitors drive the headline number and collapse into a single
        # badge when zoomed out; regional ones always draw individually.
        "metro": site["metro"],
        "label": site["name"],
        "detail": detail,
        "real": True,
        # The hour the reading is FOR, not the hour we fetched it.
        "observedAt": (anchor - timedelta(hours=stale_hours or 0)).isoformat(),
    })
print(f"  {reporting} of {len(sites)} monitors have a valid NowCast")
print(f"  {stale_with_value} more had an older reading within {LOOKBACK_HOURS}h")

# ===========================================================================
# 2. Open-Meteo wind grid
# ===========================================================================
#
# Two densities: a coarse regional grid so zooming out shows the transport
# pattern, and a finer metro grid so the opening view is not sparse. Open-Meteo
# takes comma-separated coordinate lists, so this is a couple of calls.

def grid(box, step):
    (s, w), (n, e) = box
    pts = []
    lat = s + step / 2
    while lat <= n:
        lng = w + step / 2
        while lng <= e:
            pts.append((round(lat, 4), round(lng, 4)))
            lng += step
        lat += step
    return pts


COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
           "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]


def compass(deg):
    return COMPASS[int((deg % 360) / 22.5 + 0.5) % 16]


# Dense enough to read as a field rather than as scattered marks. The map swaps
# between the two densities by zoom, so neither view is ever cluttered.
wind_points = grid(REGION, 0.45) + grid(METRO, 0.08)
print(f"fetching wind for {len(wind_points)} grid points...")

wind_rows = []
# Open-Meteo counts each coordinate in a multi-point call against the quota, so
# a 650-point grid rate-limits easily. Smaller chunks, a pause between them, and
# exponential backoff on 429 rather than dying halfway through a build.
CHUNK = 60
for i in range(0, len(wind_points), CHUNK):
    chunk = wind_points[i:i + CHUNK]
    params = {
        "latitude": ",".join(str(p[0]) for p in chunk),
        "longitude": ",".join(str(p[1]) for p in chunk),
        "current": "wind_speed_10m,wind_direction_10m",
        "wind_speed_unit": "mph",
    }
    for attempt in range(6):
        try:
            data = get_json("https://api.open-meteo.com/v1/forecast", params)
            break
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 5:
                raise
            wait = 10 * (attempt + 1)
            print(f"    rate limited, waiting {wait}s...")
            time.sleep(wait)
    # Open-Meteo returns a bare object for one point, a list for many.
    wind_rows.extend(data if isinstance(data, list) else [data])
    time.sleep(1.5)

for j, row in enumerate(wind_rows):
    cur = row.get("current") or {}
    speed, bearing = cur.get("wind_speed_10m"), cur.get("wind_direction_10m")
    if speed is None or bearing is None:
        continue
    features.append({
        "id": f"wind-{j}",
        "layer": "wind",
        "lat": round(row["latitude"], 4),
        "lng": round(row["longitude"], 4),
        "value": round(speed, 1),
        # Meteorological convention: the direction wind comes FROM.
        "bearing": round(bearing),
        "label": f"{round(speed)} mph from the {compass(bearing)}",
        "real": True,
        "observedAt": cur.get("time"),
    })
print(f"  {sum(1 for f in features if f['layer'] == 'wind')} wind cells")

# ===========================================================================
# 3. NIFC current wildfire perimeters
# ===========================================================================
#
# Public ArcGIS FeatureServer, no key. maxAllowableOffset generalizes the
# geometry server-side; full-resolution perimeters are far more vertices than
# this zoom can show and would bloat the repo.
print("fetching NIFC perimeters...")
NIFC = ("https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/"
        "WFIGS_Interagency_Perimeters_Current/FeatureServer/0/query")
(s, w), (n, e) = REGION
perims = get_json(NIFC, {
    "where": "1=1",
    "geometry": f"{w},{s},{e},{n}",
    "geometryType": "esriGeometryEnvelope",
    "inSR": "4326",
    "spatialRel": "esriSpatialRelIntersects",
    "outFields": ("poly_IncidentName,poly_GISAcres,attr_PercentContained,"
                  "attr_FireDiscoveryDateTime"),
    "outSR": "4326",
    "maxAllowableOffset": "0.004",
    "f": "geojson",
})
perim_features = perims.get("features", [])
for f in perim_features:
    a = f.setdefault("properties", {})
    acres = a.get("poly_GISAcres")
    a["name"] = a.get("poly_IncidentName") or "Unnamed fire"
    a["acres"] = round(acres) if isinstance(acres, (int, float)) else None
    a["contained"] = a.get("attr_PercentContained")
print(f"  {len(perim_features)} perimeters in the region")

# ===========================================================================
# write
# ===========================================================================

payload = {
    "features": features,
    "shapes": [{
        "layer": "perimeter",
        "geojson": {"type": "FeatureCollection", "features": perim_features},
        "real": True,
    }],
    "generatedAt": now.isoformat(timespec="seconds"),
    "counts": {
        "monitors": len(sites),
        "monitorsReporting": reporting,
        "metroMonitors": metro_n,
        "metroReporting": sum(
            1 for f in features
            if f["layer"] == "monitor" and f.get("metro") and f["staleHours"] is None
            and f["value"] is not None
        ),
        "windCells": sum(1 for f in features if f["layer"] == "wind"),
        "perimeters": len(perim_features),
        "hourlyFilesUsed": sum(available),
    },
}

with open(OUT, "w") as fh:
    json.dump(payload, fh, separators=(",", ":"))

print(f"\nwrote {OUT}")
for k, v in payload["counts"].items():
    print(f"  {k}: {v}")
