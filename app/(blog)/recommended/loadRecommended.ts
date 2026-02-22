import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Recommendation } from './types'

export function getAllRecommendations(): Recommendation[] {
  const dir = path.resolve(path.join(process.cwd(), 'app/(blog)/recommended/items'))
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

  const items: Recommendation[] = files.map((fileName) => {
    const id = fileName.replace(/\.md$/, '')
    const filePath = path.join(dir, fileName)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)

    return {
      id,
      title: data.title || '',
      url: data.url || '',
      date: data.date instanceof Date
        ? data.date.toISOString().split('T')[0]
        : data.date ? String(data.date) : '',
    }
  })

  return items.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}
