import type { LayerId } from '../types'

export type ChapterBounds = [[number, number], [number, number]]

export type Chapter = {
  id: string
  index: number
  eyebrow: string
  stat: string
  heading: string
  body: string[]
  layers: LayerId[]
  bounds: ChapterBounds
}

const ORIGINAL_PETITION: ChapterBounds = [
  [45.478, -122.660],
  [45.495, -122.648],
]

const FULL_CORRIDOR: ChapterBounds = [
  [45.452, -122.662],
  [45.490, -122.648],
]

const MID_CORRIDOR: ChapterBounds = [
  [45.466, -122.665],
  [45.502, -122.645],
]

const NORTH_CORRIDOR: ChapterBounds = [
  [45.466, -122.665],
  [45.502, -122.645],
]

export const chapters: Chapter[] = [
  {
    id: 'corridor',
    index: 0,
    eyebrow: '01 · THE PETITION',
    stat: 'Original petition · SE Franklin to SE Harold · under two miles · Filed 2023',
    heading: 'Why I asked for these two miles',
    body: [
      "In 2023 I petitioned Portland's Vision Zero program to slow SE McLoughlin Boulevard, a state highway where preventable deaths had already happened. My ask was modest: under two miles, from SE Franklin to SE Harold, where continuous sidewalks, parks, and an elementary school put people on foot right beside fast traffic.",
      "The argument was just math: 20 mph residential streets feed straight into a 45 mph throughway with no buffer. Dropping to 40 costs the average driver about **20 seconds**. But because McLoughlin belongs to ODOT, not the city, even that small change needed two agencies: PBOT to build the case, ODOT and Salem to sign off.",
    ],
    layers: ['corridor', 'sidewalks', 'parks', 'schools', 'springwater', 'highCrashIntersections', 'fatalCrashes', 'pedCrashes'],
    bounds: ORIGINAL_PETITION,
  },
  {
    id: 'expansion',
    index: 1,
    eyebrow: '02 · THE PROCESS',
    stat: '2 miles → 4 miles · PBOT + ODOT + Salem · Signs installed January 2026',
    heading: 'Why three years for a sign change',
    body: [
      "PBOT finished its engineering review in about a month. ODOT estimated a year and took longer. I checked in with engineers at both agencies every few months; each call surfaced the next stage: more data, another review, another stakeholder. The engineering was never the hard part. The cross-agency coordination was.",
      "Salem's traffic office asked for revisions, including extending the study 250 feet past the OR-224 overcrossing: more data, a new report, all during a stretch of ODOT budget uncertainty they ultimately funded. That extra scope also let the reduction grow from two miles to **four**: from the Ross Island Bridge south into Milwaukie, where the limit drops to 30 and the corridor turns to local shops, breweries, and a riverside park. The signs went up **January 2026**.",
    ],
    layers: ['corridor', 'sidewalks', 'parks', 'schools', 'springwater'],
    bounds: FULL_CORRIDOR,
  },
  {
    id: 'safety',
    index: 2,
    eyebrow: '03 · THE DATA',
    stat: '7 fatalities · 45 serious-injury crashes · 25 pedestrian crashes · 2018–2023',
    heading: "A state highway the city couldn't formally measure",
    body: [
      "McLoughlin doesn't appear on Portland's High Crash Network, not because it's safe, but because the city ranks its own streets and this one belongs to ODOT. That jurisdictional gap went unexamined for decades; one ODOT engineer told me they could find no speed or safety evaluation of this section in over **60 years**.",
      "The record it wasn't keeping: **7 fatalities** and 45 serious-injury crashes from 2018–2023, plus 25 pedestrian crashes, 3 of them fatal. The two most dangerous intersections nearby both rank citywide: SE Holgate at McLoughlin is Portland's **#12**, with **$14.85M** in injury costs. A corridor that had to be petitioned just to be reviewed was producing outcomes its own city couldn't formally measure.",
    ],
    layers: [
      'corridor',
      'highCrashStreets',
      'highCrashIntersections',
      'fatalCrashes',
      'pedCrashes',
    ],
    bounds: MID_CORRIDOR,
  },
  {
    id: 'modern',
    index: 3,
    eyebrow: '04 · THE VISION',
    stat: 'One at-grade crosswalk across 4 miles · MAX Orange Line · Springwater Trail · Oaks Bottom Wildlife Refuge',
    heading: 'What a 5 mph reduction starts',
    body: [
      "The pieces of a livable corridor are already here: Oaks Bottom Wildlife Refuge to the west, a MAX Orange Line stop at SE 17th and Holgate, and the Springwater Trail running alongside the Willamette. At 40 instead of 45, stopping distances shrink, reaction time grows, and the whole corridor gets quieter for the people and wildlife beside it. A 5 mph change sounds small; it changes how a place feels.",
      "McLoughlin can still move traffic and integrate with the neighborhood that grew up around it. To the north, west-side sidewalks and a few crosswalks would connect the streets to the trail and the river; to the south, where it's functionally a highway, pedestrian overpasses, like those already at SE Bybee and SE Tacoma, are the natural pattern. Corridors further down 99E, including Oregon City, have already made this shift. McLoughlin is on the same arc.",
    ],
    layers: ['corridor', 'sidewalks', 'parks', 'schools', 'maxOrange', 'springwater'],
    bounds: NORTH_CORRIDOR,
  },
]

export const CHAPTER_LAYERS: Record<number, LayerId[]> = Object.fromEntries(
  chapters.map((c) => [c.index, c.layers]),
)
