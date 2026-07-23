'use client'

import { useState } from 'react'
import Image from 'next/image'
import styles from './IdentityCard.module.css'

const links = [
  { href: 'https://github.com/optimusjames', label: 'GitHub' },
  { href: 'https://www.linkedin.com/in/optimizationmason/', label: 'LinkedIn' },
]

function LinkRow() {
  return (
    <div className={styles.links}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          onClick={(e) => e.stopPropagation()}
        >
          {l.label}
        </a>
      ))}
    </div>
  )
}

/**
 * The hero identity card. Front carries the pitch; a flip reveals a short bio.
 * Reuses the CSS 3D recipe from the Yoga Cards experiment (perspective +
 * preserve-3d + backface-visibility). Both faces render real DOM text so the
 * bio stays crawlable; the hidden face is `inert` so it drops out of the tab
 * order and screen-reader flow. prefers-reduced-motion swaps the spin for an
 * instant flip (handled in CSS).
 */
export default function IdentityCard() {
  const [flipped, setFlipped] = useState(false)
  const toggle = () => setFlipped((f) => !f)

  return (
    <div className={styles.wrap}>
      <div className={`${styles.inner} ${flipped ? styles.flipped : ''}`} onClick={toggle}>
        {/* Front — pitch */}
        <div className={styles.face} inert={flipped}>
          <div className={styles.avatar}>
            <Image
              src="/james-headshot.jpg"
              alt="James Mason"
              width={160}
              height={160}
              sizes="80px"
              className={styles.avatarImg}
              priority
            />
          </div>
          <div className={styles.text}>
            <h1 className={styles.name}>James Mason</h1>
            <p className={styles.role}>GIS &amp; Civic data · Portland, OR</p>
            <p className={styles.tagline}>
              I turn public data into maps and tools people actually use, and I&apos;m moving toward the operations side of how a city runs.
            </p>
            <LinkRow />
          </div>
          <button
            type="button"
            className={styles.flipBtn}
            aria-label="Read a short bio"
            aria-expanded={flipped}
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
          >
            About <span aria-hidden="true">↻</span>
          </button>
        </div>

        {/* Back — bio */}
        <div className={`${styles.face} ${styles.back}`} inert={!flipped}>
          <span className={styles.backLabel}>About</span>
          <p className={styles.bio}>
            I work at the seam where public data meets city operations. This site is my open notebook, maps, essays, and experiments, a running record of what I&apos;m building and how I think.
          </p>
          <div className={styles.backFoot}>
            <LinkRow />
            <button
              type="button"
              className={styles.flipBtn}
              aria-label="Back to the front of the card"
              onClick={(e) => {
                e.stopPropagation()
                toggle()
              }}
            >
              <span aria-hidden="true">←</span> Back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
