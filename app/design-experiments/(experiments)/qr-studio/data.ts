export type ContentType = 'experiment' | 'post' | 'pose' | 'explore'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  description: string
  url: string
  image?: string
}

const BASE = 'https://masons-world.vercel.app'

export const contentItems: ContentItem[] = [
  // Experiments
  {
    id: 'mcloughlin-99e',
    type: 'experiment',
    title: 'McLoughlin / 99E',
    description: 'Scrollytelling case study of the SE McLoughlin corridor speed reduction.',
    url: `${BASE}/design-experiments/mcloughlin-99e`,
    image: '/screenshots/mcloughlin-99e.png',
  },
  {
    id: 'yoga-cards',
    type: 'experiment',
    title: 'Yoga Cards',
    description: 'Flippable yoga pose cards with 3D flip animation and shareable deep links.',
    url: `${BASE}/design-experiments/yoga-cards`,
    image: '/screenshots/yoga-cards.png',
  },
  {
    id: 'yoga-guide',
    type: 'experiment',
    title: 'Yoga Guide',
    description: 'A five-step questionnaire that produces a personalized yoga prescription.',
    url: `${BASE}/design-experiments/yoga-guide`,
    image: '/screenshots/yoga-guide.png',
  },
  {
    id: 'crossfit-bento',
    type: 'experiment',
    title: 'CrossFit Bento',
    description: 'Dark bento grid dashboard for CrossFit training data and weekly metrics.',
    url: `${BASE}/design-experiments/crossfit-bento`,
    image: '/screenshots/crossfit-bento.png',
  },
  // Blog posts
  {
    id: 'whos-the-smartest',
    type: 'post',
    title: "Who's the Smartest?",
    description: 'On vibe as intelligence, and why it\'s about to matter more.',
    url: `${BASE}/blog/whos-the-smartest`,
  },
  {
    id: 'close-your-eyes',
    type: 'post',
    title: 'Close Your Eyes',
    description: 'On reps, feel, and the work before the one shot.',
    url: `${BASE}/blog/close-your-eyes`,
  },
  {
    id: 'remarkable-is-a-direction',
    type: 'post',
    title: 'Remarkable Is a Direction',
    description: 'On obsession, play, and knowing when to ship.',
    url: `${BASE}/blog/remarkable-is-a-direction`,
  },
  // Yoga poses (link to individual pose routes)
  {
    id: 'pose-warrior-ii',
    type: 'pose',
    title: 'Warrior II',
    description: 'Strengthens legs and core. Opens hips and chest. Builds stamina and focus.',
    url: `${BASE}/design-experiments/yoga-cards/warrior-ii`,
    image: '/images/yoga-cards/warrior-ii.png',
  },
  {
    id: 'pose-tree-pose',
    type: 'pose',
    title: 'Tree Pose',
    description: 'Improves balance and stability. Strengthens ankles and calves. Calms the mind.',
    url: `${BASE}/design-experiments/yoga-cards/tree-pose`,
    image: '/images/yoga-cards/tree-pose.png',
  },
  {
    id: 'pose-downward-dog',
    type: 'pose',
    title: 'Downward Dog',
    description: 'Stretches hamstrings and calves. Strengthens arms. Energizes the whole body.',
    url: `${BASE}/design-experiments/yoga-cards/downward-dog`,
    image: '/images/yoga-cards/downward-dog.png',
  },
  {
    id: 'pose-crow',
    type: 'pose',
    title: 'Crow Pose',
    description: 'Builds arm and wrist strength. Strengthens the core deeply. Develops focus.',
    url: `${BASE}/design-experiments/yoga-cards/crow`,
    image: '/images/yoga-cards/crow-pose.png',
  },
]

export const TYPE_LABELS: Record<ContentType, string> = {
  experiment: 'Experiment',
  post: 'Blog Post',
  pose: 'Yoga Pose',
  explore: 'Explore',
}
