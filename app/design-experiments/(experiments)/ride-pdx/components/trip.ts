// Trip planning for Ride PDX: pure functions, no React, no Leaflet.
//
// A trip is two legs: walk to the nearest thing you can rent, then ride it to
// the destination. "Nearest" is chosen by straight-line distance, then both
// legs are routed. Choosing by routed time would mean an OSRM call per
// candidate, and on a city grid the straight-line nearest is almost always the
// routed nearest too.

import type { BikeData, Place, PlaceCategory, Station, Target, VehicleKind } from '../types'
import { distMeters, type LatLng } from './geo'

/** Where a tapped thing sits on the map. */
export function targetPoint(t: Target): LatLng {
  if (t.kind === 'place') return [t.place.lat, t.place.lng]
  if (t.kind === 'station') return [t.station.lat, t.station.lng]
  return [t.vehicle[0], t.vehicle[1]]
}

export interface Ride {
  kind: 'station' | VehicleKind
  at: LatLng
  /** Station name, or null for a vehicle parked on the street. */
  name: string | null
  /** Bikes ready, for a station. */
  count?: number
  /** Battery range in miles, for a free vehicle when the feed reports it. */
  rangeMi?: number | null
  meters: number
  /** What to select when this ride is tapped in a list. */
  target: Target
}

/** Every rentable thing near `origin`, nearest first. */
export function ridesNear(bikes: BikeData, origin: LatLng, kinds?: Ride['kind'][]): Ride[] {
  const ok = (k: Ride['kind']) => !kinds || kinds.includes(k)
  const out: Ride[] = []
  if (ok('station')) {
    for (const s of bikes.stations) {
      if (!s.renting || s.bikes === 0) continue
      const at: LatLng = [s.lat, s.lng]
      out.push({
        kind: 'station',
        at,
        name: s.name,
        count: s.bikes,
        meters: distMeters(origin, at),
        target: { kind: 'station', station: s },
      })
    }
  }
  for (const v of bikes.vehicles) {
    if (!ok(v[2])) continue
    const at: LatLng = [v[0], v[1]]
    out.push({
      kind: v[2],
      at,
      name: null,
      rangeMi: v[3],
      meters: distMeters(origin, at),
      target: { kind: 'vehicle', vehicle: v },
    })
  }
  return out.sort((a, b) => a.meters - b.meters)
}

/** The `n` nearest places in one category, nearest first. */
export function nearestPlaces(places: Place[], from: LatLng, cat: PlaceCategory, n: number): Place[] {
  return places
    .filter((p) => p.cat === cat)
    .map((p) => ({ p, d: distMeters(from, [p.lat, p.lng]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.p)
}

/**
 * A station or vehicle tapped on the map, as a ride. Null for a station with
 * nothing to rent: tapping it should show it, not pretend you can ride from it.
 */
export function rideFromTarget(t: Target, origin: LatLng | null): Ride | null {
  const at = targetPoint(t)
  const meters = origin ? distMeters(origin, at) : 0
  if (t.kind === 'station') {
    const s = t.station
    if (!s.renting || s.bikes === 0) return null
    return { kind: 'station', at, name: s.name, count: s.bikes, meters, target: t }
  }
  if (t.kind === 'vehicle') {
    const v = t.vehicle
    return { kind: v[2], at, name: null, rangeMi: v[3], meters, target: t }
  }
  return null
}

/** Where to leave the bike: the nearest station with an open dock. */
export function nearestDock(stations: Station[], at: LatLng): (Station & { meters: number }) | null {
  let best: (Station & { meters: number }) | null = null
  for (const s of stations) {
    if (!s.renting || s.docks === 0) continue
    const meters = distMeters(at, [s.lat, s.lng])
    if (!best || meters < best.meters) best = { ...s, meters }
  }
  return best
}
