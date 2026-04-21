'use client'

import styles from '../styles.module.css'
import type { Chapter } from '../data/chapters'

type Props = {
  chapters: Chapter[]
  activeIndex: number
  onSelect: (index: number) => void
}

export default function ChapterIndicator({ chapters, activeIndex, onSelect }: Props) {
  return (
    <div className={styles.chapterIndicator} role="tablist" aria-label="Story chapters">
      {chapters.map((c) => {
        const label = String(c.index + 1).padStart(2, '0')
        const isActive = c.index === activeIndex
        return (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Chapter ${label}: ${c.heading}`}
            className={`${styles.chapterDot} ${isActive ? styles.chapterDotActive : ''}`}
            onClick={() => onSelect(c.index)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
