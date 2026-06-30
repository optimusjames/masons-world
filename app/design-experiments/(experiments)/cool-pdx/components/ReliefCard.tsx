'use client'

import styles from '../styles.module.css'
import type { ReliefResult, ReliefKind, Spot } from '../types'

type Props = {
  result: ReliefResult
  selFountain: number
  selCooling: number
  onSelect: (kind: ReliefKind, idx: number) => void
  onClose: () => void
}

function fmtDist(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`
  return `${(m / 1000).toFixed(1)} km`
}

function walkMin(m: number): number {
  return Math.max(1, Math.round(m / 80))
}

function directionsUrl(coord: [number, number]): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coord[0]},${coord[1]}&travelmode=walking`
}

function Column({
  kind,
  eyebrow,
  color,
  spots,
  selected,
  onSelect,
}: {
  kind: ReliefKind
  eyebrow: string
  color: string
  spots: Spot[]
  selected: number
  onSelect: (kind: ReliefKind, idx: number) => void
}) {
  return (
    <div className={styles.reliefRow} style={{ borderLeftColor: color }}>
      <div className={styles.reliefEyebrow} style={{ color }}>
        <span className={styles.reliefIcon} style={{ background: color }} />
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
                  href={directionsUrl(s.coord)}
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
          eyebrow="Cold water"
          color="#2b8fd0"
          spots={result.fountains}
          selected={selFountain}
          onSelect={onSelect}
        />
        <Column
          kind="cooling"
          eyebrow="Cool air · AC"
          color="#6366f1"
          spots={result.cooling}
          selected={selCooling}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}
