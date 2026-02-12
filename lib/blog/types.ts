export interface BlogMeta {
  title: string
  subtitle?: string
  date: string
  image?: string
  readingTime?: string
  slug: string
}

export interface BlogPost {
  meta: BlogMeta
  content: string
}
