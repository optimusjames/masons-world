// SVG for markers drawn as Leaflet divIcons, which take an HTML string and so
// cannot render a React component.
//
// The geometry is Lucide's (ISC), copied from the `__iconNode` exports of the
// lucide-react already in this repo, so the map marks and the React UI around
// them (which uses lucide-react directly) are one icon family. Regenerate with
// the same names if lucide-react is upgraded:
//
//   bike, scooter, shopping-basket, trees, coffee, library-big, binoculars

import type { PlaceCategory, VehicleKind } from '../types'

const BODY = {
  bike:
    '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/>' +
    '<path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
  scooter:
    '<path d="M21 4h-3.5l2 11.05"/><path d="M6.95 17h5.142c.523 0 .95-.406 1.063-.916a6.5 6.5 0 0 1 5.345-5.009"/>' +
    '<circle cx="19.5" cy="17.5" r="2.5"/><circle cx="4.5" cy="17.5" r="2.5"/>',
  grocery:
    '<path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/>' +
    '<path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="M4.5 15.5h15"/>' +
    '<path d="m5 11 4-7"/><path d="m9 11 1 9"/>',
  park:
    '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/>' +
    '<path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
  coffee:
    '<path d="M10 2v2"/><path d="M14 2v2"/>' +
    '<path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
  library:
    '<rect width="8" height="18" x="3" y="3" rx="1"/><path d="M7 3v18"/>' +
    '<path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z"/>',
  viewpoint:
    '<path d="M10 10h4"/><path d="M19 7V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3"/>' +
    '<path d="M20 21a2 2 0 0 0 2-2v-3.851c0-1.39-2-2.962-2-4.829V8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v11a2 2 0 0 0 2 2z"/>' +
    '<path d="M 22 16 L 2 16"/>' +
    '<path d="M4 21a2 2 0 0 1-2-2v-3.851c0-1.39 2-2.962 2-4.829V8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2z"/>' +
    '<path d="M9 7V4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3"/>',
} as const

function svg(body: string, size: number, stroke: number): string {
  return (
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" ` +
    `stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`
  )
}

export const stationGlyph = () => svg(BODY.bike, 15, 2.4)

export const vehicleGlyph = (kind: VehicleKind) => svg(kind === 'e' ? BODY.bike : BODY.scooter, 13, 2.6)

export const placeGlyph = (cat: PlaceCategory) => svg(BODY[cat], 15, 2.2)
