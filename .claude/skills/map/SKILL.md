---
name: map
description: Build a data map experiment from a region and a question. Hunts real open data, snapshots it with provenance, and scaffolds a Leaflet map with a consistent legend and palette.
---

# map

Turn "map X over Y" into a working design experiment. The map chrome is a solved
pattern and lives in `templates/`. The work of this skill is the **data**: finding
a real source, proving it's real, and being honest in the interface about what we
could and could not verify.

## Usage

```
/map smoke concentration from AQI in greater Portland
/map heat islands and cooling centers in Sacramento
/map every public restroom in Seattle, plus hours
/map crash history on Powell Blvd
```

Output lands in `app/design-experiments/(experiments)/[slug]/` and ships with
`/ship-experiment` like any other experiment.

## The Six Steps

Run them in order. Step 3 is a hard stop.

### 1. Brief

Restate the stream of consciousness as three things, and show it back in two lines:

- **Place** — the region, at the zoom a person actually needs
- **Question** — the one thing the map answers ("where is the smoke right now")
- **Layers** — three or four, no more

**Cap the scope at one question and four layers.** `mcloughlin-99e` has twelve data
files and a 139k-line sidewalk layer; that is a case study that earned its weight over
weeks. A `/map` run produces a first draft we grow from, not that.

If the request names a region larger than a metro (a whole state, the country), ask
whether they want the metro or the full extent. It changes every source decision.

### 2. Geography

Resolve the place to numbers and write `data/place.ts` from
`templates/place.ts.tpl`. Never hardcode a bounding box in `MapView`.

Use Nominatim for the lookup:

```
https://nominatim.openstreetmap.org/search?q=<place>&format=json&polygon_geojson=0&limit=1
```

It returns `boundingbox` as `[south, north, west, east]`. Convert to the
`[[south, west], [north, east]]` Leaflet order in `place.ts`. Nominatim requires a
descriptive User-Agent and rate-limits to 1 req/sec, so make one call.

**Widen past city limits when the phenomenon does.** Air, smoke, watersheds, and
transit corridors do not stop at a jurisdiction line. Administrative data (permits,
311, code enforcement) usually does. Pick the extent that matches the phenomenon,
not the extent that matches the data owner.

### 3. Source hunt — STOP HERE

Search for real sources across every level: city and county open-data portals
(most run ArcGIS or Socrata), state agencies (DEQ, DOT, health authority), federal
(EPA, NOAA, USGS, NASA, Census), and topic aggregators. Check
`references/known-sources.md` first — it accumulates across runs.

For each candidate, **actually hit the endpoint** and record what came back. Then
present a ranked short list, two to four options, in a table:

| Source | Tier | Cadence | Key | Records | Geometry |
|---|---|---|---|---|---|

**Tier is the honesty rating:**

- **A** — primary. The agency that owns the data, publishing it directly.
- **B** — aggregator republishing government data (OpenAQ, ArcGIS Living Atlas).
- **C** — community or crowdsourced (PurpleAir, OSM, citizen sensors).
- **D** — could not fetch, could not verify, or could not determine provenance.

Then **stop and let the user pick.** Do not proceed on your own judgment. Portals
are full of layers that look right and are five years stale or cover the wrong
jurisdiction, and that is not visible from a title.

#### The verification rule

A layer may only be drawn as real if we fetched it and counted the records. If we
could not:

- drop it, or
- draw it and **label it in the interface**, not only in `SOURCES.md`

A caveat buried in a doc nobody opens is not disclosure. `fixit-pdx` marks
`"real": true` per record and the popup says "real city record" — generalize that.
Never fabricate a field the source does not have. When Fix It PDX found the pothole
layer had no repair date, real closed potholes got **no** `daysToFix`, and the copy
changed to match. That instinct is the standard.

#### API keys

**You cannot create API keys.** Signup means email verification and accepting terms
of service, and both are the user's to do. So:

1. Rank keyless sources first when quality is close.
2. If a keyed source is clearly better, give the user, in one message: the signup
   URL, the env var name, and the exact command to store it.
3. **Keep building with the keyless fallback.** Never block on a key.

Before writing any key-bearing file, confirm `.env*.local` is in `.gitignore` and
add it if not. This repo's `.gitignore` did not cover it as of August 2026.

Because keyed sources go through a proxy route (step 4), swapping the fallback for
the real feed later is a one-line change.

### 4. Data

**Snapshot is the default.** A refresh button is theater when the data barely moves.
Ask for live only when staleness breaks the map: air quality, fire, transit
position, weather, anything where a reading from last Tuesday is worthless.

**Snapshot path:**
- `data/_build.py` from `templates/_build.py.tpl` — deterministic (seed any random),
  fetches once, normalizes into the schema in `types.ts`, writes JSON next to itself
- `data/SOURCES.md` from `templates/SOURCES.md.tpl` — tier, endpoint, fields used,
  date verified, record count, and exactly which records are real
- Commit the script next to its output. The script is the provenance.

**Live path:**
- `app/api/[slug]/route.ts` from `templates/route.ts.tpl` — server-side proxy so any
  key stays out of the browser, with `revalidate` matched to the real cadence
- Ship a snapshot too, as the fallback when the fetch fails
- A refresh button shows the fetch timestamp, not just a spinner

Keep GeoJSON out of the repo when it is enormous. Decimate to what the zoom can
actually show and say so in `SOURCES.md`.

### 5. Scaffold

Copy from `templates/`, strip the `.tpl` extension:

```
[slug]/
├── page.tsx              ← page.tsx.tpl (thin: metadata + component)
├── [Name].tsx            ← Experiment.tsx.tpl (state, layer toggles, selection)
├── styles.module.css     ← starts with the full contents of map-tokens.css
├── types.ts              ← types.ts.tpl
├── map.config.ts         ← map.config.ts.tpl
├── components/
│   ├── MapView.tsx       ← MapView.tsx.tpl (all Leaflet lives here)
│   ├── Legend.tsx        ← Legend.tsx.tpl
│   └── scale.ts          ← scale.ts.tpl (value → color, radius, weight)
└── data/
    ├── _build.py, SOURCES.md, *.json
    └── place.ts
```

`map.config.ts` is the machine-readable spec: place, bbox, zoom, layers, sources,
encoding. Fill it in completely. It is what a future public map tool would read.

### 6. Color and encoding

**Invoke the `dataviz` skill for the palette.** Do not invent a second opinion about
sequential, diverging, and categorical scales.

**Exception: standardized domain palettes win.** Some scales are legally or
conventionally fixed and people read them without a legend. AQI is the canonical
case (EPA's green/yellow/orange/red/purple/maroon), and flood stage, UV index,
hurricane category, and fire danger all behave the same way. Use the official
colors, adjust only lightness for legibility on the basemap, and say in
`SOURCES.md` exactly what you changed and why. Inventing a prettier scale here
would be worse design.

On top of the palette, four map-specific rules:

1. **The basemap recedes.** Use a light, desaturated basemap. CARTO `light_all` is
   the house default and matches the existing three maps. Data carries all the
   saturation on the page.
2. **Fills over tiles cap at ~0.55 opacity.** Past that the streets underneath
   vanish and people lose their bearings.
3. **Ordered scales need a second channel.** Hue alone fails for roughly 1 in 12
   men. Drive radius, ring weight, or pattern from the same value. The official
   AQI ramp (green/yellow/orange/red/purple) is a live example of this problem.
4. **The legend is the key to reading the map,** so it states units and the
   as-of time, not just colors. Prefer one continuous bar with tick labels over a
   stack of swatch rows: it reads faster and takes a third of the height.
   Collapse it by default under 540px.
5. **Place names go on their own pane, and where they sit depends on the
   marks.** The moment any tint covers the basemap, labels baked into the tiles
   become unreadable, so they need a labels-only tile layer on their own pane
   (CARTO serves `light_only_labels`), with `pointerEvents: none`. Then:
   - Markers that **print a value** (a number in a badge): labels go *below* at
     `zIndex: 450`, between the overlay pane (400) and the marker pane (600). A
     city name must never cover a reading.
   - Markers that are **pure color** (dots, blooms): labels go *above* at
     `zIndex: 650`. A name landing on a colored dot costs nothing, while a city
     disappearing under one costs the reader their bearings.

   Keep the white halo baked into those tiles; it is what makes the names
   readable over saturated color.
6. **Draw field data on a screen-space lattice, not on the source grid.** If
   sample density varies (a fine patch inside a coarse one), rendering cells
   directly makes the dense patch read as a rectangle floating in the sparse
   field. Sample the field onto a lattice spaced in *pixels*, snapped to a
   global grid so it does not shimmer while panning, and re-render on
   `moveend`/`zoomend`. Apparent spacing then stays constant at every zoom.
7. **Any color not derived from a measurement must say so on the page.** Soft
   interpolated-looking washes are persuasive and easy to mistake for a model.

## Non-Negotiables

Learned from the three maps that came before. Do not relearn them.

- **Leaflet is dynamic-imported inside an effect**, never at module scope. It
  touches `window` and will break the build otherwise.
- **`preferCanvas: true`** on map init. Hundreds of markers as DOM nodes will crawl.
- **`import 'leaflet/dist/leaflet.css'`** in `page.tsx`, not the component.
- **A `ResizeObserver` calls `invalidateSize()`.** Without it the map renders as
  grey tiles inside a flex layout.
- **Every map ships a fullscreen toggle.** A ⤢ button top-right that swaps the
  wrapper to `position: fixed; inset: 0`, locks body scroll, and exits on Esc. Not
  the browser Fullscreen API. Templates carry it; do not ship a map without it.
  Bump `resizeKey` on toggle so Leaflet re-measures, or the map renders at the old
  size until the next pan.
- **Attribution is required.** Basemap and every data source. `attributionControl`
  with `prefix: false`, bottom-left.
- **Put the number on the map.** If a layer's whole point is a value, draw the
  value in the marker rather than making people hover for it. Badge markers are
  `L.divIcon`, so use `zIndexOffset` to keep the important ones on top.
- **Escape any HTML built for a popup.** `MapView.tsx.tpl` ships an `escapeHtml`.
- **Clean up on unmount** — `map.remove()`, disconnect the observer, null the refs.

## Ship

Hand off to `/ship-experiment`, which handles the screenshot, gallery entry,
OG image, README, and commit. Before that, per the project SEO checklist, the new
route needs entries in `public/llms.txt` and `public/llms-full.txt`, and a note in
`docs/01-progress.md`.

Then append the confirmed sources to `references/known-sources.md`. That file is the
point. Ten maps in, it is a vetted registry by topic and jurisdiction, which is the
raw material for a public map tool and for selling curation.

## Portability

Everything the skill needs lives in this directory. The only masons-world-specific
touches are in Ship, above. When this becomes its own project, that section is the
only thing to rewrite.
