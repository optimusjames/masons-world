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

let savedIndex = 0

interface Props {
  notes: StickyNote[]
}

export default function StickyNoteStack({ notes }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(savedIndex)
  const [transitioning, setTransitioning] = useState(false)
  const [justOpened, setJustOpened] = useState(false)
  const [inAdvanceZone, setInAdvanceZone] = useState(true)
  const prevIndex = useRef(0)
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalStackRef = useRef<HTMLDivElement>(null)

  const isInAdvanceZone = useCallback((clientX: number, clientY: number) => {
    if (!modalStackRef.current) return true
    const rect = modalStackRef.current.getBoundingClientRect()
    return (
      clientX >= rect.left - 200 &&
      clientX <= rect.right + 200 &&
      clientY >= rect.top - 100 &&
      clientY <= rect.bottom + 100
    )
  }, [])

  const advance = useCallback(() => {
    if (notes.length <= 1) return
    const next = (currentIndex + 1) % notes.length
    if (isExpanded && !transitioning) {
      prevIndex.current = currentIndex
      setTransitioning(true)
      setJustOpened(false)
      transitionTimeout.current = setTimeout(() => {
        setCurrentIndex(next)
        savedIndex = next
        setTransitioning(false)
      }, 400)
    } else {
      setCurrentIndex(next)
      savedIndex = next
    }
  }, [notes.length, currentIndex, isExpanded, transitioning])

  const close = useCallback(() => {
    setIsExpanded(false)
    setTransitioning(false)
    setJustOpened(false)
    if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
  }, [])

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

  if (notes.length === 0) return null

  const displayedIndex = transitioning ? prevIndex.current : currentIndex
  const active = notes[displayedIndex]
  const incoming = transitioning ? notes[(currentIndex + 1) % notes.length] : null

  return (
    <>
      <div
        className={styles.stackWrapper}
        onClick={() => {
          setIsExpanded(true)
          setJustOpened(true)
        }}
      >
        <div className={styles.stackLabel}>Note to self</div>
        <div className={styles.stack}>
          {notes.slice(0, 4).map((_, i) => {
            const noteIndex = (currentIndex + i) % notes.length
            const note = notes[noteIndex]
            const rotation = (i * 2.5 - 3) + (i % 2 === 0 ? 1 : -1)
            const isTop = i === 0
            return (
              <div
                key={`${noteIndex}-${currentIndex}`}
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
                      <button
                        className={styles.skipBtn}
                        onClick={(e) => { e.stopPropagation(); advance() }}
                        aria-label="Next note"
                      >&rsaquo;</button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isExpanded && (
        <div
          className={styles.backdrop}
          style={{ cursor: inAdvanceZone ? 'pointer' : 'default' }}
          onMouseMove={(e) => setInAdvanceZone(isInAdvanceZone(e.clientX, e.clientY))}
          onClick={(e) => {
            if (isInAdvanceZone(e.clientX, e.clientY)) {
              advance()
            } else {
              close()
            }
          }}
        >
          <div className={styles.modalStack} ref={modalStackRef}>
            <div
              key={`modal-${displayedIndex}`}
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
                key={`modal-incoming-${(currentIndex + 1) % notes.length}`}
                className={`${styles.modal} ${styles.modalEnter} ${colorClass(incoming.color)}`}
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
