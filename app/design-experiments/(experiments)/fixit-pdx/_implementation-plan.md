# Fix It PDX — Comprehensive Implementation Plan

> **For a fresh context.** Read this fully before touching any file.
> Location: `app/design-experiments/(experiments)/fixit-pdx/`
> Reuse heavily from: `app/design-experiments/(experiments)/mcloughlin-99e/` (Leaflet `MapView`, `Legend`, GeoJSON loaders, `data/` pattern, types).

---

## What this is

A reimagining of the City of Portland's **PDX Reporter** — the clunky, login-walled, 13-tile grid citizens use to report potholes, graffiti, dead streetlights, etc. Fix It PDX is a **front-end vision prototype** (real interactions, mocked submit) built to a quality where it can be put in front of PBOT as "here's the replacement experience — you build the backend."

**The one-sentence product:** a fast, beautiful, login-free way to report and track the physical condition of your streets.

**Name rationale:** "Fix It" = fix *this thing*, outcome-focused — not "fix PDX" (implies the city is broken) and not "Reporter" (reads as journalism / process, not outcome). The whole redesign reframes the act from *filing a complaint* to *getting something fixed*.

---

## The core concept: one map, two verbs

Do **not** build a report flow and a separate dashboard. Build **one map that does both**:

- **You land on the map.** It's already alive — pins for what's been reported and fixed near you, colored by status and iconed by category. Proof-of-work *is* the landing experience. Motivation before action.
- **Tap an empty spot → you're reporting.** Location is captured by the tap. Pick category → details → submit. (Map-first is the confirmed entry model.)
- **Tap an existing pin → you see its story.** Reported → Assessed → Fixed, with date and "fixed in X days" where true.

The map is the spine. Action and proof share one surface — the thing the real PDX Reporter and even the city's decent IRP dashboard completely fail to connect.

### Why we win the pitch
- **No login wall** — the single biggest killer of casual good-Samaritan reporting. Account becomes an optional "want status updates?" step at the *end*.
- **One consistent flow** absorbs the city's backend fragmentation. Behind the 12 tiles today are three different destinations (inline form, phone hotline, external Portland.gov form). The citizen should never feel that seam.
- **Lightweight Leaflet** renders instantly vs. the heavy, laggy Esri dashboard embed. "Mine's faster than the city's" is a literal demo point.

---

## Scope decisions (locked)

- **Infrastructure only.** Campsite reporting is **dropped** from the product — it's politically loaded, the city owns it elsewhere, and excluding it sharpens the whole story. Replace it with one small respectful pointer: *"Reporting a campsite? That's handled by the Impact Reduction Program →"* linking to `https://www.portland.gov/homelessness-impact-reduction/report-campsite`.
- **12 categories**, each routed to one of three handling patterns (table below).
- **Stats strip = two honest numbers:** *Reported this month* / *Fixed this month*. No cross-category median-days (a pothole and a streetlight aren't the same clock). But show **"fixed in X days" on each individual pin** where it's accurate.
- **Data: real snapshot, baked static** (like McLoughlin's `data/` folder). No live API calls at runtime — fast, stable for demos, immune to the city's outages. Mock only where real data isn't publicly available.
- **v1 vs v1.5 cut line enforced** (see Phase 6). The showcase-extras (Vision Zero layer, before/after carousels, monthly charts, yard-sign CTA) are explicitly **out of v1**.

---

## The 12 categories × 3 handling patterns

Every category shares the **same front-end flow** (tap location → pick category → details). They diverge only at the final action. Verify each category's real-world destination against the live site during build; the screenshots already confirm several (marked ✓confirmed).

| Category | Pattern | Notes |
|---|---|---|
| **Potholes** | Inline (mock submit) | HERO — has real reported/repaired data |
| Street Lighting | Inline (mock submit) | ✓confirmed inline form (Location*, Photo, Message) |
| Abandoned Auto | Inline (mock submit) | |
| Debris in Roadway | Inline (mock submit) | |
| Park Maintenance | Inline (mock submit) | |
| Plugged Storm Drain/Inlet | Inline (mock submit) | |
| Sidewalk Trip Hazard | Inline (mock submit) | |
| **Illegal Parking** | Phone handoff | ✓confirmed → 503-823-5195; pre-fill a read-aloud script from entered details |
| **Graffiti** | External handoff | ✓confirmed → portland.gov Report Graffiti; carry photo+location summary |
| Sidewalk Vegetation | External handoff | ✓confirmed → portland.gov Right-of-Way Obstruction form |
| Right of Way Obstruction | External handoff | → portland.gov obstruction form |
| Other / PDX 311 | External handoff | → 311 |

**Three patterns, defined:**
1. **Inline (mock submit):** photo + message + submit, fully in-app. Lands on confirmation screen with a fake reference #. This is the "look how easy it *could* be" pattern — make it the most polished.
2. **Phone handoff:** "This one's handled by phone." Show a big **Call now** (`tel:`) button AND a pre-formatted script block built from what they entered ("I'd like to report an illegally parked vehicle at {address}…") with a Copy button. Turns a dead-end into a warm handoff.
3. **External handoff:** "This goes to a city form." Collect photo + location + notes anyway, then **Continue to city form** (opens the real Portland.gov URL in a new tab) with a tidy summary to carry/paste. Never feel kicked out mid-thought.

---

## Phase 0 — Scaffold & reuse

Create the experiment skeleton and wire it into the sandbox.

**Files:**
- `page.tsx` — exports `metadata` (title + description per project CLAUDE.md), renders `<FixItPdx />`.
- `FixItPdx.tsx` — top-level client component, owns the screen-state machine.
- `styles.module.css` — design tokens + layout.
- `types.ts` — `Report`, `ReportStatus`, `Category`, `HandlingPattern`, `MapPin`.
- `data/` — static snapshots (Phase 1).
- `components/` — `MapView.tsx`, `Legend.tsx`, `ReportFlow.tsx`, `CategoryPicker.tsx`, `PinStory.tsx`, `StatsStrip.tsx` (extract as they grow; keep inline under 300 lines, extract by 500 per CLAUDE.md).

**Reuse from `mcloughlin-99e`:** copy and adapt `components/MapView.tsx` (Leaflet init, tile layer, bounds), `components/Legend.tsx`, and the `data/*.geojson.ts` / `data/*.json` loading pattern. Leaflet + `@types/leaflet` are already in `package.json`. Leaflet must be dynamically imported / client-only (no SSR) — follow how McLoughlin already does it.

**Screen-state machine** in `FixItPdx.tsx`:
```
'map'            // landing — living map + stats + CTA
'pick-location'  // tap-to-drop-pin (or use-my-location)
'pick-category'  // 5 common chips + search/more (12 categories)
'report-inline'  // photo + message + submit
'report-phone'   // call button + prefilled script
'report-external'// summary + continue-to-city-form
'confirmation'   // reference # + what-happens-next + delight
'pin-story'      // tap an existing pin: status timeline
```

---

## Phase 1 — Data acquisition (real snapshot → static JSON)

Build a small one-time snapshot, NOT a runtime integration. Output baked JSON into `data/`.

**Schema (`types.ts`):**
```ts
type ReportStatus = 'reported' | 'in_progress' | 'fixed'
interface MapPin {
  id: string
  category: CategoryId
  status: ReportStatus
  lat: number
  lng: number
  reportedDate: string   // ISO
  resolvedDate?: string  // ISO, present when status === 'fixed'
  daysToFix?: number     // computed where both dates exist
  note?: string
}
```

**Real sources to pull from (snapshot to static JSON):**
- **Portland Open Data portal:** `https://gis-pdx.opendata.arcgis.com/` — browse for the pothole reported/repaired layer, Pavement Management System, PedPDX (sidewalk network), Parks. Most ArcGIS Hub datasets expose a GeoJSON/CSV download and a queryable REST endpoint (`.../FeatureServer/0/query?where=1=1&outFields=*&f=geojson`).
- **Potholes Reported & Repaired app:** `https://www.arcgis.com/apps/webappviewer/index.html?id=1606bfad51a34a99a5d11d8016bd78ae` — inspect for the underlying feature service; this is the gold dataset (real reported + repaired status + dates) that powers the hero category and the "fixed in X days" pin stories.
- **PortlandMaps REST services root:** `https://www.portlandmaps.com/arcgis/rest/services` and `https://www.portlandmaps.com/od/rest/services/` — enumerate layers for street lighting, traffic signals, abandoned autos, storm drains. (Note: some endpoints intermittently 500 — retry, or pull the GeoJSON via the Hub dataset page instead.)
- **IRP Campsite Reports feature service** (`.../COP_OpenData_Miscellaneous/MapServer/1396`) — reference ONLY, to model the report-record schema (status/date/photo fields). Not used in product (campsite dropped).
- **Crash data for Vision Zero (v1.5):** already in `mcloughlin-99e/data/` (`fatalCrashes.json`, `pedCrashes.json`, `highCrashIntersections.json`). Reuse directly when v1.5 lands.

**Method:** prefer the ArcGIS Hub dataset "Download → GeoJSON" or the FeatureServer `query?f=geojson` endpoint. Use `WebFetch`/curl during build to grab a bounded set (e.g. last 12 months, a manageable count — sample/decimate to a few hundred pins per category so the map stays snappy). Normalize each source into the `MapPin` schema above and write `data/reports.json`.

**Mock where needed:** for any category without a clean public dataset, synthesize plausible pins within Portland bounds (real street coordinates, realistic date spreads, sensible status mix) so every category has presence on the map. Clearly comment which pins are real vs. synthesized in a `data/SOURCES.md`.

**Stats:** compute *Reported this month* / *Fixed this month* from the snapshot at build time (or derive on load from `reports.json`). Keep honest — numbers should reconcile with the visible pins.

---

## Phase 2 — The living map (landing)

The home screen. Full-bleed Leaflet map centered on Portland (reuse McLoughlin's bounds/center).

- **Pins:** render all `reports.json` pins. **Color by status** (reported / in-progress / fixed), **icon by category**. Cluster if density warrants (Leaflet marker clustering) so it stays clean — the user explicitly wants a *clean* map, not the IRP dashboard's clutter.
- **Stats strip:** compact, two numbers — *Reported this month* / *Fixed this month*. Honest, outcome-focused, not a 6-card KPI wall.
- **Legend:** status colors + category icons (adapt McLoughlin's `Legend`).
- **Primary CTA:** a single prominent **"Report something"** button → enters `pick-location`. (Also support tapping empty map directly to start a report.)
- **Performance is the pitch:** keep it instant. Decimate data, lazy-load, no heavy embeds.

---

## Phase 3 — The report flow (map-first)

The core loop. Identical for all 12 categories until the final action.

**Step 1 — `pick-location`:** Map with a draggable pin; "Use my location" button (geolocation API, graceful fallback). Reverse-geocode to show a human address (Nominatim or a baked lookup; if reverse-geocode is fragile, just show coordinates + a confirm). Big **Confirm location** CTA.

**Step 2 — `pick-category`:** "What's here?" Show the ~5 most common as large chips (**Pothole, Graffiti, Street light, Abandoned auto, Debris**), plus type-to-search and a **More** expansion to the full 12. This is where we kill the 13-tile choice-paralysis. Selecting routes to the category's handling pattern.

**Step 3 — handling branch:**
- `report-inline`: Photo (optional, file input w/ preview), Message (optional), **Submit report** → `confirmation`.
- `report-phone`: Headline ("Parking is handled by phone"), **Call now** (`tel:5038235195`), a prefilled script block + Copy button built from {category, address, note}.
- `report-external`: Headline ("This goes to a city form"), summary of what they entered, **Continue to city form** (`target="_blank"` to the real Portland.gov URL), with a "here's what to bring" recap.

**Step 4 — `confirmation`:** Fake reference # (e.g. `FIX-2026-04821`), **what happens next** (set honest expectations: who gets it, rough timeline), and a moment of *earned delight* — "You're the kind of person who makes the city better." Optional, low-key: **"Want status updates? Add your email"** (the login wall, demoted to an opt-in afterthought). Optionally drop the new pin onto the map so the user sees their contribution appear.

---

## Phase 4 — Pin story (proof of work)

Tap any existing pin → `pin-story` panel/sheet:
- Category icon + label, status badge.
- **Timeline:** Reported → Assessed → Fixed, with dates for each known stage.
- **"Fixed in X days"** when `resolvedDate` exists — concrete, true, per-pin (never a fake aggregate).
- Note/photo if present.

This is the "look at all the work that's been done" the user wants — distributed across every pin rather than a separate dashboard tab.

---

## Phase 5 — Polish (the "almost fun")

- **Aesthetic:** Portland civic — muted blues/greens, Rose City restraint. Clean, modern, pragmatic, NOT flashy. Mobile-first (good Samaritan standing on a sidewalk with a phone); fully responsive up to desktop.
- **Status palette:** reported (amber/blue), in-progress (orange), fixed (green) — consistent across pins, legend, and timelines.
- **Motion:** entrance animations + stagger on the map landing and category chips; satisfying micro-feedback on submit and on a pin dropping. Consider running `/animation-audit` after the flow works.
- **States:** loading, empty (no pins in view), geolocation-denied, photo-too-large — all handled gracefully (cf. the `feedback_clean_fallbacks` memory: prefer code guards over workflow discipline).
- **Confirmation delight:** the one place to be a little warm and rewarding without being cutesy.

---

## Phase 6 — v1.5 backlog (DO NOT build in v1)

Documented so we don't lose the vision, explicitly deferred to keep v1 tight and pitch-ready:
- **Vision Zero layer:** toggle showing crash/high-crash-network data (reuse McLoughlin's crash JSON). Note: you *can't* report speeding here, so frame it as a public traffic-safety acknowledgment + **free Vision Zero yard sign** request CTA.
- **Before/after photo carousels** on fixed pins (the city publishes these for some programs).
- **Monthly charts** (reported vs. fixed over time) — only if they stay lightweight.
- **Category-specific micro-questionnaires** (1–2 smart questions to pre-triage).

---

## SEO & sandbox registration (per project CLAUDE.md)

After the experiment renders:
- `app/sitemap.ts` — confirm the route is auto-discovered (experiments are dynamic); add to `staticRoutes` only if needed.
- `public/llms.txt` — concise entry.
- `public/llms-full.txt` — expanded entry w/ description.
- `README.md` — only if treated as a new section.
- `docs/01-progress.md` — note the addition.
- `page.tsx` `metadata` — title + description.
- Gallery: ensure it appears on `app/design-experiments/page.tsx`.
- Consider `opengraph-image.tsx` (McLoughlin has one to copy).

---

## Execution order

1. **Phase 0** — scaffold + reuse McLoughlin Leaflet bones. Get an empty Portland map rendering client-side.
2. **Phase 1** — snapshot real data → `data/reports.json` + `data/SOURCES.md`. This is research-heavy; do it before UI so the map has real content.
3. **Phase 2** — living map: pins, status colors, category icons, stats strip, legend, CTA.
4. **Phase 3** — report flow: location → category → 3 handling branches → confirmation.
5. **Phase 4** — pin story timeline.
6. **Phase 5** — polish, motion, states, responsive.
7. **SEO/registration**, then `/ship-experiment`.

Run `npx tsc --noEmit` after each phase; fix types before proceeding. Run `npm run build` at the end for a clean production build. Use `/sanity-check` or `/ts-handoff` before shipping.

---

## Prompt for James to use after clearing context

```
Read and execute the implementation plan at:
app/design-experiments/(experiments)/fixit-pdx/_implementation-plan.md

Work phase by phase in the order specified. The plan is self-contained.
Reuse the Leaflet map bones from mcloughlin-99e. Phase 1 (real data
snapshot from Portland open data) is research-heavy — do it before the UI.
After completing each phase, run `npx tsc --noEmit`. Summarize what changed.
```
