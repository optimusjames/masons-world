'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import type { GridConfig } from '../types'

// --- Tokens ---

const UNIT = 8
const u = (n: number) => n * UNIT

const BREAKPOINT = 768

const CONFIG: GridConfig = {
  columns: 4,
  outerMargin: u(8),
  columnGap: u(3),
}

const CONFIG_NARROW: GridConfig = {
  columns: 2,
  outerMargin: u(4),
  columnGap: u(2),
}

export const COLORS = {
  bg: '#0a0a0a',
  surface: '#141414',
  text: '#e8e8e8',
  textSecondary: '#999',
  textMuted: '#666',
  divider: '#e8e8e8',
  dividerSubtle: '#333',
  accent: '#00d4cc',
  gridColumn: 'rgba(0, 212, 204, 0.04)',
  gridColumnBorder: 'rgba(0, 212, 204, 0.1)',
  gridLine: 'rgba(0, 212, 204, 0.04)',
  gridLineMajor: 'rgba(0, 212, 204, 0.15)',
} as const

export const FONT = {
  display: "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  body: "'Suisse Intl', 'Helvetica Neue', Helvetica, Arial, sans-serif",
} as const

export const TYPE = {
  h1: { fontSize: 38, lineHeight: `${u(5)}px`, fontWeight: 400, letterSpacing: '-0.02em' } as const,
  h2: { fontSize: 19, lineHeight: `${u(3)}px`, fontWeight: 500, letterSpacing: '-0.01em' } as const,
  body: { fontSize: 13, lineHeight: `${u(2.5)}px`, fontWeight: 400, letterSpacing: '0.005em' } as const,
  caption: { fontSize: 10, lineHeight: `${u(2)}px`, fontWeight: 400, letterSpacing: '0.03em', textTransform: 'uppercase' } as const,
  label: { fontSize: 11, lineHeight: `${u(2)}px`, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' } as const,
}

// --- Context ---

const GridContext = createContext<GridConfig>(CONFIG)

export function useGrid(): GridConfig {
  return useContext(GridContext)
}

export function useGridConfig(): GridConfig {
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return narrow ? CONFIG_NARROW : CONFIG
}

// --- Helpers ---

/** Clamp a span to the current column count */
const col = (span: number, columns: number) => Math.min(span, columns)

export { u, UNIT }

// --- Provider ---

export function GridProvider({ children, className }: { children: React.ReactNode; className?: string }) {
  const config = useGridConfig()
  return (
    <GridContext.Provider value={config}>
      <div className={className}>
        {children}
      </div>
    </GridContext.Provider>
  )
}

// --- Primitives ---

export function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { outerMargin } = useGrid()
  return (
    <div style={{ paddingLeft: outerMargin, paddingRight: outerMargin, ...style }}>
      {children}
    </div>
  )
}

export function Grid({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { columns, columnGap } = useGrid()
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `0 ${columnGap}px`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function Span({ n, children, style }: { n: number; children: React.ReactNode; style?: React.CSSProperties }) {
  const { columns } = useGrid()
  return <div style={{ gridColumn: `span ${col(n, columns)}`, ...style }}>{children}</div>
}

export function Divider({ style }: { style?: React.CSSProperties } = {}) {
  const { columns } = useGrid()
  return (
    <div
      style={{
        gridColumn: `span ${columns}`,
        height: 1,
        background: COLORS.divider,
        ...style,
      }}
    />
  )
}

export function ThinDivider({ style }: { style?: React.CSSProperties } = {}) {
  const { columns } = useGrid()
  return (
    <div
      style={{
        gridColumn: `span ${columns}`,
        height: 1,
        background: COLORS.dividerSubtle,
        ...style,
      }}
    />
  )
}

export function Spacer({ units = 3, span = 4 }: { units?: number; span?: number }) {
  const { columns } = useGrid()
  if (columns === 2 && units === 0) return null
  return <div style={{ gridColumn: `span ${col(span, columns)}`, height: u(units) }} />
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  const { columns } = useGrid()
  const narrow = columns === 2
  return <div style={{ gridColumn: `span ${narrow ? 2 : 1}`, marginBottom: narrow ? u(4) : 0 }}>{children}</div>
}

export function GridOverlay({ visible, rows }: { visible: boolean; rows: number }) {
  const { columns, outerMargin, columnGap } = useGrid()
  if (!visible) return null

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: outerMargin,
          right: outerMargin,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: columnGap,
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            style={{
              background: COLORS.gridColumn,
              borderLeft: `1px solid ${COLORS.gridColumnBorder}`,
              borderRight: `1px solid ${COLORS.gridColumnBorder}`,
            }}
          />
        ))}
      </div>

      {Array.from({ length: rows }).map((_, i) => {
        const isMajor = i % 24 === 0
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: i * u(1),
              left: 0,
              right: 0,
              height: 1,
              background: isMajor ? COLORS.gridLineMajor : COLORS.gridLine,
            }}
          />
        )
      })}
    </div>
  )
}
