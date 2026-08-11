// Smoke PDX — domain types.
//
// The build script normalizes three very different feeds into this shape, so
// the UI never has to know what AirNow, Open-Meteo, or ArcGIS look like.

export type LayerId = 'monitor' | 'wind' | 'perimeter'

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
    /** Where the map opens. */
    view: { center: [number, number]; zoom: number }
    /** How far out you can pan. Data was fetched for this whole box. */
    bounds: [[number, number], [number, number]]
    minZoom: number
    maxZoom: number
  }
  basemap: { url: string; subdomains: string; attribution: string }
  layers: LayerSpec[]
  sources: SourceRecord[]
  freshness: {
    mode: 'snapshot' | 'live'
    revalidateSeconds?: number
  }
}

export interface MapFeature {
  id: string
  layer: LayerId
  lat: number
  lng: number
  /** Monitors: US AQI. Wind: speed in mph. Null on a monitor means no reading. */
  value: number | null
  /**
   * Monitors only. Hours since the reading was measured. Null/absent means
   * current. A number means we fell back to an older reading, and the map draws
   * it in a muted style so it can never pass for a live one.
   */
  staleHours?: number | null
  /** Monitors only: inside the greater-Portland box. Drives the headline number
   *  and the zoomed-out collapse. */
  metro?: boolean
  /** Wind only: degrees the wind is coming FROM (meteorological convention). */
  bearing?: number
  label: string
  detail?: { label: string; value: string }[]
  real: boolean
  observedAt?: string
}

export interface ShapeLayer {
  layer: LayerId
  geojson: {
    type: 'FeatureCollection'
    features: {
      type: 'Feature'
      properties: {
        name: string
        acres: number | null
        contained: number | null
        [k: string]: unknown
      }
      geometry: { type: string; coordinates: unknown }
    }[]
  }
  real: boolean
}

export interface MapData {
  features: MapFeature[]
  shapes: ShapeLayer[]
  generatedAt: string
  counts: {
    monitors: number
    monitorsReporting: number
    metroMonitors: number
    metroReporting: number
    windCells: number
    perimeters: number
    hourlyFilesUsed: number
  }
  /** Set by the API route: false when we fell back to the committed snapshot. */
  live?: boolean
}
