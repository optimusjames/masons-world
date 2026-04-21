'use client'

import styles from '../styles.module.css'
import type { Chapter } from '../data/chapters'

type Props = {
  chapter: Chapter
  isActive: boolean
  registerRef: (el: HTMLElement | null) => void
}

export default function StoryCard({ chapter, isActive, registerRef }: Props) {
  return (
    <section
      ref={registerRef}
      className={`${styles.storyCard} ${isActive ? styles.storyCardActive : ''}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className={styles.storyEyebrow}>{chapter.eyebrow}</div>
      <div className={styles.statCallout}>{chapter.stat}</div>
      <h2 className={styles.storyHeading}>{chapter.heading}</h2>
      {chapter.body.map((para, i) => (
        <p key={i} className={styles.storyBody}>
          {para}
        </p>
      ))}
    </section>
  )
}
