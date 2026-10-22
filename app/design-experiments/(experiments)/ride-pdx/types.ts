import type { BasemapTheme } from '@/lib/basemap'
// Ride PDX — domain types.
//
// The build script and data/live.ts shape every upstream into these, so the UI
// never has to know what GBFS or Overpass looked like.

export type LayerId = 'station' | 'ebike' | 'scooter' | 'place'
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
  /** The one sentence under the title on the page. A promise, not a question:
   *  `question` is the design brief, this is what a visitor reads. */
  dek: string
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

// ---- BIKETOWN --------------------------------------------------------------

export interface Station {
  id: string
  name: string
  lat: number
  lng: number
  capacity: number | null
  /** Bikes ready to rent right now. Every BIKETOWN bike is electric today. */
  bikes: number
  ebikes: number
  scooters: number
  docks: number
  renting: boolean
}

/** e = e-bike, s = scooter. Compact because there are ~1,500 of them. */
export type VehicleKind = 'e' | 's'

/** [lat, lng, kind, range in miles or null] */
export type Vehicle = [number, number, VehicleKind, number | null]

export interface BikeData {
  stations: Station[]
  vehicles: Vehicle[]
  /** The feed's own `last_updated`, not when we fetched it. */
  asOf: string
  /** False when the live feed failed and this is the committed snapshot. */
  live: boolean
}

// ---- places ------------------------------------------------------------------

export type PlaceCategory = 'grocery' | 'park' | 'coffee' | 'library' | 'viewpoint'

export interface Place {
  id: string
  cat: PlaceCategory
  name: string
  lat: number
  lng: number
  /** osm = OpenStreetMap, ppr = Portland Parks & Recreation */
  src: 'osm' | 'ppr'
  brand?: string
  hours?: string
  addr?: string
  acres?: number
}

// ---- selection -------------------------------------------------------------

/** Anything the visitor can tap and get directions to. */
export type Target =
  | { kind: 'place'; place: Place }
  | { kind: 'station'; station: Station }
  | { kind: 'vehicle'; vehicle: Vehicle }
