import styles from '../styles.module.css'

export default function Legend() {
  return (
    <div className={styles.legend}>
      <span className={styles.legendRow}>
        <span className={styles.legendDot} style={{ background: '#ef4444' }} />
        Fatal intersection
      </span>
      <span className={styles.legendRow}>
        <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
        Serious injury
      </span>
      <span
        className={styles.legendRow}
        style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.44)' }}
      >
        Source: Portland Open Data
      </span>
    </div>
  )
}
