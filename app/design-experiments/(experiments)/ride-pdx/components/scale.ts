// Visual encoding for Ride PDX.
//
// Two colors carry identity on their own, the free-floating e-bike and scooter
// dots, so those two were run through the dataviz validator against this map's
// surface in all-pairs mode (2026-10-21):
//
//   node validate_palette.js "#e2560e,#2a78d6" --mode light --pairs all --surface "#eef2ee"
//   CVD ΔE 26.5 (protan) · normal-vision ΔE 34.0 · both >= 3:1 contrast · ALL PASS
//
// The orange is BIKETOWN's, darkened from the brand's brighter tone until it
// cleared 3:1 on the basemap. Stations reuse it, distinguished from e-bike dots
// by shape (a badge with the count printed on it), not by hue.
//
// Places are identified by their icon, not by color, so no hue has to do that
// job and the five categories never compete with the vehicles for attention.
// The pale tints behind each icon are decoration and carry no meaning a reader
// needs; the icon alone tells a park from a library.

import type { LucideIcon } from 'lucide-react'
import { Binoculars, Bike, Coffee, LibraryBig, Scooter, ShoppingBasket, Trees } from 'lucide-react'
import type { PlaceCategory, VehicleKind } from '../types'

export const BIKETOWN = '#e2560e'
export const SCOOTER = '#2a78d6'
/** A station with nothing to rent. A state, not a category: always paired with a printed 0. */
export const EMPTY = '#8a8f98'

export const VEHICLE: Record<VehicleKind, { label: string; Icon: LucideIcon; color: string }> = {
  e: { label: 'E-bike', Icon: Bike, color: BIKETOWN },
  s: { label: 'Scooter', Icon: Scooter, color: SCOOTER },
}

/** Fixed order. This is the order of the chips and of the "Ride to" list. */
export const CATEGORIES: {
  id: PlaceCategory
  label: string
  plural: string
  Icon: LucideIcon
  tint: string
}[] = [
  { id: 'grocery', label: 'Grocery', plural: 'Groceries', Icon: ShoppingBasket, tint: '#fbeed6' },
  { id: 'park', label: 'Park', plural: 'Parks', Icon: Trees, tint: '#dcefdf' },
  { id: 'coffee', label: 'Coffee', plural: 'Coffee', Icon: Coffee, tint: '#f0e3d6' },
  { id: 'library', label: 'Library', plural: 'Libraries', Icon: LibraryBig, tint: '#e2e7f7' },
  { id: 'viewpoint', label: 'Viewpoint', plural: 'Views', Icon: Binoculars, tint: '#ece1f4' },
]

export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  PlaceCategory,
  (typeof CATEGORIES)[number]
>

/** Coffee alone is 541 pins. It starts off so the map opens readable. */
export const DEFAULT_CATEGORIES: PlaceCategory[] = ['grocery', 'park', 'library', 'viewpoint']

/** Below this zoom, place pins are hidden: a thousand icons at city scale is noise. */
export const PLACE_MIN_ZOOM = 13

/** From this zoom in, free vehicles draw as icon chips instead of dots. */
export const VEHICLE_ICON_ZOOM = 16
