'use client'

import { useEffect, useState } from 'react'
import styles from '../styles.module.css'
import type { CategoryId, ReportStatus } from '../types'
import { CATEGORIES } from '../data/categories'
import { STATUS_COLOR, STATUS_LABEL } from './icons'

const STATUSES: ReportStatus[] = ['reported', 'in_progress', 'fixed']

export default function Legend({
  visibleStatuses,
  onToggleStatus,
  visibleCategory,
  onCategoryChange,
  counts,
}: {
  visibleStatuses: ReportStatus[]
  onToggleStatus: (s: ReportStatus) => void
  visibleCategory: CategoryId | 'all'
  onCategoryChange: (c: CategoryId | 'all') => void
  counts: Record<ReportStatus, number>
}) {
  // Start collapsed on phones, where the full panel eats too much of the map.
  // Desktop ignores this (the toggle only does anything at the mobile breakpoint).
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 540px)').matches) {
      setCollapsed(true)
    }
  }, [])

  return (
    <div className={styles.legend} data-collapsed={collapsed}>
      <button
        type="button"
        className={styles.legendHeader}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span>Showing on map</span>
        <span className={styles.legendDots} aria-hidden>
          {STATUSES.map((s) =>
            visibleStatuses.includes(s) ? (
              <span key={s} className={styles.legendMiniDot} style={{ background: STATUS_COLOR[s] }} />
            ) : null,
          )}
        </span>
        <span className={styles.legendChevron} aria-hidden>
          ▾
        </span>
      </button>
      <div className={styles.legendBody}>
      <div className={styles.legendRow}>
        {STATUSES.map((s) => {
          const on = visibleStatuses.includes(s)
          const color = STATUS_COLOR[s]
          return (
            <button
              key={s}
              type="button"
              className={`${styles.legendChip} ${on ? '' : styles.legendChipOff}`}
              onClick={() => onToggleStatus(s)}
              aria-pressed={on}
              style={on ? { background: color, borderColor: color, color: '#fff' } : undefined}
            >
              {on ? (
                <span className={styles.legendCheck} aria-hidden>
                  ✓
                </span>
              ) : (
                <span className={styles.legendDot} style={{ background: color }} />
              )}
              <span className={styles.legendLabel}>{STATUS_LABEL[s]}</span>
              <span className={styles.legendCount}>{counts[s]}</span>
            </button>
          )
        })}
      </div>
      <select
        className={styles.legendSelect}
        value={visibleCategory}
        onChange={(e) => onCategoryChange(e.target.value as CategoryId | 'all')}
        aria-label="Filter by category"
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      </div>
    </div>
  )
}
