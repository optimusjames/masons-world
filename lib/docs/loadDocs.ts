import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { docsDirectory, UNCATEGORIZED_LABEL } from './config'
import { parseFileName } from './parseFileName'
import { parseDocTitle } from './parseDocTitle'
import { extractHeadings } from './extractHeadings'
import type { DocFile, DocNavCategory, Heading } from './types'

function isExcluded(fileName: string): boolean {
  return fileName.startsWith('_') || fileName.startsWith('.')
}

interface RawDoc {
  slug: string
  category: string
  order: number
  title: string
  description?: string
  content: string
  filePath: string
}

function scanDirectory(dir: string, category: string): RawDoc[] {
  const docs: RawDoc[] = []

  if (!fs.existsSync(dir)) return docs

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md') && !isExcluded(entry.name)) {
      const filePath = path.join(dir, entry.name)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data: frontmatter, content } = matter(raw)
      const { order, slug } = parseFileName(entry.name)
      const title = parseDocTitle(content, slug)
      const fullSlug = category === UNCATEGORIZED_LABEL ? slug : `${category.toLowerCase()}/${slug}`

      docs.push({
        slug: fullSlug,
        category,
        order,
        title,
        description: frontmatter.description || undefined,
        content,
        filePath,
      })
    }
  }

  return docs.sort((a, b) => a.order - b.order)
}

function getAllDocs(): RawDoc[] {
  const docs: RawDoc[] = []

  // Root-level docs
  docs.push(...scanDirectory(docsDirectory, UNCATEGORIZED_LABEL))

  // Subdirectory docs
  if (fs.existsSync(docsDirectory)) {
    const entries = fs.readdirSync(docsDirectory, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory() && !isExcluded(entry.name)) {
        const categoryName = entry.name.charAt(0).toUpperCase() + entry.name.slice(1)
        docs.push(...scanDirectory(path.join(docsDirectory, entry.name), categoryName))
      }
    }
  }

  return docs
}

export function getNavCategories(): DocNavCategory[] {
  const docs = getAllDocs()
  const categoryMap = new Map<string, DocNavCategory>()

  for (const doc of docs) {
    if (!categoryMap.has(doc.category)) {
      categoryMap.set(doc.category, { name: doc.category, items: [] })
    }
    categoryMap.get(doc.category)!.items.push({
      title: doc.title,
      slug: doc.slug,
      href: `/docs/${doc.slug}`,
      description: doc.description,
    })
  }

  // Put General first, then alphabetical
  const categories = Array.from(categoryMap.values())
  categories.sort((a, b) => {
    if (a.name === UNCATEGORIZED_LABEL) return -1
    if (b.name === UNCATEGORIZED_LABEL) return 1
    return a.name.localeCompare(b.name)
  })

  return categories
}

export function getFirstDocSlug(): string | null {
  const categories = getNavCategories()
  if (categories.length > 0 && categories[0].items.length > 0) {
    return categories[0].items[0].slug
  }
  return null
}

export function getDocBySlug(slugParts: string[]): DocFile | null {
  const targetSlug = slugParts.join('/')
  const docs = getAllDocs()
  const doc = docs.find((d) => d.slug === targetSlug)

  if (!doc) return null

  return {
    metadata: {
      title: doc.title,
      slug: doc.slug,
      order: doc.order,
      category: doc.category,
    },
    content: doc.content,
  }
}

export function getHeadingsForSlug(slugParts: string[]): Heading[] {
  const doc = getDocBySlug(slugParts)
  if (!doc) return []
  return extractHeadings(doc.content)
}

export function getRecentDocs(count: number = 3): { title: string; slug: string; href: string; modified: Date }[] {
  const docs = getAllDocs()
  return docs
    .map((doc) => ({
      title: doc.title,
      slug: doc.slug,
      href: `/docs/${doc.slug}`,
      modified: fs.statSync(doc.filePath).mtime,
    }))
    .sort((a, b) => b.modified.getTime() - a.modified.getTime())
    .slice(0, count)
}
