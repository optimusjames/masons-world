import type { Category, CategoryId } from '../types'

// The 12 infrastructure categories. Campsite reporting is deliberately NOT a
// category here — it's owned by the Impact Reduction Program and surfaced only
// as a respectful pointer (CAMPSITE_POINTER below).
//
// External URLs point at the real Portland.gov program pages. Exact deep-link
// form URLs should be confirmed against the live site during polish; program
// pages are stable and won't 404 in the meantime.

export const CATEGORIES: Category[] = [
  {
    id: 'pothole',
    label: 'Pothole',
    blurb: 'Holes, sinkholes, or broken pavement in the road',
    handling: 'inline',
    icon: 'pothole',
    common: true,
  },
  {
    id: 'graffiti',
    label: 'Graffiti',
    blurb: 'Tagging or vandalism on walls, signs, or property',
    handling: 'external',
    icon: 'graffiti',
    common: true,
    externalUrl: 'https://www.portland.gov/graffiti',
    externalLabel: 'Continue to Report Graffiti',
  },
  {
    id: 'street-light',
    label: 'Street light',
    blurb: 'A streetlight that’s out, flickering, or damaged',
    handling: 'inline',
    icon: 'street-light',
    common: true,
  },
  {
    id: 'abandoned-auto',
    label: 'Abandoned auto',
    blurb: 'A vehicle that appears abandoned on a public street',
    handling: 'inline',
    icon: 'abandoned-auto',
    common: true,
  },
  {
    id: 'debris',
    label: 'Debris in road',
    blurb: 'Objects, branches, or hazards blocking the roadway',
    handling: 'inline',
    icon: 'debris',
    common: true,
  },
  {
    id: 'sidewalk-hazard',
    label: 'Sidewalk trip hazard',
    blurb: 'Cracked, lifted, or uneven sidewalk surfaces',
    handling: 'inline',
    icon: 'sidewalk-hazard',
  },
  {
    id: 'storm-drain',
    label: 'Plugged storm drain',
    blurb: 'A clogged or flooding storm drain or inlet',
    handling: 'inline',
    icon: 'storm-drain',
  },
  {
    id: 'park-maintenance',
    label: 'Park maintenance',
    blurb: 'Damage or upkeep issues in a city park',
    handling: 'inline',
    icon: 'park-maintenance',
  },
  {
    id: 'sidewalk-vegetation',
    label: 'Sidewalk vegetation',
    blurb: 'Overgrown plants blocking a sidewalk or path',
    handling: 'external',
    icon: 'sidewalk-vegetation',
    externalUrl: 'https://www.portland.gov/transportation/permitting',
    externalLabel: 'Continue to Obstruction form',
  },
  {
    id: 'row-obstruction',
    label: 'Right-of-way obstruction',
    blurb: 'Something blocking a street, sidewalk, or right-of-way',
    handling: 'external',
    icon: 'row-obstruction',
    externalUrl: 'https://www.portland.gov/transportation/permitting',
    externalLabel: 'Continue to Obstruction form',
  },
  {
    id: 'illegal-parking',
    label: 'Illegal parking',
    blurb: 'A vehicle parked illegally or creating a hazard',
    handling: 'phone',
    icon: 'illegal-parking',
    phone: '503-823-5195',
  },
  {
    id: 'other',
    label: 'Something else',
    blurb: 'Anything not listed — routed through PDX 311',
    handling: 'external',
    icon: 'other',
    externalUrl: 'https://www.portland.gov/311',
    externalLabel: 'Continue to PDX 311',
  },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<CategoryId, Category>,
)

export const COMMON_CATEGORIES = CATEGORIES.filter((c) => c.common)

/** Respectful pointer for campsite reports — intentionally not a category. */
export const CAMPSITE_POINTER = {
  label: 'Reporting a campsite?',
  detail: 'That’s handled by the Impact Reduction Program.',
  url: 'https://www.portland.gov/homelessness-impact-reduction/report-campsite',
}
