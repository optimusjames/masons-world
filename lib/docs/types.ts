export interface DocMetadata {
  title: string
  slug: string
  order: number
  category: string
}

export interface DocFile {
  metadata: DocMetadata
  content: string
}

export interface DocNavItem {
  title: string
  slug: string
  href: string
}

export interface DocNavCategory {
  name: string
  items: DocNavItem[]
}

export interface Heading {
  id: string
  text: string
  level: number
}
