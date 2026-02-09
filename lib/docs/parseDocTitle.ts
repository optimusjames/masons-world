import { slugToTitle } from './slugify'

export function parseDocTitle(content: string, slug: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : slugToTitle(slug)
}
