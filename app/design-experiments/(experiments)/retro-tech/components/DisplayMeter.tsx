'use client';

import styles from './DisplayMeter.module.css';

export function DisplayMeter({ levels }: { levels: number[] }) {
  return (
    <div className={styles.displayMeter}>
      {levels.map((l, i) => (
        <div
          key={i}
          className={`${styles.bar} ${l > 0 ? styles.filled : ''} ${l > 80 ? styles.peak : ''}`}
          style={{ height: `${Math.max(4, l)}%` }}
        />
      ))}
      <div className={styles.scanlines} />
    </div>
  );
}
