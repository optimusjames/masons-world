'use client'

import { forwardRef } from 'react'
import { Cormorant_Garamond, Space_Mono, DM_Sans } from 'next/font/google'
import QrCode from './QrCode'
import { type ContentType, TYPE_LABELS } from '../data'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  display: 'swap',
  variable: '--font-cormorant',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-space-mono',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const SHELL_PATH = 'M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44'

interface Props {
  title: string
  description: string
  url: string
  image?: string
  type: ContentType
  dark: boolean
}

// Square: 400×400
const W = 400
const H = 400
const IMG_H = 200

const ContentCard = forwardRef<HTMLDivElement, Props>(function ContentCard(
  { title, description, url, image, type, dark },
  ref
) {
  const bg = dark ? '#1a1816' : '#f5f2ed'
  const fg = dark ? '#f0ede8' : '#1a1816'
  const muted = dark ? '#6a6560' : '#8a8580'
  const rule = dark ? '#2a2724' : '#d8d2ca'
  const imgBg = dark ? '#0d0d0d' : '#e8e2da'
  const fullUrl = url.startsWith('http') ? url : `https://${url}`
  const isLocalImage = image && image.startsWith('/')

  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        background: bg,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={`${cormorant.variable} ${spaceMono.variable} ${dmSans.variable}`}
    >
      {/* Image area */}
      <div style={{ width: '100%', height: IMG_H, background: imgBg, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {isLocalImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          // Gradient fallback — minimal, intentional
          <div style={{
            width: '100%',
            height: '100%',
            background: dark
              ? 'linear-gradient(135deg, #1a1816 0%, #0d0d0d 50%, #1a1816 100%)'
              : 'linear-gradient(135deg, #e8e2da 0%, #d5cec4 50%, #e8e2da 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d={SHELL_PATH} />
            </svg>
          </div>
        )}
        {/* Type badge */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          fontFamily: 'var(--font-space-mono), monospace',
          fontSize: 8,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: fg,
          background: dark ? 'rgba(13,13,13,0.7)' : 'rgba(245,242,237,0.8)',
          backdropFilter: 'blur(4px)',
          padding: '3px 8px',
          borderRadius: 3,
        }}>
          {TYPE_LABELS[type]}
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '18px 20px 16px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 400, color: fg, lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 11, color: muted, lineHeight: 1.4, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {description}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${rule}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={SHELL_PATH} />
            </svg>
            <span style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, color: muted, letterSpacing: '0.1em' }}>
              masons-world.vercel.app
            </span>
          </div>
          <QrCode url={fullUrl} dark={dark} size={60} />
        </div>
      </div>
    </div>
  )
})

export default ContentCard
