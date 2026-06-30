export type LayerId = 'canopy' | 'fountains' | 'cooling'

// Compact canopy grid (see scripts/fetch-cool-pdx-data.mjs). Cells are [ix, iy, intensity]
// triples; rectangles are reconstructed client-side from origin + cell size.
export interface CanopyGrid {
  source: {
    title: string
    url: string
    maxCount: number
    treeCount: number
    fetchedAt: string
  }
  cell: number
  origin: [number, number] // [lon, lat] of grid cell (0,0) corner
  cells: [number, number, number][] // [ix, iy, intensity 0..1]
}

export interface PointFeature<P> {
  type: 'Feature'
  properties: P
  geometry: { type: 'Point'; coordinates: [number, number] } // [lon, lat]
}

export interface FeatureCollection<P> {
  type: 'FeatureCollection'
  source?: unknown
  features: PointFeature<P>[]
}

export interface FountainProps {
  id: number
  name: string | null
  bubbler: boolean
}

export interface CoolingProps {
  id: number
  name: string
  kind: 'library' | 'community-center'
}

export type FountainsCollection = FeatureCollection<FountainProps>
export type CoolingCollection = FeatureCollection<CoolingProps>

export interface Spot {
  label: string
  sub: string
  coord: [number, number] // [lat, lon]
  distM: number
}

export type ReliefKind = 'fountain' | 'cooling'

export interface ReliefResult {
  origin: [number, number] // [lat, lon]
  originLabel: string
  fountains: Spot[]
  cooling: Spot[]
}

// A destination currently selected for routing/drawing on the map.
export interface ActiveSpot {
  key: string
  coord: [number, number] // [lat, lon]
  color: string
  minWalk: number
}
