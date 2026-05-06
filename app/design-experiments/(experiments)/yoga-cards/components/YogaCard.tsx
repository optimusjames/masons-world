'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Cormorant_Garamond, Space_Mono, DM_Sans } from 'next/font/google'
import { type YogaPose } from '../data'
import '../styles.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  display: 'swap',
  variable: '--font-cormorant',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-dm-sans',
})

const levelColor: Record<string, string> = {
  Beginner: '#6bcb77',
  Intermediate: '#f0a500',
  Advanced: '#e74c3c',
}

export default function YogaCard({
  pose,
  index = 0,
}: {
  pose: YogaPose
  index?: number
}) {
  const [flipped, setFlipped] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('yoga-card-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/design-experiments/yoga-cards/${pose.id}`
    await navigator.clipboard.writeText(url)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    setCopied(true)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }, [pose.id])

  return (
    <div
      ref={cardRef}
      data-pose-id={pose.id}
      className={`${cormorant.variable} ${spaceMono.variable} ${dmSans.variable} yoga-card yoga-card--square`}
      style={{
        '--aspect': '1 / 1',
        '--delay': `${index * 0.08}s`,
        '--level-color': levelColor[pose.level],
      } as React.CSSProperties}
      onClick={() => setFlipped(f => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setFlipped(f => !f)}
    >
      <div className={`yoga-card__inner yoga-card__inner--rounded ${flipped ? 'yoga-card__inner--flipped' : ''}`}>
        {/* FRONT */}
        <div className="yoga-card__face yoga-card__front">
          <img
            src={pose.image}
            alt={pose.name}
            className="yoga-card__img"
            loading="lazy"
          />
          <div className="yoga-card__overlay yoga-card__overlay--top">
            <span className="yoga-card__category">{pose.category}</span>
            <h3 className="yoga-card__name">{pose.name}</h3>
          </div>
        </div>

        {/* BACK */}
        <div className="yoga-card__face yoga-card__back">
          <div className="yoga-card__back-content">
            <div className="yoga-card__back-header">
              <h3 className="yoga-card__back-name">{pose.name}</h3>
              <p className="yoga-card__back-sanskrit">{pose.sanskrit}</p>
              <span
                className="yoga-card__level-badge"
                style={{ background: levelColor[pose.level] }}
              >
                {pose.level}
              </span>
            </div>

            <div className="yoga-card__back-section">
              <h4 className="yoga-card__back-label">Benefits</h4>
              <ul className="yoga-card__back-list">
                {pose.benefits.map(b => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>

            <div className="yoga-card__back-section">
              <h4 className="yoga-card__back-label">Cues</h4>
              <ul className="yoga-card__back-list">
                {pose.cues.map(c => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            {pose.holdTime && (
              <p className="yoga-card__hold-time">Hold: {pose.holdTime}</p>
            )}

            <div className="yoga-card__back-footer">
              <button
                className={`yoga-card__share-btn ${copied ? 'yoga-card__share-btn--copied' : ''}`}
                onClick={handleShare}
              >
                {copied ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 9.5l4-3M6 6.5l4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="4.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="11.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
                    <circle cx="11.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                )}
                {copied ? 'Copied!' : 'Share'}
              </button>
              <span className="yoga-card__tap-hint">tap to flip</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
