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
    tags: ['Dark', 'Industrial', 'Aggressive'],
    accent: '#ff3333',
  },
  {
    id: 'minimal',
    name: 'Elise Nakamura',
    tags: ['Whitespace', 'Restraint', 'Refined'],
    accent: '#94a3b8',
  },
  {
    id: 'editorial',
    name: 'Sofia Reyes',
    tags: ['Magazine', 'Photography', 'Warmth'],
    accent: '#d97706',
  },
  {
    id: 'tech-data',
    name: 'James Chen',
    tags: ['Metrics', 'Dashboard', 'Data-Forward'],
    accent: '#6366f1',
  },
]
