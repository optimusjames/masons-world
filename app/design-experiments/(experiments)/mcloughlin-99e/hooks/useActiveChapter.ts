'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Picks the active chapter symmetrically in both scroll directions by finding the
// last card whose top has crossed an offset line near the viewport top. Avoids the
// asymmetric firing behavior of IntersectionObserver's isIntersecting transitions
// (which fire early on scroll-down and late on scroll-up).
export function useActiveChapter(total: number) {
  const [activeIndex, setActiveIndex] = useState(0)
  const elsRef = useRef<Array<HTMLElement | null>>([])
  const lastActiveRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  if (elsRef.current.length !== total) {
    const next = Array<HTMLElement | null>(total).fill(null)
    for (let i = 0; i < Math.min(elsRef.current.length, total); i++) {
      next[i] = elsRef.current[i]
    }
    elsRef.current = next
  }

  const compute = useCallback(() => {
    rafRef.current = null
    const isNarrow = window.matchMedia('(max-width: 900px)').matches
    // Offset line: desktop = ~20% down, mobile = below the sticky map (~55% down).
    const offset = isNarrow ? window.innerHeight * 0.55 : window.innerHeight * 0.2
    let next = 0
    for (let i = 0; i < elsRef.current.length; i++) {
      const el = elsRef.current[i]
      if (!el) continue
      const top = el.getBoundingClientRect().top
      if (top <= offset) next = i
    }
    if (next !== lastActiveRef.current) {
      lastActiveRef.current = next
      setActiveIndex(next)
    }
  }, [])

  const schedule = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(compute)
  }, [compute])

  useEffect(() => {
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [schedule])

  const registerCard = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      elsRef.current[index] = el
      if (el) el.dataset.chapterIndex = String(index)
      schedule()
    },
    [schedule],
  )

  return { activeIndex, registerCard }
}
