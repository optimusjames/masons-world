'use client'

// The legend carries the three things the map itself cannot say: what the
// colors mean, what unit the numbers are in, and how old the reading is.

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from '../styles.module.css'
import { MAP_CONFIG } from '../map.config'
import type { LayerId } from '../types'
import { AQI_BANDS, FIRE, WIND } from './scale'

type Props = {
  visibleLayers: LayerId[]
  onToggleLayer: (id: LayerId) => void
  counts: Record<LayerId, number>
  reporting: number
  /** When we last assembled the payload from the sources. */
  asOf: string
  /** The hour the freshest reading is for. */
  observedAt?: string
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
  observedAt,
  live,
  refreshing,
  checked,
  onRefresh,
}: Props) {
  // Open on a desktop, closed on a phone, where it would cover the map.
  //
  // Two ways in once it is closed: hover peeks, click pins. Hover alone would
  // strand touch users, and click alone hides the scale behind a guess that
  // there is anything under the header worth opening.
  const [pinned, setPinned] = useState(true)
  const [hovered, setHovered] = useState(false)
  const open = pinned || hovered

  useEffect(() => {
    // Closed wherever the map is narrow enough that an open panel would be
    // sitting on the map instead of beside it, which now includes the widths
    // where the controls opposite still carry their labels.
    if (window.matchMedia('(max-width: 760px)').matches) setPinned(false)
  }, [])

  // Touch browsers fire mouseenter on tap, which would leave the panel stuck
  // open after a tap meant to close it. Only trust hover where hover is real.
  const canHover = useRef(false)
  useEffect(() => {
    canHover.current = window.matchMedia('(hover: hover)').matches
  }, [])

  // The legend has to describe the mark the map actually drew. MapView draws
  // drifting particles unless the reader has asked for reduced motion, in which
  // case it falls back to the static chevrons, and the same question decides
  // the swatch and the sentence here. Defaulting to the reduced case matches
  // MapView, so the two can never disagree on the first paint.
  const [reducedMotion, setReducedMotion] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const toggle = useCallback(() => {
    setPinned((p) => {
      if (p) setHovered(false)
      return !p
    })
  }, [])

  // Two different clocks, and conflating them is what made this line look
  // broken. `reading` is the hour the data is FOR and only moves when AirNow
  // publishes; `age` is how long ago we last went and looked, which moves on
  // every refresh. One line was being asked to carry both.
  //
  // Both have to be computed after mount. Rendering them on the server would
  // bake in the build time and mismatch on hydration. Re-tick every half minute
  // so a page left open does not keep claiming the data is fresh.
  const [age, setAge] = useState<string | null>(null)
  const [reading, setReading] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => {
      setAge(formatAge(asOf))
      setReading(observedAt ? formatReading(observedAt) : null)
    }
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [asOf, observedAt])

  const showAqi = visibleLayers.includes('monitor')

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
              <span>Moderate</span>
              <span>Unhealthy</span>
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
                {/* Wind shows its actual mark, so what is moving on the map is
                    identifiable without guessing: a trailing particle normally,
                    a chevron when motion is off. */}
                {layer.id === 'wind' ? (
                  reducedMotion ? (
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
                    <svg className={styles.legendChevronMark} viewBox="0 0 14 12" aria-hidden>
                      {/* Head, then a tail that fades, which is exactly what one
                          particle leaves behind on the canvas. */}
                      <path
                        d="M1 6 H5"
                        stroke={WIND}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        opacity="0.3"
                      />
                      <path
                        d="M6 6 H9.5"
                        stroke={WIND}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        opacity="0.75"
                      />
                      <circle cx="11.6" cy="6" r="1.4" fill={WIND} />
                    </svg>
                  )
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

        {/* The chips above already carry the counts, so repeating them here was
            the panel arguing with itself. What is left is the two things the
            marks cannot say. */}
        <div className={styles.legendNote}>
          {visibleLayers.includes('wind') && (
            <>
              {/* "Downwind" is the meteorologist's word for it. What a reader
                  wants to know is where the smoke goes, which is the same fact
                  said in the terms they came with. */}
              {reducedMotion ? (
                'Wind marks point where the smoke is headed.'
              ) : (
                <>
                  Particles drift the way the smoke is headed. Tap the map for the
                  wind speed there.
                </>
              )}
              <br />
            </>
          )}
          Click a monitor or a fire for its numbers.
        </div>

        <div className={styles.legendFoot}>
          <span className={styles.legendAsOf} title={formatAsOf(asOf)}>
            <span className={styles.legendReading}>
              {live === false && <span className={styles.legendStale}>saved copy · </span>}
              {reading ?? age ?? formatAsOf(asOf)}
            </span>
            {/* What the last press found. Separate line, because "we looked"
                and "the data moved" are separate facts and the button only
                controls the first one. */}
            <span className={styles.legendChecked}>
              {checked === 'failed' ? (
                <span className={styles.legendStale}>sources unreachable</span>
              ) : checked === 'current' ? (
                // A successful check is good news. "Nothing new yet" reported
                // the same fact as a small disappointment.
                <>checked just now · up to date</>
              ) : checked === 'new' ? (
                <>checked just now · new readings in</>
              ) : (
                <>checked {age ? age.replace(/^Updated /, '') : 'on load'}</>
              )}
            </span>
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
 * The hour the readings are for. AirNow publishes hourly and with a lag, so this
 * lands an hour or two behind the clock on a perfectly healthy day. Printing the
 * hour rather than an age keeps that from reading as a fault.
 */
function formatReading(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit' })
  const sameDay = d.toDateString() === new Date().toDateString()
  if (sameDay) return `Readings from ${time}`
  return `Readings from ${d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
  })}, ${time}`
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
