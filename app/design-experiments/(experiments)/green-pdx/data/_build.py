#!/usr/bin/env python3
"""Build data/green.json for Green PDX.

This script IS the provenance. It lives next to its output, it is deterministic,
and re-running it reproduces the committed file (modulo upstream changes).

Sources: see SOURCES.md next to this file. Every one is a City of Portland
ArcGIS service, public, no API key.

Re-run:  python3 _build.py
"""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "green.json")

# Leaflet order: [[south, west], [north, east]] — keep in sync with place.ts.
# Portland city limits from Nominatim, 2026-09-15, padded slightly so a park on
# the boundary is not clipped mid-polygon.
BOUNDS = ((45.42, -122.85), (45.66, -122.46))

USER_AGENT = "masons-world/green-pdx (design experiment; github.com/optimusjames)"

PM = "https://www.portlandmaps.com/arcgis/rest/services/Public"

# Generalization tolerance in degrees, applied server-side. ~0.00012° is about
# 10m at this latitude, which is finer than one screen pixel at the zoom this
# map opens on, and it cuts the payload by roughly an order of magnitude.
# Stated in SOURCES.md because it IS a transformation of the source geometry.
OFFSET = 0.00012


def fetch_json(url, params=None, timeout=90):
    """GET + parse JSON. Raises on failure — a silent empty layer is worse than
    a loud build error, because it ships looking like real data."""
    if params:
        url = url + ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


def fetch_geojson(layer_url, out_fields="*"):
    """Every feature in a layer as GeoJSON, paged.

    ArcGIS caps a response at maxRecordCount (2,000 here) and says so with
    `exceededTransferLimit` rather than an error, so paging is not optional:
    without it a layer silently ships truncated.
    """
    features = []
    offset = 0
    while True:
        page = fetch_json(
            layer_url + "/query",
            {
                "where": "1=1",
                "outFields": out_fields,
                "outSR": "4326",
                "maxAllowableOffset": OFFSET,
                "resultOffset": offset,
                "resultRecordCount": 1000,
                "f": "geojson",
            },
        )
        batch = page.get("features", [])
        features.extend(batch)
        if len(batch) < 1000 or not page.get("exceededTransferLimit"):
            break
        offset += len(batch)
    return features


def ring_centroid(geometry):
    """Area-weighted centroid of a (multi)polygon's outer ring.

    Community gardens are drawn as points: at city zoom a 0.15-acre garden is
    smaller than the dot marking it, so the polygon would be invisible while the
    point carries the plot count. The polygon is still the source of truth for
    where it sits, hence a real centroid rather than a bounding-box middle.
    """
    if not geometry:
        return None
    gtype = geometry.get("type")
    if gtype == "Polygon":
        rings = [geometry["coordinates"][0]]
    elif gtype == "MultiPolygon":
        rings = [poly[0] for poly in geometry["coordinates"]]
    else:
        return None

    best = None
    best_area = -1.0
    for ring in rings:
        area = 0.0
        cx = 0.0
        cy = 0.0
        for i in range(len(ring) - 1):
            x0, y0 = ring[i][0], ring[i][1]
            x1, y1 = ring[i + 1][0], ring[i + 1][1]
            cross = x0 * y1 - x1 * y0
            area += cross
            cx += (x0 + x1) * cross
            cy += (y0 + y1) * cross
        area *= 0.5
        if abs(area) < 1e-12:
            continue
        if abs(area) > best_area:
            best_area = abs(area)
            best = (cy / (6 * area), cx / (6 * area))  # (lat, lng)
    return best


def in_bounds(lat, lng):
    (s, w), (n, e) = BOUNDS
    return s <= lat <= n and w <= lng <= e


def strip(props, keep):
    """Only the fields the UI uses. An ArcGIS layer carries internal columns
    that would triple the payload for nothing."""
    return {k: props.get(k) for k in keep if props.get(k) is not None}


# ---- 1. Parks -------------------------------------------------------------

parks_raw = fetch_geojson(f"{PM}/Parks_Misc/MapServer/2", "NAME,ACRES,PROPERTYID")
parks = []
for feat in parks_raw:
    p = feat.get("properties") or {}
    parks.append(
        {
            "type": "Feature",
            "properties": {
                "name": p.get("NAME") or "Unnamed park",
                "acres": round(p["ACRES"], 1) if p.get("ACRES") is not None else None,
                "kind": "park",
            },
            "geometry": feat.get("geometry"),
        }
    )

# ---- 2. Natural areas -----------------------------------------------------
#
# Most records in this inventory have a NULL Name — it is a land inventory keyed
# by parcel, not a directory of named places. So the popup leads with the
# managing bureau, which every record does have, and a record without a name
# says "Unnamed natural area" rather than borrowing one from anywhere.

natural_raw = fetch_geojson(
    f"{PM}/Parks_Natural_Area_Land_Inventory/MapServer/0",
    "Name,Owner,Manager,Management_Unit",
)
natural = []
for feat in natural_raw:
    p = feat.get("properties") or {}
    natural.append(
        {
            "type": "Feature",
            "properties": {
                # A whitespace-only name is not a name. Counting it as one made
                # our total disagree with the city's own query (which tests
                # `Name IS NOT NULL AND Name <> ''`) by four records, and a
                # number on the page that the publisher's own portal
                # contradicts is not a number worth printing.
                "name": (p.get("Name") or "").strip() or "Unnamed natural area",
                "named": bool((p.get("Name") or "").strip()),
                "manager": p.get("Manager"),
                "owner": p.get("Owner"),
                "unit": p.get("Management_Unit"),
                "kind": "natural",
            },
            "geometry": feat.get("geometry"),
        }
    )

# ---- 3. Community gardens -------------------------------------------------

gardens_raw = fetch_geojson(
    f"{PM}/Parks_Community_Gardens/MapServer/5",
    "Site_Name,Status,Plotspergarden,Acres,PropertyID",
)

# The plot layer, counted CITYWIDE and never attributed to a garden.
#
# Do not re-attempt a per-garden plot count. Both joins were tried on
# 2026-09-15 and both failed, in ways worth recording so the next person does
# not spend the afternoon again:
#
# 1. SPATIAL. Only 98 of 3,026 plot polygons fall inside any garden boundary
#    polygon, about 3%. It is not a generalization artifact — fetching both
#    layers at full resolution moves the match from 93 to 98 — and both layers
#    publish the same spatial reference (EPSG:3857). The plot polygons simply
#    sit beside their garden's boundary rather than within it. Colonel Summers
#    has 103 recorded plots and 2 that land inside its boundary.
#
# 2. ATTRIBUTE. `ActiveNet_ID` looks like a garden key ("MTTCG.002.A" → MTTCG),
#    and for the largest clusters it is: 64 prefixes against 62 gardens. But
#    the nearest garden to a prefix's own centroid ranges from 4m to 638m; five
#    prefixes sit hundreds of metres from any garden; three gardens are claimed
#    by more than one prefix (Beach by three, including the junk keys "Home"
#    and "Patton"); and where a comparison is possible the counts disagree with
#    the city's own `Plotspergarden` in both directions (Brentwood South 108
#    mapped vs 28 recorded, Adams 76 vs 57). Matching a prefix to whichever
#    garden happens to be nearest is circular, and "151 of 166 ADA plots landed
#    somewhere" is not the same claim as "landed on the right garden".
#
# So a garden reports only what its own record carries. What the plot layer can
# honestly support is a single citywide count, which needs no join at all and
# is a real accessibility fact nobody surfaces.
plots_raw = fetch_geojson(
    f"{PM}/Parks_Community_Gardens/MapServer/3", "Plot_ID,Plot_Size"
)
plot_sizes = {}
for plot in plots_raw:
    size = (plot.get("properties") or {}).get("Plot_Size")
    plot_sizes[size] = plot_sizes.get(size, 0) + 1

features = []
skipped_gardens = 0

# ---- 3b. Community gardens the city does not run --------------------------
#
# The PP&R layer is a roster of PP&R's own program, not a census of gardens.
# Brooklyn Community Garden sits on ODOT land and is run by the Brooklyn Action
# Corps, so it is absent — and a person looking for their nearest garden does
# not care which bureau runs it. `extra-gardens.json` is a small hand-assembled
# set to fill that gap, with a source per record and the rejects kept alongside.
#
# These are drawn with the same violet mark as the city gardens, deliberately:
# the distinction that matters to a reader is "community garden", not "which
# agency". The distinction that matters to honesty is carried in the popup,
# which names the operator and says the location is approximate.
EXTRA = os.path.join(HERE, "extra-gardens.json")
with open(EXTRA) as f:
    extra = json.load(f)

for g in extra["gardens"]:
    detail = []
    if g.get("plots"):
        detail.append({"label": "Plots", "value": str(g["plots"])})
    detail.append({"label": "Run by", "value": g["operator"]})
    if g.get("onLandOf"):
        detail.append({"label": "On land of", "value": g["onLandOf"]})
    features.append(
        {
            "id": g["id"],
            "layer": "garden",
            "lat": g["lat"],
            "lng": g["lng"],
            "value": g.get("plots"),
            "label": g["name"],
            "detail": detail,
            # Real: these gardens exist and an operator says so on its own site.
            # What differs from the city records is the provenance tier and the
            # precision of the location, and both are carried into the UI rather
            # than flattened away here.
            "real": True,
            "source": "community",
            "operator": g["operator"],
            "approx": True,
            "note": g.get("plotsNote"),
            "sourceName": g["sourceName"],
            "sourceUrl": g["sourceUrl"],
            "contact": g.get("contact"),
        }
    )

for idx, feat in enumerate(gardens_raw):
    p = feat.get("properties") or {}
    center = ring_centroid(feat.get("geometry"))
    if not center or not in_bounds(*center):
        skipped_gardens += 1
        continue
    lat, lng = center
    plots = p.get("Plotspergarden")
    acres = p.get("Acres")
    detail = []
    # Only fields the source actually has. A garden with no plot count gets no
    # plot row rather than a zero, which would read as "no plots".
    if plots:
        detail.append({"label": "Plots", "value": str(plots)})
    if acres:
        detail.append({"label": "Size", "value": f"{acres:.2f} acres"})
    if p.get("Status"):
        detail.append({"label": "Status", "value": p["Status"]})
    features.append(
        {
            "id": f"garden-{p.get('PropertyID') or len(features)}",
            "layer": "garden",
            "lat": round(lat, 5),
            "lng": round(lng, 5),
            "value": plots,
            "label": (p.get("Site_Name") or "Community garden").strip(),
            "detail": detail,
            "real": True,
        }
    )

# ---- 4. Neighborhoods -----------------------------------------------------

hoods_raw = fetch_geojson(f"{PM}/Boundaries/MapServer/1", "NAME,MAPLABEL,COALIT")
hoods = []
for feat in hoods_raw:
    p = feat.get("properties") or {}
    hoods.append(
        {
            "type": "Feature",
            "properties": {
                "name": p.get("MAPLABEL") or p.get("NAME") or "Neighborhood",
                "coalition": p.get("COALIT"),
                "kind": "neighborhood",
            },
            "geometry": feat.get("geometry"),
        }
    )

# ---- write ----------------------------------------------------------------

shapes = [
    {"layer": "park", "geojson": {"type": "FeatureCollection", "features": parks}, "real": True},
    {"layer": "natural", "geojson": {"type": "FeatureCollection", "features": natural}, "real": True},
    {
        "layer": "neighborhood",
        "geojson": {"type": "FeatureCollection", "features": hoods},
        "real": True,
    },
]

payload = {
    "features": features,
    "shapes": shapes,
    "generatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    "counts": {
        "parks": len(parks),
        "naturalAreas": len(natural),
        "naturalAreasNamed": sum(1 for f in natural if f["properties"]["named"]),
        "gardens": len(features),
        "neighborhoods": len(hoods),
        "gardensCity": sum(1 for f in features if f.get("source") != "community"),
        "gardensCommunity": sum(1 for f in features if f.get("source") == "community"),
        "gardenPlots": sum(f["value"] or 0 for f in features),
        "parkAcres": round(sum(f["properties"]["acres"] or 0 for f in parks)),
        # Citywide, straight from the plot layer. Not attributed to gardens —
        # see the long note above for why that is not honestly possible.
        "mappedPlots": len(plots_raw),
        "adaPlots": plot_sizes.get("ADA", 0),
    },
}

with open(OUT, "w") as f:
    json.dump(payload, f, separators=(",", ":"))

print(f"wrote {OUT}")
for key, val in payload["counts"].items():
    print(f"  {key}: {val}")
if skipped_gardens:
    print(f"  gardens skipped (no geometry or outside bounds): {skipped_gardens}")
print(f"  file size: {os.path.getsize(OUT) / 1_000_000:.2f} MB")
