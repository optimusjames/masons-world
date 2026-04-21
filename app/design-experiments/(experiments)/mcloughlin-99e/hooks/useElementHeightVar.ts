'use client'

import { useCallback, useEffect, useRef } from 'react'

// Tracks the rendered height of a DOM element via ResizeObserver and writes
// it into a CSS custom property on that element. Downstream CSS can then size
// against the live height (e.g. scroll-margin-top keyed to a sticky region).
export function useElementHeightVar(cssVar: string) {
  const elRef = useRef<HTMLDivElement | null>(null)

  const write = useCallback(
    (px: number) => {
      const el = elRef.current
      if (!el) return
      el.style.setProperty(cssVar, `${Math.round(px)}px`)
    },
    [cssVar],
  )

  useEffect(() => {
    const el = elRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    write(el.getBoundingClientRect().height)
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) write(entry.contentRect.height)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [write])

  return elRef
}
