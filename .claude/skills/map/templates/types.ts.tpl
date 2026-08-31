import type { BasemapTheme } from '@/lib/basemap'
// {{TITLE}} — domain types.
//
// Shape the data to this schema in the build script, so the UI never has to
// know what the upstream feed looked like.

export type LayerId = string
export type SourceId = string

export type SourceTier = 'A' | 'B' | 'C' | 'D'

export interface SourceRecord {
  id: SourceId
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
  sourceId: SourceId
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

/** One drawn thing on the map. */
export interface MapFeature {
  id: string
  layer: LayerId
  lat: number
  lng: number
  /** Drives color AND a second visual channel on ordered scales. */
  value?: number
  /** Bucket key for categorical layers. */
  category?: string
  label: string
  /** Rows shown in the popup, in order. Only include fields the source has. */
  detail?: { label: string; value: string }[]
  /**
   * True only when this record came from a verified fetch of a real source.
   * False means illustrative, and the UI must say so where it's drawn.
   */
  real: boolean
  /** ISO timestamp of the observation, when the source provides one. */
  observedAt?: string
}

/** A polygon or line layer, kept as raw GeoJSON. */
export interface ShapeLayer {
  layer: LayerId
  geojson: GeoJSON.FeatureCollection
  real: boolean
}

export interface MapData {
  features: MapFeature[]
  shapes?: ShapeLayer[]
  generatedAt: string
}
