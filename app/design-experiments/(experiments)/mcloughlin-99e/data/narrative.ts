export type NarrativeBeat = {
  eyebrow: string
  heading: string
  body: string
}

export const narrative: NarrativeBeat[] = [
  {
    eyebrow: 'The civic win',
    heading: 'First engineering review in over 70 years',
    body: 'In April 2023, I petitioned Vision Zero, the Portland Bureau of Transportation, and the Oregon Department of Transportation to lower the posted speed limit on SE McLoughlin Boulevard, OR-99E. The original ask was under two miles. After multiple engineering reviews by both agencies, the project expanded to just over four miles, from the Ross Island Bridge through the Portland city limit and about 200 feet into Milwaukie. The new signs went into the ground in January 2026, just under three years end to end. A 5 mph reduction across both directions of the full corridor, slower to ship than expected but a larger benefit over a longer span.',
  },
  {
    eyebrow: 'Through the AV lens',
    heading: '20 feeds into 40, three lanes wide',
    body: 'McLoughlin is a three-lane throughway with 20 mph residential streets feeding directly into it. Turning off the corridor means decelerating from 40 to 20 in the space of a turn, which can be abrupt for the driver behind you if they are not expecting it. Merging on means coming from a stop sign in a quiet neighborhood straight into a 40 mph stream. Real-world speeds run a little above posted because the road feels like a highway, so the speed differential between merging traffic and through traffic is real and persistent. Those are exactly the conditions an autonomous vehicle has to read, predict, and plan around: speed differential, jurisdictional seams, and infrastructure that changes faster than map data updates.',
  },
  {
    eyebrow: 'What the data shows',
    heading: 'Rank #12 sits on this corridor',
    body: 'SE Holgate Blvd and SE McLoughlin Blvd is ranked the 12th most dangerous intersection in Portland, with 2 fatal crashes and $14.85M in injury costs on record. Every major crossing here (Holgate, Powell, Division, 7th Ave) is on Portland’s High Crash Network. McLoughlin itself is not, because it is state-owned and PBOT does not rank ODOT corridors. That jurisdictional seam is the point: safety data lives in the network of the agency that owns the road, and the corridor that carries the weight can fall between the cracks.',
  },
  {
    eyebrow: 'What this map cannot yet see',
    heading: 'Coming in future experiments',
    body: 'Reported crash history styled by severity over time, speed-study data showing real 85th-percentile speeds, the equity overlay of who lives and travels here, and an AV-readiness score that combines complexity factors into a single corridor-level signal. Each of those is its own map. Each builds on this foundation.',
  },
]

export const headline = {
  title: 'McLoughlin / 99E',
  subtitle: 'A Portland corridor through the autonomous-vehicle operations lens',
}
