# Known sources

Endpoints confirmed by an actual fetch during a `/map` run. Check here first
before searching. **Append after every run** — this file is the accumulating
asset, and after ten maps it is a vetted registry by topic and jurisdiction.

Format: one row per endpoint, with the tier, whether a key is needed, and the
date it last returned data.

---

## Portland / Oregon

| Topic | Source | Tier | Key | Endpoint | Last OK |
|---|---|---|---|---|---|
| Portal (city/regional) | PortlandMaps Open Data | — | no | `https://gis-pdx.opendata.arcgis.com/` | 2026-06 |
| Potholes & street maintenance | PBOT Maintenance MapServer/0 | A | no | `https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Maintenance/MapServer/0` | 2026-06 |
| Street trees / canopy | Portland street tree inventory (253,951 trees) | A | no | via PortlandMaps open data | 2026-06 |
| Crash data | ODOT / Vision Zero, snapshot in `mcloughlin-99e/data/` | A | no | see that experiment's data dir | 2026-04 |
| Walking routes | OSRM public foot service | B | no | `https://routing.openstreetmap.de/routed-foot/route/v1/foot/` | 2026-06 |

## Air, fire, weather (national, all keyless)

| Topic | Source | Tier | Key | Endpoint | Last OK |
|---|---|---|---|---|---|
| PM2.5 / AQI monitors | EPA AirNow hourly files | A | no | `https://files.airnowtech.org/airnow/today/` | 2026-08-10 |
| Wildfire perimeters | NIFC WFIGS current | A | no | `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Interagency_Perimeters_Current/FeatureServer/0` | 2026-08-10 |
| Satellite fire hotspots | NASA FIRMS VIIRS 24h CSV | A | no | `https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_USA_contiguous_and_Hawaii_24h.csv` | 2026-08-10 |
| Wind, weather (model) | Open-Meteo forecast | B | no | `https://api.open-meteo.com/v1/forecast` | 2026-08-10 |
| Air quality (model + forecast) | Open-Meteo air-quality | B | no | `https://air-quality-api.open-meteo.com/v1/air-quality` | 2026-08-10 |
| Weather (station observations) | NOAA NWS | A | no | `https://api.weather.gov/stations/{id}/observations/latest` | 2026-08-10 |

**AirNow file format.** Two pipe-delimited files, no key, no signup.
`monitoring_site_locations.dat` gives site metadata with a 12-digit AQSID;
`HourlyData_YYYYMMDDHH.dat` (UTC) gives readings with a 9-digit one. **Join on the
last 9 characters.** No CORS headers, so a browser cannot read these directly and
they need a server-side proxy.

**AQI is NowCast, not the raw hourly value.** This is the trap. AirNow's published
AQI decay-weights the last 12 hours before hitting the breakpoint table, so a
single hourly reading run through the 24-hour breakpoints will disagree with every
other source in town. Working implementation, plus the 2024-revised PM2.5
breakpoints, in `smoke-pdx/data/_build.py`.

**Anchor a time window on the newest COMPLETE hour.** Two ways this bites, both
of which silently blanked the whole Smoke PDX map before they were caught:

1. AirNow publishes with a lag, so the current clock hour usually has no file.
2. Worse, the newest file often *exists but is half-written* — 113 PM2.5 rows
   where a complete file has ~1,350. Row-count the file and reject stubs.

Anchor to the newest hour that passes both checks, never to `now`.

**Never let a missing file count as a missing reading.** Hourly archives have
gaps (00Z, 01Z, and 02Z were all absent on 2026-08-10). If a validity rule like
EPA's "2 of the 3 most recent hours" is evaluated over clock hours, a server-side
gap makes every station look dead. Track which hours you actually retrieved and
evaluate over those. This generalizes to any gappy time series, not just AirNow.

**Open-Meteo takes coordinate lists.** Comma-separated `latitude` and `longitude`
fetch a whole grid in one call (~90 points per request is comfortable). It returns
a bare object for one point and an array for many, so handle both.

**FIRMS hotspots need care.** A VIIRS detection means a satellite saw heat in a
~375m cell: ag burns, industrial flares, and hot roofs all appear. Prefer named
perimeters when the reader needs to trust what a mark means.

**NIFC rate-limits hard.** It returned HTTP 429 twice during one source hunt.
Retry with a delay rather than in a tight loop.

## General purpose

| Topic | Source | Tier | Key | Endpoint | Last OK |
|---|---|---|---|---|---|
| Place → bbox | Nominatim | B | no | `https://nominatim.openstreetmap.org/search?q=&format=json&limit=1` | 2026-08-10 |
| Basemap tiles | CARTO light_all | — | no | `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` | — |

Nominatim wants a descriptive User-Agent and rate-limits to 1 req/sec.

---

## Patterns worth knowing

**ArcGIS FeatureServer / MapServer.** Most city and county portals run these.
Any layer becomes queryable GeoJSON:

```
{layer-url}/query?where=1%3D1&outFields=*&f=geojson&resultRecordCount=1000
```

Add `&geometry=<xmin>,<ymin>,<xmax>,<ymax>&geometryType=esriGeometryEnvelope&inSR=4326`
to clip to a bbox. Hit `{layer-url}?f=json` first to read the field list and the
record count before pulling anything.

**Socrata.** The other common portal engine (`data.<city>.gov`). Append
`.geojson` to a dataset id and use `$where` / `$limit`:

```
https://data.example.gov/resource/abcd-1234.geojson?$limit=5000
```

**Check for staleness before you trust a layer.** A portal will happily serve a
layer last updated in 2019 with no warning on the endpoint. Look for a max date
in the records themselves, not the portal's metadata page.
