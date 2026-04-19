import type { CorridorFeature } from '../types'
import { corridor } from './corridor.geojson'

export const speedZoneReduced: CorridorFeature = {
  type: 'Feature',
  properties: {
    name: '45 → 40 mph reduction zone',
    previousLimit: 45,
    currentLimit: 40,
    effectiveYear: 2026,
    agencies: 'PBOT, ODOT, Vision Zero',
  },
  geometry: {
    type: 'MultiLineString',
    coordinates: corridor.geometry.coordinates,
  },
  center: corridor.center,
}
