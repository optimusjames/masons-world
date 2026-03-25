import { ImageResponse } from 'next/og'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { getPostBySlug } from '@/lib/blog/loadBlog'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function loadFont() {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'space-grotesk-700.ttf')
  return readFileSync(fontPath)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  const fontData = loadFont()

  if (!post) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontFamily: 'Space Grotesk', fontSize: 48 }}>Not found</span>
      </div>,
      { width: 1200, height: 630, fonts: [{ name: 'Space Grotesk', data: fontData, weight: 700 }] }
    )
  }

  const dateStr = post.meta.date ? formatDate(post.meta.date) : ''

  // With hero image: image as background, gradient overlay, title + date
  if (post.meta.image) {
    const imgPath = path.join(process.cwd(), 'public', post.meta.image)
    let imgSrc: string | null = null

    if (existsSync(imgPath)) {
      const imgBuffer = readFileSync(imgPath)
      const ext = path.extname(post.meta.image).slice(1).replace('jpg', 'jpeg')
      imgSrc = `data:image/${ext};base64,${imgBuffer.toString('base64')}`
    }

    return new ImageResponse(
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          position: 'relative',
          background: '#1a1a1a',
        }}
      >
        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.15) 100%)',
            display: 'flex',
          }}
        />
        {/* Text */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            padding: '0 64px 56px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <span
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: 15,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.55)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {dateStr}
          </span>
          <span
            style={{
              fontFamily: 'Space Grotesk',
              fontSize: 64,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {post.meta.title}
          </span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts: [{ name: 'Space Grotesk', data: fontData, weight: 700 }],
      }
    )
  }

  // Text-only fallback: dark background
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '0 64px 56px',
        gap: 10,
      }}
    >
      <span
        style={{
          fontFamily: 'Space Grotesk',
          fontSize: 15,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        {dateStr}
      </span>
      <span
        style={{
          fontFamily: 'Space Grotesk',
          fontSize: 64,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.1,
          maxWidth: 900,
        }}
      >
        {post.meta.title}
      </span>
      <span
        style={{
          fontFamily: 'Space Grotesk',
          fontSize: 18,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.35)',
          marginTop: 8,
        }}
      >
        masons-world.com
      </span>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Space Grotesk', data: fontData, weight: 700 }],
    }
  )
}
