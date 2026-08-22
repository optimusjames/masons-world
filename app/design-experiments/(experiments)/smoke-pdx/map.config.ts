// Smoke PDX — map spec.
//
// The machine-readable description of this map. Keep it accurate; it is what a
// future map-builder tool would read to reproduce this experiment.

import type { MapConfig } from './types'
import { METRO, REGION } from './data/place'

export const MAP_CONFIG: MapConfig = {
  slug: 'smoke-pdx',
  title: 'Smoke PDX',
  question:
    'Where is the smoke right now, where is it coming from, and which way is the wind carrying it.',

  place: {
    name: 'Greater Portland · smoke across the Northwest',
    view: METRO,
    bounds: REGION.bounds,
    minZoom: REGION.minZoom,
    maxZoom: REGION.maxZoom,
  },

  basemap: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '© <a href="https://carto.com">CARTO</a> · © OpenStreetMap',
  },

  layers: [
    {
      id: 'monitor',
      label: 'Air monitors',
      kind: 'point',
      encoding: 'sequential',
      unit: 'US AQI, from NowCast PM2.5',
      defaultOn: true,
      sourceId: 'airnow',
    },
    {
      id: 'wind',
      label: 'Wind',
      kind: 'point',
      encoding: 'sequential',
      unit: 'mph at 10m, arrow points downwind',
      defaultOn: true,
      sourceId: 'open-meteo',
    },
    {
      id: 'perimeter',
      label: 'Active fires',
      kind: 'polygon',
      encoding: 'single',
      unit: 'perimeter, acres',
      defaultOn: true,
      sourceId: 'nifc',
    },
  ],

  sources: [
    {
      id: 'airnow',
      name: 'EPA AirNow hourly files',
      tier: 'A',
      url: 'https://files.airnowtech.org/airnow/today/',
      cadence: 'hourly',
      requiresKey: false,
      verifiedOn: '2026-08-10',
      recordCount: 22,
      notes:
        'Monitors run by Oregon DEQ and Washington Dept. of Ecology. AQI is EPA NowCast over 12 hours, not a raw hourly reading.',
    },
    {
      id: 'open-meteo',
      name: 'Open-Meteo 10m wind',
      tier: 'B',
      url: 'https://open-meteo.com/',
      cadence: 'hourly',
      requiresKey: false,
      verifiedOn: '2026-08-10',
      recordCount: 651,
      notes: 'Model output on a two-density grid, not station observations.',
    },
    {
      id: 'nifc',
      name: 'NIFC WFIGS current wildfire perimeters',
      tier: 'A',
      url: 'https://data-nifc.opendata.arcgis.com/',
      cadence: 'continuously',
      requiresKey: false,
      verifiedOn: '2026-08-10',
      recordCount: 118,
      notes: 'Geometry generalized server-side to 0.004° for payload size.',
    },
  ],

  freshness: {
    mode: 'live',
    // Matched to the source cadence. Polling faster than hourly just burns
    // requests against a public file server.
    revalidateSeconds: 900,
  },
}
