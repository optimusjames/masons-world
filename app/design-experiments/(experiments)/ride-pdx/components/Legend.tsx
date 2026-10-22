'use client'

// One small pill that says how fresh the bikes are, and opens into the key.
//
// The key and the layer toggles are the same list: each row shows the mark and,
// while browsing, switches it on and off. During the trip flow the steps decide
// what is on the map, so the rows are a plain key there and cannot be toggled.

import { useState, type ReactNode } from 'react'
import { ChevronDown, RefreshCw } from 'lucide-react'
import styles from '../styles.module.css'
import type { BikeData, LayerId, PlaceCategory } from '../types'
import { fmtClock } from './FlowSheet'
import { CATEGORIES } from './scale'

type Props = {
  bikes: BikeData
  refreshing: boolean
  onRefresh: () => void
  /** Present only while browsing, when the visitor owns what is shown. */
  toggles?: {
    layers: LayerId[]
    categories: PlaceCategory[]
    onLayer: (id: LayerId) => void
    onCategory: (id: PlaceCategory) => void
  }
}

const VEHICLE_ROWS: { id: LayerId; label: string; mark: 'badge' | 'e' | 's' }[] = [
  { id: 'station', label: 'Station, bikes ready', mark: 'badge' },
  { id: 'ebike', label: 'E-bike on the street', mark: 'e' },
  { id: 'scooter', label: 'Scooter on the street', mark: 's' },
]

export default function Legend({ bikes, refreshing, onRefresh, toggles }: Props) {
  // Closed by default everywhere: the map is the point, and the pill alone
  // already says the one thing everyone needs, how old the bikes are.
  const [open, setOpen] = useState(false)

  const row = (key: string, on: boolean, onClick: (() => void) | undefined, mark: ReactNode, label: string) =>
    onClick ? (
      <button key={key} type="button" className={styles.keyRow} data-on={on} aria-pressed={on} onClick={onClick}>
        {mark}
        <span>{label}</span>
        <span className={styles.keySwitch} data-on={on} aria-hidden />
      </button>
    ) : (
      <div key={key} className={styles.keyRow}>
        {mark}
        <span>{label}</span>
      </div>
    )

  return (
    <div className={styles.legend} data-collapsed={!open}>
      <button
        type="button"
        className={styles.legendHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.liveDot} data-live={bikes.live} aria-hidden />
        <span>
          {bikes.live ? 'Live' : 'Snapshot'} · {fmtClock(bikes.asOf)}
        </span>
        <ChevronDown size={14} className={styles.legendChevron} aria-hidden />
      </button>

      <div className={styles.legendBody}>
        {VEHICLE_ROWS.map((r) =>
          row(
            r.id,
            toggles ? toggles.layers.includes(r.id) : true,
            toggles ? () => toggles.onLayer(r.id) : undefined,
            r.mark === 'badge' ? (
              <span className={styles.keyBadge}>7</span>
            ) : (
              <span className={styles.keyDot} data-kind={r.mark} />
            ),
            r.label,
          ),
        )}
        {row(
          'empty',
          true,
          undefined,
          <span className={styles.keyBadge} data-state="empty">
            0
          </span>,
          'Station, nothing to rent',
        )}

        {toggles && (
          <>
            <div className={styles.keyDivider} />
            {CATEGORIES.map((c) =>
              row(
                c.id,
                toggles.layers.includes('place') && toggles.categories.includes(c.id),
                () => toggles.onCategory(c.id),
                <span className={styles.keyPlace} style={{ background: c.tint }}>
                  <c.Icon size={12} strokeWidth={2.4} />
                </span>,
                c.plural,
              ),
            )}
            <p className={styles.keyNote}>Places appear as you zoom in.</p>
          </>
        )}

        {!bikes.live && (
          <p className={styles.keyNote}>The live feed did not answer, so these are saved positions.</p>
        )}
        <button type="button" className={styles.refreshBtn} onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={12} strokeWidth={2.4} /> {refreshing ? 'Checking…' : 'Refresh bikes'}
        </button>
      </div>
    </div>
  )
}
