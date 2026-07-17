'use client'

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
  return (
    <div className={styles.legend}>
      <div className={styles.legendHeader}>Showing on map</div>
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
  )
}
