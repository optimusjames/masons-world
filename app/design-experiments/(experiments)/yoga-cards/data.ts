export type Level = 'Beginner' | 'Intermediate' | 'Advanced'

export interface YogaPose {
  id: string
  name: string
  sanskrit: string
  level: Level
  category: string
  benefits: string[]
  cues: string[]
  image: string
  holdTime?: string
}

export const poses: YogaPose[] = [
  {
    id: 'warrior-ii',
    name: 'Warrior II',
    sanskrit: 'Vīrabhadrāsana II',
    level: 'Beginner',
    category: 'Standing',
    benefits: ['Strengthens legs & core', 'Opens hips & chest', 'Builds stamina & focus'],
    cues: ['Front knee over ankle', 'Arms parallel to floor', 'Gaze past front fingers'],
    image: '/images/yoga-cards/warrior-ii.png',
    holdTime: '30–60 sec per side',
  },
  {
    id: 'tree-pose',
    name: 'Tree Pose',
    sanskrit: 'Vṛkṣāsana',
    level: 'Beginner',
    category: 'Balance',
    benefits: ['Improves balance & stability', 'Strengthens ankles & calves', 'Calms the mind'],
    cues: ['Foot on inner thigh or calf', 'Never on the knee', 'Hands at heart or overhead'],
    image: '/images/yoga-cards/tree-pose.png',
    holdTime: '30 sec per side',
  },
  {
    id: 'downward-dog',
    name: 'Downward Dog',
    sanskrit: 'Adho Mukha Śvānāsana',
    level: 'Beginner',
    category: 'Inversion',
    benefits: ['Stretches hamstrings & calves', 'Strengthens arms & shoulders', 'Energizes the whole body'],
    cues: ['Hands shoulder-width apart', 'Press hips up and back', 'Pedal the feet to warm up'],
    image: '/images/yoga-cards/downward-dog.png',
    holdTime: '1–3 minutes',
  },
  {
    id: 'cobra',
    name: 'Cobra Pose',
    sanskrit: 'Bhujaṅgāsana',
    level: 'Beginner',
    category: 'Backbend',
    benefits: ['Opens chest & lungs', 'Strengthens spine', 'Soothes sciatica'],
    cues: ['Elbows close to body', 'Shoulders away from ears', 'Lift with your back, not arms'],
    image: '/images/yoga-cards/cobra-pose.png',
    holdTime: '15–30 sec',
  },
  {
    id: 'half-moon',
    name: 'Half Moon',
    sanskrit: 'Ardha Chandrāsana',
    level: 'Intermediate',
    category: 'Balance',
    benefits: ['Strengthens legs & ankles', 'Stretches hamstrings & groin', 'Improves coordination'],
    cues: ['Stack hips vertically', 'Flex top foot', 'Extend through fingertips'],
    image: '/images/yoga-cards/half-moon.png',
    holdTime: '30 sec per side',
  },
  {
    id: 'crow',
    name: 'Crow Pose',
    sanskrit: 'Bakāsana',
    level: 'Advanced',
    category: 'Arm Balance',
    benefits: ['Builds arm & wrist strength', 'Strengthens core deeply', 'Develops mental focus'],
    cues: ['Knees high on triceps', 'Lean forward slowly', 'Round the upper back'],
    image: '/images/yoga-cards/crow-pose.png',
    holdTime: '10–30 sec',
  },
  {
    id: 'legs-up-wall',
    name: 'Legs Up the Wall',
    sanskrit: 'Viparīta Karaṇī',
    level: 'Beginner',
    category: 'Restorative',
    benefits: ['Relieves tired legs & feet', 'Calms the nervous system', 'Reduces lower back tension'],
    cues: ['Sit sideways against wall', 'Swing legs up as you lie back', 'Arms relaxed at sides'],
    image: '/images/yoga-cards/legs-up-wall.png',
    holdTime: '5–15 minutes',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    sanskrit: 'Dhyāna',
    level: 'Beginner',
    category: 'Mindfulness',
    benefits: ['Reduces stress & anxiety', 'Sharpens focus & clarity', 'Deepens self-awareness'],
    cues: ['Find a comfortable seat', 'Close eyes, soften the jaw', 'Follow the breath without forcing'],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=1000&fit=crop&crop=center',
    holdTime: '5–20 minutes',
  },
]

export type CardStyle = 'landscape' | 'portrait' | 'square' | 'minimal' | 'gallery'

// Gallery mode: explicit grid placement for each pose
// 4 columns, 8 row units. Cards fill their grid area (no aspect-ratio).
//
//          Col 1    Col 2    Col 3    Col 4
// Row 1-2: [  Warrior II   ] [Tree  ] [Half  ]
// Row 3-4: [  Cobra Pose   ] [Pose  ] [Moon  ]
// Row 5-6: [ Downward Dog  ] [Legs  ] [Medi- ]
// Row 7-8: [  Crow Pose    ] [Up Wl ] [tation]
//
export interface GalleryCard {
  poseId: string
  style: CardStyle
  gridColumn: string
  gridRow: string
}

export const galleryCards: GalleryCard[] = [
  { poseId: 'warrior-ii',   style: 'landscape', gridColumn: '1 / 3', gridRow: '1 / 3' },
  { poseId: 'tree-pose',    style: 'portrait',  gridColumn: '3 / 4', gridRow: '1 / 5' },
  { poseId: 'half-moon',    style: 'square',    gridColumn: '4 / 5', gridRow: '1 / 3' },
  { poseId: 'cobra',        style: 'landscape', gridColumn: '1 / 3', gridRow: '3 / 5' },
  { poseId: 'meditation',   style: 'portrait',  gridColumn: '4 / 5', gridRow: '3 / 7' },
  { poseId: 'downward-dog', style: 'landscape', gridColumn: '1 / 3', gridRow: '5 / 7' },
  { poseId: 'legs-up-wall', style: 'square',    gridColumn: '3 / 4', gridRow: '5 / 7' },
  { poseId: 'crow',         style: 'landscape', gridColumn: '1 / 3', gridRow: '7 / 9' },
]

export interface CardStyleConfig {
  id: CardStyle
  label: string
  description: string
  aspectRatio: string
  rounded: boolean
}

export const cardStyles: CardStyleConfig[] = [
  {
    id: 'landscape',
    label: 'Wide',
    description: 'Blog-style card with overlay text',
    aspectRatio: '16 / 10',
    rounded: true,
  },
  {
    id: 'portrait',
    label: 'Tall',
    description: 'Full-bleed portrait with minimal text',
    aspectRatio: '3 / 4',
    rounded: true,
  },
  {
    id: 'square',
    label: 'Square',
    description: 'Clean, symmetric layout',
    aspectRatio: '1 / 1',
    rounded: true,
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Image only, info icon to flip',
    aspectRatio: '4 / 5',
    rounded: false,
  },
  {
    id: 'gallery',
    label: 'Gallery',
    description: 'Mixed styles, best fit per pose',
    aspectRatio: '1 / 1',
    rounded: true,
  },
]
