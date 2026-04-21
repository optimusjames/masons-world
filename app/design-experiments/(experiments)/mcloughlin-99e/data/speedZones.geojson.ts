import type { CorridorFeature } from '../types'
import { corridor } from './corridor.geojson'

// Southbound 40 mph starts just north of Ross Island Bridge (~45.505).
// Trim corridor coordinates to that latitude so the glow reflects the actual
// posted-speed zone, while the corridor line continues to indicate the broader region.
const SOUTH_40_CUT = 45.505

const trimmed = corridor.geometry.coordinates
  .map((part) => part.filter((c) => c[1] <= SOUTH_40_CUT))
  .filter((part) => part.length >= 2)

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
    coordinates: trimmed,
  },
  center: corridor.center,
}
