// Value -> visual encoding for Green PDX.
//
// The palette is the `dataviz` skill's categorical set, not a hand-picked one,
// and the choice was made by running its validator rather than by eye. That
// mattered here. The obvious first instinct, dark green for natural areas and
// warm orange for gardens, FAILED: orange against #008300 measures ΔE 3.2 for
// protanopia, which is the classic red-green confusion, and nothing about
// looking at it on screen would have revealed that.
//
// What shipped (validated all-pairs, on this map's own #eef2ee surface, since a
// map shows every category at once rather than in adjacent pairs):
//
//   PASS  lightness band, chroma floor
//   PASS  CVD separation      worst pair olive↔teal ΔE 21.0 (deutan)
//   PASS  normal-vision floor worst pair olive↔teal ΔE 21.8
//   WARN  contrast            park teal 1.92 on this surface, under 3:1
//
// The second round came from a plain design note: parks should read cooler and
// more urban, natural areas drier and yellower. Changing only the natural green
// to olive FAILED, at ΔE 11.0 normal-vision against the old aqua — two greens
// that a reader with full color vision could not reliably separate. Moving both
// ends apart passed with the widest margins of anything tried. The lesson is
// that these colors are a set: a slot cannot be re-picked alone.
//
// That warning is not dismissable; it obliges "relief", meaning identity can
// never rest on the fill alone. So every polygon is named in its popup, the
// legend carries a labelled swatch and a count per layer, and gardens print
// their plot count in the marker. Hue is the fast read, never the only one.
//
// Two greens is a deliberate reading of the data: parks and natural areas ARE
// both green space, differing in kind rather than in category, and the pair
// clears the floor. Gardens take violet because they are the cultivated, human
// layer, and looking unlike the other two is the point.

import type { LayerId, MapFeature } from '../types'

export const PARK = '#4fc3a1'
export const NATURAL = '#5f7d12'
export const GARDEN = '#4a3aa7'

/**
 * Darker steps of the same two hues, for the polygon edges.
 *
 * The fills are deliberately pale, which is what lets two of them stack and
 * stay readable, but a pale fill on a pale basemap has no edge. These carry the
 * outline. Parks get the crisper, heavier one: a park is a boundary somebody
 * drew and maintains, and it should look municipal. Natural areas get a
 * dashed, lighter line, because an inventory parcel is a line on a map rather
 * than a fence in the world.
 *
 * Edges are not categorical slots, so they do not go through the palette gate;
 * they are darker steps of the hues that did.
 */
export const PARK_EDGE = '#1e8f6e'
export const NATURAL_EDGE = '#47600d'

/** Neighborhood lines are context, not a category, so they take ink rather than
 *  a palette slot. A fourth hue here would claim the boundaries are a fourth
 *  kind of green space. */
export const NEIGHBORHOOD = '#6b5f57'

export const LAYER_COLOR: Record<LayerId, string> = {
  park: PARK,
  natural: NATURAL,
  garden: GARDEN,
  neighborhood: NEIGHBORHOOD,
}

export const LAYER_LABEL: Record<LayerId, string> = {
  park: 'Parks',
  natural: 'Natural areas',
  garden: 'Community gardens',
  neighborhood: 'Neighborhoods',
}

/**
 * Fill opacity per polygon layer.
 *
 * The house cap is 0.55, past which the streets underneath vanish and people
 * lose their bearings. Parks sit a little heavier than natural areas because
 * natural areas frequently overlap them in this inventory (a park can contain a
 * natural area parcel), and the lighter wash keeps the overlap readable as two
 * things rather than one muddy one.
 */
export const FILL_OPACITY: Partial<Record<LayerId, number>> = {
  park: 0.5,
  natural: 0.36,
}

/**
 * Natural areas draw a dashed edge, parks a solid one.
 *
 * The two greens clear the colorblind floor, but they are still two greens, and
 * at city zoom a reader is separating them at a glance rather than studying
 * them. Line style is a channel that survives every kind of vision and every
 * printer, and it matches what the layers are: a park has a boundary somebody
 * drew and maintains, while a natural area parcel is an inventory line.
 */
export const STROKE_DASH: Partial<Record<LayerId, string>> = {
  natural: '4 3',
}

/**
 * Garden marker radius, driven by plot count.
 *
 * The second channel the palette warning demands. A 90-plot garden is a
 * different kind of place than a 9-plot one, and that difference should survive
 * both a grayscale print and a reader who cannot separate the hues. Range kept
 * tight: these are points on a city-wide map, not bubbles in a chart.
 */
export function gardenRadius(plots: number | null | undefined): number {
  if (!plots) return 6
  return Math.round(Math.min(Math.max(6 + Math.sqrt(plots) * 0.85, 6), 13))
}

/**
 * Print the count whenever there is one.
 *
 * This used to require 20 plots, with smaller gardens getting a sprout glyph
 * instead. Two problems: a 17-plot garden hid a number we actually had, and at
 * a 12px marker the sprout's stem and leaves collapsed into something that read
 * as the letter Y. A garden with no published count gets a plain dot, which
 * says "a garden is here" without pretending to say more.
 */
export function showsPlotBadge(plots: number | null | undefined): boolean {
  return (plots ?? 0) > 0
}

export function colorFor(layer: LayerId): string {
  return LAYER_COLOR[layer] ?? NEIGHBORHOOD
}

/** Park acreage, phrased the way a person would say it. */
export function acresLabel(acres: number | null | undefined): string | null {
  if (acres == null) return null
  if (acres < 1) return `${acres.toFixed(2)} acres`
  if (acres < 10) return `${acres.toFixed(1)} acres`
  return `${Math.round(acres).toLocaleString()} acres`
}
