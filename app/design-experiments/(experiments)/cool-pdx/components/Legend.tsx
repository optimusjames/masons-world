'use client'

import styles from '../styles.module.css'

export default function Legend() {
  return (
    <div className={styles.legend}>
      <span className={styles.legendItem}>
        <span className={styles.canopyRamp} />
        Less shade → more shade
      </span>
      <span className={styles.legendItem}>
        <span className={styles.swatch} style={{ background: '#2b8fd0', borderRadius: '50%' }} />
        Drinking fountain
      </span>
      <span className={styles.legendItem}>
        <span className={styles.swatch} style={{ background: '#6366f1', borderRadius: '50%' }} />
        Library / community center
      </span>
    </div>
  )
}
