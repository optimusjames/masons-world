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
      <div className={styles.legendRow}>
        {STATUSES.map((s) => {
          const on = visibleStatuses.includes(s)
          return (
            <button
              key={s}
              type="button"
              className={`${styles.legendChip} ${on ? '' : styles.legendChipOff}`}
              onClick={() => onToggleStatus(s)}
              aria-pressed={on}
            >
              <span
                className={styles.legendDot}
                style={{ background: STATUS_COLOR[s] }}
              />
              {STATUS_LABEL[s]}
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
