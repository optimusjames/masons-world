export interface Recipe {
  name: string;
  colors: string[];
  prompt: string;
}

export const recipes: Record<string, Recipe> = {
  'g-01': {
    name: 'Depth',
    colors: ['#0d4f4f', '#1a2744'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: dark teal (#0d4f4f)
- End color: deep navy (#1a2744)
This creates a moody, oceanic depth effect.`
  },
  'g-02': {
    name: 'Dusk',
    colors: ['#3d2d5c', '#0f1729'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: muted purple (#3d2d5c)
- End color: dark navy (#0f1729)
This creates a twilight dusk atmosphere.`
  },
  'g-03': {
    name: 'Signal',
    colors: ['#14b8a6', '#6366f1'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: teal (#14b8a6)
- End color: indigo (#6366f1)
This creates a vibrant, energetic signal effect.`
  },
  'g-04': {
    name: 'Ember',
    colors: ['#c97b63', '#4a1d34'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: warm copper (#c97b63)
- End color: dark burgundy (#4a1d34)
This creates a smoldering ember glow -- warm and intimate.`
  },
  'g-05': {
    name: 'Forest',
    colors: ['#065f46', '#0a0a0a'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: deep emerald (#065f46)
- End color: near-black (#0a0a0a)
This creates a dense canopy fading into shadow.`
  },
  'g-06': {
    name: 'Haze',
    colors: ['#8b7fc7', '#0c1222'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: dusty lavender (#8b7fc7)
- End color: deep midnight (#0c1222)
This creates a soft atmospheric haze.`
  },
  'g-07': {
    name: 'Ultraviolet',
    colors: ['#7c3aed', '#4f46e5'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: violet (#7c3aed)
- End color: indigo (#4f46e5)
This creates a saturated UV glow -- electric and concentrated.`
  },
  'g-08': {
    name: 'Oxidize',
    colors: ['#92400e', '#1c1917'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: burnt amber (#92400e)
- End color: warm charcoal (#1c1917)
This creates a weathered metal patina -- industrial and grounded.`
  },
  'g-09': {
    name: 'Ice',
    colors: ['#e0f2fe', '#0c4a6e'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: pale ice blue (#e0f2fe)
- End color: deep ocean (#0c4a6e)
This creates a glacial depth -- light surface, dark below. Text should be dark on the light end.`
  },
  'g-10': {
    name: 'Bruise',
    colors: ['#581c87', '#0f172a'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: deep purple (#581c87)
- End color: dark slate (#0f172a)
This creates a brooding, contused palette -- dramatic and moody.`
  },
  'm-01': {
    name: 'Mesh',
    colors: ['#14b8a6', '#6366f1', '#0c0c14'],
    prompt: `Create a card with a mesh gradient background using SVG blur:
- Background: near-black (#0c0c14)
- Blob 1: teal ellipse (#14b8a6) at left-center, 70% opacity
- Blob 2: indigo ellipse (#6366f1) at right-center, 60% opacity
- Apply a Gaussian blur (stdDeviation ~30) to both blobs
- Clip to card bounds
This creates an organic, ambient mesh gradient effect.`
  },
  'g-11': {
    name: 'Infrared',
    colors: ['#dc2626', '#450a0a'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: hot red (#dc2626)
- End color: blood dark (#450a0a)
This creates a thermal infrared signature -- urgent and alive.`
  },
  'g-12': {
    name: 'Void',
    colors: ['#18181b', '#09090b'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: zinc-900 (#18181b)
- End color: near-black (#09090b)
This creates an almost-black gradient with just enough depth to feel three-dimensional. Subtle.`
  },
  'g-13': {
    name: 'Verdigris',
    colors: ['#2dd4bf', '#134e4a'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: bright teal (#2dd4bf)
- End color: dark teal (#134e4a)
This creates a weathered copper patina -- aged and elegant.`
  },
  'g-14': {
    name: 'Rosewood',
    colors: ['#be185d', '#1a1a2e'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: deep rose (#be185d)
- End color: dark navy (#1a1a2e)
This creates a rich, saturated jewel tone fading into night.`
  },
  'g-15': {
    name: 'Aurora',
    colors: ['#34d399', '#6366f1', '#0f172a'],
    prompt: `Create a card with a linear gradient background:
- Angle: 160 degrees (steep diagonal)
- Color stop 1: emerald (#34d399) at 0%
- Color stop 2: indigo (#6366f1) at 50%
- Color stop 3: dark slate (#0f172a) at 100%
This creates a three-color aurora borealis sweep.`
  },
  'g-16': {
    name: 'Sulfur',
    colors: ['#facc15', '#422006'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: vivid yellow (#facc15)
- End color: dark umber (#422006)
This creates a volcanic sulfur glow -- bright surface decaying into scorched earth.`
  },
  'g-17': {
    name: 'Graphite',
    colors: ['#6b7280', '#111827'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Start color: cool gray (#6b7280)
- End color: charcoal (#111827)
This creates a neutral graphite study -- professional and restrained.`
  },
  'g-18': {
    name: 'Plasma',
    colors: ['#e879f9', '#7c3aed', '#1e1b4b'],
    prompt: `Create a card with a linear gradient background:
- Angle: 135 degrees (top-left to bottom-right)
- Color stop 1: fuchsia (#e879f9) at 0%
- Color stop 2: violet (#7c3aed) at 50%
- Color stop 3: deep indigo (#1e1b4b) at 100%
This creates a plasma discharge -- hot pink cooling through purple to dark.`
  },
  'm-02': {
    name: 'Solar Mesh',
    colors: ['#f97316', '#eab308', '#7c2d12'],
    prompt: `Create a card with a mesh gradient background using SVG blur:
- Background: dark brown (#1a0f0a)
- Blob 1: orange ellipse (#f97316) at center-left, 70% opacity
- Blob 2: amber ellipse (#eab308) at top-right, 50% opacity
- Blob 3: deep rust ellipse (#7c2d12) at bottom-center, 60% opacity
- Apply a Gaussian blur (stdDeviation ~35) to all blobs
This creates a solar corona effect -- molten and radiant.`
  },
  'm-03': {
    name: 'Deep Sea Mesh',
    colors: ['#0891b2', '#059669', '#312e81'],
    prompt: `Create a card with a mesh gradient background using SVG blur:
- Background: deep navy (#0a0a1a)
- Blob 1: cyan ellipse (#0891b2) at top-left, 65% opacity
- Blob 2: emerald ellipse (#059669) at bottom-right, 55% opacity
- Blob 3: indigo ellipse (#312e81) at center, 50% opacity
- Apply a Gaussian blur (stdDeviation ~40) to all blobs
This creates a bioluminescent deep-sea atmosphere.`
  },
};
