#!/usr/bin/env node
// Fetches Portland Open Data safety layers, trims each to the McLoughlin corridor bbox,
// and writes static GeoJSON into the design experiment's data folder.
//
// Source portal: https://gis-pdx.opendata.arcgis.com/
// Re-run this script when you want fresher data. The output files are committed to the repo
// so builds never depend on network availability.

import { writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(
  __dirname,
  '..',
  'app',
  'design-experiments',
  '(experiments)',
  'mcloughlin-99e',
  'data',
)

// Bbox tuned to roughly cover the McLoughlin / 99E corridor from the Ross Island
// Bridge area south to ~200 ft into Milwaukie.
const BBOX = {
  south: 45.438,
  west: -122.672,
  north: 45.514,
  east: -122.638,
}

const DATASETS = [
  {
    id: 'high-crash-streets',
    title: 'High Crash Streets',
    url: 'https://gis-pdx.opendata.arcgis.com/api/download/v1/items/206a6a67222a4157ae692b58ac47a7ea/geojson?layers=1429',
    outFile: 'highCrashStreets.json',
  },
  {
    id: 'high-crash-intersections',
    title: 'High Crash Intersections',
    url: 'https://gis-pdx.opendata.arcgis.com/api/download/v1/items/bce6a71d1eaf4013bcad42d878d6fe49/geojson?layers=1428',
    outFile: 'highCrashIntersections.json',
  },
  // Speed-limits dataset is available at the same portal (item b0209a2063e346b586782560fa64bda6,
  // layer 225) but is not used in v1. The corridor bbox returns ~2k segments which requires a
  // stricter street-name filter before it's useful on the map.
]

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const BBOX_TUPLE = `${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}`
const OVERPASS_QUERY = `
[out:json][timeout:25];
(
  way["ref"~"99E"]["highway"](${BBOX_TUPLE});
  way["name"~"McLoughlin",i]["highway"](${BBOX_TUPLE});
  way["ref"~"OR[- ]?99E",i]["highway"](${BBOX_TUPLE});
  way["ref"~"US[- ]?99E",i]["highway"](${BBOX_TUPLE});
);
out geom;
`.trim()

const PARKS_QUERY = `
[out:json][timeout:25];
(
  node["leisure"="park"](${BBOX_TUPLE});
  way["leisure"="park"](${BBOX_TUPLE});
  way["leisure"="nature_reserve"](${BBOX_TUPLE});
  relation["leisure"="nature_reserve"](${BBOX_TUPLE});
  way["boundary"="protected_area"](${BBOX_TUPLE});
  way["landuse"="allotments"](${BBOX_TUPLE});
  way["leisure"="garden"](${BBOX_TUPLE});
);
out geom;
`.trim()

const SCHOOLS_QUERY = `
[out:json][timeout:25];
(
  node["amenity"="school"](${BBOX_TUPLE});
  way["amenity"="school"](${BBOX_TUPLE});
);
out geom;
`.trim()

const MAX_ORANGE_QUERY = `
[out:json][timeout:25];
relation["route"="light_rail"]["name"~"Orange",i](${BBOX_TUPLE});
way(r)["railway"="light_rail"];
out geom;
`.trim()

const SPRINGWATER_QUERY = `
[out:json][timeout:25];
(
  way["name"~"Springwater",i](${BBOX_TUPLE});
);
out geom;
`.trim()

function featureInBbox(feature) {
  const geom = feature?.geometry
  if (!geom) return false
  const coords = geom.coordinates
  const inBox = ([lon, lat]) =>
    lat >= BBOX.south && lat <= BBOX.north && lon >= BBOX.west && lon <= BBOX.east
  const check = (arr) => {
    if (typeof arr[0] === 'number') return inBox(arr)
    return arr.some((x) => check(x))
  }
  if (!Array.isArray(coords)) return false
  return check(coords)
}

async function fetchDataset({ title, url }) {
  process.stdout.write(`  → ${title}... `)
  const res = await fetch(url, {
    headers: { Accept: 'application/geo+json, application/json' },
    redirect: 'follow',
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  const before = Array.isArray(data.features) ? data.features.length : 0
  const kept = (data.features || []).filter(featureInBbox)
  const out = {
    type: 'FeatureCollection',
    source: { title, url, fetchedAt: new Date().toISOString() },
    features: kept,
  }
  console.log(`kept ${kept.length} / ${before}`)
  return out
}

async function fetchCorridorFromOverpass() {
  process.stdout.write('  → Corridor from OSM Overpass... ')
  const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(OVERPASS_QUERY)}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'masons-world-design-experiment/1.0 (https://masons-world.vercel.app)',
    },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }
  const data = await res.json()
  const ways = (data.elements || []).filter((e) => e.type === 'way' && Array.isArray(e.geometry))
  const segments = ways.map((w) =>
    w.geometry.map((pt) => [Number(pt.lon.toFixed(6)), Number(pt.lat.toFixed(6))]),
  )
  console.log(`${ways.length} ways, ${segments.reduce((n, s) => n + s.length, 0)} points`)

  // Bridge small gaps between OSM way endpoints so the corridor renders as a
  // continuous line. Uses ~15 m threshold (0.00014° lat). Endpoints belonging
  // to the same segment are never bridged to each other.
  const STITCH_DEG = 0.00014
  const endpoints = []
  segments.forEach((seg, i) => {
    endpoints.push({ segIndex: i, end: 'start', coord: seg[0] })
    endpoints.push({ segIndex: i, end: 'end', coord: seg[seg.length - 1] })
  })
  const bridges = []
  const used = new Set()
  for (let i = 0; i < endpoints.length; i++) {
    for (let j = i + 1; j < endpoints.length; j++) {
      const a = endpoints[i]
      const b = endpoints[j]
      if (a.segIndex === b.segIndex) continue
      const key = `${i}-${j}`
      if (used.has(key)) continue
      const dLon = a.coord[0] - b.coord[0]
      const dLat = a.coord[1] - b.coord[1]
      const d = Math.sqrt(dLon * dLon * 0.5 + dLat * dLat)
      if (d > 0 && d <= STITCH_DEG) {
        bridges.push([a.coord, b.coord])
        used.add(key)
      }
    }
  }
  if (bridges.length > 0) {
    segments.push(...bridges)
    console.log(`    stitched ${bridges.length} small gap(s)`)
  }

  const lats = segments.flat().map(([, lat]) => lat)
  const lons = segments.flat().map(([lon]) => lon)
  const center = [
    Number(((Math.min(...lats) + Math.max(...lats)) / 2).toFixed(5)),
    Number(((Math.min(...lons) + Math.max(...lons)) / 2).toFixed(5)),
  ]

  return {
    type: 'Feature',
    properties: {
      name: 'SE McLoughlin Boulevard / OR-99E',
      segment: 'Ross Island Bridge to Milwaukie city limit',
      source: { title: 'OpenStreetMap via Overpass API', fetchedAt: new Date().toISOString() },
    },
    geometry: {
      type: 'MultiLineString',
      coordinates: segments,
    },
    center,
  }
}

// Converts EsriJSON geometry to GeoJSON geometry (for older ArcGIS servers)
function esriGeomToGeoJSON(geom) {
  if (!geom) return null
  if (geom.x !== undefined) return { type: 'Point', coordinates: [geom.x, geom.y] }
  if (geom.paths) return geom.paths.length === 1
    ? { type: 'LineString', coordinates: geom.paths[0] }
    : { type: 'MultiLineString', coordinates: geom.paths }
  return null
}

// ArcGIS REST query helper — tries GeoJSON first, falls back to EsriJSON conversion
async function fetchArcGIS({ title, url, where, outFields = '*' }) {
  process.stdout.write(`  → ${title}... `)
  const base = {
    geometry: `${BBOX.west},${BBOX.south},${BBOX.east},${BBOX.north}`,
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    inSR: '4326',
    outSR: '4326',
    outFields,
    returnGeometry: 'true',
    where,
  }

  // Try GeoJSON first (ArcGIS 10.3+)
  let res = await fetch(`${url}/query?${new URLSearchParams({ ...base, f: 'geojson' })}`, {
    headers: { Accept: 'application/geo+json, application/json' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)

  let data = await res.json()
  if (data.error) {
    // Fall back to EsriJSON
    res = await fetch(`${url}/query?${new URLSearchParams({ ...base, f: 'json' })}`)
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`)
    data = await res.json()
    if (data.error) throw new Error(`ArcGIS error ${data.error.code}: ${data.error.message}`)
    data = {
      type: 'FeatureCollection',
      features: (data.features || []).map((f) => ({
        type: 'Feature',
        properties: f.attributes || {},
        geometry: esriGeomToGeoJSON(f.geometry),
      })),
    }
  }

  const features = Array.isArray(data.features) ? data.features : []
  console.log(`${features.length} features`)
  return {
    type: 'FeatureCollection',
    source: { title, fetchedAt: new Date().toISOString() },
    features,
  }
}

async function fetchPedCrashes() {
  // ODOT crash data (2018-2023) on ODOT ArcGIS Server — pedestrian-involved only
  // Severity: KABCO field (K=fatal, A=serious injury, B/C/O=minor/property)
  return fetchArcGIS({
    title: 'ODOT Crash Data — Pedestrian Involved',
    url: 'https://gis.odot.state.or.us/arcgis1006/rest/services/agol/OTSDE_Crash/MapServer/0',
    where: 'TOT_PED_CNT > 0',
    outFields: 'CRASH_ID,TOT_PED_CNT,TOT_PED_INJ_CNT,TOT_PED_FATAL_CNT,CRASH_DT,KABCO,Graph_Severity',
  })
}

async function fetchFatalCrashes() {
  // All fatal (K) and serious-injury (A) crashes along the corridor, any mode.
  // Separate from pedCrashes so Ch 3 can show motor-vehicle fatalities too.
  return fetchArcGIS({
    title: 'ODOT Crash Data — Fatal & Serious (all types)',
    url: 'https://gis.odot.state.or.us/arcgis1006/rest/services/agol/OTSDE_Crash/MapServer/0',
    where: "KABCO IN ('K','A')",
    outFields:
      'CRASH_ID,CRASH_DT,KABCO,Graph_Severity,TOT_FATAL_CNT,TOT_INJ_LVL_A_CNT,TOT_PED_CNT,TOT_PED_FATAL_CNT',
  })
}

async function fetchSidewalks() {
  // PBOT sidewalk polygon inventory via PortlandMaps ArcGIS Server (v11.5, supports GeoJSON)
  return fetchArcGIS({
    title: 'Portland Sidewalk Network',
    url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Sidewalk_Layers/MapServer/50',
    where: '1=1',
    outFields: 'OBJECTID,SidewalkType,Material,Owner',
  })
}

// Returns min approximate distance (degrees) from a [lon, lat] point to the corridor.
// Applies a ~1.4× lon correction for lat 45° (1°lon ≈ 79 km, 1°lat ≈ 111 km).
function minDistToCorridorDeg(point, corridorSegments) {
  const [pLon, pLat] = point
  let min = Infinity
  for (const seg of corridorSegments) {
    for (const [lon, lat] of seg) {
      const d = Math.hypot((pLon - lon) * 1.4, pLat - lat)
      if (d < min) min = d
      if (d < 0.0001) return d
    }
  }
  return min
}

function featureSamplePoints(geom) {
  if (!geom || !Array.isArray(geom.coordinates)) return []
  const out = []
  const walk = (coords) => {
    if (!Array.isArray(coords)) return
    if (typeof coords[0] === 'number') {
      if (coords.length >= 2) out.push(coords)
      return
    }
    for (const c of coords) walk(c)
  }
  walk(geom.coordinates)
  return out
}

function filterByCorridorProximity(collection, corridorSegments, maxDeg) {
  const before = collection.features.length
  collection.features = collection.features.filter((f) => {
    const pts = featureSamplePoints(f.geometry)
    if (pts.length === 0) return false
    for (const p of pts) {
      if (minDistToCorridorDeg(p, corridorSegments) <= maxDeg) return true
    }
    return false
  })
  console.log(`      proximity filter: kept ${collection.features.length} / ${before}`)
  return collection
}

function osmElementsToGeoJSON(elements) {
  const features = []
  for (const e of elements) {
    const props = { id: e.id, ...(e.tags || {}) }
    if (e.type === 'node' && e.lat != null && e.lon != null) {
      features.push({
        type: 'Feature',
        properties: props,
        geometry: {
          type: 'Point',
          coordinates: [Number(e.lon.toFixed(6)), Number(e.lat.toFixed(6))],
        },
      })
    } else if (e.type === 'way' && Array.isArray(e.geometry) && e.geometry.length >= 2) {
      const coords = e.geometry.map((pt) => [
        Number(pt.lon.toFixed(6)),
        Number(pt.lat.toFixed(6)),
      ])
      const first = coords[0]
      const last = coords[coords.length - 1]
      const closed = coords.length >= 4 && first[0] === last[0] && first[1] === last[1]
      features.push({
        type: 'Feature',
        properties: props,
        geometry: closed
          ? { type: 'Polygon', coordinates: [coords] }
          : { type: 'LineString', coordinates: coords },
      })
    }
  }
  return { type: 'FeatureCollection', features }
}

async function fetchOverpass({ title, query }) {
  process.stdout.write(`  → ${title}... `)
  const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'masons-world-design-experiment/1.0 (https://masons-world.vercel.app)',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const data = await res.json()
  const fc = osmElementsToGeoJSON(data.elements || [])
  fc.source = { title: `${title} — OpenStreetMap via Overpass`, fetchedAt: new Date().toISOString() }
  console.log(`${fc.features.length} features`)
  return fc
}

async function tryFetch(fn, outFile, label) {
  try {
    const data = await fn()
    await writeFile(join(OUT_DIR, outFile), JSON.stringify(data, null, 2) + '\n')
    console.log(`    wrote ${outFile}`)
  } catch (err) {
    console.warn(`    ⚠ ${label} failed: ${err.message}`)
    console.warn(`    Keeping existing ${outFile} — update URL if endpoint has moved`)
  }
}

async function main() {
  console.log('Fetching Portland Open Data layers for McLoughlin / 99E')
  console.log(`Bbox: S=${BBOX.south} W=${BBOX.west} N=${BBOX.north} E=${BBOX.east}`)
  console.log()
  for (const ds of DATASETS) {
    const trimmed = await fetchDataset(ds)
    const path = join(OUT_DIR, ds.outFile)
    await writeFile(path, JSON.stringify(trimmed, null, 2) + '\n')
    console.log(`    wrote ${ds.outFile}`)
  }
  const corridor = await fetchCorridorFromOverpass()
  await writeFile(join(OUT_DIR, 'corridor.json'), JSON.stringify(corridor, null, 2) + '\n')
  console.log(`    wrote corridor.json`)

  // Load corridor segments for proximity filtering
  const corridorSegments = corridor.geometry.coordinates

  // ~3 blocks / 300 m: 0.0027° lat, corrected to ~0.0038° lon — use 0.004 as threshold
  const CORRIDOR_BUFFER_DEG = 0.004

  await tryFetch(
    async () => {
      const data = await fetchPedCrashes()
      return filterByCorridorProximity(data, corridorSegments, CORRIDOR_BUFFER_DEG)
    },
    'pedCrashes.json',
    'Ped crashes',
  )

  await tryFetch(
    async () => {
      const data = await fetchFatalCrashes()
      return filterByCorridorProximity(data, corridorSegments, CORRIDOR_BUFFER_DEG)
    },
    'fatalCrashes.json',
    'Fatal & serious crashes',
  )

  // Sidewalks: use a slightly wider buffer (5 blocks) to capture cross-street sidewalks at intersections
  await tryFetch(
    async () => {
      const data = await fetchSidewalks()
      return filterByCorridorProximity(data, corridorSegments, CORRIDOR_BUFFER_DEG * 1.5)
    },
    'sidewalks.json',
    'Sidewalks',
  )

  // Parks & schools: wider buffer (~0.008° ≈ 6 blocks) so nearby amenities register
  await tryFetch(
    async () => {
      const data = await fetchOverpass({ title: 'Parks (OSM)', query: PARKS_QUERY })
      return filterByCorridorProximity(data, corridorSegments, 0.008)
    },
    'parks.json',
    'Parks',
  )

  await tryFetch(
    async () => {
      const data = await fetchOverpass({ title: 'Schools (OSM)', query: SCHOOLS_QUERY })
      return filterByCorridorProximity(data, corridorSegments, 0.008)
    },
    'schools.json',
    'Schools',
  )

  // MAX Orange Line: relation expands to member ways via `>;`. Keep only lines close to corridor.
  await tryFetch(
    async () => {
      const data = await fetchOverpass({ title: 'MAX Orange Line (OSM)', query: MAX_ORANGE_QUERY })
      return filterByCorridorProximity(data, corridorSegments, 0.02)
    },
    'maxOrange.json',
    'MAX Orange Line',
  )

  // Springwater: trail is across the river, ~0.015° west of corridor at closest
  await tryFetch(
    async () => {
      const data = await fetchOverpass({ title: 'Springwater Trail (OSM)', query: SPRINGWATER_QUERY })
      return filterByCorridorProximity(data, corridorSegments, 0.025)
    },
    'springwater.json',
    'Springwater Trail',
  )

  console.log()
  console.log('Done.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
