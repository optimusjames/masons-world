// Geography for Green PDX.
//
// Resolved from Nominatim on 2026-09-15:
//   https://nominatim.openstreetmap.org/search?q=Portland,Oregon&format=json&limit=1
// which returned [45.4325360, 45.6528812] x [-122.8367489, -122.4720252].
//
// Nominatim returns boundingbox as [south, north, west, east]; Leaflet wants
// [[south, west], [north, east]]. The conversion is applied below.
//
// The extent is the city, not the metro, and that is a data decision rather
// than a geographic one. Parks and natural areas exist across the whole region,
// but the community garden program is run by Portland Parks & Recreation and
// stops at the city line. A metro map would show gardens clustered in the
// middle and none in Beaverton or Gresham, which reads as "no gardens there"
// instead of "no data there". Metro's regional ORCA layer is the way to widen
// this later, and that swap belongs in the build script, not here.

export const PLACE = {
  name: 'Portland, Oregon',
  bounds: [
    [45.4325, -122.8367], // south, west
    [45.6529, -122.472], // north, east
  ] as [[number, number], [number, number]],
  center: [45.5202, -122.6742] as [number, number],
  // The whole city in frame on a laptop. Forest Park at the northwest and
  // Powell Butte at the east are the two anchors that have to both fit, and
  // they are what makes the city read as greener than people expect.
  zoom: 12,
  minZoom: 11,
  maxZoom: 17,
}

/**
 * How far past the city the camera may go.
 *
 * The data stops at the city limits, but clamping the camera exactly there
 * means a park on the boundary can never be centered. Padding gives every
 * feature room, at the cost of a little empty basemap at the edges.
 */
const PAN_PAD = { lat: 0.06, lng: 0.09 }

export const PAN_BOUNDS = [
  [PLACE.bounds[0][0] - PAN_PAD.lat, PLACE.bounds[0][1] - PAN_PAD.lng],
  [PLACE.bounds[1][0] + PAN_PAD.lat, PLACE.bounds[1][1] + PAN_PAD.lng],
] as [[number, number], [number, number]]
