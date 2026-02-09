import type { Heading } from './types'

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = []
  const regex = /^##\s+(.+)$/gm
  let match

  while ((match = regex.exec(content)) !== null) {
    const text = match[1].trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
    headings.push({ id, text, level: 2 })
  }

  return headings
}
