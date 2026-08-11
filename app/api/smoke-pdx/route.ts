// Live data for Smoke PDX.
//
// Every upstream here is keyless, so this route exists for two other reasons:
// AirNow's file server sends no CORS headers (the browser cannot read it
// directly), and server-side caching keeps us from hammering a public file
// host once per visitor.
//
// Only the fast-moving layers refresh. Fire perimeters change on the order of
// days, so they come from the committed snapshot rather than being refetched
// every 15 minutes.

import { NextResponse } from 'next/server'
import type { MapData, MapFeature } from '@/app/design-experiments/(experiments)/smoke-pdx/types'
import { METRO, REGION } from '@/app/design-experiments/(experiments)/smoke-pdx/data/place'
import snapshot from '@/app/design-experiments/(experiments)/smoke-pdx/data/smoke.json'

// Matched to the source cadence. AirNow publishes hourly; polling faster just
// burns requests against a public file server.
export const revalidate = 900

const AIRNOW = 'https://files.airnowtech.org/airnow/today/'
const UA = 'masons-world/smoke-pdx (design experiment; github.com/optimusjames)'

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

// EPA AQI breakpoints for PM2.5, as revised in the 2024 NAAQS update.
const BREAKPOINTS: [number, number, number, number, string][] = [
  [0.0, 9.0, 0, 50, 'Good'],
  [9.1, 35.4, 51, 100, 'Moderate'],
  [35.5, 55.4, 101, 150, 'Unhealthy for Sensitive Groups'],
  [55.5, 125.4, 151, 200, 'Unhealthy'],
  [125.5, 225.4, 201, 300, 'Very Unhealthy'],
  [225.5, 325.4, 301, 500, 'Hazardous'],
]

function toAqi(conc: number): { aqi: number; category: string } {
  const c = Math.floor(conc * 10) / 10 // EPA truncates to 1 decimal first
  for (const [lo, hi, alo, ahi, cat] of BREAKPOINTS) {
    if (c <= hi) {
      const cc = Math.max(c, lo)
      return { aqi: Math.round(((ahi - alo) / (hi - lo)) * (cc - lo) + alo), category: cat }
    }
  }
  return { aqi: 500, category: 'Hazardous' }
}

/**
 * EPA NowCast for PM2.5. `vals` is newest-first indexed by hours back from the
 * anchor; `usable` marks which of those hours we retrieved a complete file for.
 *
 * The 2-of-3 validity rule is applied over the 3 most recent hours we could
 * READ, not the 3 most recent clock hours. EPA's rule is about whether the
 * monitor reported; holes in AirNow's file publishing are our problem, not
 * evidence a station went quiet, and conflating the two blanks the whole map.
 */
function nowcast(vals: (number | null)[], usable: boolean[]): number | null {
  const present = vals.filter((v): v is number => v != null)
  if (present.length < 2) return null
  const recent = vals.filter((_, i) => usable[i]).slice(0, 3)
  if (recent.filter((v) => v != null).length < 2) return null
  const hi = Math.max(...present)
  const lo = Math.min(...present)
  if (hi <= 0) return 0
  const w = Math.max(1 - (hi - lo) / hi, 0.5)
  let num = 0
  let den = 0
  vals.forEach((v, i) => {
    if (v == null) return
    num += Math.pow(w, i) * v
    den += Math.pow(w, i)
  })
  return den ? Math.round((num / den) * 10) / 10 : null
}

function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}${p(d.getUTCHours())}`
}

function hourlyUrl(t: Date, now: Date): string {
  const s = stamp(t)
  // `today/` only holds the current UTC day; older hours live in the dated archive.
  if (t.getUTCDate() === now.getUTCDate() && t.getUTCMonth() === now.getUTCMonth()) {
    return `${AIRNOW}HourlyData_${s}.dat`
  }
  return `https://files.airnowtech.org/airnow/${s.slice(0, 4)}/${s.slice(0, 8)}/HourlyData_${s}.dat`
}

// A complete national hourly file carries ~1,300-1,400 PM2.5 rows. AirNow writes
// them progressively, so the newest file on the server is often a stub with a
// hundred rows. Treating a stub as real makes the whole country look offline.
const MIN_PM25_ROWS = 800

async function text(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, next: { revalidate } })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.text()
}

async function buildMonitors(now: Date): Promise<MapFeature[]> {
  const sitesRaw = await text(`${AIRNOW}monitoring_site_locations.dat`)
  const [[rs, rw], [rn, re]] = REGION.bounds

  type Site = { name: string; agency: string; lat: number; lng: number; metro: boolean }
  const sites = new Map<string, Site>()
  for (const line of sitesRaw.split('\n')) {
    const p = line.split('|')
    if (p.length < 21 || p[1] !== 'PM2.5') continue
    const lat = Number(p[8])
    const lng = Number(p[9])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    if (lat < rs || lat > rn || lng < rw || lng > re) continue
    sites.set(p[0].slice(-9), {
      name: p[3],
      agency: p[6],
      lat,
      lng,
      metro: inMetro(lat, lng),
    })
  }

  /** Parse one hourly file. Returns null if the hour is unusable. */
  const readHour = (file: string | null): Map<string, number> | null => {
    if (file == null) return null
    let total = 0
    const vals = new Map<string, number>()
    for (const line of file.split('\n')) {
      const p = line.split('|')
      if (p.length < 9 || p[5] !== 'PM2.5') continue
      total++
      if (!sites.has(p[2])) continue
      const v = Number(p[7])
      if (Number.isFinite(v)) vals.set(p[2], v)
    }
    return total < MIN_PM25_ROWS ? null : vals
  }

  // Scan a few extra hours so we can anchor on the newest COMPLETE one. AirNow
  // publishes with a lag, so anchoring to the current clock hour leaves the
  // newest slots empty and every site fails the validity rule.
  const SCAN = 16
  const hours = Array.from({ length: SCAN }, (_, i) => new Date(now.getTime() - i * 3600_000))
  const files = await Promise.all(
    hours.map((h) => text(hourlyUrl(h, now)).catch(() => null)),
  )
  const parsed = files.map(readHour)

  const anchorIdx = parsed.findIndex((p) => p != null)
  if (anchorIdx < 0) throw new Error('no complete AirNow hourly file in the scan window')

  const window = parsed.slice(anchorIdx, anchorIdx + 12)
  const usable = window.map((p) => p != null)
  const series = new Map<string, (number | null)[]>()
  for (const id of sites.keys()) {
    series.set(id, window.map((p) => (p == null ? null : p.get(id) ?? null)))
  }

  const observedAt = new Date(hours[anchorIdx])
  observedAt.setUTCMinutes(0, 0, 0)

  return Array.from(sites.entries()).map(([id, site]) => {
    const vals = series.get(id)!
    let conc = nowcast(vals, usable)
    const detail: { label: string; value: string }[] = []
    let value: number | null = null
    let staleHours: number | null = null

    if (conc == null) {
      // No valid NowCast. Fall back to the most recent single reading in the
      // window, reported as "last known" and never as current AQI.
      const i = vals.findIndex((v) => v != null)
      if (i >= 0) {
        staleHours = i
        conc = vals[i]
      }
    }

    if (conc == null) {
      detail.push({ label: 'Reading', value: 'Nothing in 12h' })
    } else {
      const { aqi, category } = toAqi(conc)
      value = aqi
      detail.push({
        label: staleHours == null ? 'PM2.5 (NowCast)' : 'Last reading',
        value: `${conc} µg/m³`,
      })
      detail.push({ label: 'Category', value: category })
      if (staleHours != null) detail.push({ label: 'Measured', value: `${staleHours}h ago` })
    }
    detail.push({ label: 'Operated by', value: site.agency })

    return {
      id: `monitor-${id}`,
      layer: 'monitor' as const,
      lat: Math.round(site.lat * 1e5) / 1e5,
      lng: Math.round(site.lng * 1e5) / 1e5,
      value,
      staleHours,
      metro: site.metro,
      label: site.name,
      detail,
      real: true,
      // The hour the reading is FOR, not the hour we fetched it.
      observedAt: new Date(
        observedAt.getTime() - (staleHours ?? 0) * 3600_000,
      ).toISOString(),
    }
  })
}

function inMetro(lat: number, lng: number): boolean {
  const [[s, w], [n, e]] = METRO.bounds
  return lat >= s && lat <= n && lng >= w && lng <= e
}

/**
 * Refresh only the metro wind cells, and carry the regional ones over from the
 * snapshot.
 *
 * The full grid is 651 points. Open-Meteo counts every coordinate in a
 * multi-point call against the quota, so refetching all of them every 15
 * minutes rate-limits immediately (verified: a single 90-point call returns 429
 * once the quota is spent). The metro grid is ~66 cells, it is what the opening
 * view actually shows, and regional wind barely changes inside a refresh
 * interval anyway.
 */
async function buildWind(): Promise<MapFeature[]> {
  const all = (snapshot as unknown as MapData).features.filter((f) => f.layer === 'wind')
  const cells = all.filter((c) => inMetro(c.lat, c.lng))
  const regional = all.filter((c) => !inMetro(c.lat, c.lng))
  const out: MapFeature[] = [...regional]

  for (let i = 0; i < cells.length; i += 60) {
    const chunk = cells.slice(i, i + 60)
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${chunk.map((c) => c.lat).join(',')}` +
      `&longitude=${chunk.map((c) => c.lng).join(',')}` +
      '&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=mph'
    const res = await fetch(url, { next: { revalidate } })
    if (!res.ok) throw new Error(`open-meteo -> ${res.status}`)
    const json = await res.json()
    // Open-Meteo returns a bare object for one point, an array for many.
    const rows = Array.isArray(json) ? json : [json]

    rows.forEach((row, j) => {
      const cur = row.current ?? {}
      const speed = cur.wind_speed_10m
      const bearing = cur.wind_direction_10m
      if (speed == null || bearing == null) return
      out.push({
        id: `wind-${i + j}`,
        layer: 'wind',
        lat: row.latitude,
        lng: row.longitude,
        value: Math.round(speed * 10) / 10,
        bearing: Math.round(bearing),
        label: `${Math.round(speed)} mph from the ${COMPASS[Math.round((bearing % 360) / 22.5) % 16]}`,
        real: true,
        observedAt: cur.time,
      })
    })
  }
  return out
}

export async function GET() {
  const base = snapshot as unknown as MapData
  const now = new Date()

  // Each layer falls back independently. One flaky upstream should degrade its
  // own layer, not blank the map: Open-Meteo rate-limiting has nothing to do
  // with whether AirNow has fresh readings.
  const [monitorsResult, windResult] = await Promise.allSettled([
    buildMonitors(now),
    buildWind(),
  ])

  const monitors =
    monitorsResult.status === 'fulfilled'
      ? monitorsResult.value
      : base.features.filter((f) => f.layer === 'monitor')
  const wind =
    windResult.status === 'fulfilled'
      ? windResult.value
      : base.features.filter((f) => f.layer === 'wind')

  // "Live" tracks the monitors, since they are the reading someone came for.
  const live = monitorsResult.status === 'fulfilled'

  return NextResponse.json({
    ...base,
    features: [...monitors, ...wind],
    // Perimeters intentionally come from the snapshot: they move on the order
    // of days, and refetching 118 polygons every 15 minutes buys nothing.
    shapes: base.shapes,
    generatedAt: live ? now.toISOString() : base.generatedAt,
    counts: {
      ...base.counts,
      monitors: monitors.length,
      monitorsReporting: monitors.filter((m) => m.value != null).length,
      metroMonitors: monitors.filter((m) => m.metro).length,
      metroReporting: monitors.filter((m) => m.metro && m.value != null && m.staleHours == null)
        .length,
      windCells: wind.length,
    },
    live,
  } satisfies MapData)
}
