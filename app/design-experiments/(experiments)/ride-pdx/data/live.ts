// Live BIKETOWN data for Ride PDX.
//
// GBFS is keyless and CORS-open, so this module is not hiding a key. It exists
// so one server-side fetch per minute is shared by every visitor instead of
// each browser pulling ~600KB of feed, and so the page's first paint already
// has bikes on it.
//
// Both the page (first paint) and /api/ride-pdx (the Refresh button) call
// getLiveBikes(). The committed snapshot is the fallback when the feed fails,
// never the thing we show by default: a bike's position from last week is
// worse than no position.

import type { BikeData, Station, Vehicle, VehicleKind } from '../types'
import snapshot from './bikes.json'

// The feed's own ttl is 60s. Polling faster cannot find anything new.
export const REVALIDATE = 60

const GBFS = 'https://gbfs.lyft.com/gbfs'
const UA = 'masons-world/ride-pdx (design experiment; github.com/optimusjames)'

async function json<T>(url: string, force: boolean): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    ...(force ? { cache: 'no-store' as const } : { next: { revalidate: REVALIDATE } }),
  })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.json() as Promise<T>
}

type GbfsInfo = {
  data: {
    stations: { station_id: string; name: string; lat: number; lon: number; capacity?: number }[]
  }
}
type GbfsStatus = {
  data: {
    stations: {
      station_id: string
      num_bikes_available: number
      num_ebikes_available?: number
      num_scooters_available?: number
      num_docks_available: number
      is_installed: number
      is_renting: number
    }[]
  }
}
type GbfsFree = {
  last_updated: number
  data: {
    bikes: {
      lat: number
      lon: number
      is_disabled: number
      is_reserved: number
      vehicle_type_id: string
      current_range_meters?: number
    }[]
  }
}

// Vehicle types from the 2.3 vehicle_types feed: 2 = e-bike, 3 = scooter.
const TYPE: Record<string, VehicleKind> = { '2': 'e', '3': 's' }

const r5 = (x: number) => Math.round(x * 1e5) / 1e5

/**
 * Stations come from GBFS 1.1, which splits counts by e-bike and scooter.
 * Free vehicles come from 2.3, which adds vehicle type and battery range.
 * Mirrors _build.py so the fallback snapshot is the same shape.
 */
export async function getLiveBikes({ force = false } = {}): Promise<BikeData> {
  try {
    const [info, status, free] = await Promise.all([
      json<GbfsInfo>(`${GBFS}/1.1/pdx/en/station_information.json`, force),
      json<GbfsStatus>(`${GBFS}/1.1/pdx/en/station_status.json`, force),
      json<GbfsFree>(`${GBFS}/2.3/pdx/en/free_bike_status.json`, force),
    ])

    const byId = new Map(status.data.stations.map((s) => [s.station_id, s]))
    const stations: Station[] = []
    for (const s of info.data.stations) {
      const st = byId.get(s.station_id)
      if (!st || !st.is_installed) continue
      stations.push({
        id: s.station_id,
        name: s.name,
        lat: r5(s.lat),
        lng: r5(s.lon),
        capacity: s.capacity ?? null,
        bikes: st.num_bikes_available,
        ebikes: st.num_ebikes_available ?? 0,
        scooters: st.num_scooters_available ?? 0,
        docks: st.num_docks_available,
        renting: Boolean(st.is_renting),
      })
    }

    const vehicles: Vehicle[] = []
    for (const b of free.data.bikes) {
      if (b.is_disabled || b.is_reserved) continue
      const kind = TYPE[String(b.vehicle_type_id)]
      if (!kind) continue
      const range = b.current_range_meters
      vehicles.push([
        r5(b.lat),
        r5(b.lon),
        kind,
        range ? Math.round((range / 1609.344) * 10) / 10 : null,
      ])
    }

    if (!stations.length) throw new Error('BIKETOWN returned no stations')

    return {
      stations,
      vehicles,
      asOf: new Date(free.last_updated * 1000).toISOString(),
      live: true,
    }
  } catch (err) {
    console.warn('[ride-pdx] live feed failed, serving snapshot', err)
    return snapshot as BikeData
  }
}
