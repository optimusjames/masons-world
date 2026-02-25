import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Recommendation } from './types'

const THUMB_DIR = path.join(process.cwd(), 'public/screenshots/recommended')

interface YouTubeOEmbed {
  title: string
  author_name: string
  author_url: string
  thumbnail_url: string
}

interface GitHubRepo {
  full_name: string
  owner: { login: string; html_url: string }
}

async function fetchYouTubeOEmbed(url: string): Promise<YouTubeOEmbed | null> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"/)
      || html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"/)
    return match?.[1] || null
  } catch {
    return null
  }
}

async function downloadThumbnail(imageUrl: string, id: string): Promise<string | null> {
  try {
    const ext = imageUrl.match(/\.(png|jpg|jpeg|webp)/i)?.[1] || 'png'
    const localPath = `/screenshots/recommended/${id}.${ext}`
    const fullPath = path.join(process.cwd(), 'public', localPath)

    // Skip if already downloaded
    if (fs.existsSync(fullPath)) return localPath

    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!res.ok) return null

    const buffer = Buffer.from(await res.arrayBuffer())
    fs.mkdirSync(path.dirname(fullPath), { recursive: true })
    fs.writeFileSync(fullPath, buffer)
    return localPath
  } catch {
    return null
  }
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url)
}

function isYouTubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url)
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

function hasLocalThumb(id: string): string | null {
  if (!fs.existsSync(THUMB_DIR)) return null
  const files = fs.readdirSync(THUMB_DIR)
  const match = files.find((f) => f.startsWith(id + '.'))
  return match ? `/screenshots/recommended/${match}` : null
}

export async function getAllRecommendations(): Promise<Recommendation[]> {
  const dir = path.resolve(path.join(process.cwd(), 'app/(blog)/recommended/items'))
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))

  const items = await Promise.all(
    files.map(async (fileName) => {
      const id = fileName.replace(/\.md$/, '')
      const filePath = path.join(dir, fileName)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      const url = data.url || ''
      const date = data.date instanceof Date
        ? data.date.toISOString().split('T')[0]
        : data.date ? String(data.date) : ''

      const note = content.trim() || undefined
      const source = isYouTubeUrl(url) ? 'youtube' : parseGitHubUrl(url) ? 'github' : isPdfUrl(url) ? 'pdf' : 'web' as const
      const rec: Recommendation = { id, title: data.title || url, url, date, note, source }

      // Check for existing local thumbnail first
      const localThumb = hasLocalThumb(id)
      if (localThumb) {
        rec.thumbnail = localThumb
      }

      if (isYouTubeUrl(url)) {
        const oembed = await fetchYouTubeOEmbed(url)
        if (oembed) {
          rec.title = data.title || oembed.title
          rec.author = oembed.author_name
          rec.authorUrl = oembed.author_url
          if (!rec.thumbnail) {
            rec.thumbnail = await downloadThumbnail(oembed.thumbnail_url, id) || undefined
          }
        }
      } else {
        const gh = parseGitHubUrl(url)
        const [repoResult, ogImageUrl] = await Promise.all([
          gh ? fetchGitHubRepo(gh.owner, gh.repo) : null,
          !rec.thumbnail ? fetchOgImage(url) : null,
        ])
        if (repoResult) {
          rec.title = data.title || repoResult.full_name
          rec.author = repoResult.owner.login
          rec.authorUrl = repoResult.owner.html_url
        }
        if (!rec.thumbnail && ogImageUrl) {
          rec.thumbnail = await downloadThumbnail(ogImageUrl, id) || undefined
        }
      }

      return rec
    })
  )

  return items.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}
