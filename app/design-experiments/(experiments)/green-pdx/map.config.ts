// Green PDX — map spec.
//
// The machine-readable description of this map: where it looks, what it draws,
// where the data came from, and how values become color. Keep it accurate; it
// is what a future map-builder tool would read to reproduce this experiment.

import { BASEMAP_ATTRIBUTION } from '@/lib/basemap'
import type { MapConfig } from './types'
import { PLACE } from './data/place'

const PM = 'https://www.portlandmaps.com/arcgis/rest/services/Public'

export const MAP_CONFIG: MapConfig = {
  slug: 'green-pdx',
  title: 'Green PDX',
  question: 'Where is the green space in Portland, and what kind is it.',

  place: {
    name: PLACE.name,
    bounds: PLACE.bounds,
    center: PLACE.center,
    zoom: PLACE.zoom,
    minZoom: PLACE.minZoom,
    maxZoom: PLACE.maxZoom,
  },

  // The provider lives in lib/basemap, so a change in its terms is one edit for
  // every map. This map only declares which theme it wants.
  basemap: {
    theme: 'light',
    attribution: BASEMAP_ATTRIBUTION,
  },

  layers: [
    {
      id: 'park',
      label: 'Parks',
      kind: 'polygon',
      encoding: 'categorical',
      unit: 'park boundary, acres',
      defaultOn: true,
      sourceId: 'pdx-parks',
    },
    {
      id: 'natural',
      label: 'Natural areas',
      kind: 'polygon',
      encoding: 'categorical',
      unit: 'natural area parcel, managing bureau',
      defaultOn: true,
      sourceId: 'pdx-natural',
    },
    {
      id: 'garden',
      label: 'Community gardens',
      kind: 'point',
      encoding: 'categorical',
      unit: 'garden site, plots per garden',
      defaultOn: true,
      sourceId: 'pdx-gardens',
    },
    {
      id: 'neighborhood',
      label: 'Neighborhoods',
      kind: 'polygon',
      encoding: 'single',
      unit: 'boundary, for orientation',
      // On by default. The reflex is to keep a context layer off so the data
      // reads clean, but this map is about community green space, and which
      // neighborhood a garden belongs to is part of what someone is asking.
      // The lines are a faint dashed hairline under everything else, so they
      // orient without competing.
      defaultOn: true,
      sourceId: 'pdx-hoods',
    },
  ],

  sources: [
    {
      id: 'pdx-parks',
      name: 'Portland Parks & Recreation — Parks',
      tier: 'A',
      url: `${PM}/Parks_Misc/MapServer/2`,
      cadence: 'as maintained by the city',
      requiresKey: false,
      verifiedOn: '2026-09-15',
      recordCount: 318,
      notes:
        'Park boundaries with NAME and ACRES. Every record drawn is real. Geometry generalized 0.00012° (~10m) server-side.',
    },
    {
      id: 'pdx-natural',
      name: 'Portland Parks & Recreation — Natural Area Land Inventory',
      tier: 'A',
      url: `${PM}/Parks_Natural_Area_Land_Inventory/MapServer/0`,
      cadence: 'as maintained by the city',
      requiresKey: false,
      verifiedOn: '2026-09-15',
      recordCount: 575,
      notes:
        'A land inventory keyed by parcel, not a directory of named places: 29 of 575 parcels carry no name, and those are drawn as "Unnamed natural area" rather than borrowing one. Parcels can overlap parks.',
    },
    {
      id: 'pdx-gardens',
      name: 'Portland Parks & Recreation — Community Garden Boundaries',
      tier: 'A',
      url: `${PM}/Parks_Community_Gardens/MapServer/5`,
      cadence: 'as maintained by the city',
      requiresKey: false,
      verifiedOn: '2026-09-15',
      recordCount: 62,
      notes:
        'Garden sites with plot counts and acreage, drawn as points at the polygon centroid because a 0.15-acre garden is smaller than the dot marking it. City program, so it stops at the city line.',
    },
    {
      id: 'pdx-hoods',
      name: 'City of Portland — Neighborhoods',
      tier: 'A',
      url: `${PM}/Boundaries/MapServer/1`,
      cadence: 'as maintained by the city',
      requiresKey: false,
      verifiedOn: '2026-09-15',
      recordCount: 125,
      notes:
        'Recognized neighborhood boundaries with coalition names. Context for orientation, off by default.',
    },
  ],

  // Parks and gardens move on the order of years. A refresh button here would
  // be theater, so the snapshot is committed next to the script that made it.
  freshness: {
    mode: 'snapshot',
    snapshotAt: '2026-09-15',
  },
}
