'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Space_Grotesk, Bitter, Lora, Space_Mono } from 'next/font/google'
import { ChevronLeft } from 'lucide-react'
import CurtainLink from '@/app/components/CurtainLink'
import styles from './page.module.css'
import { experiments } from '@/lib/experiments/data'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

const bitter = Bitter({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
  variable: '--font-bitter',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-lora',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
})

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('gallery-visited')
    const experiments = containerRef.current?.querySelectorAll(`.${styles.experiment}`)

    if (hasVisited) {
      // Skip animation on return visits — show everything immediately
      experiments?.forEach((el) => el.classList.add(styles.visible))
      return
    }

    sessionStorage.setItem('gallery-visited', '1')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible)
          }
        })
      },
      { threshold: 0.1 }
    )

    experiments?.forEach((experiment) => observer.observe(experiment))

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${spaceGrotesk.variable} ${bitter.variable} ${lora.variable} ${spaceMono.variable}`}
    >
      <div className={styles.backRow}>
        <CurtainLink href="/" className={styles.backLink} curtainTransition={true} curtainReverse={true}>
          <ChevronLeft size={14} />
          Back
        </CurtainLink>
      </div>
      <h1 className={styles.title}>Design</h1>
      <p className={styles.subtitle}>
        Random experiments in visual design — layouts, systems, widgets, and whatever else seems interesting
      </p>

      <div className={styles.rule}></div>

      {experiments.map((experiment, index) => (
        <div
          key={experiment.slug}
          className={styles.experiment}
          data-delay={Math.min(index + 1, 6)}
        >
          <div className={styles.experimentPreviewContainer}>
            <Link href={`/design-experiments/${experiment.slug}`}>
              <Image
                src={experiment.screenshot}
                alt={`${experiment.title} preview`}
                width={280}
                height={210}
                className={styles.experimentPreview}
              />
            </Link>
          </div>
          <div className={styles.experimentContent}>
            <div className={styles.experimentDate}>{experiment.date}</div>
            <h2 className={styles.experimentTitle}>
              <Link href={`/design-experiments/${experiment.slug}`}>{experiment.title}</Link>
            </h2>
            <p className={styles.experimentDescription}>
              {experiment.description}
            </p>
            <div className={styles.experimentTags}>
              {experiment.tags.map((tag) => (
                <span key={`${experiment.slug}-${tag}`} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className={styles.footer}>
        <p>
          Design experiments by Josh Coolman •{' '}
          <a href="https://github.com/joshcoolman-smc/sandbox">GitHub</a>
        </p>
      </div>
    </div>
  )
}
