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
    eyebrow: '01 · THE CORRIDOR',
    stat: 'Original petition · SE Franklin to SE Harold · under two miles · Filed 2023',
    heading: 'Why I asked for these two miles',
    body: [
      'In 2023, I petitioned Portland\u2019s Vision Zero program to lower the posted speed on SE McLoughlin Boulevard. Vision Zero is the commitment that no one should die or be seriously injured simply going about their day, and Portland has formally adopted that commitment. There had already been preventable traffic deaths along this corridor, so the petition wasn\u2019t abstract. Because McLoughlin runs through Portland but is owned by the State of Oregon, the process requires coordination across three entities: Vision Zero and PBOT submit a formal request and engineering review, ODOT conducts an independent review, and the state traffic engineer in Salem signs off. Two reviews, three entities, one sign change.',
      'My initial ask was an under-two-mile stretch from SE Franklin down to SE Harold, the section with continuous sidewalks and the clearest pedestrian presence. I built the case the way the engineers would evaluate it: schools and parks along the corridor, a neighborhood that has shifted from industrial to residential over decades along with the businesses that followed, a brick-and-mortar bar and courtyard with a rotating food-truck pod right on the boulevard, a 24-hour gym, a local vet, a neighborhood brewery a few blocks off, dog walkers and families on adjacent streets, and several 20 mph residential streets that plug directly into a 45 mph throughway. A simple calculation showed that dropping from 45 to 40 mph over those two miles would cost the average driver roughly 35 seconds. The cost-benefit case was clear on paper. The work was moving it through the agencies.',
    ],
    layers: ['corridor', 'sidewalks', 'parks', 'schools', 'springwater', 'highCrashIntersections', 'fatalCrashes', 'pedCrashes'],
    bounds: ORIGINAL_PETITION,
  },
  {
    id: 'expansion',
    index: 1,
    eyebrow: '02 · THE EXPANSION',
    stat: '2 miles \u2192 4 miles · PBOT + ODOT + Salem · Signs installed January 2026',
    heading: 'Why three years for a sign change',
    body: [
      'PBOT completed its engineering review in about a month. ODOT initially estimated a year. I maintained regular check-ins with engineer contacts at both agencies. When ODOT hadn\u2019t finished the review at the one-year mark, I followed up, and again every few months after. Each check-in surfaced the next stage: additional data, another review, another stakeholder.',
      'ODOT\u2019s regional traffic engineer signed off, but the Salem office requested several revisions, including extending the investigation up to 250 feet south of the OR-224 overcrossing, which required additional data collection and a new report. The final report was signed by the state traffic engineer and sent to Portland for concurrence. The result was a 5 mph reduction across four miles of corridor, in both directions, from the Ross Island Bridge past Portland\u2019s southern boundary. The cross-agency coordination, not the engineering itself, was what took the three years.',
    ],
    layers: ['corridor', 'sidewalks', 'parks', 'schools', 'springwater'],
    bounds: FULL_CORRIDOR,
  },
  {
    id: 'safety',
    index: 2,
    eyebrow: '03 · THE SAFETY RECORD',
    stat: '3 fatalities · 25 pedestrian crashes (2018\u20132023) · Every major interchange on Portland\u2019s High Crash Network',
    heading: 'A state highway the city couldn\u2019t formally measure',
    body: [
      'McLoughlin doesn\u2019t appear on Portland\u2019s High Crash Network. Not because it\u2019s safe; because it\u2019s a state highway. PBOT ranks city streets; ODOT owns McLoughlin. That jurisdictional gap is structural.',
      'The data tells its own story. Between 2018 and 2023, ODOT recorded 25 pedestrian crashes within three blocks of the corridor: 3 resulted in fatalities, 24 pedestrians were injured. Fatal and serious-injury crashes of all types cluster along the same stretch. SE Holgate at McLoughlin is Portland\u2019s 12th most dangerous intersection ($14.85M in recorded injury costs), and the major interchanges along the corridor are all on Portland\u2019s High Crash Network: Holgate crosses McLoughlin at grade, Powell bridges over it on its way to the Ross Island Bridge, and Division passes underneath. A corridor that had to be petitioned to be reviewed was producing outcomes its own city couldn\u2019t formally measure.',
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
    eyebrow: '04 · A MODERN CORRIDOR',
    stat: 'One crosswalk across the full corridor · MAX Orange Line · Springwater Trail · Willamette River to the west',
    heading: 'Balancing throughway with community',
    body: [
      'The dynamic I\u2019ve been working on with these agencies for years is the balance between throughway and community. A continuous sidewalk runs along the east side of McLoughlin from about SE Franklin in the north down to SE Harold in the south; that stretch was the original under-two-mile span of my petition. Below SE Harold, the road is functionally a highway. But the context around it is a living neighborhood: a community garden on the southeast corner of SE Franklin and McLoughlin, Oaks Bottom Wildlife Refuge along the west side of the corridor, a MAX Orange Line station by SE 17th and Holgate, SE 17th Avenue itself as a slower parallel route with bike lanes, and the Springwater Trail just to the west along the east bank of the Willamette, providing car-free north-south travel for walkers and cyclists.',
      'McLoughlin can still move traffic. What it can also do, with continued investment, is integrate with the community that has grown up around it. Between SE Franklin and SE Holgate, sidewalk coverage on the west side of McLoughlin plus additional crosswalks would physically connect the neighborhood to the Springwater Trail and the Willamette. South of SE Harold, where the road is functionally a highway, pedestrian overpasses like the existing ones at SE Bybee and SE Tacoma are the more natural pattern. The throughline is infrastructure that reflects the residents, businesses, schools, and parks along the route today rather than the industrial corridor it was decades ago.',
    ],
    layers: ['corridor', 'sidewalks', 'parks', 'schools', 'maxOrange', 'springwater'],
    bounds: NORTH_CORRIDOR,
  },
]

export const CHAPTER_LAYERS: Record<number, LayerId[]> = Object.fromEntries(
  chapters.map((c) => [c.index, c.layers]),
)
