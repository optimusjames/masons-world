export type LayerId =
  | 'corridor'
  | 'speedZone'
  | 'highCrashStreets'
  | 'highCrashIntersections'

export type LineFeature = {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry: { type: 'LineString'; coordinates: [number, number][] }
}

export type CorridorFeature = {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry: { type: 'MultiLineString'; coordinates: [number, number][][] }
  center: [number, number]
}

export type PointFeature = {
  type: 'Feature'
  properties: Record<string, string | number | boolean | null>
  geometry: { type: 'Point'; coordinates: [number, number] }
}

export type PointCollection = {
  type: 'FeatureCollection'
  features: PointFeature[]
}

export type HighCrashStreetProperties = {
  CorridorID?: string | null
  CorridorName?: string | null
  CorridorDescription?: string | null
  MotorVehicle?: string | null
  Bicycle?: string | null
  Pedestrian?: string | null
}

export type HighCrashIntersectionProperties = {
  IntersectionID?: string | null
  LocationDescription?: string | null
  NumFatal?: number | null
  NumInjA?: number | null
  NumInjB?: number | null
  NumInjC?: number | null
  InjuryCosts?: number | null
  ADTVolume?: number | null
  CollisonRate?: number | null
  CurrentRank?: number | null
}

export type HighCrashStreetsCollection = {
  type: 'FeatureCollection'
  source?: { title: string; url: string; fetchedAt: string }
  features: Array<{
    type: 'Feature'
    properties: HighCrashStreetProperties
    geometry:
      | { type: 'LineString'; coordinates: [number, number][] }
      | { type: 'MultiLineString'; coordinates: [number, number][][] }
  }>
}

export type HighCrashIntersectionsCollection = {
  type: 'FeatureCollection'
  source?: { title: string; url: string; fetchedAt: string }
  features: Array<{
    type: 'Feature'
    properties: HighCrashIntersectionProperties
    geometry: { type: 'Point'; coordinates: [number, number] }
  }>
}
