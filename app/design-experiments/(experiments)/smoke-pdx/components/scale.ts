// Value -> visual encoding for Smoke PDX.
//
// The AQI palette is NOT a design choice. EPA standardizes it, every news
// station and phone weather app uses it, and people read it without a legend.
// Inventing our own scale here would be worse design even if it were prettier,
// so this overrides the usual `dataviz` palette step.
//
// The one liberty taken: pure #ffff00 and #00e400 are illegible on a light
// basemap, so Moderate and Good are darkened while keeping their hue. The three
// bands that matter most in a real smoke event are left exactly as EPA
// publishes them.
//
// Hue alone fails for roughly 1 in 12 men, and this ramp runs straight through
// green/yellow/orange/red. So radius carries the same value, and the top two
// bands get a heavier ring. Three channels, one number.

import type { LayerId, MapFeature } from '../types'

export interface Band {
  min: number
  label: string
  short: string
  color: string
  radius: number
}

// `radius` is half the diameter of the dot. No number rides inside any more, so
// these can grow: size and hue now carry the reading together, which is the
// second visual channel the ramp needs anyway.
export const AQI_BANDS: Band[] = [
  { min: 0, label: 'Good', short: '0–50', color: '#00a651', radius: 12 },
  { min: 51, label: 'Moderate', short: '51–100', color: '#c9a800', radius: 14 },
  { min: 101, label: 'Unhealthy for sensitive groups', short: '101–150', color: '#ff7e00', radius: 16 },
  { min: 151, label: 'Unhealthy', short: '151–200', color: '#ee0000', radius: 18 },
  { min: 201, label: 'Very unhealthy', short: '201–300', color: '#8f3f97', radius: 20 },
  { min: 301, label: 'Hazardous', short: '301+', color: '#7e0023', radius: 22 },
]

/** A monitor that is online but has no valid NowCast. Drawn, not hidden. */
export const NO_READING = '#b9b1a8'

export const FIRE = '#c0392b'
export const WIND = '#27405f'

export function bandFor(aqi: number | null | undefined): Band | null {
  if (aqi == null || Number.isNaN(aqi)) return null
  let hit: Band | null = null
  for (const b of AQI_BANDS) {
    if (aqi >= b.min) hit = b
    else break
  }
  return hit
}

export function colorFor(f: Pick<MapFeature, 'layer' | 'value'>): string {
  if (f.layer === 'wind') return WIND
  if (f.layer === 'perimeter') return FIRE
  return bandFor(f.value)?.color ?? NO_READING
}

export function radiusFor(f: Pick<MapFeature, 'layer' | 'value'>): number {
  return bandFor(f.value)?.radius ?? 4
}

/** Heavier ring at the dangerous end — the third read, and it survives B&W. */
export function weightFor(f: Pick<MapFeature, 'layer' | 'value'>): number {
  const band = bandFor(f.value)
  if (!band) return 1.5
  return AQI_BANDS.indexOf(band) >= 3 ? 2.5 : 1.5
}

/** Wind arrow length in px. Small and dense reads as a field; big and sparse
 *  reads as scattered marks. Keep the range tight so a calm day still shows
 *  arrows rather than dots. */
export function arrowLength(mph: number | null): number {
  if (mph == null) return 9
  return Math.round(Math.min(Math.max(8 + mph * 0.55, 9), 20))
}

/** Stroke width in px. Thin strokes make an opacity ramp invisible — there is
 *  not enough ink on screen for the eye to compare. Width and opacity have to
 *  climb together for speed to read at a glance. */
export function arrowWidth(mph: number | null): number {
  if (mph == null) return 1.6
  return Math.min(Math.max(1.4 + mph * 0.09, 1.4), 3.2)
}

/** Faster wind draws more solid. Range widened to near-full contrast so the
 *  difference between a calm cell and a fast one is obvious. */
export function arrowOpacity(mph: number | null): number {
  if (mph == null) return 0.5
  // Floor raised: arrows sit over the air-quality tint, and a 0.22 alpha blue
  // simply disappears against a saturated orange or red field.
  return Math.min(Math.max(0.42 + mph * 0.035, 0.42), 0.95)
}

export const LAYER_COLOR: Record<LayerId, string> = {
  monitor: '#00a651',
  wind: WIND,
  perimeter: FIRE,
}
