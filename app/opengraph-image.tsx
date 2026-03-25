import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  const fontData = readFileSync(
    path.join(process.cwd(), 'public', 'fonts', 'space-grotesk-700.ttf')
  )

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
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: 'Space Grotesk',
          fontSize: 72,
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1.05,
        }}
      >
        Mason&apos;s World
      </span>
      <span
        style={{
          fontFamily: 'Space Grotesk',
          fontSize: 20,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
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
