'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [stackIndex, setStackIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [justOpened, setJustOpened] = useState(false)
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const close = useCallback(() => {
    setIsExpanded(false)
    setTransitioning(false)
    setJustOpened(false)
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
    setActiveIndex(stackIndex)
  }, [stackIndex])

  const advanceModal = useCallback(() => {
    if (notes.length <= 1 || transitioning) return
    setJustOpened(false)
    setTransitioning(true)
    const next = (activeIndex + 1) % notes.length
    transitionTimeout.current = setTimeout(() => {
      setActiveIndex(next)
      setDisplayIndex(next)
      setStackIndex(next)
      setTransitioning(false)
    }, 400)
  }, [notes.length, activeIndex, transitioning])

  useEffect(() => {
    if (!isExpanded) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isExpanded, close])

  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
    }
  }, [])

  const skipToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (notes.length <= 1) return
    const next = (activeIndex + 1) % notes.length
    setActiveIndex(next)
    setStackIndex(next)
  }, [notes.length, activeIndex])

  if (notes.length === 0) return null

  const active = notes[transitioning ? displayIndex : activeIndex]
  const incoming = transitioning ? notes[(activeIndex + 1) % notes.length] : null

  return (
    <>
      <div
        className={styles.stackWrapper}
        onClick={() => {
          setIsExpanded(true)
          setJustOpened(true)
          setDisplayIndex(activeIndex)
          if (notes.length > 1) {
            setStackIndex((activeIndex + 1) % notes.length)
          }
        }}
      >
        <div className={styles.stackLabel}>Note to self</div>
        <div className={styles.stack}>
          {notes.slice(0, 4).map((_, i) => {
            const noteIndex = (stackIndex + i) % notes.length
            const note = notes[noteIndex]
            const rotation = (i * 2.5 - 3) + (i % 2 === 0 ? 1 : -1)
            const isTop = i === 0
            return (
              <div
                key={`${noteIndex}-${stackIndex}`}
                className={`${styles.stackCard} ${colorClass(note.color)} ${isTop ? styles.stackCardTop : ''}`}
                style={{
                  transform: `translate(${i * 3}px, ${i * 3}px) rotate(${rotation}deg)`,
                  zIndex: notes.length - i,
                }}
              >
                {isTop && (
                  <>
                    <div className={styles.stackTeaser}>{note.content}</div>
                    {notes.length > 1 && (
                      <button className={styles.skipBtn} onClick={skipToNext} aria-label="Next note">&rsaquo;</button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.backdrop} onClick={advanceModal}>
          <button
            className={styles.closeBtn}
            onClick={(e) => { e.stopPropagation(); close() }}
            aria-label="Close"
          >
            &times;
          </button>
          <div className={styles.modalStack}>
            <div
              key={`modal-${transitioning ? displayIndex : activeIndex}`}
              className={`${styles.modal} ${justOpened ? styles.modalTop : ''} ${colorClass(active.color)} ${transitioning ? styles.modalExit : ''}`}
            >
              <div
                className={styles.modalContent}
                dangerouslySetInnerHTML={{
                  __html: parseInlineMarkdown(active.content),
                }}
              />
            </div>
            {transitioning && incoming && (
              <div
                key={`modal-incoming-${(activeIndex + 1) % notes.length}`}
                className={`${styles.modal} ${styles.modalTop} ${styles.modalEnter} ${colorClass(incoming.color)}`}
              >
                <div
                  className={styles.modalContent}
                  dangerouslySetInnerHTML={{
                    __html: parseInlineMarkdown(incoming.content),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
