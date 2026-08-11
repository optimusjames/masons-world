// Value -> visual encoding for {{TITLE}}.
//
// Palette comes from the `dataviz` skill. Do not hand-pick hues here; run that
// skill and paste its scale in.
//
// Rule that matters: an ordered scale drives a SECOND channel besides hue,
// because hue alone fails for roughly 1 in 12 men. Radius and ring weight both
// read from the same value below.

import type { LayerId, MapFeature } from '../types'

export interface Band {
  /** Inclusive lower bound. */
  min: number
  label: string
  color: string
  /** Marker radius in px at this band. */
  radius: number
}

/** Ordered low -> high. Replace with the scale `dataviz` returns. */
export const BANDS: Band[] = [
  { min: 0, label: '{{Low}}', color: '#{{aaa}}', radius: 4 },
  { min: 50, label: '{{Moderate}}', color: '#{{bbb}}', radius: 5.5 },
  { min: 100, label: '{{High}}', color: '#{{ccc}}', radius: 7 },
  { min: 150, label: '{{Very high}}', color: '#{{ddd}}', radius: 9 },
]

/** Flat colors for categorical layers, keyed by layer id. */
export const LAYER_COLOR: Record<LayerId, string> = {
  // '{{layer-id}}': '#{{hex}}',
}

const FALLBACK = '#94a3b8'

export function bandFor(value: number | undefined): Band | null {
  if (value == null || Number.isNaN(value)) return null
  let hit: Band | null = null
  for (const b of BANDS) {
    if (value >= b.min) hit = b
    else break
  }
  return hit
}

export function colorFor(f: Pick<MapFeature, 'layer' | 'value'>): string {
  const band = bandFor(f.value)
  if (band) return band.color
  return LAYER_COLOR[f.layer] ?? FALLBACK
}

export function radiusFor(f: Pick<MapFeature, 'layer' | 'value'>): number {
  return bandFor(f.value)?.radius ?? 5
}

/** Heavier ring at the top of the scale — the third read, for print and B&W. */
export function weightFor(f: Pick<MapFeature, 'layer' | 'value'>): number {
  const band = bandFor(f.value)
  if (!band) return 1.5
  const i = BANDS.indexOf(band)
  return i >= BANDS.length - 1 ? 2.5 : 1.5
}
