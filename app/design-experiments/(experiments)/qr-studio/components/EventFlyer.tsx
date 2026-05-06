'use client'

import { forwardRef } from 'react'
import { Cormorant_Garamond, Space_Mono, DM_Sans } from 'next/font/google'
import QrCode from './QrCode'

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
  subtitle: string
  date: string
  location: string
  details: string
  url: string
  dark: boolean
}

// A5 proportion: 148×210mm → display 300×425
const W = 300
const H = 425

const EventFlyer = forwardRef<HTMLDivElement, Props>(function EventFlyer(
  { title, subtitle, date, location, details, url, dark },
  ref
) {
  const bg = dark ? '#0d0d0d' : '#f5f2ed'
  const fg = dark ? '#f0ede8' : '#1a1816'
  const muted = dark ? '#6a6560' : '#8a8580'
  const rule = dark ? '#2a2724' : '#d8d2ca'
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
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 28px 24px',
        boxSizing: 'border-box',
      }}
      className={`${cormorant.variable} ${spaceMono.variable} ${dmSans.variable}`}
    >
      {/* Top mark */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={SHELL_PATH} />
        </svg>
      </div>

      {/* Rule */}
      <div style={{ height: 1, background: rule, marginBottom: 28 }} />

      {/* Title */}
      <div style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: 44, fontWeight: 300, color: fg, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: subtitle ? 10 : 0 }}>
        {title || 'Event Title'}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ fontFamily: 'var(--font-dm-sans), sans-serif', fontSize: 13, color: muted, lineHeight: 1.4, marginBottom: 4 }}>
          {subtitle}
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Details block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {date && (
          <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: fg }}>
            {date}
          </div>
        )}
        {location && (
          <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: muted }}>
            {location}
          </div>
        )}
        {details && (
          <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: muted }}>
            {details}
          </div>
        )}
      </div>

      {/* Rule */}
      <div style={{ height: 1, background: rule, marginBottom: 16 }} />

      {/* QR + URL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <QrCode url={fullUrl} dark={dark} size={64} />
        <div>
          <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.14em', color: muted, marginBottom: 3 }}>
            Scan to visit
          </div>
          <div style={{ fontFamily: 'var(--font-space-mono), monospace', fontSize: 8, color: fg, letterSpacing: '0.06em' }}>
            {url.replace(/^https?:\/\//, '')}
          </div>
        </div>
      </div>
    </div>
  )
})

export default EventFlyer
