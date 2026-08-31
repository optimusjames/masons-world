// {{TITLE}} — map spec.
//
// The machine-readable description of this map: where it looks, what it draws,
// where the data came from, and how values become color. Keep it accurate; this
// is what a future map-builder tool would read to reproduce this experiment.

import { BASEMAP_ATTRIBUTION } from '@/lib/basemap'
import type { MapConfig } from './types'

export const MAP_CONFIG: MapConfig = {
  slug: '{{SLUG}}',
  title: '{{TITLE}}',
  question: '{{THE ONE QUESTION THIS MAP ANSWERS}}',

  place: {
    name: '{{PLACE NAME}}',
    // Leaflet order: [[south, west], [north, east]]
    bounds: [
      [0, 0],
      [0, 0],
    ],
    center: [0, 0],
    zoom: 11,
    minZoom: 9,
    maxZoom: 17,
  },

  // The provider itself lives in lib/basemap, so a change in its terms is one
  // edit for every map. This map only declares which theme it wants.
  basemap: {
    theme: 'light',
    attribution: BASEMAP_ATTRIBUTION,
  },

  layers: [
    {
      id: '{{layer-id}}',
      label: '{{Layer label}}',
      // 'point' | 'polygon' | 'line'
      kind: 'point',
      // 'categorical' | 'sequential' | 'diverging' | 'single'
      encoding: 'sequential',
      // Units shown in the legend. Say what the number means.
      unit: '{{µg/m³, count, minutes…}}',
      defaultOn: true,
      sourceId: '{{source-id}}',
    },
  ],

  sources: [
    {
      id: '{{source-id}}',
      name: '{{Publisher — dataset name}}',
      // A = primary agency · B = aggregator · C = community · D = unverified
      tier: 'A',
      url: '{{endpoint}}',
      cadence: '{{hourly | daily | annual snapshot | static}}',
      requiresKey: false,
      // ISO date we last fetched it and counted rows.
      verifiedOn: '{{YYYY-MM-DD}}',
      recordCount: 0,
      // Every record drawn from this source is real. If any part is
      // illustrative, say exactly which part, and label it in the UI too.
      notes: '',
    },
  ],

  // Snapshot unless staleness breaks the map.
  freshness: {
    mode: 'snapshot', // 'snapshot' | 'live'
    // For live: seconds between revalidations, matched to the real cadence.
    revalidateSeconds: undefined,
    // For snapshot: when the committed JSON was pulled.
    snapshotAt: '{{ISO timestamp}}',
  },
}
