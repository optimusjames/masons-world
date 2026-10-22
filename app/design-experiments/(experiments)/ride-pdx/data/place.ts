// Geography for Ride PDX.
//
// Resolved from Nominatim on 2026-10-21:
//   https://nominatim.openstreetmap.org/search?q=Portland,+Oregon&format=json&limit=1
//
// Nominatim returns boundingbox as [south, north, west, east]. Leaflet wants
// [[south, west], [north, east]]. The conversion is already applied below.
//
// The extent is the city, because BIKETOWN is a city program and its service
// area sits inside city limits (stations span 45.46-45.60 N, 122.53-122.76 W).
// The map opens on the inner city, where the stations are densest.

export const PLACE = {
  name: 'Portland, Oregon',
  bounds: [
    [45.4325, -122.8367], // south, west
    [45.6529, -122.472], // north, east
  ] as [[number, number], [number, number]],
  center: [45.5195, -122.6655] as [number, number],
  zoom: 14,
  minZoom: 11,
  maxZoom: 18,
}

/**
 * Where places are pulled from. The BIKETOWN station extent plus a margin, so a
 * ride that starts at the edge of the system still has somewhere to go.
 */
export const PLACES_BBOX = { south: 45.44, west: -122.79, north: 45.62, east: -122.5 }
