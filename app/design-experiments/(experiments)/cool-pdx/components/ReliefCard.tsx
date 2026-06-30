'use client'

import styles from '../styles.module.css'
import type { NearestResult, NearestSpot } from '../types'

type Props = {
  nearest: NearestResult
  onClose: () => void
}

function fmtDist(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`
  return `${(m / 1000).toFixed(1)} km`
}

// ~80 m/min is a relaxed walking pace.
function walkMin(m: number): number {
  return Math.max(1, Math.round(m / 80))
}

function directionsUrl(coord: [number, number]): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${coord[0]},${coord[1]}`
}

function Row({
  spot,
  eyebrow,
  color,
}: {
  spot: NearestSpot | null
  eyebrow: string
  color: string
}) {
  if (!spot) return null
  return (
    <div className={styles.reliefRow} style={{ borderLeftColor: color }}>
      <div className={styles.reliefEyebrow} style={{ color }}>
        <span className={styles.reliefIcon} style={{ background: color }} />
        {eyebrow}
      </div>
      <div className={styles.reliefName}>{spot.label}</div>
      <div className={styles.reliefMeta}>
        {spot.sub && spot.sub !== spot.label ? `${spot.sub} · ` : ''}
        {fmtDist(spot.distM)} · ~{walkMin(spot.distM)} min walk
      </div>
      <a
        className={styles.reliefDirections}
        href={directionsUrl(spot.coord)}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color }}
      >
        Directions ↗
      </a>
    </div>
  )
}

export default function ReliefCard({ nearest, onClose }: Props) {
  const hasAny = nearest.fountain || nearest.cooling
  return (
    <div className={styles.reliefCard}>
      <div className={styles.reliefAccent} />
      <div className={styles.reliefHead}>
        <div>
          <div className={styles.reliefTitle}>Nearest relief</div>
          <div className={styles.reliefSub}>Closest places to cool down right now</div>
        </div>
        <button type="button" className={styles.reliefClose} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      {hasAny ? (
        <div className={styles.reliefRows}>
          <Row spot={nearest.fountain} eyebrow="Cold water" color="#2b8fd0" />
          <Row spot={nearest.cooling} eyebrow="Cool air · AC" color="#6366f1" />
        </div>
      ) : (
        <p className={styles.reliefEmpty} style={{ padding: '12px 16px' }}>
          No mapped relief found nearby. Try panning the map.
        </p>
      )}
    </div>
  )
}
