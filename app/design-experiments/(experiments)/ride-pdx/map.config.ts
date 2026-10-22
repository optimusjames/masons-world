// Ride PDX — map spec.
//
// The machine-readable description of this map: where it looks, what it draws,
// where the data came from, and how values become color. Keep it accurate; this
// is what a future map-builder tool would read to reproduce this experiment.

import { BASEMAP_ATTRIBUTION } from '@/lib/basemap'
import type { MapConfig } from './types'
import { PLACE } from './data/place'

export const MAP_CONFIG: MapConfig = {
  slug: 'ride-pdx',
  title: 'Ride PDX',
  question:
    'Where is the nearest BIKETOWN bike or scooter, and how long is the ride from it to somewhere worth going.',
  dek: 'Find a BIKETOWN bike or scooter near you and see how fast it gets you somewhere good.',

  place: {
    name: PLACE.name,
    bounds: PLACE.bounds,
    center: PLACE.center,
    zoom: PLACE.zoom,
    minZoom: PLACE.minZoom,
    maxZoom: PLACE.maxZoom,
  },

  // The provider itself lives in lib/basemap, so a change in its terms is one
  // edit for every map. This map only declares which theme it wants.
  basemap: {
    theme: 'light',
    attribution: BASEMAP_ATTRIBUTION,
  },

  layers: [
    {
      id: 'station',
      label: 'Stations',
      kind: 'point',
      encoding: 'single',
      unit: 'bikes ready now, printed on the badge',
      defaultOn: true,
      sourceId: 'biketown',
    },
    {
      id: 'ebike',
      label: 'E-bikes',
      kind: 'point',
      encoding: 'categorical',
      unit: 'free-floating, parked anywhere',
      defaultOn: true,
      sourceId: 'biketown',
    },
    {
      id: 'scooter',
      label: 'Scooters',
      kind: 'point',
      encoding: 'categorical',
      unit: 'free-floating, parked anywhere',
      defaultOn: true,
      sourceId: 'biketown',
    },
    {
      id: 'place',
      label: 'Places',
      kind: 'point',
      encoding: 'categorical',
      unit: 'grocery, park, coffee, library, viewpoint (by icon)',
      defaultOn: true,
      sourceId: 'osm',
    },
  ],

  sources: [
    {
      id: 'biketown',
      name: 'BIKETOWN live feed (GBFS)',
      tier: 'A',
      url: 'https://gbfs.biketownpdx.com/gbfs/gbfs.json',
      cadence: 'every 60 seconds',
      requiresKey: false,
      verifiedOn: '2026-10-21',
      recordCount: 308 + 1535,
      notes:
        'Operated by Lyft for PBOT. 308 stations plus every free-floating e-bike and scooter. Lime and Bird publish no Portland vehicles as of this date.',
    },
    {
      id: 'ppr',
      name: 'Portland Parks & Recreation parks',
      tier: 'A',
      url: 'https://www.portlandmaps.com/arcgis/rest/services/Public/Parks_Misc/MapServer/2',
      cadence: 'static snapshot',
      requiresKey: false,
      verifiedOn: '2026-10-21',
      recordCount: 305,
      notes: 'Pin placed at the centroid of each park’s largest parcel.',
    },
    {
      id: 'osm',
      name: 'OpenStreetMap places',
      tier: 'C',
      url: 'https://www.openstreetmap.org/copyright',
      cadence: 'static snapshot',
      requiresKey: false,
      verifiedOn: '2026-10-21',
      recordCount: 541 + 117 + 18 + 38,
      notes: 'Groceries, coffee, public libraries, and viewpoints via Overpass.',
    },
    {
      id: 'osrm',
      name: 'OSRM routing (FOSSGIS)',
      tier: 'C',
      url: 'https://routing.openstreetmap.de/',
      cadence: 'on tap',
      requiresKey: false,
      verifiedOn: '2026-10-21',
      recordCount: 0,
      notes: 'Walk and bike times routed over the OSM street network.',
    },
  ],

  freshness: {
    mode: 'live',
    // Matched to the GBFS ttl.
    revalidateSeconds: 60,
  },
}
