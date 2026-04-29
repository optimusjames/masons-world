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
      "In 2023, I petitioned Portland's Vision Zero program to lower the posted speed on SE McLoughlin Boulevard. Vision Zero is Portland's formal commitment that no one should die or be seriously injured in traffic. There had already been preventable deaths on this corridor. Because McLoughlin is a state highway owned by ODOT, a speed reduction requires two separate reviews: PBOT engineers the case and submits a formal request, ODOT conducts its own independent review, and the state traffic engineer in Salem issues final sign-off. One petition, two agencies, one outcome.",
      "My initial ask was an under-two-mile stretch from SE Franklin to SE Harold, the section with continuous sidewalks and the clearest pedestrian presence. The case built itself: schools and parks along the route, a community garden and a food cart pod with a bar and courtyard right on the boulevard, and an elementary school just a few blocks east where kids walk to school and families move through the neighborhood on foot. The sharpest argument was the math: 20 mph residential streets feed directly into a 45 mph throughway with no buffer. Dropping from 45 to 40 mph over those two miles costs the average driver roughly **20 seconds**.",
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
      "PBOT completed its engineering review in about a month. ODOT initially estimated a year. I maintained regular check-ins with engineer contacts at both agencies. When ODOT hadn't finished the review at the one-year mark, I followed up, and again every few months after. Each check-in surfaced the next stage: additional data, another review, another stakeholder.",
      "ODOT's regional traffic engineer signed off, but the Salem office requested several revisions, including extending the investigation to 250 feet south of the OR-224 overcrossing, which required additional data collection and a new report. During that final review phase, ODOT was navigating internal budget uncertainty, but the team identified a funding source and followed through. The extended scope also supported expanding the reduction to **four miles**, from the Ross Island Bridge south through Portland and into the north end of Milwaukie, where the posted limit drops to 30 mph and the corridor transitions to local shops, breweries, a riverside park, and a boat ramp. Between those two bookends, there is only a brief stretch of industrial use. The cross-agency coordination, not the engineering itself, was what took the three years.",
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
      "McLoughlin doesn't appear on Portland's High Crash Network. Not because it's safe; because it's a state highway. PBOT ranks city streets; ODOT owns McLoughlin. That jurisdictional gap is structural, and it went unexamined for decades. One of the ODOT engineers I worked with told me they could find no record of a safety or speed evaluation on this section dating back more than **sixty years**.",
      "Between 2018 and 2023, ODOT recorded **7 fatalities** and 45 serious-injury crashes along the corridor. Of the 25 pedestrian crashes in that period, 3 were fatal and 24 pedestrians were injured. The two most dangerous intersections adjacent to the corridor both appear on Portland's citywide ranking: SE Holgate at McLoughlin is #12, with **$14.85M** in recorded injury costs; SE Clay at MLK is #29, with $6.93M. A corridor that had to be petitioned to be reviewed was producing outcomes its own city couldn't formally measure.",
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
      "The corridor is bordered by Oaks Bottom Wildlife Refuge to the west, served by a MAX Orange Line station at SE 17th and Holgate, and runs parallel to the Springwater Trail, a north-south path along the Willamette used daily by walkers and cyclists. The speed limit signs went up in **January 2026**. At 40 mph, stopping distances are shorter, reaction time is greater, and the corridor is meaningfully quieter for the people and wildlife along it. A small change in speed produces real changes in how a place feels. The infrastructure for a livable corridor was already there. The change is underway.",
      "McLoughlin can still move traffic. What it can also do, with continued investment, is integrate with the community that has grown up around it. Between SE Franklin and SE Holgate, sidewalk coverage on the west side plus additional crosswalks would physically connect the neighborhood to the Springwater Trail and the Willamette. South of SE Harold, where the road is functionally a highway, pedestrian overpasses like the existing ones at SE Bybee, SE Tacoma, and the Springwater Trail crossing near the south end of the corridor are the more natural pattern. Communities along 99E to the south, including Oregon City, have already made similar transitions as their corridors shifted from industrial to residential over time. McLoughlin is part of that same arc.",
    ],
    layers: ['corridor', 'sidewalks', 'parks', 'schools', 'maxOrange', 'springwater'],
    bounds: NORTH_CORRIDOR,
  },
]

export const CHAPTER_LAYERS: Record<number, LayerId[]> = Object.fromEntries(
  chapters.map((c) => [c.index, c.layers]),
)
