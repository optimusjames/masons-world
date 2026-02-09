export interface Designer {
  id: string
  name: string
  tags: string[]
  accent: string
}

export const designers: Designer[] = [
  {
    id: 'brutal',
    name: 'Marcus Voss',
    tags: ['Dark Mode', 'Glitch Animation', 'Raw Metrics'],
    accent: '#ff3333',
  },
  {
    id: 'minimal',
    name: 'Elise Nakamura',
    tags: ['Dark Elegance', 'Subtle Motion', 'Clean Data'],
    accent: '#94a3b8',
  },
  {
    id: 'editorial',
    name: 'Sofia Reyes',
    tags: ['Dark Editorial', 'Scroll-Driven', 'Narrative Data'],
    accent: '#d97706',
  },
  {
    id: 'tech-data',
    name: 'James Chen',
    tags: ['Dashboard', 'Animated Charts', 'Live Data'],
    accent: '#6366f1',
  },
]
