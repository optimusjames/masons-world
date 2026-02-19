import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { StickyNote } from './types'

export function getAllNotes(notesDir: string): StickyNote[] {
  const dir = path.resolve(notesDir)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

  const notes: StickyNote[] = files.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const filePath = path.join(dir, fileName)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    return {
      id,
      date: data.date instanceof Date
        ? data.date.toISOString().split('T')[0]
        : data.date ? String(data.date) : '',
      color: data.color || 'warm',
      content: content.trim(),
    }
  })

  return notes.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    const diff = dateB.getTime() - dateA.getTime()
    if (diff !== 0) return diff
    return b.id.localeCompare(a.id)
  })
}
