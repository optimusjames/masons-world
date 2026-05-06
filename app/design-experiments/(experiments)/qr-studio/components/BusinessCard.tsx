'use client'

import { forwardRef } from 'react'
import { Cormorant_Garamond, Space_Mono } from 'next/font/google'
import QrCode from './QrCode'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  display: 'swap',
  variable: '--font-cormorant',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-space-mono',
})

// Shell SVG path from favicon
const SHELL_PATH = 'M14 11a2 2 0 1 1-4 0 4 4 0 0 1 8 0 6 6 0 0 1-12 0 8 8 0 0 1 16 0 10 10 0 1 1-20 0 11.93 11.93 0 0 1 2.42-7.22 2 2 0 1 1 3.16 2.44'

interface Props {
  name: string
  title: string
  tagline: string
  url: string
  dark: boolean
  side: 'front' | 'back'
}

// Card is 420×240 on screen (3.5:2 ratio = US standard business card)
const W = 420
const H = 240

const BusinessCard = forwardRef<HTMLDivElement, Props>(function BusinessCard(
  { name, title, tagline, url, dark, side },
  ref
) {
  const bg = dark ? '#1a1816' : '#f5f2ed'
  const fg = dark ? '#f0ede8' : '#1a1816'
  const muted = dark ? '#6a6560' : '#8a8580'
  const border = dark ? '#2a2724' : '#d8d2ca'
  const fullUrl = url.startsWith('http') ? url : `https://${url}`

  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        background: bg,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        fontFamily: 'sans-serif',
      }}
      className={`${cormorant.variable} ${spaceMono.variable}`}
    >
      {side === 'front' ? (
        // FRONT — shell mark + name + title
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, boxSizing: 'border-box' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
            <path d={SHELL_PATH} />
          </svg>
          <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 26, fontWeight: 300, color: fg, letterSpacing: '-0.01em', lineHeight: 1.1, marginBottom: 8, textAlign: 'center' }}>
            {name}
          </div>
          <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.18em', color: muted, textAlign: 'center' }}>
            {title}
          </div>
          <div style={{ position: 'absolute', bottom: 18, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, color: muted, letterSpacing: '0.1em' }}>
            {url.replace(/^https?:\/\//, '')}
          </div>
        </div>
      ) : (
        // BACK — QR code + url + tagline
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '28px 32px', boxSizing: 'border-box', gap: 28 }}>
          <QrCode url={fullUrl} dark={dark} size={140} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 18, fontWeight: 300, fontStyle: 'italic', color: fg, lineHeight: 1.3 }}>
              {tagline}
            </div>
            <div style={{ width: 28, height: 1, background: border }} />
            <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, color: muted, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {url.replace(/^https?:\/\//, '')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default BusinessCard
