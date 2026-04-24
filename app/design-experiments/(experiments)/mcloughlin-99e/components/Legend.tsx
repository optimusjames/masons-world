'use client'

import { useEffect, useState, type ReactNode } from 'react'
import styles from '../styles.module.css'
import type { LayerId } from '../types'

type Row = { id: LayerId; node: ReactNode }

const ROWS: Row[] = [
  {
    id: 'corridor',
    node: (
      <>
        <span className={styles.legendLine} style={{ background: '#e8b04e', height: 3 }} />
        Corridor
      </>
    ),
  },
  {
    id: 'highCrashStreets',
    node: (
      <>
        <span className={styles.legendLineDashed} style={{ borderTopColor: '#ec4899' }} />
        High Crash Network
      </>
    ),
  },
  {
    id: 'sidewalks',
    node: (
      <>
        <span className={styles.legendLine} style={{ background: '#2dd4bf' }} />
        Sidewalk
      </>
    ),
  },
  {
    id: 'maxOrange',
    node: (
      <>
        <span className={styles.legendLine} style={{ background: '#f58025', height: 3 }} />
        MAX Orange Line
      </>
    ),
  },
  {
    id: 'springwater',
    node: (
      <>
        <span
          className={styles.legendLineDashed}
          style={{ borderTopColor: '#15803d', borderTopWidth: 3 }}
        />
        Springwater Trail
      </>
    ),
  },
  {
    id: 'parks',
    node: (
      <>
        <span
          className={styles.legendSwatch}
          style={{ background: 'rgba(34,197,94,0.45)', borderColor: '#4ade80' }}
        />
        Park
      </>
    ),
  },
  {
    id: 'schools',
    node: (
      <>
        <span
          className={styles.legendSwatchCircle}
          style={{ background: 'rgba(59,130,246,0.32)', borderColor: '#93c5fd' }}
        />
        School zone
      </>
    ),
  },
  {
    id: 'highCrashIntersections',
    node: (
      <>
        <span
          className={styles.legendDot}
          style={{ background: '#ef4444', width: 14, height: 14 }}
        />
        Fatal intersection
      </>
    ),
  },
  {
    id: 'highCrashIntersections',
    node: (
      <>
        <span
          className={styles.legendDot}
          style={{ background: '#f59e0b', width: 11, height: 11 }}
        />
        Serious injury intersection
      </>
    ),
  },
  {
    id: 'fatalCrashes',
    node: (
      <>
        <span className={styles.legendDiamond} style={{ color: '#dc2626' }} />
        Fatal crash (all types)
      </>
    ),
  },
  {
    id: 'fatalCrashes',
    node: (
      <>
        <span className={styles.legendDiamond} style={{ color: '#f59e0b' }} />
        Serious-injury crash
      </>
    ),
  },
  {
    id: 'pedCrashes',
    node: (
      <>
        <span
          className={styles.legendDotOutline}
          style={{ borderColor: '#ef4444', width: 13, height: 13, borderWidth: 2.5 }}
        />
        Fatal ped crash
      </>
    ),
  },
  {
    id: 'pedCrashes',
    node: (
      <>
        <span
          className={styles.legendDotOutline}
          style={{ borderColor: '#f97316', width: 10, height: 10, borderWidth: 2.5 }}
        />
        Ped injury crash
      </>
    ),
  },
]

function useIsNarrow(maxWidth = 900) {
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${maxWidth - 1}px)`)
    const update = () => setNarrow(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [maxWidth])
  return narrow
}

export default function Legend({ visibleLayers }: { visibleLayers: LayerId[] }) {
  const active = new Set(visibleLayers)
  const rows = ROWS.filter((r) => active.has(r.id))
  const narrow = useIsNarrow(900)
  const [expanded, setExpanded] = useState(false)
  const collapsed = narrow && !expanded

  if (collapsed) {
    return (
      <button
        type="button"
        className={styles.legendToggle}
        onClick={() => setExpanded(true)}
        aria-expanded={false}
        aria-label="Show map legend"
      >
        <span className={styles.legendToggleLabel}>Legend</span>
        <span className={styles.legendToggleCount}>{rows.length} layers</span>
        <span className={styles.legendToggleCaret} aria-hidden>
          ▾
        </span>
      </button>
    )
  }

  return (
    <div className={styles.legend}>
      {rows.map((r, i) => (
        <span key={`${r.id}-${i}`} className={styles.legendRow}>
          {r.node}
        </span>
      ))}
      <span
        className={styles.legendRow}
        style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.44)' }}
      >
        Portland Open Data · ODOT · OpenStreetMap
      </span>
      {narrow && (
        <button
          type="button"
          className={styles.legendCollapse}
          onClick={() => setExpanded(false)}
          aria-label="Hide map legend"
        >
          Hide ▴
        </button>
      )}
    </div>
  )
}
