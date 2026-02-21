'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  className?: string
}

export default function StickyNoteStack({ notes, className }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(savedIndex)
  const [transitioning, setTransitioning] = useState(false)
  const [justOpened, setJustOpened] = useState(false)
  const [inAdvanceZone, setInAdvanceZone] = useState(true)
  const prevIndex = useRef(0)
  const direction = useRef<'forward' | 'back'>('forward')
  const transitionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalStackRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  const getClickZone = useCallback((clientX: number, clientY: number): 'forward' | 'back' | 'close' => {
    if (!modalStackRef.current) return 'forward'
    const rect = modalStackRef.current.getBoundingClientRect()
    const inY = clientY >= rect.top && clientY <= rect.bottom
    if (!inY) return 'close'
    const backEdge = rect.left + 40
    if (clientX >= rect.left - 100 && clientX < backEdge) return 'back'
    if (clientX >= backEdge && clientX <= rect.right + 100) return 'forward'
    return 'close'
  }, [])

  const navigate = useCallback((dir: 'forward' | 'back') => {
    if (notes.length <= 1) return
    const next = dir === 'forward'
      ? (currentIndex + 1) % notes.length
      : (currentIndex - 1 + notes.length) % notes.length
    if (isExpanded && !transitioning) {
      prevIndex.current = currentIndex
      direction.current = dir
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
      if (e.key === 'ArrowRight') navigate('forward')
      if (e.key === 'ArrowLeft') navigate('back')
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isExpanded, close, navigate])

  useEffect(() => {
    return () => {
      if (transitionTimeout.current) clearTimeout(transitionTimeout.current)
    }
  }, [])

  if (notes.length === 0) return null

  const displayedIndex = transitioning ? prevIndex.current : currentIndex
  const active = notes[displayedIndex]
  const nextIndex = direction.current === 'forward'
    ? (currentIndex + 1) % notes.length
    : (currentIndex - 1 + notes.length) % notes.length
  const incoming = transitioning ? notes[nextIndex] : null
  const isBack = direction.current === 'back'

  return (
    <>
      <div
        ref={wrapperRef}
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
                  <div className={styles.stackTeaser}>{note.content}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isExpanded && createPortal(
        <div
          className={`${styles.backdrop}${className ? ` ${className}` : ''}`}
          style={{
            cursor: inAdvanceZone ? 'pointer' : 'default',
            '--font-marker': wrapperRef.current
              ? getComputedStyle(wrapperRef.current).getPropertyValue('--font-marker')
              : undefined,
          } as React.CSSProperties}
          onMouseMove={(e) => setInAdvanceZone(getClickZone(e.clientX, e.clientY) !== 'close')}
          onTouchStart={(e) => {
            const t = e.touches[0]
            touchStart.current = { x: t.clientX, y: t.clientY }
            swiped.current = false
          }}
          onTouchEnd={(e) => {
            if (!touchStart.current) return
            const t = e.changedTouches[0]
            const dx = t.clientX - touchStart.current.x
            const dy = t.clientY - touchStart.current.y
            if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
              swiped.current = true
              navigate(dx < 0 ? 'forward' : 'back')
            }
            touchStart.current = null
          }}
          onClick={(e) => {
            if (swiped.current) { swiped.current = false; return }
            const zone = getClickZone(e.clientX, e.clientY)
            if (zone === 'close') {
              close()
            } else {
              navigate(zone)
            }
          }}
        >
          <div className={styles.caretLeft} aria-hidden>&#8249;</div>
          <div className={styles.modalStack} ref={modalStackRef}>
            <div
              key={`modal-${displayedIndex}`}
              className={`${styles.modal} ${justOpened ? styles.modalTop : ''} ${colorClass(active.color)} ${transitioning ? (isBack ? styles.modalExitRight : styles.modalExit) : ''}`}
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
                key={`modal-incoming-${nextIndex}`}
                className={`${styles.modal} ${isBack ? styles.modalEnterLeft : styles.modalEnter} ${colorClass(incoming.color)}`}
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
          <div className={styles.caretRight} aria-hidden>&#8250;</div>
        </div>,
        document.body
      )}
    </>
  )
}
