// The basemap every map experiment draws on.
//
// This module exists because a tile provider belongs to the outside world, not
// to any one experiment. When CARTO added an "API KEY REQUIRED" watermark to
// their free raster tiles in August 2026, four experiments broke at once and the
// fix meant editing four files. Now it means editing this one.
//
// The rule that keeps this module honest: it knows about providers and themes
// and nothing else. Where a map is centered, how far it zooms, what it plots,
// and which theme it wants are all the experiment's business. If this file ever
// needs to branch on a specific experiment, the abstraction is wrong and it
// should be inlined back into the experiments that need it.

import type { Map as LeafletMap, Layer as LeafletLayer } from 'leaflet'

export type BasemapTheme = 'light' | 'dark'

/**
 * OpenFreeMap. No API key, no account, no rate limit, and self-hostable if the
 * public instance ever goes away.
 *
 * These are vector styles, not raster tile URLs. Vector buys us three things
 * that mattered for this project: the labels stay sharp at any pixel density
 * instead of needing a separate @2x tile, switching light to dark restyles the
 * map in place rather than refetching every tile in the viewport, and the
 * styles follow the open OpenMapTiles schema, so replacing the provider means
 * swapping a host rather than rewriting the maps.
 *
 * `positron` is a deliberate clone of the CARTO Positron look these experiments
 * were built against, so the migration was close to visually neutral.
 */
const STYLE_URLS: Record<BasemapTheme, string> = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
}

/**
 * Required attribution, and nothing beyond it.
 *
 * OpenFreeMap serves these tiles but says in its own guidance that crediting
 * OpenFreeMap is optional, so we don't: three credits on a small map read as
 * clutter and push the real one out of sight. OpenMapTiles and OpenStreetMap
 * stay, because those are license conditions rather than courtesies. Keep this
 * visible on every map, styled quiet.
 */
export const BASEMAP_ATTRIBUTION =
  '© <a href="https://openmaptiles.org" target="_blank" rel="noopener">OpenMapTiles</a> ' +
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'

/** The style URL for a theme, for callers that drive MapLibre themselves. */
export function basemapStyleUrl(theme: BasemapTheme): string {
  return STYLE_URLS[theme]
}

/**
 * The same style with everything but the text stripped out.
 *
 * Maps that tint the basemap (smoke plumes, canopy density, heat) have a
 * problem: the moment a translucent layer covers the ground, the place names
 * baked into it go muddy and the reader loses their bearings. The fix is to
 * draw labels a second time on a pane above the data.
 *
 * We derive this from the real style rather than hardcoding a second provider,
 * so the labels always match the basemap they sit on and there is still only
 * one provider to change.
 */
async function labelsOnlyStyle(theme: BasemapTheme): Promise<unknown | null> {
  const res = await fetch(basemapStyleUrl(theme))
  if (!res.ok) return null
  const style = (await res.json()) as {
    layers: { type: string }[]
    sources: Record<string, unknown>
  }
  return {
    ...style,
    // Transparent ground: this style is an overlay, not a basemap.
    layers: style.layers.filter((l) => l.type === 'symbol'),
  }
}

/**
 * Load MapLibre and the Leaflet bridge, and build a layer from a style.
 *
 * Everything client-only and failure-prone lives here so the two public helpers
 * stay small and share one definition of "what could go wrong".
 */
async function createVectorLayer(
  style: unknown,
  pane?: string,
): Promise<LeafletLayer | null> {
  const [L] = await Promise.all([
    import('leaflet').then((m) => m.default),
    import('maplibre-gl'),
    import('maplibre-gl/dist/maplibre-gl.css'),
    import('@maplibre/maplibre-gl-leaflet'),
  ])

  // The bridge attaches itself to the Leaflet namespace as an import side
  // effect, so it is absent if the import silently no-ops.
  const factory = (L as unknown as {
    maplibreGL?: (opts: unknown) => LeafletLayer
  }).maplibreGL
  if (typeof factory !== 'function') return null

  return factory({
    style,
    // Must be top level, not nested under a maplibreOptions key: the bridge
    // reads this flag off its own options both to configure MapLibre and to
    // decide whether to copy the style's built-in credit into Leaflet's
    // attribution control. Nested, it silently does neither, and the map ends
    // up crediting OpenStreetMap twice in one line. We render the credit
    // ourselves from BASEMAP_ATTRIBUTION instead.
    attributionControl: false,
    ...(pane ? { pane } : {}),
  })
}

/**
 * Add the vector basemap to an existing Leaflet map.
 *
 * Deliberately a Leaflet layer rather than a full MapLibre rewrite. Every
 * experiment's markers, panes, popups, and GeoJSON keep working exactly as they
 * did; only the ground underneath them changed.
 *
 * Returns the layer so callers can swap themes later, or null if the basemap
 * could not be created. Null is not worth crashing over: a map that draws its
 * data on a blank ground is still a usable map, and it beats a component that
 * throws because a visitor's browser has WebGL turned off.
 */
export async function addBasemap(
  map: LeafletMap,
  { theme = 'light' }: { theme?: BasemapTheme } = {},
): Promise<LeafletLayer | null> {
  try {
    const layer = await createVectorLayer(basemapStyleUrl(theme))
    if (!layer) return null
    layer.addTo(map)
    return layer
  } catch (err) {
    console.warn('[basemap] vector basemap unavailable, continuing without it', err)
    return null
  }
}

/**
 * Add place names on a pane above the data layers.
 *
 * Only for maps that tint the ground. On an untinted map this would just draw
 * every label twice.
 *
 * The caller owns the pane and its z-index, because how high "above the data"
 * sits is a per-map decision about what may cover what.
 */
export async function addLabelsOverlay(
  map: LeafletMap,
  { theme = 'light', pane }: { theme?: BasemapTheme; pane: string },
): Promise<LeafletLayer | null> {
  try {
    const style = await labelsOnlyStyle(theme)
    if (!style) return null
    const layer = await createVectorLayer(style, pane)
    if (!layer) return null
    layer.addTo(map)
    return layer
  } catch (err) {
    console.warn('[basemap] label overlay unavailable, continuing without it', err)
    return null
  }
}

// A note on versions, because this one cost an afternoon.
//
// maplibre-gl is pinned to ^5, not ^6, even though the Leaflet bridge's
// peerDependencies claim to accept ^6. The bridge keeps Leaflet and MapLibre in
// sync by reaching into `map.transform` and overwriting internals like
// `latRange` and `maxValidLatitude`. Those internals moved in MapLibre 6, so on
// 6.x the bridge fails silently: the style, sprites, and TileJSON all load, a
// correctly sized canvas appears in the tile pane, and not a single vector tile
// is ever requested, because the camera never gets a valid transform. There is
// no error to catch, just a blank basemap under working data layers.
//
// If you bump this, the check is not "does it build" or "is the canvas there".
// Load a map and confirm .pbf requests to tiles.openfreemap.org actually fire.
