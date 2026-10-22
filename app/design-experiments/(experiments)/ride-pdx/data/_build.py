#!/usr/bin/env python3
"""Build data/places.json and data/bikes.json for Ride PDX.

This script IS the provenance. It lives next to its output, it is deterministic,
and re-running it should reproduce the committed files (modulo upstream changes).

  places.json  the destinations: groceries, coffee, libraries, viewpoints (OSM)
               and parks (Portland Parks & Recreation). Snapshot; these move on
               the order of months.
  bikes.json   one pull of the BIKETOWN feed. Only the FALLBACK: the page reads
               the live feed through data/live.ts and uses this when it fails.

Sources: see SOURCES.md next to this file.

Re-run:  python3 _build.py
"""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))

# Keep in sync with PLACES_BBOX in place.ts
SOUTH, WEST, NORTH, EAST = 45.44, -122.79, 45.62, -122.50

USER_AGENT = "masons-world/ride-pdx (design experiment; github.com/optimusjames)"

OVERPASS = "https://overpass-api.de/api/interpreter"
PARKS = "https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Misc/MapServer/2/query"
GBFS = "https://gbfs.lyft.com/gbfs"

# Public library systems only. OSM's amenity=library also covers university
# stacks, a bookshop, and a private campus library, none of which a visitor
# can walk into and use.
PUBLIC_LIBRARY_OPERATORS = (
    "Multnomah County Library",
    "Washington County Cooperative Library Services",
    "Garden Home Community Library Association",
    "City of Milwaukie",
)


def fetch_json(url, params=None, data=None, timeout=90):
    """GET (or POST form) + parse JSON. Raises on failure: a silent empty layer
    is worse than a loud build error, because it ships looking like real data."""
    if params:
        url = url + ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    body = urllib.parse.urlencode(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def r5(x):
    return round(x, 5)


# ---- places: OpenStreetMap -------------------------------------------------

bbox = f"({SOUTH},{WEST},{NORTH},{EAST})"
query = f"""
[out:json][timeout:80];
(
  nwr["shop"~"^(supermarket|greengrocer)$"]{bbox};
  nwr["amenity"="cafe"]{bbox};
  nwr["amenity"="library"]{bbox};
  nwr["tourism"="viewpoint"]{bbox};
);
out center tags;
"""
osm = fetch_json(OVERPASS, data={"data": query})["elements"]


def osm_category(t):
    if t.get("shop") in ("supermarket", "greengrocer"):
        return "grocery"
    if t.get("amenity") == "cafe":
        return "coffee"
    if t.get("amenity") == "library":
        return "library"
    if t.get("tourism") == "viewpoint":
        return "viewpoint"
    return None


def is_public_library(t):
    if t.get("access") in ("private", "no"):
        return False
    op = t.get("operator")
    if op:
        return op in PUBLIC_LIBRARY_OPERATORS
    # Two Multnomah County branches carry no operator tag in OSM.
    return (t.get("name") or "").endswith(" Library")


places = []
seen = set()
for el in sorted(osm, key=lambda e: (e["type"], e["id"])):
    t = el.get("tags", {})
    cat = osm_category(t)
    if cat is None:
        continue
    lat = el.get("lat") or el.get("center", {}).get("lat")
    lng = el.get("lon") or el.get("center", {}).get("lon")
    if lat is None or lng is None:
        continue
    name = t.get("name")
    if cat == "library" and not is_public_library(t):
        continue
    # A coffee shop or grocery with no name is not a destination anyone can
    # look for. A viewpoint without one still is: the view is the point.
    if not name and cat != "viewpoint":
        continue
    key = (cat, name, round(lat, 4), round(lng, 4))
    if key in seen:
        continue
    seen.add(key)

    place = {
        "id": f"osm-{el['type'][0]}{el['id']}",
        "cat": cat,
        "name": name or "Viewpoint",
        "lat": r5(lat),
        "lng": r5(lng),
        "src": "osm",
    }
    # Only fields OSM actually has for this record. Never invented.
    if t.get("brand") and t.get("brand") != name:
        place["brand"] = t["brand"]
    if t.get("opening_hours"):
        place["hours"] = t["opening_hours"]
    if t.get("addr:housenumber") and t.get("addr:street"):
        place["addr"] = f"{t['addr:housenumber']} {t['addr:street']}"
    places.append(place)


# ---- places: Portland Parks & Recreation ----------------------------------


def ring_centroid(ring):
    """Area-weighted centroid of one ring (shoelace). Planar math is fine at a
    park's scale; the error is well under a meter."""
    a = cx = cy = 0.0
    for (x0, y0), (x1, y1) in zip(ring, ring[1:]):
        cross = x0 * y1 - x1 * y0
        a += cross
        cx += (x0 + x1) * cross
        cy += (y0 + y1) * cross
    if abs(a) < 1e-14:
        xs, ys = zip(*ring)
        return sum(xs) / len(xs), sum(ys) / len(ys), 0.0
    a *= 0.5
    return cx / (6 * a), cy / (6 * a), abs(a)


def polygon_point(geom):
    """Centroid of the largest outer ring. Good enough to put a pin on a park;
    a multi-part park gets its pin on its biggest piece."""
    if geom["type"] == "Polygon":
        rings = [geom["coordinates"][0]]
    else:
        rings = [p[0] for p in geom["coordinates"]]
    best = max((ring_centroid(r) for r in rings), key=lambda c: c[2])
    return best[1], best[0]


parks = fetch_json(
    PARKS,
    {
        "where": "1=1",
        "outFields": "OBJECTID,NAME,ACRES",
        "outSR": 4326,
        "f": "geojson",
    },
)["features"]

for feat in sorted(parks, key=lambda f: f["properties"]["OBJECTID"]):
    p = feat["properties"]
    if not feat.get("geometry") or not p.get("NAME"):
        continue
    lat, lng = polygon_point(feat["geometry"])
    if not (SOUTH <= lat <= NORTH and WEST <= lng <= EAST):
        continue
    place = {
        "id": f"ppr-{p['OBJECTID']}",
        "cat": "park",
        "name": p["NAME"].strip(),
        "lat": r5(lat),
        "lng": r5(lng),
        "src": "ppr",
    }
    if p.get("ACRES"):
        place["acres"] = round(p["ACRES"], 1)
    places.append(place)

places.sort(key=lambda p: (p["cat"], p["name"], p["id"]))

with open(os.path.join(HERE, "places.json"), "w") as f:
    json.dump(
        {
            "places": places,
            "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        },
        f,
        separators=(",", ":"),
    )

# ---- bikes: BIKETOWN GBFS (fallback snapshot only) -------------------------
#
# Mirrors data/live.ts exactly, so the fallback is the same shape as the live
# payload. Stations come from GBFS 1.1, which splits counts by e-bike and
# scooter. Free vehicles come from 2.3, which adds vehicle type and range.

info = fetch_json(f"{GBFS}/1.1/pdx/en/station_information.json")
status = fetch_json(f"{GBFS}/1.1/pdx/en/station_status.json")
free = fetch_json(f"{GBFS}/2.3/pdx/en/free_bike_status.json")

by_id = {s["station_id"]: s for s in status["data"]["stations"]}
stations = []
for s in sorted(info["data"]["stations"], key=lambda s: s["station_id"]):
    st = by_id.get(s["station_id"])
    if not st or not st.get("is_installed"):
        continue
    stations.append(
        {
            "id": s["station_id"],
            "name": s["name"],
            "lat": r5(s["lat"]),
            "lng": r5(s["lon"]),
            "capacity": s.get("capacity"),
            "bikes": st["num_bikes_available"],
            "ebikes": st.get("num_ebikes_available", 0),
            "scooters": st.get("num_scooters_available", 0),
            "docks": st["num_docks_available"],
            "renting": bool(st.get("is_renting")),
        }
    )

TYPE = {"2": "e", "3": "s"}  # 1 is a classic bike; none are free-floating today
vehicles = []
for b in sorted(free["data"]["bikes"], key=lambda b: (b["lat"], b["lon"])):
    if b.get("is_disabled") or b.get("is_reserved"):
        continue
    kind = TYPE.get(str(b.get("vehicle_type_id")))
    if kind is None:
        continue
    rng = b.get("current_range_meters")
    vehicles.append(
        [r5(b["lat"]), r5(b["lon"]), kind, round(rng / 1609.344, 1) if rng else None]
    )

asof = datetime.fromtimestamp(free["last_updated"], timezone.utc).isoformat(timespec="seconds")
with open(os.path.join(HERE, "bikes.json"), "w") as f:
    json.dump(
        {"stations": stations, "vehicles": vehicles, "asOf": asof, "live": False},
        f,
        separators=(",", ":"),
    )

# ---- report -----------------------------------------------------------------

counts = {}
for p in places:
    counts[p["cat"]] = counts.get(p["cat"], 0) + 1
print(f"places.json: {len(places)} places")
for k, v in sorted(counts.items()):
    print(f"    {k}: {v}")
print(f"bikes.json: {len(stations)} stations, {len(vehicles)} free vehicles")
print(f"    e-bikes: {sum(1 for v in vehicles if v[2] == 'e')}")
print(f"    scooters: {sum(1 for v in vehicles if v[2] == 's')}")
print(f"    bikes docked: {sum(s['bikes'] for s in stations)}")
print(f"    as of: {asof}")
