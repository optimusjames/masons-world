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
  /** How often new data appears at the source. Our polling interval is an
   *  implementation detail and lives in SOURCES.md, not in the interface: what
   *  a reader needs is the age of the reading, which the legend already gives. */
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

export type FireFeature = ShapeLayer['geojson']['features'][number]

/**
 * Somewhere the map has been asked to go, and what to open when it lands.
 *
 * The nonce is what makes asking twice for the same place work: the object
 * identity has to change or the effect watching it never re-runs.
 */
export type MapFocus =
  | { nonce: number; kind: 'monitor'; feature: MapFeature; from?: [number, number] }
  | { nonce: number; kind: 'fire'; feature: FireFeature }
  | { nonce: number; kind: 'wind'; feature: MapFeature }
  | { nonce: number; kind: 'region' }

export interface MapData {
  features: MapFeature[]
  shapes: ShapeLayer[]
  /** When we last assembled this payload from the sources. */
  generatedAt: string
  /**
   * The hour the freshest monitor reading is FOR. Unlike `generatedAt` this only
   * moves when new data actually lands, which is what makes it the honest answer
   * to "did that refresh find anything".
   */
  observedAt?: string
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
