// Geography for {{TITLE}}.
//
// Resolved from Nominatim on {{YYYY-MM-DD}}:
//   https://nominatim.openstreetmap.org/search?q={{QUERY}}&format=json&limit=1
//
// Nominatim returns boundingbox as [south, north, west, east]. Leaflet wants
// [[south, west], [north, east]]. The conversion is already applied below.
//
// The extent matches the phenomenon, not the jurisdiction that publishes the
// data. {{One line: why this extent. e.g. "Smoke crosses the county line, so
// this covers Beaverton, Milwaukie, Vancouver, and the mouth of the Gorge."}}

export const PLACE = {
  name: '{{PLACE NAME}}',
  bounds: [
    [0, 0], // south, west
    [0, 0], // north, east
  ] as [[number, number], [number, number]],
  center: [0, 0] as [number, number],
  zoom: 11,
  minZoom: 9,
  maxZoom: 17,
}
