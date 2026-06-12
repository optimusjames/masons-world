// Fix It PDX — domain types
//
// A "report" is one civic infrastructure issue at a point on the map. The map
// shows existing reports (proof of work); the report flow creates a new one.

export type ReportStatus = 'reported' | 'in_progress' | 'fixed'

/** How a category's report is ultimately handled (the 3 patterns). */
export type HandlingPattern =
  | 'inline' // mock submit, fully in-app
  | 'phone' // hand off to a phone hotline with a prefilled script
  | 'external' // hand off to a real Portland.gov form

export type CategoryId =
  | 'pothole'
  | 'street-light'
  | 'abandoned-auto'
  | 'debris'
  | 'park-maintenance'
  | 'storm-drain'
  | 'sidewalk-hazard'
  | 'illegal-parking'
  | 'graffiti'
  | 'sidewalk-vegetation'
  | 'row-obstruction'
  | 'other'

export interface Category {
  id: CategoryId
  label: string
  /** One-line plain description shown under the chip. */
  blurb: string
  handling: HandlingPattern
  /** Inline SVG path data or emoji-free key used to pick the marker glyph. */
  icon: CategoryId
  /** Surfaced as a "common" quick-pick chip on the category step. */
  common?: boolean
  /** For phone handling: the number to call. */
  phone?: string
  /** For external handling: the real city form URL + button label. */
  externalUrl?: string
  externalLabel?: string
}

/** A pin on the map — an existing reported/in-progress/fixed issue. */
export interface MapPin {
  id: string
  category: CategoryId
  status: ReportStatus
  lat: number
  lng: number
  reportedDate: string // ISO date
  resolvedDate?: string // ISO date, present when status === 'fixed'
  daysToFix?: number // computed where both dates exist
  note?: string
  /** True when this pin came from a real Portland open-data snapshot. */
  real?: boolean
}

export interface ReportsData {
  pins: MapPin[]
  /** Pre-computed headline stats (honest, reconcile with pins). */
  stats: {
    reportedThisMonth: number
    fixedThisMonth: number
  }
  generatedAt: string
}

/** Screen-state machine for the app shell. */
export type Screen =
  | 'map'
  | 'pick-location'
  | 'pick-category'
  | 'report-inline'
  | 'report-phone'
  | 'report-external'
  | 'confirmation'

/** A location the user picked while reporting. */
export interface PickedLocation {
  lat: number
  lng: number
  address?: string
}
