'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Cormorant_Garamond, Space_Mono, DM_Sans } from 'next/font/google'
import { poses, cardStyles, galleryCards, type YogaPose, type CardStyle } from './data'
import './styles.css'

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

function YogaCard({
  pose,
  style,
  index,
  gridPlacement,
}: {
  pose: YogaPose
  style: CardStyle
  index: number
  gridPlacement?: { gridColumn: string; gridRow: string }
}) {
  const [flipped, setFlipped] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

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
    const text = `${pose.name} (${pose.sanskrit}) — ${pose.benefits[0]}`
    if (navigator.share) {
      await navigator.share({ title: pose.name, text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }, [pose])

  const isMinimal = style === 'minimal'
  const isLandscape = style === 'landscape'
  const rounded = style !== 'minimal'
  const isGallery = !!gridPlacement
  const aspectVar = isGallery ? 'auto' : (cardStyles.find(s => s.id === style)?.aspectRatio ?? '1 / 1')

  return (
    <div
      ref={cardRef}
      className={`yoga-card yoga-card--${style} ${isGallery ? 'yoga-card--gallery' : ''}`}
      style={{
        '--aspect': aspectVar,
        '--delay': `${index * 0.08}s`,
        '--level-color': levelColor[pose.level],
        ...(gridPlacement ?? {}),
      } as React.CSSProperties}
      onClick={() => setFlipped(f => !f)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && setFlipped(f => !f)}
    >
      <div className={`yoga-card__inner ${flipped ? 'yoga-card__inner--flipped' : ''} ${rounded ? 'yoga-card__inner--rounded' : ''}`}>
        {/* FRONT */}
        <div className="yoga-card__face yoga-card__front">
          <img
            src={pose.image}
            alt={pose.name}
            className="yoga-card__img"
            loading="lazy"
          />
          {!isMinimal && (
            <div className={`yoga-card__overlay ${isLandscape ? 'yoga-card__overlay--bottom' : 'yoga-card__overlay--top'}`}>
              <span className="yoga-card__category">{pose.category}</span>
              <h3 className="yoga-card__name">{pose.name}</h3>
              {isLandscape && (
                <p className="yoga-card__sanskrit">{pose.sanskrit}</p>
              )}
            </div>
          )}
          {isMinimal && (
            <button
              className="yoga-card__info-btn"
              aria-label="Show pose details"
              onClick={e => {
                e.stopPropagation()
                setFlipped(true)
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 9v5M10 6.5v.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* BACK */}
        <div className="yoga-card__face yoga-card__back">
          <div className={`yoga-card__back-content ${isLandscape ? 'yoga-card__back-content--landscape' : ''}`}>
            {isLandscape ? (
              <>
                <div className="yoga-card__back-left">
                  <h3 className="yoga-card__back-name">{pose.name}</h3>
                  <p className="yoga-card__back-sanskrit">{pose.sanskrit}</p>
                  <span
                    className="yoga-card__level-badge"
                    style={{ background: levelColor[pose.level] }}
                  >
                    {pose.level}
                  </span>
                  {pose.holdTime && (
                    <p className="yoga-card__hold-time">
                      Hold: {pose.holdTime}
                    </p>
                  )}
                  <div className="yoga-card__back-footer">
                    <button className="yoga-card__share-btn" onClick={handleShare}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 9.5l4-3M6 6.5l4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        <circle cx="4.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="11.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="11.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      Share
                    </button>
                    <span className="yoga-card__tap-hint">tap to flip</span>
                  </div>
                </div>
                <div className="yoga-card__back-right">
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
                </div>
              </>
            ) : (
              <>
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
                  <p className="yoga-card__hold-time">
                    Hold: {pose.holdTime}
                  </p>
                )}

                <div className="yoga-card__back-footer">
                  <button className="yoga-card__share-btn" onClick={handleShare}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 9.5l4-3M6 6.5l4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="4.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="11.5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="11.5" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                    Share
                  </button>
                  <span className="yoga-card__tap-hint">tap to flip</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function YogaCards() {
  const [activeStyle, setActiveStyle] = useState<CardStyle>('landscape')

  return (
    <div className={`yoga-cards ${cormorant.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <header className="yoga-cards__header">
        <p className="yoga-cards__eyebrow">Design Experiment</p>
        <h1 className="yoga-cards__title">Yoga Cards</h1>
        <p className="yoga-cards__subtitle">
          Flippable pose cards in four styles. Click any card to reveal details.
        </p>
      </header>

      <nav className="yoga-cards__style-picker">
        {cardStyles.map(s => (
          <button
            key={s.id}
            className={`yoga-cards__style-btn ${activeStyle === s.id ? 'yoga-cards__style-btn--active' : ''}`}
            onClick={() => setActiveStyle(s.id)}
          >
            <span className="yoga-cards__style-label">{s.label}</span>
            <span className="yoga-cards__style-desc">{s.description}</span>
          </button>
        ))}
      </nav>

      <section
        className={`yoga-cards__grid yoga-cards__grid--${activeStyle}`}
        key={activeStyle}
      >
        {activeStyle === 'gallery'
          ? galleryCards.map((gc, i) => {
              const pose = poses.find(p => p.id === gc.poseId)!
              return (
                <YogaCard
                  key={`${gc.poseId}-gallery`}
                  pose={pose}
                  style={gc.style as CardStyle}
                  index={i}
                  gridPlacement={{ gridColumn: gc.gridColumn, gridRow: gc.gridRow }}
                />
              )
            })
          : poses.map((pose, i) => (
              <YogaCard key={`${pose.id}-${activeStyle}`} pose={pose} style={activeStyle} index={i} />
            ))
        }
      </section>
    </div>
  )
}
