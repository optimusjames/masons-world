export interface BlogMeta {
  title: string
  subtitle?: string
  date: string
  author?: string
  image?: string
  readingTime?: string
  overlay?: boolean
  slug: string
}

export interface BlogPost {
  meta: BlogMeta
  content: string
}
