// Geography for Smoke PDX.
//
// Resolved from Nominatim on 2026-08-10:
//   https://nominatim.openstreetmap.org/search?q=Portland,Oregon&format=json&limit=1
// which returned city limits of [45.4325, 45.6529] x [-122.8367, -122.4720].
//
// We use two boxes rather than one, because the phenomenon and the measurement
// live at different scales. Smoke is made hundreds of miles away and measured
// on your block, so the map OPENS on the metro and lets you pan out to the
// wider region. Data was fetched for the whole outer box, so zooming out reveals
// fires and wind instead of empty basemap.

/** Where the map opens: greater Portland. All 22 AirNow monitors sit inside. */
export const METRO = {
  center: [45.52, -122.67] as [number, number],
  zoom: 10,
  bounds: [
    [45.25, -123.1], // south, west  — Estacada, Hillsboro
    [45.8, -122.15], // north, east  — Ridgefield, the Gorge
  ] as [[number, number], [number, number]],
}

/**
 * How far out you can pan: the whole Pacific Northwest.
 *
 * Oregon and SW Washington was too small an idea. Portland's August smoke
 * routinely arrives from Northern California, Idaho, and western Montana, so
 * cutting the map at the state line hides the actual source of what people are
 * breathing. This box covers all of Oregon and Washington plus those origins:
 * 118 active fire perimeters at last count, against 67 inside the old one.
 */
export const REGION = {
  bounds: [
    [40.0, -125.2], // south, west  — Northern California, offshore
    [49.5, -113.0], // north, east  — Canadian border, western Montana
  ] as [[number, number], [number, number]],
  // 6, not 5. The wind grid stops at the bounds above, and zooming out far
  // enough to see all four edges at once turns a data extent into a visible
  // rectangle floating over North America. This keeps the frame just inside it.
  minZoom: 6,
  maxZoom: 14,
}

/** Degrees from the region edge over which wind arrows fade out, so the grid
 *  ends softly instead of stopping on a ruled line. */
export const EDGE_FADE_DEG = 1.2

/**
 * How far past the data extent you are allowed to pan.
 *
 * REGION is where we fetched data, which is not the same question as where the
 * camera may go. Clamping the camera to the data box means a monitor sitting on
 * the north edge can never be centered, so clicking it opens a card the map
 * refuses to pan into view and the reading gets clipped by the top of the
 * frame. Padding the camera box gives every marker room to breathe, at the cost
 * of a strip of empty basemap at the extremes, which the edge fade on the wind
 * grid already prepares the eye for.
 */
const PAN_PAD = { lat: 1.6, lng: 2.6 }

export const PAN_BOUNDS = [
  [REGION.bounds[0][0] - PAN_PAD.lat, REGION.bounds[0][1] - PAN_PAD.lng],
  [REGION.bounds[1][0] + PAN_PAD.lat, REGION.bounds[1][1] + PAN_PAD.lng],
] as [[number, number], [number, number]]
