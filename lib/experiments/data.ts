import type { Experiment } from '@/app/types/experiments'

export const experiments: Experiment[] = [
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
