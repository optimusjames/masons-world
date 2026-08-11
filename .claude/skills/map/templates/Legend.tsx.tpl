'use client'

// The legend is how someone learns to read the map, so it carries three things
// the map itself cannot say: what the colors mean, what UNIT the numbers are
// in, and HOW OLD the reading is.

import { useEffect, useState } from 'react'
import styles from '../styles.module.css'
import { MAP_CONFIG } from '../map.config'
import type { LayerId } from '../types'
import { BANDS } from './scale'

type Props = {
  visibleLayers: LayerId[]
  onToggleLayer: (id: LayerId) => void
  counts: Record<LayerId, number>
  /** ISO timestamp of the data being shown. */
  asOf?: string
}

export default function Legend({ visibleLayers, onToggleLayer, counts, asOf }: Props) {
  // Collapsed on phones, where the panel eats too much of the map.
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 540px)').matches) {
      setCollapsed(true)
    }
  }, [])

  const scaleUnit = MAP_CONFIG.layers.find((l) => l.encoding !== 'categorical')?.unit

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
        {/* Ordered scale, with its unit stated. */}
        {BANDS.length > 0 && (
          <div className={styles.legendScale}>
            {scaleUnit && <div className={styles.legendUnit}>{scaleUnit}</div>}
            <div className={styles.legendRamp}>
              {BANDS.map((b) => (
                <div key={b.label} className={styles.legendBand}>
                  <span
                    className={styles.legendSwatch}
                    style={{ background: b.color, width: b.radius * 2, height: b.radius * 2 }}
                  />
                  <span className={styles.legendBandLabel}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer toggles. */}
        <div className={styles.legendRow}>
          {MAP_CONFIG.layers.map((layer) => {
            const on = visibleLayers.includes(layer.id)
            return (
              <button
                key={layer.id}
                type="button"
                className={`${styles.legendChip} ${on ? '' : styles.legendChipOff}`}
                onClick={() => onToggleLayer(layer.id)}
                aria-pressed={on}
              >
                <span className={styles.legendLabel}>{layer.label}</span>
                <span className={styles.legendCount}>{counts[layer.id] ?? 0}</span>
              </button>
            )
          })}
        </div>

        {asOf && (
          <div className={styles.legendAsOf}>
            Readings as of {new Date(asOf).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  )
}
