export type LayerId =
  | 'corridor'
  | 'speedZone'
  | 'highCrashStreets'
  | 'highCrashIntersections'
  | 'pedCrashes'
  | 'fatalCrashes'
  | 'sidewalks'
  | 'parks'
  | 'schools'
  | 'maxOrange'
  | 'springwater'

export type OsmCollection = {
  type: 'FeatureCollection'
  source?: { title: string; fetchedAt: string }
  features: Array<{
    type: 'Feature'
    properties: Record<string, string | number | boolean | null | undefined>
    geometry: Record<string, unknown>
  }>
}

export type ParksCollection = OsmCollection
export type SchoolsCollection = OsmCollection
export type MaxLineCollection = OsmCollection
export type SpringwaterCollection = OsmCollection

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

export type PedCrashProperties = {
  CRASH_ID?: string | number | null
  TOT_PED_CNT?: number | null
  TOT_PED_INJ_CNT?: number | null
  TOT_PED_FATAL_CNT?: number | null
  CRASH_DT?: number | string | null
  KABCO?: string | null
  Graph_Severity?: string | null
}

export type PedCrashesCollection = {
  type: 'FeatureCollection'
  source?: { title: string; fetchedAt: string }
  features: Array<{
    type: 'Feature'
    properties: PedCrashProperties
    geometry: { type: 'Point'; coordinates: [number, number] }
  }>
}

export type FatalCrashProperties = {
  CRASH_ID?: string | number | null
  CRASH_DT?: number | string | null
  KABCO?: string | null
  Graph_Severity?: string | null
  TOT_FATAL_CNT?: number | null
  TOT_INJ_LVL_A_CNT?: number | null
}

export type FatalCrashesCollection = {
  type: 'FeatureCollection'
  source?: { title: string; fetchedAt: string }
  features: Array<{
    type: 'Feature'
    properties: FatalCrashProperties
    geometry: { type: 'Point'; coordinates: [number, number] }
  }>
}

export type SidewalkProperties = {
  OBJECTID?: number | null
  SidewalkType?: string | null
  Material?: string | null
  Owner?: string | null
}

export type SidewalksCollection = {
  type: 'FeatureCollection'
  source?: { title: string; fetchedAt: string }
  features: Array<{
    type: 'Feature'
    properties: SidewalkProperties
    geometry: Record<string, unknown>
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
