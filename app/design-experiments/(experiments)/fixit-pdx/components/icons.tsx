import type { CategoryId, ReportStatus } from '../types'

// Simple 24x24 stroke glyphs, one per category. Defined as inner-SVG markup so
// the same source feeds both React (CategoryIcon) and Leaflet popups (glyphSvg).

const GLYPHS: Record<CategoryId, string> = {
  pothole:
    '<path d="M3 17h18" /><path d="M7 17c0-3 1.5-5 5-5s5 2 5 5" /><path d="M10 14.5l-.6 2.5M14 14.5l.6 2.5" />',
  graffiti:
    '<rect x="8" y="9" width="8" height="11" rx="1.5" /><path d="M10 9V7a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2" /><path d="M17 6l2-1M17 9l2 0M17 12l2 1" />',
  'street-light':
    '<path d="M12 21V8" /><path d="M9 21h6" /><path d="M12 8a4 3 0 0 1 8 0z" transform="translate(-4 0)" /><path d="M8 8a4 3 0 0 1 8 0z" />',
  'abandoned-auto':
    '<path d="M3 14l1.5-4.5A2 2 0 0 1 6.4 8h11.2a2 2 0 0 1 1.9 1.5L21 14v3h-2M5 17H3v-3" /><circle cx="7.5" cy="17" r="1.6" /><circle cx="16.5" cy="17" r="1.6" />',
  debris:
    '<path d="M4 19l5-9 3 5 2-3 6 7z" /><path d="M14 5l1.5 2.5M18 4l-1 2.5" />',
  'sidewalk-hazard':
    '<path d="M3 8h18M3 16h18" /><path d="M9 8l3 4-2 4" /><path d="M15 8l-1 4 2 4" />',
  'storm-drain':
    '<rect x="5" y="6" width="14" height="12" rx="1.5" /><path d="M8 9v6M12 9v6M16 9v6" />',
  'park-maintenance':
    '<path d="M12 21v-5" /><path d="M12 16c-3 0-5-2-5-5 0-3 2-6 5-7 3 1 5 4 5 7 0 3-2 5-5 5z" />',
  'sidewalk-vegetation':
    '<path d="M12 21c0-5 0-7-3-10" /><path d="M9 11C6 11 4 9 4 6c3 0 6 1 6 5" /><path d="M13 13c0-4 2-6 6-7 0 4-2 7-6 7z" />',
  'row-obstruction':
    '<path d="M12 4l7 15H5z" /><path d="M9.4 11h5.2M8 15h8" />',
  'illegal-parking':
    '<circle cx="12" cy="12" r="8.5" /><path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3" />',
  other:
    '<circle cx="6.5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="17.5" cy="12" r="1.3" />',
}

export function CategoryIcon({
  id,
  size = 20,
  className,
}: {
  id: CategoryId
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
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: GLYPHS[id] }}
    />
  )
}

/** Raw SVG string for use inside Leaflet popup HTML. */
export function glyphSvg(id: CategoryId, color: string, size = 18): string {
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
    `stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">` +
    GLYPHS[id] +
    `</svg>`
  )
}

export const STATUS_COLOR: Record<ReportStatus, string> = {
  reported: '#e2892b', // amber — needs attention
  in_progress: '#3b7fb8', // blue — being worked
  fixed: '#3f9d6b', // green — done
}

export const STATUS_LABEL: Record<ReportStatus, string> = {
  reported: 'Reported',
  in_progress: 'In progress',
  fixed: 'Fixed',
}
