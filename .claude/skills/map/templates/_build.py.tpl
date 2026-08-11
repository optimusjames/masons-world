#!/usr/bin/env python3
"""Build data/{{output}}.json for {{TITLE}}.

This script IS the provenance. It lives next to its output, it is deterministic,
and re-running it should reproduce the committed file (modulo upstream changes).

Sources: see SOURCES.md next to this file.

Re-run:  python3 _build.py
"""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "{{output}}.json")

# Leaflet order: [[south, west], [north, east]] — keep in sync with place.ts
BOUNDS = ((0.0, 0.0), (0.0, 0.0))

USER_AGENT = "masons-world/{{slug}} (design experiment; contact via github)"


def fetch_json(url, params=None, timeout=40):
    """GET + parse JSON. Raises on failure — a silent empty layer is worse
    than a loud build error, because it ships looking like real data."""
    if params:
        url = url + ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def in_bounds(lat, lng):
    (s, w), (n, e) = BOUNDS
    return s <= lat <= n and w <= lng <= e


# ---- fetch ----------------------------------------------------------------

features = []

# TODO: one block per source. Normalize into the MapFeature schema in ../types.ts.
#
# raw = fetch_json(ENDPOINT, {"where": "1=1", "outFields": "*", "f": "geojson"})
# for feat in raw.get("features", []):
#     lng, lat = feat["geometry"]["coordinates"]
#     if not in_bounds(lat, lng):
#         continue
#     props = feat["properties"]
#     features.append({
#         "id": f"src-{props['OBJECTID']}",
#         "layer": "{{layer-id}}",
#         "lat": round(lat, 5),
#         "lng": round(lng, 5),
#         "value": props.get("{{VALUE_FIELD}}"),
#         "label": props.get("{{NAME_FIELD}}") or "Unnamed",
#         "detail": [
#             {"label": "{{Label}}", "value": str(props["{{FIELD}}"])},
#         ],
#         # Only true because we fetched it and counted it.
#         "real": True,
#         "observedAt": props.get("{{TIME_FIELD}}"),
#     })

# ---- write ----------------------------------------------------------------

payload = {
    "features": features,
    "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
}

with open(OUT, "w") as f:
    json.dump(payload, f, separators=(",", ":"))

by_layer = {}
for feat in features:
    by_layer[feat["layer"]] = by_layer.get(feat["layer"], 0) + 1

print(f"wrote {OUT}")
print(f"  {len(features)} features")
for layer, n in sorted(by_layer.items()):
    print(f"    {layer}: {n}")
print(f"  real: {sum(1 for f in features if f['real'])}")
