// Distance, routing, and hand-off links for Ride PDX.
//
// Times come from OSRM on the FOSSGIS public server (routing.openstreetmap.de):
// keyless, CORS-open, and routed over the real OSM street network with separate
// foot and bike profiles. It is a shared community server, so we only ask it
// things on a tap, never on pan or zoom.
//
// When it fails we fall back to a straight-line estimate and the UI says
// "about" instead of a routed number. Never the other way round.

export type LatLng = [number, number]
export type Mode = 'foot' | 'bike'

const OSRM = 'https://routing.openstreetmap.de'

/** Haversine distance in meters. */
export function distMeters(a: LatLng, b: LatLng): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Fallback only. Streets are not straight lines, so the crow-flies distance is
// stretched by a typical urban grid factor, then divided by a plain pace.
const DETOUR = 1.3
const PACE_M_PER_MIN: Record<Mode, number> = { foot: 78, bike: 230 }

export function estimateMinutes(a: LatLng, b: LatLng, mode: Mode): number {
  return Math.max(1, Math.round((distMeters(a, b) * DETOUR) / PACE_M_PER_MIN[mode]))
}

export interface Leg {
  mode: Mode
  minutes: number
  meters: number
  /** Route geometry as [lat, lng]. Straight line when `routed` is false. */
  path: LatLng[]
  /** True when OSRM routed it. False means a straight-line estimate. */
  routed: boolean
}

const profile = (mode: Mode) => (mode === 'foot' ? 'routed-foot' : 'routed-bike')
const pair = (p: LatLng) => `${p[1]},${p[0]}`

/** One routed leg, or an honest estimate if the router is unavailable. */
export async function routeLeg(from: LatLng, to: LatLng, mode: Mode, signal?: AbortSignal): Promise<Leg> {
  try {
    const url =
      `${OSRM}/${profile(mode)}/route/v1/driving/${pair(from)};${pair(to)}` +
      '?overview=full&geometries=geojson'
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(`osrm ${res.status}`)
    const json = await res.json()
    const r = json.routes?.[0]
    if (json.code !== 'Ok' || !r) throw new Error(`osrm ${json.code}`)
    return {
      mode,
      minutes: Math.max(1, Math.round(r.duration / 60)),
      meters: r.distance,
      path: (r.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
      routed: true,
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    return {
      mode,
      minutes: estimateMinutes(from, to, mode),
      meters: distMeters(from, to) * DETOUR,
      path: [from, to],
      routed: false,
    }
  }
}

/**
 * Minutes from one origin to many destinations, in one request.
 * Returns null per destination OSRM could not reach, or all estimates (with
 * `routed: false`) if the server is unavailable.
 */
export async function minutesFrom(
  origin: LatLng,
  dests: LatLng[],
  mode: Mode,
  signal?: AbortSignal,
): Promise<{ minutes: number[]; routed: boolean }> {
  const estimate = () => ({
    minutes: dests.map((d) => estimateMinutes(origin, d, mode)),
    routed: false,
  })
  if (!dests.length) return { minutes: [], routed: true }
  try {
    const coords = [origin, ...dests].map(pair).join(';')
    const url = `${OSRM}/${profile(mode)}/table/v1/driving/${coords}?sources=0&annotations=duration`
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(`osrm ${res.status}`)
    const json = await res.json()
    const row: (number | null)[] | undefined = json.durations?.[0]
    if (json.code !== 'Ok' || !row) throw new Error(`osrm ${json.code}`)
    return {
      minutes: row.slice(1).map((s, i) =>
        s == null ? estimateMinutes(origin, dests[i], mode) : Math.max(1, Math.round(s / 60)),
      ),
      routed: true,
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    return estimate()
  }
}

/** Turn-by-turn belongs to an app built for it. Google Maps takes a travel mode in the URL. */
export function directionsUrl(to: LatLng, mode: Mode, from?: LatLng | null): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${to[0]},${to[1]}`,
    travelmode: mode === 'foot' ? 'walking' : 'bicycling',
  })
  if (from) params.set('origin', `${from[0]},${from[1]}`)
  return `https://www.google.com/maps/dir/?${params}`
}

export function fmtMiles(meters: number): string {
  const mi = meters / 1609.344
  return mi < 0.1 ? `${Math.round(meters * 3.281)} ft` : `${mi.toFixed(1)} mi`
}
