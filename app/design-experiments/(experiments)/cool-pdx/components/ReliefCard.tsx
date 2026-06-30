'use client'

import styles from '../styles.module.css'
import type { NearestResult, NearestSpot } from '../types'

type Props = {
  nearest: NearestResult
  onClose: () => void
}

function fmtDist(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m away`
  return `${(m / 1000).toFixed(1)} km away`
}

function Row({ spot, color }: { spot: NearestSpot | null; color: string }) {
  if (!spot) return null
  return (
    <div className={styles.reliefRow}>
      <span className={styles.reliefIcon} style={{ background: color }} />
      <div>
        <div className={styles.reliefName}>{spot.label}</div>
        <div className={styles.reliefMeta}>
          {spot.sub} · {fmtDist(spot.distM)}
        </div>
      </div>
    </div>
  )
}

export default function ReliefCard({ nearest, onClose }: Props) {
  const hasAny = nearest.fountain || nearest.cooling
  return (
    <div className={styles.reliefCard}>
      <div className={styles.reliefHead}>
        <span className={styles.reliefTitle}>Nearest relief</span>
        <button type="button" className={styles.reliefClose} onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      {hasAny ? (
        <>
          <Row spot={nearest.fountain} color="#2b8fd0" />
          <Row spot={nearest.cooling} color="#6366f1" />
        </>
      ) : (
        <p className={styles.reliefEmpty}>No mapped relief found nearby. Try panning the map.</p>
      )}
    </div>
  )
}
