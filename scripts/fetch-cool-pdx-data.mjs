#!/usr/bin/env node
// Fetches Portland heat-relief data for the Cool PDX experiment and writes static
// JSON into the experiment's data folder. Output files are committed so builds
// never depend on network availability.
//
// Sources:
//   - Street Tree Inventory (Active) — PortlandMaps ArcGIS, binned into a density
//     grid in this script (the "shade gradient"). The raw layer is ~200k points,
//     far too heavy to ship; we ship only the binned grid (a few hundred cells).
//   - Drinking fountains — OpenStreetMap via Overpass (amenity=drinking_water).
//     Benson Bubblers and public fountains are well tagged in Portland.
//
// Cooling/cool-air spots are authored by hand in data/coolingSpots.json (the county
// only publishes heat-event cooling centers as a seasonal list, not a stable API).

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(
  __dirname,
  '..',
  'app',
  'design-experiments',
  '(experiments)',
  'cool-pdx',
  'data',
)

// Portland proper, with a little margin.
const BBOX = { south: 45.43, west: -122.84, north: 45.66, east: -122.46 }
const BBOX_TUPLE = `${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}`

const TREES_URL =
  'https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Street_Tree_Inventory_Active/MapServer/4'
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const UA = 'masons-world-design-experiment/1.0 (https://masons-world.vercel.app)'

// Grid cell size in degrees (~0.005° lat ≈ 555 m; lon at 45.5° ≈ 390 m). Square-ish
// enough for a city-scale shade gradient without shipping a huge file.
const CELL = 0.005

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ---- Street trees → density grid ----------------------------------------

async function fetchTreesGrid() {
  console.log('  → Street trees (paged, geometry only)...')
  const pageSize = 2000
  let offset = 0
  let page = 0
  const cells = new Map() // key "ix,iy" -> count

  while (page < 300) {
    const params = new URLSearchParams({
      where: '1=1',
      geometry: `${BBOX.west},${BBOX.south},${BBOX.east},${BBOX.north}`,
      geometryType: 'esriGeometryEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
      inSR: '4326',
      outSR: '4326',
      outFields: '',
      returnGeometry: 'true',
      resultOffset: String(offset),
      resultRecordCount: String(pageSize),
      f: 'geojson',
    })
    const res = await fetch(`${TREES_URL}/query?${params}`, {
      headers: { Accept: 'application/geo+json, application/json', 'User-Agent': UA },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    const data = await res.json()
    const feats = Array.isArray(data.features) ? data.features : []
    for (const f of feats) {
      const c = f?.geometry?.coordinates
      if (!Array.isArray(c) || c.length < 2) continue
      const [lon, lat] = c
      if (lat < BBOX.south || lat > BBOX.north || lon < BBOX.west || lon > BBOX.east) continue
      const ix = Math.floor((lon - BBOX.west) / CELL)
      const iy = Math.floor((lat - BBOX.south) / CELL)
      const key = `${ix},${iy}`
      cells.set(key, (cells.get(key) || 0) + 1)
    }
    const more = feats.length === pageSize || data.exceededTransferLimit === true
    process.stdout.write(`    page ${page + 1}: +${feats.length} (cells: ${cells.size})\r`)
    if (!more || feats.length === 0) break
    offset += pageSize
    page += 1
    await sleep(150) // be polite to the public endpoint
  }
  process.stdout.write('\n')

  // Emit cells as rectangles with a log-normalized intensity (0..1). Log scale keeps
  // dense downtown/older neighborhoods from flattening the eastside contrast.
  const counts = [...cells.values()]
  const maxCount = counts.length ? Math.max(...counts) : 1
  const logMax = Math.log(maxCount + 1)
  const total = counts.reduce((a, b) => a + b, 0)
  const features = [...cells.entries()].map(([key, count]) => {
    const [ix, iy] = key.split(',').map(Number)
    const west = BBOX.west + ix * CELL
    const south = BBOX.south + iy * CELL
    return {
      type: 'Feature',
      properties: {
        count,
        intensity: Number((Math.log(count + 1) / logMax).toFixed(3)),
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [Number(west.toFixed(6)), Number(south.toFixed(6))],
          [Number((west + CELL).toFixed(6)), Number(south.toFixed(6))],
          [Number((west + CELL).toFixed(6)), Number((south + CELL).toFixed(6))],
          [Number(west.toFixed(6)), Number((south + CELL).toFixed(6))],
          [Number(west.toFixed(6)), Number(south.toFixed(6))],
        ]],
      },
    }
  })
  console.log(`    ${features.length} cells, ${total} trees, max ${maxCount}/cell`)
  return {
    type: 'FeatureCollection',
    source: {
      title: 'Street Tree Inventory (Active) — PortlandMaps, binned to density grid',
      url: TREES_URL,
      cellDegrees: CELL,
      maxCount,
      fetchedAt: new Date().toISOString(),
    },
    features,
  }
}

// ---- Drinking fountains (OSM) -------------------------------------------

async function fetchFountains() {
  console.log('  → Drinking fountains (OSM Overpass)...')
  const query = `
[out:json][timeout:30];
(
  node["amenity"="drinking_water"](${BBOX_TUPLE});
  node["man_made"="drinking_fountain"](${BBOX_TUPLE});
  node["drinking_water"="yes"]["amenity"="fountain"](${BBOX_TUPLE});
);
out body;
`.trim()
  const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const data = await res.json()
  const features = (data.elements || [])
    .filter((e) => e.type === 'node' && e.lat != null && e.lon != null)
    .map((e) => ({
      type: 'Feature',
      properties: {
        id: e.id,
        name: e.tags?.name || null,
        bubbler: e.tags?.fountain === 'bubbler' || /benson/i.test(e.tags?.name || ''),
      },
      geometry: {
        type: 'Point',
        coordinates: [Number(e.lon.toFixed(6)), Number(e.lat.toFixed(6))],
      },
    }))
  console.log(`    ${features.length} fountains`)
  return {
    type: 'FeatureCollection',
    source: {
      title: 'Drinking fountains — OpenStreetMap via Overpass',
      fetchedAt: new Date().toISOString(),
    },
    features,
  }
}

// ---- Cooling spots: air-conditioned public refuges (OSM) ----------------
// Libraries and community centers are reliable year-round cool spaces anyone can
// enter. During declared heat emergencies, Multnomah County also opens dedicated
// cooling shelters (a seasonal list, linked in the UI) — those are not in this file.

async function fetchCoolingSpots() {
  console.log('  → Cooling spots: libraries + community centers (OSM Overpass)...')
  const query = `
[out:json][timeout:30];
(
  node["amenity"="library"](${BBOX_TUPLE});
  way["amenity"="library"](${BBOX_TUPLE});
  node["amenity"="community_centre"](${BBOX_TUPLE});
  way["amenity"="community_centre"](${BBOX_TUPLE});
  node["leisure"="sports_centre"]["community_centre"](${BBOX_TUPLE});
);
out center;
`.trim()
  const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(query)}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
  const data = await res.json()
  const features = (data.elements || [])
    .map((e) => {
      const lat = e.lat ?? e.center?.lat
      const lon = e.lon ?? e.center?.lon
      if (lat == null || lon == null) return null
      const kind = e.tags?.amenity === 'library' ? 'library' : 'community-center'
      return {
        type: 'Feature',
        properties: {
          id: e.id,
          name: e.tags?.name || (kind === 'library' ? 'Library' : 'Community center'),
          kind,
        },
        geometry: { type: 'Point', coordinates: [Number(lon.toFixed(6)), Number(lat.toFixed(6))] },
      }
    })
    .filter(Boolean)
  console.log(`    ${features.length} cooling spots`)
  return {
    type: 'FeatureCollection',
    source: {
      title: 'Cooling spots (libraries + community centers) — OpenStreetMap via Overpass',
      note: 'Year-round air-conditioned public spaces. Declared-heat-emergency cooling shelters are separate (county seasonal list).',
      fetchedAt: new Date().toISOString(),
    },
    features,
  }
}

// ---- main ----------------------------------------------------------------

async function tryStep(fn, outFile, label) {
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
  console.log('Fetching Cool PDX data')
  console.log(`Bbox: S=${BBOX.south} W=${BBOX.west} N=${BBOX.north} E=${BBOX.east}`)
  console.log()
  if (!process.argv.includes('--skip-trees')) {
    await tryStep(fetchTreesGrid, 'canopyGrid.json', 'Tree canopy grid')
  } else {
    console.log('  → Skipping trees (--skip-trees); keeping existing canopyGrid.json')
  }
  await tryStep(fetchFountains, 'fountains.json', 'Drinking fountains')
  await tryStep(fetchCoolingSpots, 'coolingSpots.json', 'Cooling spots')
  console.log()
  console.log('Done.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
