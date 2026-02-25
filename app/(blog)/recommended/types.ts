export interface Recommendation {
  id: string
  title: string
  url: string
  date: string
  author?: string
  authorUrl?: string
  thumbnail?: string
  note?: string
  source: 'youtube' | 'github' | 'pdf' | 'web'
}
