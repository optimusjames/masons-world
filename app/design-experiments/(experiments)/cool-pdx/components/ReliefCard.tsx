'use client'

import styles from '../styles.module.css'
import { LayerGlyph } from './icons'
import type { LayerId, ReliefResult, ReliefKind, Spot } from '../types'

type Props = {
  result: ReliefResult
  selFountain: number
  selCooling: number
  onSelect: (kind: ReliefKind, idx: number) => void
  onClose: () => void
}

function fmtDist(m: number): string {
  const feet = m * 3.28084
  // Feet under ~1000 ft (~0.19 mi); miles with one decimal beyond that.
  if (feet < 1000) return `${Math.round(feet / 10) * 10} ft`
  return `${(m / 1609.34).toFixed(1)} mi`
}

function walkMin(m: number): number {
  return Math.max(1, Math.round(m / 80))
}

// Real route needs both ends: origin is the searched spot, so Google draws the
// same walk we show on screen instead of guessing the start from device location.
function directionsUrl(origin: [number, number], dest: [number, number]): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${origin[0]},${origin[1]}` +
    `&destination=${dest[0]},${dest[1]}` +
    `&travelmode=walking`
  )
}

function Column({
  kind,
  iconId,
  eyebrow,
  color,
  spots,
  selected,
  origin,
  onSelect,
}: {
  kind: ReliefKind
  iconId: LayerId
  eyebrow: string
  color: string
  spots: Spot[]
  selected: number
  origin: [number, number]
  onSelect: (kind: ReliefKind, idx: number) => void
}) {
  return (
    <div className={styles.reliefRow} style={{ borderLeftColor: color }}>
      <div className={styles.reliefEyebrow} style={{ color }}>
        <LayerGlyph id={iconId} size={13} className={styles.reliefGlyph} />
        {eyebrow}
      </div>
      <div className={styles.optionList}>
        {spots.length === 0 && <div className={styles.optEmpty}>None mapped nearby</div>}
        {spots.map((s, i) => {
          const isSel = i === selected
          return (
            <div key={`${s.label}-${i}`} className={styles.optionWrap}>
              <button
                type="button"
                className={`${styles.option} ${isSel ? styles.optionSelected : ''}`}
                style={isSel ? { borderColor: color } : undefined}
                onClick={() => onSelect(kind, i)}
                aria-pressed={isSel}
              >
                <span className={styles.optName}>{s.label}</span>
                <span className={styles.optMeta}>
                  {s.sub && s.sub !== s.label ? `${s.sub} · ` : ''}
                  {fmtDist(s.distM)} · ~{walkMin(s.distM)} min
                </span>
              </button>
              {isSel && (
                <a
                  className={styles.reliefDirections}
                  style={{ color }}
                  href={directionsUrl(origin, s.coord)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions ↗
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ReliefCard({ result, selFountain, selCooling, onSelect, onClose }: Props) {
  return (
    <div className={styles.reliefCard}>
      <div className={styles.reliefAccent} />
      <div className={styles.reliefHead}>
        <div>
          <div className={styles.reliefTitle}>Nearest relief</div>
          <div className={styles.reliefSub}>from {result.originLabel} · tap an option for its route</div>
        </div>
        <button type="button" className={styles.reliefClose} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className={styles.reliefRows}>
        <Column
          kind="fountain"
          iconId="fountains"
          eyebrow="Cold water"
          color="#2b8fd0"
          spots={result.fountains}
          selected={selFountain}
          origin={result.origin}
          onSelect={onSelect}
        />
        <Column
          kind="cooling"
          iconId="cooling"
          eyebrow="Cool air · AC"
          color="#6366f1"
          spots={result.cooling}
          selected={selCooling}
          origin={result.origin}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}
