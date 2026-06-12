#!/usr/bin/env python3
"""Build data/reports.json for Fix It PDX.

Provenance:
  - REAL pothole pins come from the City of Portland's public PBOT Maintenance
    feature layer (the same data behind the "Potholes Reported & Repaired" app):
    https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Maintenance/MapServer/0
    Fields: ITEM_STATUS (Open/In Progress/Closed), ITEM_DATE_CREATED (epoch ms),
    ITEM_CATEGORY_NAME, LOCATION_NEIGHBORHOOD. Status maps Open->reported,
    In Progress->in_progress, Closed->fixed. The layer has NO repair/close date,
    so real "fixed" potholes carry no daysToFix (we never fabricate one).

  - SYNTHETIC pins for the other 11 categories are illustrative. They're anchored
    to REAL sampled pothole coordinates (so they land on real Portland streets)
    with small jitter, realistic per-category date spreads and status mixes, and
    a resolvedDate (=> daysToFix) only on fixed pins. Marked real=False.

Re-run:  python3 _build-reports.py   (writes reports.json next to this file)
"""
import json
import os
import random
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

random.seed(503)  # deterministic output (503 = PDX area code)

LAYER = "https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Maintenance/MapServer/0/query"
HERE = os.path.dirname(os.path.abspath(__file__))
NOW = datetime(2026, 6, 11, tzinfo=timezone.utc)

STATUS_MAP = {"Open": "reported", "In Progress": "in_progress", "Closed": "fixed"}


def fetch(where, count, order="ITEM_DATE_CREATED DESC"):
    params = {
        "where": where,
        "outFields": "ITEM_STATUS,ITEM_DATE_CREATED,LOCATION_NEIGHBORHOOD",
        "orderByFields": order,
        "resultRecordCount": str(count),
        "f": "geojson",
    }
    url = LAYER + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=40) as r:
        return json.load(r).get("features", [])


def iso(ms):
    return datetime.fromtimestamp(ms / 1000, tz=timezone.utc).date().isoformat()


# ---- 1. Real pothole pins (decimated sample, mixed statuses) ----------------
real_pins = []
anchors = []  # (lat, lng) reused to place synthetic pins on real streets
slices = [
    ("ITEM_STATUS='Open'", 220),
    ("ITEM_STATUS='In Progress'", 130),
    ("ITEM_STATUS='Closed'", 260),
]
for where, n in slices:
    for f in fetch(where, n):
        geom = f.get("geometry") or {}
        coords = geom.get("coordinates") or []
        if len(coords) != 2 or coords[0] is None or coords[1] is None:
            continue
        lng, lat = float(coords[0]), float(coords[1])
        if not (45.4 < lat < 45.65 and -122.85 < lng < -122.45):
            continue  # drop anything outside the Portland envelope
        p = f.get("properties") or {}
        status = STATUS_MAP.get(p.get("ITEM_STATUS"), "reported")
        ms = p.get("ITEM_DATE_CREATED")
        if not ms:
            continue
        hood = p.get("LOCATION_NEIGHBORHOOD")
        real_pins.append(
            {
                "id": f"pot-{len(real_pins)}",
                "category": "pothole",
                "status": status,
                "lat": round(lat, 6),
                "lng": round(lng, 6),
                "reportedDate": iso(ms),
                "note": f"Reported pothole in {hood}." if hood else None,
                "real": True,
            }
        )
        anchors.append((lat, lng))

# ---- 2. Synthetic pins for the other categories -----------------------------
# (category_id, count, status_weights[reported,in_progress,fixed], (min_days,max_days) to fix)
SYNTH = [
    ("graffiti", 46, (0.30, 0.20, 0.50), (4, 28)),
    ("street-light", 38, (0.32, 0.25, 0.43), (6, 40)),
    ("abandoned-auto", 30, (0.40, 0.25, 0.35), (8, 35)),
    ("debris", 34, (0.18, 0.12, 0.70), (1, 6)),
    ("sidewalk-hazard", 26, (0.45, 0.25, 0.30), (30, 110)),
    ("storm-drain", 28, (0.30, 0.22, 0.48), (2, 18)),
    ("park-maintenance", 22, (0.38, 0.24, 0.38), (7, 30)),
    ("sidewalk-vegetation", 20, (0.50, 0.20, 0.30), (12, 40)),
    ("row-obstruction", 18, (0.42, 0.22, 0.36), (4, 18)),
    ("illegal-parking", 16, (0.70, 0.10, 0.20), (1, 5)),
    ("other", 14, (0.45, 0.25, 0.30), (3, 21)),
]
NOTES = {
    "graffiti": "Tagging reported on a wall/fence.",
    "street-light": "Streetlight out at this location.",
    "abandoned-auto": "Vehicle appears abandoned on the street.",
    "debris": "Debris in the roadway.",
    "sidewalk-hazard": "Lifted/cracked sidewalk panel.",
    "storm-drain": "Storm drain clogged / pooling water.",
    "park-maintenance": "Maintenance issue in a city park.",
    "sidewalk-vegetation": "Overgrown vegetation blocking the sidewalk.",
    "row-obstruction": "Obstruction in the public right-of-way.",
    "illegal-parking": "Vehicle parked illegally / blocking.",
    "other": "General service request.",
}

synth_pins = []
for cat, count, weights, fixspan in SYNTH:
    for i in range(count):
        alat, alng = random.choice(anchors)
        lat = round(alat + random.uniform(-0.006, 0.006), 6)
        lng = round(alng + random.uniform(-0.006, 0.006), 6)
        status = random.choices(["reported", "in_progress", "fixed"], weights=weights)[0]
        # reported within the last ~120 days; fixed ones skew slightly older
        age = random.randint(0, 120 if status != "fixed" else 160)
        reported = NOW - timedelta(days=age)
        pin = {
            "id": f"{cat}-{i}",
            "category": cat,
            "status": status,
            "lat": lat,
            "lng": lng,
            "reportedDate": reported.date().isoformat(),
            "note": NOTES[cat],
            "real": False,
        }
        if status == "fixed":
            days = random.randint(*fixspan)
            resolved = reported + timedelta(days=days)
            if resolved <= NOW:
                pin["resolvedDate"] = resolved.date().isoformat()
                pin["daysToFix"] = days
            else:  # would resolve in the future -> keep it in progress instead
                pin["status"] = "in_progress"
        synth_pins.append(pin)

pins = real_pins + synth_pins
random.shuffle(pins)

# ---- 3. Honest stats over the dataset actually shown ------------------------
ym = (NOW.year, NOW.month)


def in_this_month(d):
    try:
        dt = datetime.fromisoformat(d)
        return (dt.year, dt.month) == ym
    except (ValueError, TypeError):
        return False


reported_this_month = sum(1 for p in pins if in_this_month(p["reportedDate"]))
fixed_this_month = sum(1 for p in pins if in_this_month(p.get("resolvedDate") or ""))

out = {
    "pins": pins,
    "stats": {
        "reportedThisMonth": reported_this_month,
        "fixedThisMonth": fixed_this_month,
    },
    "generatedAt": NOW.date().isoformat(),
}

with open(os.path.join(HERE, "reports.json"), "w") as fh:
    json.dump(out, fh, separators=(",", ":"))

real_n = sum(1 for p in pins if p.get("real"))
print(f"wrote {len(pins)} pins ({real_n} real potholes, {len(pins)-real_n} synthetic)")
print(f"  reportedThisMonth={reported_this_month}  fixedThisMonth={fixed_this_month}")
by_status = {}
for p in pins:
    by_status[p["status"]] = by_status.get(p["status"], 0) + 1
print("  by status:", by_status)
