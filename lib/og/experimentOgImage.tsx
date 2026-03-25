import { ImageResponse } from 'next/og'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { experiments } from '@/lib/experiments/data'

export function loadFont() {
  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'space-grotesk-700.ttf')
  return readFileSync(fontPath)
}

export function experimentOgImage(slug: string) {
  const exp = experiments.find((e) => e.slug === slug)
  const fontData = loadFont()

  if (!exp) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontFamily: 'Space Grotesk', fontSize: 48 }}>Not found</span>
      </div>,
      { width: 1200, height: 630, fonts: [{ name: 'Space Grotesk', data: fontData, weight: 700 }] }
    )
  }

  const screenshotPath = path.join(process.cwd(), 'public', exp.screenshot)
  let imgSrc: string | null = null

  if (existsSync(screenshotPath)) {
    const imgBuffer = readFileSync(screenshotPath)
    const ext = path.extname(exp.screenshot).slice(1).replace('jpg', 'jpeg')
    imgSrc = `data:image/${ext};base64,${imgBuffer.toString('base64')}`
  }

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        position: 'relative',
        background: '#111',
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
          background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.10) 100%)',
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
          {exp.date}
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
          {exp.title}
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
