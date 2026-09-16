'use client'

// The legend is how someone learns to read the map, and on this map it is also
// a requirement rather than a courtesy. The palette's aqua sits at 2.49 contrast
// against the map surface, under the 3:1 bar, and the validator's verdict for
// that is "relief required": identity cannot rest on the fill alone. So every
// layer here carries a labelled swatch and a count, not just a color.

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from '../styles.module.css'
import { MAP_CONFIG } from '../map.config'
import type { LayerId } from '../types'
import { FILL_OPACITY, LAYER_COLOR, NEIGHBORHOOD } from './scale'

type Props = {
  visibleLayers: LayerId[]
  onToggleLayer: (id: LayerId) => void
  counts: Record<LayerId, number>
  /** ISO timestamp of the committed snapshot. */
  asOf: string
}

export default function Legend({ visibleLayers, onToggleLayer, counts, asOf }: Props) {
  // Open on a desktop, closed on a phone where it would cover the map. Two ways
  // back in: hover peeks, click pins. Hover alone strands touch users; click
  // alone hides the key behind a guess that there is anything to open.
  const [pinned, setPinned] = useState(true)
  const [hovered, setHovered] = useState(false)
  const open = pinned || hovered

  useEffect(() => {
    if (window.matchMedia('(max-width: 760px)').matches) setPinned(false)
  }, [])

  // Touch browsers fire mouseenter on tap, which would leave the panel stuck
  // open after a tap meant to close it. Only trust hover where hover is real.
  const canHover = useRef(false)
  useEffect(() => {
    canHover.current = window.matchMedia('(hover: hover)').matches
  }, [])

  const toggle = useCallback(() => {
    setPinned((p) => {
      if (p) setHovered(false)
      return !p
    })
  }, [])

  return (
    <div
      className={styles.legend}
      data-collapsed={!open}
      onMouseEnter={() => canHover.current && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className={styles.legendHeader}
        onClick={toggle}
        aria-expanded={open}
      >
        <span>Showing on map</span>
        <span className={styles.legendChevron} aria-hidden>
          ▾
        </span>
      </button>

      <div className={styles.legendBody}>
        <div className={styles.legendRow}>
          {MAP_CONFIG.layers.map((layer) => {
            const on = visibleLayers.includes(layer.id)
            const color = LAYER_COLOR[layer.id]
            const isHood = layer.id === 'neighborhood'
            return (
              <button
                key={layer.id}
                type="button"
                className={`${styles.legendChip} ${on ? '' : styles.legendChipOff}`}
                onClick={() => onToggleLayer(layer.id)}
                aria-pressed={on}
              >
                {/* Each chip shows the mark the map actually draws: a filled
                    square for the polygon layers, a dot for the garden points,
                    a dashed rule for the boundaries. */}
                {isHood ? (
                  <span className={styles.legendDash} style={{ borderColor: NEIGHBORHOOD }} />
                ) : layer.id === 'garden' ? (
                  <span className={styles.legendDot} style={{ background: color }} />
                ) : (
                  <span
                    className={styles.legendSwatch}
                    style={{
                      background: color,
                      opacity: (FILL_OPACITY[layer.id] ?? 0.4) + 0.35,
                      borderColor: color,
                    }}
                  />
                )}
                <span className={styles.legendLabel}>{layer.label}</span>
                <span className={styles.legendCount}>
                  {(counts[layer.id] ?? 0).toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>

        <div className={styles.legendNote}>
          Parks and natural areas overlap where the city manages both.
          <br />
          Click a shape or a garden for details, or a neighborhood line for that
          neighborhood.
        </div>

        <div className={styles.legendFoot}>
          <span className={styles.legendAsOf}>{formatAsOf(asOf)}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Snapshot date, not a clock.
 *
 * Parks and gardens move on the order of years, so an age in minutes would be
 * false precision about data that has not changed since the city last edited
 * it. The date is the honest unit here.
 */
function formatAsOf(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `City data as of ${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`
}
