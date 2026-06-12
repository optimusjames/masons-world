'use client'

import styles from '../styles.module.css'

export default function StatsStrip({
  reported,
  fixed,
}: {
  reported: number
  fixed: number
}) {
  return (
    <div className={styles.stats}>
      <div className={styles.stat}>
        <span className={styles.statNum}>{reported.toLocaleString()}</span>
        <span className={styles.statLabel}>reported this month</span>
      </div>
      <div className={styles.statDivider} />
      <div className={styles.stat}>
        <span className={styles.statNum}>{fixed.toLocaleString()}</span>
        <span className={styles.statLabel}>fixed this month</span>
      </div>
    </div>
  )
}
