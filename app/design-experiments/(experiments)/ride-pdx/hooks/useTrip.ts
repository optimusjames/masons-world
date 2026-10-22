'use client'

// The routing behind each step of the flow. Each hook talks to OSRM only when
// its own inputs change, never on a bike-feed refresh: the feed ticks every
// minute, and re-routing what someone is reading would make the numbers jump
// under their eyes. Bikes are read through a ref for the same reason.

import { useEffect, useRef, useState } from 'react'
import type { BikeData, Place, PlaceCategory } from '../types'
import { minutesFrom, routeLeg, type LatLng, type Leg } from '../components/geo'
import { nearestPlaces, ridesNear, type Ride } from '../components/trip'

export type RideChoice = 'bike' | 'scooter' | 'any'

const KINDS: Record<RideChoice, Ride['kind'][]> = {
  bike: ['station', 'e'],
  scooter: ['s'],
  any: ['station', 'e', 's'],
}

export function rideKinds(choice: RideChoice): Ride['kind'][] {
  return KINDS[choice]
}

export interface Timed<T> {
  item: T
  minutes: number | null
  routed: boolean
}

/** Step 2: the closest bike, the closest scooter, and the closest of either, with walk times. */
export function useRideOptions(origin: LatLng | null, bikes: BikeData) {
  const bikesRef = useRef(bikes)
  bikesRef.current = bikes
  const [options, setOptions] = useState<Partial<Record<RideChoice, Timed<Ride>>>>({})

  useEffect(() => {
    setOptions({})
    if (!origin) return
    const ctrl = new AbortController()
    const found: Partial<Record<RideChoice, Ride>> = {}
    for (const c of ['bike', 'scooter', 'any'] as RideChoice[]) {
      const r = ridesNear(bikesRef.current, origin, KINDS[c])[0]
      if (r) found[c] = r
    }
    const build = (mins: Partial<Record<RideChoice, number>>, routed: boolean) =>
      Object.fromEntries(
        Object.entries(found).map(([c, item]) => [
          c,
          { item, minutes: mins[c as RideChoice] ?? null, routed },
        ]),
      ) as Partial<Record<RideChoice, Timed<Ride>>>

    // Straight-line first so the tiles fill instantly, routed minutes after.
    setOptions(build({}, false))
    const keys = Object.keys(found) as RideChoice[]
    minutesFrom(origin, keys.map((k) => found[k]!.at), 'foot', ctrl.signal)
      .then(({ minutes, routed }) =>
        setOptions(build(Object.fromEntries(keys.map((k, i) => [k, minutes[i]])), routed)),
      )
      .catch(() => {})
    return () => ctrl.abort()
  }, [origin])

  return options
}

/** One routed leg, recomputed only when its endpoints change. */
export function useLeg(from: LatLng | null, to: LatLng | null, mode: 'foot' | 'bike') {
  const [leg, setLeg] = useState<Leg | null>(null)
  const key = from && to ? `${from.join()}|${to.join()}|${mode}` : ''

  useEffect(() => {
    setLeg(null)
    if (!from || !to) return
    const ctrl = new AbortController()
    routeLeg(from, to, mode, ctrl.signal).then(setLeg).catch(() => {})
    return () => ctrl.abort()
    // `key` stands in for from/to, which are new arrays on many renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return leg
}

/** Step 3: the nearest few places in a category, timed by bike from the ride, not from you. */
export function useDestOptions(from: LatLng | null, places: Place[], category: PlaceCategory | null) {
  const [options, setOptions] = useState<Timed<Place>[]>([])
  const key = from && category ? `${from.join()}|${category}` : ''

  useEffect(() => {
    setOptions([])
    if (!from || !category) return
    const ctrl = new AbortController()
    const near = nearestPlaces(places, from, category, 4)
    setOptions(near.map((item) => ({ item, minutes: null, routed: false })))
    minutesFrom(from, near.map((p) => [p.lat, p.lng] as LatLng), 'bike', ctrl.signal)
      .then(({ minutes, routed }) =>
        setOptions(
          near
            .map((item, i) => ({ item, minutes: minutes[i], routed }))
            .sort((a, b) => (a.minutes ?? 0) - (b.minutes ?? 0)),
        ),
      )
      .catch(() => {})
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, places])

  return options
}

/** Minutes to walk the whole way, for comparison on the trip card. */
export function useWalkAll(from: LatLng | null, to: LatLng | null) {
  const [walk, setWalk] = useState<{ minutes: number; routed: boolean } | null>(null)
  const key = from && to ? `${from.join()}|${to.join()}` : ''

  useEffect(() => {
    setWalk(null)
    if (!from || !to) return
    const ctrl = new AbortController()
    minutesFrom(from, [to], 'foot', ctrl.signal)
      .then(({ minutes, routed }) => setWalk({ minutes: minutes[0], routed }))
      .catch(() => {})
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return walk
}
