import type { BasemapTheme } from '@/lib/basemap'
// Green PDX — domain types.
//
// The build script normalizes four ArcGIS layers into this shape, so the UI
// never has to know what PortlandMaps returns.

export type LayerId = 'park' | 'natural' | 'garden' | 'neighborhood'

export type SourceTier = 'A' | 'B' | 'C' | 'D'

export interface SourceRecord {
  id: string
  name: string
  tier: SourceTier
  url: string
  cadence: string
  requiresKey: boolean
  verifiedOn: string
  recordCount: number
  notes: string
}

export interface LayerSpec {
  id: LayerId
  label: string
  kind: 'point' | 'polygon' | 'line'
  encoding: 'categorical' | 'sequential' | 'diverging' | 'single'
  unit: string
  defaultOn: boolean
  sourceId: string
}

export interface MapConfig {
  slug: string
  title: string
  question: string
  place: {
    name: string
    bounds: [[number, number], [number, number]]
    center: [number, number]
    zoom: number
    minZoom: number
    maxZoom: number
  }
  basemap: { theme: BasemapTheme; attribution: string }
  layers: LayerSpec[]
  sources: SourceRecord[]
  freshness: {
    mode: 'snapshot' | 'live'
    revalidateSeconds?: number
    snapshotAt?: string
  }
}

/** A drawn point. Only community gardens are points on this map. */
export interface MapFeature {
  id: string
  layer: LayerId
  lat: number
  lng: number
  /** Gardens: number of plots. Absent when the source does not have it. */
  value?: number | null
  label: string
  detail?: { label: string; value: string }[]
  /** True only because the build script fetched it and counted it. */
  real: boolean
  /**
   * Where the record came from. Absent means the city's own layer, fetched and
   * counted. `'community'` means a garden the city does not run, assembled by
   * hand from its operator's own site — same reality, weaker provenance, and
   * the UI says so where it is drawn.
   */
  source?: 'community'
  /** Community records only: who runs the garden. */
  operator?: string
  /** Community records only: the location is an intersection or an address,
   *  not a surveyed boundary, so it is good to about a block. */
  approx?: boolean
  /** Community records only: a sentence about plots, size, or what kind of
   *  place it is, when the operator publishes one. */
  note?: string | null
  sourceName?: string
  sourceUrl?: string
  contact?: string | null
}

/** Properties the build script writes onto each polygon. */
export interface ShapeProps {
  name: string
  kind: LayerId
  /** Parks only. */
  acres?: number | null
  /** Natural areas only: false when the inventory has no name for the parcel. */
  named?: boolean
  manager?: string | null
  owner?: string | null
  unit?: string | null
  /** Neighborhoods only. */
  coalition?: string | null
}

export interface ShapeLayer {
  layer: LayerId
  geojson: {
    type: 'FeatureCollection'
    features: {
      type: 'Feature'
      properties: ShapeProps
      geometry: { type: string; coordinates: unknown }
    }[]
  }
  real: boolean
}

export type ShapeFeature = ShapeLayer['geojson']['features'][number]

/** Where the map has been asked to go, and what to open when it lands. */
export type MapFocus =
  | { nonce: number; kind: 'garden'; feature: MapFeature }
  | { nonce: number; kind: 'shape'; layer: LayerId; feature: ShapeFeature }
  | { nonce: number; kind: 'city' }

export interface MapData {
  features: MapFeature[]
  shapes: ShapeLayer[]
  generatedAt: string
  counts: {
    parks: number
    naturalAreas: number
    naturalAreasNamed: number
    gardens: number
    /** Split by provenance: the city's own program vs gardens run by
     *  neighborhood associations and nonprofits, assembled by hand. */
    gardensCity: number
    gardensCommunity: number
    neighborhoods: number
    gardenPlots: number
    parkAcres: number
    /** Citywide plot polygons, and how many are ADA-accessible. Counted from
     *  the plot layer as a whole; deliberately not attributed per garden. */
    mappedPlots: number
    adaPlots: number
  }
}
