import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { BlogMeta, BlogPost } from './types'

const blogDirectory = path.join(process.cwd(), 'blog')
const blogImageDirectory = path.join(process.cwd(), 'public', 'blog')

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif']

function findImage(slug: string): string | undefined {
  if (!fs.existsSync(blogImageDirectory)) return undefined
  for (const ext of IMAGE_EXTENSIONS) {
    if (fs.existsSync(path.join(blogImageDirectory, `${slug}${ext}`))) {
      return `/blog/${slug}${ext}`
    }
  }
  return undefined
}

export function getAllPosts(): BlogMeta[] {
  if (!fs.existsSync(blogDirectory)) return []

  const files = fs.readdirSync(blogDirectory).filter((f) => f.endsWith('.md'))

  const posts: BlogMeta[] = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '')
    const filePath = path.join(blogDirectory, fileName)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data } = matter(fileContent)

    return {
      title: data.title || slug,
      subtitle: data.subtitle,
      date: data.date ? String(data.date) : '',
      image: findImage(slug),
      readingTime: data.readingTime,
      slug,
    }
  })

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(blogDirectory, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  return {
    meta: {
      title: data.title || slug,
      subtitle: data.subtitle,
      date: data.date ? String(data.date) : '',
      image: findImage(slug),
      readingTime: data.readingTime,
      slug,
    },
    content,
  }
}
