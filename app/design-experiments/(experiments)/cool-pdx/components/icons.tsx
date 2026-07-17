import type { LayerId } from '../types'

// One glyph per layer, as inner-SVG markup so the same source feeds both React
// (LayerGlyph) and Leaflet markers/popups (glyphSvg). Paths are lifted verbatim
// from lucide-react (ISC) — tree-deciduous, droplet, snowflake — so every surface
// shows the identical icon whether it's rendered by React or injected into Leaflet.
const GLYPHS: Record<LayerId, string> = {
  canopy:
    '<path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z" />' +
    '<path d="M12 19v3" />',
  fountains:
    '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />',
  cooling:
    '<path d="m10 20-1.25-2.5L6 18" /><path d="M10 4 8.75 6.5 6 6" /><path d="m14 20 1.25-2.5L18 18" />' +
    '<path d="m14 4 1.25 2.5L18 6" /><path d="m17 21-3-6h-4" /><path d="m17 3-3 6 1.5 3" />' +
    '<path d="M2 12h6.5L10 9" /><path d="m20 10-1.5 2 1.5 2" /><path d="M22 12h-6.5L14 15" />' +
    '<path d="m4 10 1.5 2L4 14" /><path d="m7 21 3-6-1.5-3" /><path d="m7 3 3 6h4" />',
}

export function LayerGlyph({
  id,
  size = 16,
  className,
}: {
  id: LayerId
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: GLYPHS[id] }}
    />
  )
}

/** Raw SVG string for use inside Leaflet marker/popup HTML. */
export function glyphSvg(id: LayerId, color: string, size = 16): string {
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    GLYPHS[id] +
    `</svg>`
  )
}
