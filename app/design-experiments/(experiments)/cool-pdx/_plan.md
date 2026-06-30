# Cool PDX — Scoped Implementation Plan

> A Portland heat-relief map. Third map experiment, built on the same Leaflet + Portland
> Open Data toolchain as McLoughlin/99E and Fix It PDX — but a new angle: public health, not traffic.

---

## The one tight thing

**On a hot day in Portland, find the nearest relief — shade, water, cool air — and see at a glance which parts of the city are shaded and which bake.**

Everything serves that sentence. The 2021 heat dome killed 69 people in Multnomah County; heat is the city's deadliest recurring climate event, and it lands hardest on the tree-poor, low-shade eastside. This map makes relief findable and makes the shade gap visible.

One verb: **cool down.** (Mirrors Fix It PDX's "one map, two verbs" discipline — here it's one map, one verb.)

---

## Why this is a real level-up (not a repeat)

| Built already | New here |
|---|---|
| Points + lines + polygons | **Density / heat-gradient layer** (canopy as a shade proxy) |
| Static narrative | **Browser geolocation** — "relief near me," nearest fountain/cool spot |
| Dark traffic-safety aesthetic | **Light, summer/daytime aesthetic** — heat reads as warmth, shade as cool |
| Corridor bbox | **City-wide data, pre-binned into a grid** so the static JSON stays small |

The heat-gradient + geolocation are the two genuinely new techniques. Everything else reuses proven McLoughlin bones.

---

## Data sources (verified live on Portland Open Data)

All from `gis-pdx.opendata.arcgis.com` / `portlandmaps.com/arcgis` — same ArcGIS REST query helper already in `scripts/fetch-mcloughlin-data.mjs`.

1. **Street Tree Inventory – Active Records** — `gis-pdx` item `c2b02440053f459db71e1109b9947e51` (~200k+ points). *Not rendered raw.* The fetch script bins points into a coarse grid (count per cell) → a lightweight canopy-density layer = the shade gradient. **(new-skill core)**
2. **Drinking Fountains** — `gis-pdx` "Drinking Fountains" dataset (Benson Bubblers + others). Rendered as water-relief points.
3. **Cooling / cool-air locations** — **curated static JSON, hand-built.** Honest caveat: Multnomah County publishes cooling centers only as a seasonal, heat-event-activated list (webpage/PDF), not a clean year-round API. So we seed a small JSON of reliable year-round cool-air refuges (libraries, community centers, malls) and label the heat-event-only centers distinctly. This file is authored, not fetched.
4. **Spray features / splash pads** *(optional, stretch)* — Portland Parks via OSM Overpass (`leisure=splash_pad` / `playground` water) using the existing `fetchOverpass` helper.

> First implementation step verifies each exact layer URL by hitting `/query?where=1=1&resultRecordCount=1`, same as the McLoughlin "update URL if endpoint has moved" pattern. URLs pinned then, not assumed.

### Fetch status — DONE (2026-06-29)

`scripts/fetch-cool-pdx-data.mjs` written, wired as `pnpm fetch:cool-pdx`, and run. Real data committed-ready in `data/`:

- **canopyGrid.json** — 253,951 trees binned into **1,350 cells** (`Parks_Street_Tree_Inventory_Active/MapServer/4`, paged 127×2000, log-normalized `intensity`). 788 KB pretty-printed.
- **fountains.json** — **320** drinking fountains (OSM `amenity=drinking_water` + bubbler flag).
- **coolingSpots.json** — **139** libraries + community centers (OSM), `kind` = library | community-center.

Drinking Fountains city layer (`Parks_Misc/MapServer/19`, "Parks Furnishings") exists but mixes asset types; OSM was cleaner. Authoritative city fountains = a future swap-in.

**Build-phase optimization:** 788 KB is heavy if imported into the bundle. Before ship, store canopy cells compactly (e.g. `[ix, iy, intensity]` triples + cell size in `source`) and rebuild rectangles client-side — cuts the file ~5×. Reconstruct in a small `loadCanopy()` helper.

---

## Architecture (mirror McLoughlin/99E)

```
cool-pdx/
├── page.tsx                 # metadata + mounts client component
├── CoolPdx.tsx              # main client component (raw Leaflet, no react-leaflet)
├── styles.module.css        # light/warm theme
├── opengraph-image.tsx      # OG card
├── types.ts
├── components/
│   ├── MapView.tsx          # Leaflet init, light Carto basemap, layers
│   ├── Legend.tsx           # shade gradient ramp + point swatches
│   ├── LayerToggles.tsx     # canopy / fountains / cooling / spray
│   └── ReliefCard.tsx       # "nearest relief" result on geolocate
└── data/
    ├── canopyGrid.json      # binned tree-density grid (fetched)
    ├── fountains.json       # drinking fountains (fetched)
    ├── coolingSpots.json    # cool-air refuges (curated, hand-authored)
    └── sprayFeatures.json   # splash pads (fetched, optional)
```

Fetch script: `scripts/fetch-cool-pdx-data.mjs`, wired as `pnpm fetch:cool-pdx` in `package.json`. Reuses `fetchArcGIS`, `fetchOverpass`, grid-binning added. Output committed so builds never depend on network.

---

## Build phases (each a coherent commit)

1. **Scaffold** — folder, `page.tsx` + metadata, empty `CoolPdx.tsx`, `styles.module.css`, `opengraph-image.tsx`, `types.ts`. Mirror McLoughlin's client-mount + dynamic-import-Leaflet pattern (React 19 peer-dep avoidance).
2. **Fetch script** — verify/pin layer URLs; pull trees → bin to grid → `canopyGrid.json`; pull fountains → `fountains.json`. Hand-author `coolingSpots.json`. Commit data.
3. **Map shell** — light Carto basemap, Portland bounds, base view, attribution.
4. **Canopy heat layer** — render `canopyGrid.json` as graduated translucent cells (greener = shaded, bare = exposed). *The new gradient skill.*
5. **Relief points** — fountains + cooling spots (+ spray) as themed markers; layer toggles + legend with gradient ramp.
6. **"Relief near me"** — browser geolocation → drop a "you" marker, compute + highlight nearest fountain and nearest cool-air spot, show `ReliefCard`. Graceful denial fallback (manual map use still works — per [[feedback_clean_fallbacks]]).
7. **Context strip** — short, honest narrative beneath the map: the 2021 heat dome, the eastside canopy gap, how to use the map. One or two beats, not a scrollytelling epic.
8. **Polish** — entrance animations (project motion pattern), mobile layout, share button + OG. Run `/sanity-check` and `/ts-handoff`.

After each phase: `npx tsc --noEmit`. At the end: `pnpm build` clean.

---

## Scope guardrails (resist creep)

**In scope (MVP):** canopy shade gradient · fountains · cooling spots · geolocation · toggles · legend · short context.

**Out of scope → future experiments:**
- Real CAPA/PSU 2021 heat-island raster overlay (raster tiling is its own project)
- Neighborhood canopy-equity scoring / income overlay (the data-story sibling)
- Wildfire-smoke / AQI layer (PurpleAir/DEQ — different data domain, summer-smoke angle)
- Routing ("walk me there in shade") — needs isochrone/routing, a separate level-up

---

## SEO checklist (per CLAUDE.md, at ship)

`app/sitemap.ts` auto-discovers experiments — confirm. Add to `public/llms.txt`, `public/llms-full.txt`, `docs/01-progress.md`. Screenshot via `/ship-experiment`.

---

## Decisions (locked 2026-06-29)

1. **Name/slug** — `cool-pdx` ("Cool PDX").
2. **Framing emphasis** — **locator-first**: lead with "find relief near me," canopy gap as supporting context.
3. **Geographic scope** — **city-wide, binned grid**: whole of Portland, tree points pre-binned so the gradient stays light.
