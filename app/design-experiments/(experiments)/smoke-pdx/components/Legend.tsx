'use client'

// The legend carries the three things the map itself cannot say: what the
// colors mean, what unit the numbers are in, and how old the reading is.

import { useEffect, useState } from 'react'
import styles from '../styles.module.css'
import { MAP_CONFIG } from '../map.config'
import type { LayerId } from '../types'
import { AQI_BANDS, FIRE, WIND } from './scale'

type Props = {
  visibleLayers: LayerId[]
  onToggleLayer: (id: LayerId) => void
  counts: Record<LayerId, number>
  reporting: number
  asOf: string
  live: boolean | undefined
  refreshing: boolean
  /** Result of the last Refresh press, or null when nothing was pressed. */
  checked: 'new' | 'current' | 'failed' | null
  onRefresh: () => void
}

export default function Legend({
  visibleLayers,
  onToggleLayer,
  counts,
  reporting,
  asOf,
  live,
  refreshing,
  checked,
  onRefresh,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 540px)').matches) {
      setCollapsed(true)
    }
  }, [])

  // Age has to be computed after mount. Rendering it on the server would bake in
  // the build time and mismatch on hydration. Re-tick every half minute so a
  // page left open does not keep claiming the data is fresh.
  const [age, setAge] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => setAge(formatAge(asOf))
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [asOf])

  const showAqi = visibleLayers.includes('monitor')

  return (
    <div className={styles.legend} data-collapsed={collapsed}>
      <button
        type="button"
        className={styles.legendHeader}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span>Showing on map</span>
        <span className={styles.legendChevron} aria-hidden>
          ▾
        </span>
      </button>

      <div className={styles.legendBody}>
        {showAqi && (
          <div>
            <div className={styles.legendUnit}>US AQI · NowCast PM2.5</div>
            {/* One continuous bar instead of six stacked rows. Reads faster,
                takes a third of the height, and matches how every other air
                quality map presents the scale. */}
            <div className={styles.legendBar}>
              {AQI_BANDS.map((b) => (
                <span
                  key={b.label}
                  className={styles.legendBarSeg}
                  style={{ background: b.color }}
                  title={`${b.label} · ${b.short}`}
                />
              ))}
            </div>
            <div className={styles.legendBarTicks}>
              <span>0</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>300+</span>
            </div>
            <div className={styles.legendBarEnds}>
              <span>Good</span>
              <span>Hazardous</span>
            </div>
          </div>
        )}

        <div className={styles.legendRow}>
          {MAP_CONFIG.layers.map((layer) => {
            const on = visibleLayers.includes(layer.id)
            const swatch =
              layer.id === 'wind' ? WIND : layer.id === 'perimeter' ? FIRE : '#00a651'
            return (
              <button
                key={layer.id}
                type="button"
                className={`${styles.legendChip} ${on ? '' : styles.legendChipOff}`}
                onClick={() => onToggleLayer(layer.id)}
                aria-pressed={on}
              >
                {/* Wind shows its actual mark, so the chevrons on the map are
                    identifiable without guessing. */}
                {layer.id === 'wind' ? (
                  <svg className={styles.legendChevronMark} viewBox="0 0 12 12" aria-hidden>
                    <path
                      d="M2 8 L6 4 L10 8"
                      fill="none"
                      stroke={WIND}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className={styles.legendDot} style={{ background: swatch }} />
                )}
                <span className={styles.legendLabel}>{layer.label}</span>
                <span className={styles.legendCount}>
                  {layer.id === 'monitor' ? reporting : counts[layer.id] ?? 0}
                </span>
              </button>
            )
          })}
        </div>

        <div className={styles.legendNote}>
          {visibleLayers.includes('monitor') && (
            <>
              <strong>{reporting}</strong> of {counts.monitor} monitors reporting.
              Click any dot for its reading.
              <br />
            </>
          )}
          {visibleLayers.includes('wind') && (
            <>
              Chevrons point the way the wind is blowing.
              <br />
            </>
          )}
          {visibleLayers.includes('perimeter') && <>Click a fire for acreage and containment.</>}
        </div>

        <div className={styles.legendFoot}>
          <span className={styles.legendAsOf} title={formatAsOf(asOf)}>
            {live === false && <span className={styles.legendStale}>saved copy · </span>}
            {checked === 'failed' ? (
              <span className={styles.legendStale}>Could not reach the sources</span>
            ) : checked === 'current' ? (
              <>Already current, checked just now</>
            ) : (
              age ?? formatAsOf(asOf)
            )}
          </span>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Checking…' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  )
}

function formatAsOf(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `as of ${d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })}`
}

/**
 * How old the data is, in the terms someone actually asks the question in. The
 * exact timestamp stays available on hover.
 */
function formatAge(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const mins = Math.floor((Date.now() - d.getTime()) / 60_000)
  if (mins < 1) return 'Updated just now'
  if (mins === 1) return 'Updated 1 minute ago'
  if (mins < 60) return `Updated ${mins} minutes ago`
  const hrs = Math.round(mins / 60)
  if (hrs === 1) return 'Updated 1 hour ago'
  if (hrs < 24) return `Updated ${hrs} hours ago`
  return formatAsOf(iso)
}
