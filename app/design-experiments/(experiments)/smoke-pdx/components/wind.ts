// The wind field, sampled so it can be asked the same question thousands of
// times a second.
//
// Two very different marks read from these 651 cells: static chevrons on a
// screen lattice, and drifting particles. The chevrons could afford to scan
// every cell for the nearest one, because there are only a few hundred of them
// and they are redrawn once per pan. A particle layer asks "what is the wind
// here" for every particle on every frame, which is roughly four hundred
// questions sixty times a second, so the scan has to happen once up front
// instead.
//
// So this builds a regular lat/lng grid over the region, fills each node from
// the nearest real sample, and interpolates between nodes on lookup. Two
// consequences worth being honest about, both stated in SOURCES.md:
//
//   1. Nodes between real samples are interpolated, not measured.
//   2. The fill is nearest-neighbour, so a node inside the fine metro grid gets
//      metro detail and a node out over Idaho gets the coarse regional value,
//      which is the same thing the chevrons were already doing.

import { EDGE_FADE_DEG, REGION } from '../data/place'
import type { MapFeature } from '../types'

/** Wind at a point, split into components. `u` is east, `v` is north. */
export interface WindSample {
  u: number
  v: number
  speed: number
}

export interface WindField {
  /** Null outside the region, or where no sample was near enough. */
  at(lat: number, lng: number): WindSample | null
  /** How many real samples went in. Only used for a sanity check. */
  cells: number
}

/**
 * Grid spacing, in degrees.
 *
 * Matched to the fine metro grid (0.08°) rather than the coarse regional one
 * (0.45°), so the detail that exists over Portland survives the trip through
 * this structure. Across the region that is about 18,000 nodes, which is a few
 * hundred kilobytes and builds in well under a frame.
 */
const STEP = 0.08

/** Nearest-sample search radius, in degrees. Past this a node has no wind and
 *  particles there die rather than drifting on invented data. */
const MAX_REACH = 0.75

/** Bucket size for the nearest-sample search. One degree puts a handful of
 *  cells in each bucket, so a node checks tens of candidates instead of 651. */
const BUCKET = 1

/**
 * Wind components from speed and the meteorological bearing.
 *
 * Meteorology names the direction wind comes FROM, so both components are
 * negated: a wind "from 0°" (the north) blows toward the south.
 */
export function uvFrom(speedMph: number, bearingDeg: number): WindSample {
  const rad = (bearingDeg * Math.PI) / 180
  return {
    u: -speedMph * Math.sin(rad),
    v: -speedMph * Math.cos(rad),
    speed: speedMph,
  }
}

/** The meteorological bearing (degrees the wind comes FROM) for a sample. */
export function bearingOf(s: WindSample): number {
  return ((Math.atan2(-s.u, -s.v) * 180) / Math.PI + 360) % 360
}

/**
 * 0 at the region edge, 1 once EDGE_FADE_DEG inside it.
 *
 * Without this the field ends on a ruled line and reads as a rectangle drawn
 * over the map rather than as weather. The chevrons fade their opacity with it;
 * the particles fade and then die on it, which is the same idea in motion.
 */
export function edgeFade(lat: number, lng: number): number {
  const [[s, w], [n, e]] = REGION.bounds
  const d = Math.min(lat - s, n - lat, lng - w, e - lng)
  return Math.max(0, Math.min(1, d / EDGE_FADE_DEG))
}

export function buildWindField(cells: MapFeature[]): WindField | null {
  const usable = cells.filter((c) => c.bearing != null && c.value != null)
  if (!usable.length) return null

  const [[south, west], [north, east]] = REGION.bounds
  const cols = Math.ceil((east - west) / STEP) + 1
  const rows = Math.ceil((north - south) / STEP) + 1

  // Bucketed by whole degree, so filling a node means checking its own bucket
  // and the ring around it rather than every cell in the Northwest.
  const buckets = new Map<string, MapFeature[]>()
  const key = (lat: number, lng: number) =>
    `${Math.floor(lat / BUCKET)}:${Math.floor(lng / BUCKET)}`
  for (const c of usable) {
    const k = key(c.lat, c.lng)
    const list = buckets.get(k)
    if (list) list.push(c)
    else buckets.set(k, [c])
  }

  const u = new Float32Array(cols * rows)
  const v = new Float32Array(cols * rows)
  // Float32Array fills with zeros, and zero is a legitimate wind speed, so
  // "no data here" needs its own channel rather than being inferred from 0,0.
  const has = new Uint8Array(cols * rows)

  const maxReachSq = MAX_REACH * MAX_REACH

  for (let row = 0; row < rows; row++) {
    const lat = south + row * STEP
    for (let col = 0; col < cols; col++) {
      const lng = west + col * STEP
      let best: MapFeature | null = null
      let bestD = Infinity

      // Widen the ring until something is found or we pass the reach limit.
      for (let ring = 0; ring <= 2 && !best; ring++) {
        for (let dy = -ring; dy <= ring; dy++) {
          for (let dx = -ring; dx <= ring; dx++) {
            // Only the new edge of the ring; the inside was searched already.
            if (ring > 0 && Math.abs(dx) !== ring && Math.abs(dy) !== ring) continue
            const list = buckets.get(
              `${Math.floor(lat / BUCKET) + dy}:${Math.floor(lng / BUCKET) + dx}`,
            )
            if (!list) continue
            for (const c of list) {
              const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
              if (d < bestD) {
                bestD = d
                best = c
              }
            }
          }
        }
      }

      if (!best || bestD > maxReachSq) continue
      const s = uvFrom(best.value as number, best.bearing as number)
      const i = row * cols + col
      u[i] = s.u
      v[i] = s.v
      has[i] = 1
    }
  }

  return {
    cells: usable.length,
    at(lat: number, lng: number): WindSample | null {
      const fy = (lat - south) / STEP
      const fx = (lng - west) / STEP
      if (fx < 0 || fy < 0 || fx > cols - 1 || fy > rows - 1) return null

      const x0 = Math.floor(fx)
      const y0 = Math.floor(fy)
      const x1 = Math.min(x0 + 1, cols - 1)
      const y1 = Math.min(y0 + 1, rows - 1)
      const tx = fx - x0
      const ty = fy - y0

      const i00 = y0 * cols + x0
      const i10 = y0 * cols + x1
      const i01 = y1 * cols + x0
      const i11 = y1 * cols + x1
      // All four corners have to be real. Interpolating against an empty node
      // would drag particles toward a calm that is not there.
      if (!has[i00] || !has[i10] || !has[i01] || !has[i11]) return null

      const lerp = (a: number, b: number, t: number) => a + (b - a) * t
      const uu = lerp(lerp(u[i00], u[i10], tx), lerp(u[i01], u[i11], tx), ty)
      const vv = lerp(lerp(v[i00], v[i10], tx), lerp(v[i01], v[i11], tx), ty)
      return { u: uu, v: vv, speed: Math.hypot(uu, vv) }
    },
  }
}
