#!/usr/bin/env node
// Fetches Portland Open Data safety layers, trims each to the McLoughlin corridor bbox,
// and writes static GeoJSON into the design experiment's data folder.
//
// Source portal: https://gis-pdx.opendata.arcgis.com/
// Re-run this script when you want fresher data. The output files are committed to the repo
// so builds never depend on network availability.

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
  'mcloughlin-99e',
  'data',
)

// Bbox tuned to roughly cover the McLoughlin / 99E corridor from the Ross Island
// Bridge area south to ~200 ft into Milwaukie.
const BBOX = {
  south: 45.438,
  west: -122.675,
  north: 45.512,
  east: -122.640,
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
const OVERPASS_QUERY = `
[out:json][timeout:25];
(
  way["ref"~"99E"]["highway"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  way["name"~"McLoughlin"]["highway"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
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
  console.log()
  console.log('Done.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
