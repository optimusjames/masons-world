import type { Experiment } from '@/app/types/experiments'

export const experiments: Experiment[] = [
  {
    slug: 'yoga-cards',
    date: 'March 29, 2026',
    title: 'Yoga Cards',
    description: 'Flippable yoga pose cards in four styles — wide, tall, square, and minimal. Click to flip and reveal Sanskrit names, level badges, benefits, alignment cues, and hold times. CSS 3D transforms, staggered entrance animations, and a share button on each card.',
    screenshot: '/screenshots/yoga-cards.png',
    tags: ['Yoga', 'Cards', '3D Animation', 'Interactive'],
  },
  {
    slug: 'yoga-guide',
    date: 'March 13, 2026',
    title: 'Yoga Guide',
    description: 'A five-step questionnaire that produces a personalized yoga prescription — poses, breathing techniques, frequency guidance, and Ayurvedic tips — from a static scoring engine.',
    screenshot: '/screenshots/yoga-guide.png',
    tags: ['Wellness', 'Interactive', 'Yoga', 'Dark Theme'],
  },
  {
    slug: 'yoga-flow',
    date: 'March 11, 2026',
    title: 'Yoga Flow',
    description: 'A two-screen yoga flow planner. Pick a duration (Quick / Flow / Long) and level (Gentle / Moderate / Strong) on the setup screen, then hit Begin Flow to reveal a sequenced pose list with hold times and per-side indicators. Total time is computed live from the actual holds. Shares the dark theme and color swatch system from the Yoga Breathing experiment — Cormorant Garamond for pose names, Space Mono for times.',
    screenshot: '/screenshots/yoga-flow.png',
    tags: ['Wellness', 'Interactive', 'Yoga', 'Dark Theme']
  },
  {
    slug: 'yoga-breathing',
    date: 'March 6, 2026',
    title: 'Yoga Breathing',
    description: 'Guided pranayama breathing app with an animated ring that expands and contracts with each phase. Five techniques: Box (4-4-4-4), 4-7-8, Foundation (5-5), 2:1 Calm, and Triangle. Three color themes (sage, ocean, dusk), optional session timer, Cormorant Garamond phase labels, Space Mono countdown.',
    screenshot: '/screenshots/yoga-breathing.png',
    tags: ['Breathing', 'Animation', 'Wellness', 'Interactive']
  },
  {
    slug: 'crossfit-bento',
    date: 'February 20, 2026',
    title: 'CrossFit Bento',
    description: 'Dark bento grid dashboard for CrossFit training data. Nine widget cards covering goal progress, calorie tracking, weekly training load bar chart, GitHub-style activity heatmap with flame icons on peak days, WOD stats, macro donut chart, exercise log with PR badges, heart rate zones, and sleep stages. DM Sans body with Geist Pixel Square for technical labels. Matte finish palette -- orange, olive, brown accents on near-black.',
    screenshot: '/screenshots/crossfit-bento.png',
    tags: ['Bento Grid', 'Dashboard', 'Geist Pixel', 'Dark Theme']
  },
  {
    slug: 'sticky-notes',
    date: 'February 18, 2026',
    title: 'Sticky Notes',
    description: 'Interactive sticky note stack component. Post-it notes rendered from markdown files with swipe-to-cycle animation, color variants (warm, cool, neutral), and Permanent Marker handwriting font. Click to expand, click to cycle, Escape to close. Portable design -- consumer passes a notes directory path, so any page can use it with its own content.',
    screenshot: '/screenshots/sticky-notes.png',
    tags: ['Component', 'CSS Animation', 'Markdown Content', 'Portable'],
    theme: 'light'
  },
]
