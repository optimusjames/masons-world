'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StickyNote } from '../types'
import styles from './stickyNotes.module.css'

function parseInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br />')
}

function colorClass(color: StickyNote['color']): string {
  return styles[color] || styles.warm
}

interface Props {
  notes: StickyNote[]
}

export default function StickyNoteStack({ notes }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [swiping, setSwiping] = useState(false)

  const close = useCallback(() => {
    setIsExpanded(false)
    setSwiping(false)
  }, [])

  const cycleNext = useCallback(() => {
    if (notes.length <= 1 || swiping) return
    setSwiping(true)
  }, [notes.length, swiping])

  const handleSwipeEnd = useCallback(() => {
    setActiveIndex((i) => (i + 1) % notes.length)
    setSwiping(false)
  }, [notes.length])

  useEffect(() => {
    if (!isExpanded) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isExpanded, close])

  if (notes.length === 0) return null

  const nextIndex = (activeIndex + 1) % notes.length
  const active = notes[activeIndex]
  const next = notes[nextIndex]

  return (
    <>
      <div
        className={styles.stackWrapper}
        onClick={() => {
          setActiveIndex(0)
          setSwiping(false)
          setIsExpanded(true)
        }}
      >
        <div className={styles.stackLabel}>Note to self</div>
        <div className={styles.stack}>
          {notes.slice(0, 4).map((note, i) => {
            const rotation = (i * 2.5 - 3) + (i % 2 === 0 ? 1 : -1)
            const isTop = i === 0
            return (
              <div
                key={note.id}
                className={`${styles.stackCard} ${colorClass(note.color)} ${isTop ? styles.stackCardTop : ''}`}
                style={{
                  transform: `translate(${i * 3}px, ${i * 3}px) rotate(${rotation}deg)`,
                  zIndex: notes.length - i,
                }}
              >
                {isTop && (
                  <div className={styles.stackTeaser}>{note.content}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.backdrop} onClick={close}>
          <div
            className={styles.modalStack}
            onClick={(e) => {
              e.stopPropagation()
              cycleNext()
            }}
          >
            {notes.length > 1 && (
              <div
                className={`${styles.modal} ${styles.modalUnderneath} ${colorClass(next.color)}`}
              >
                <div
                  className={styles.modalContent}
                  dangerouslySetInnerHTML={{
                    __html: parseInlineMarkdown(next.content),
                  }}
                />
              </div>
            )}

            <div
              className={`${styles.modal} ${styles.modalTop} ${colorClass(active.color)} ${swiping ? styles.swipeOff : ''}`}
              onAnimationEnd={swiping ? handleSwipeEnd : undefined}
            >
              <div
                className={styles.modalContent}
                dangerouslySetInnerHTML={{
                  __html: parseInlineMarkdown(active.content),
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
