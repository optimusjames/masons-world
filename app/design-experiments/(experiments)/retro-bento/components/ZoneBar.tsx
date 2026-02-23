import { CSSProperties } from 'react';
import styles from './ZoneBar.module.css';

interface Zone {
  label: string;
  pct: number;
}

interface ZoneBarProps {
  zones: Zone[];
  className?: string;
  style?: CSSProperties;
}

export function ZoneBar({ zones, className, style }: ZoneBarProps) {
  return (
    <div className={className} style={style}>
      <div className={styles.bar}>
        {zones.map((zone, i) => (
          <div
            key={i}
            className={styles.segment}
            style={{ flex: zone.pct, opacity: 0.25 + (i / Math.max(zones.length - 1, 1)) * 0.5 }}
          />
        ))}
      </div>
      <div className={styles.labels}>
        {zones.map((zone, i) => (
          <span key={i} className={styles.label}>{zone.label}</span>
        ))}
      </div>
    </div>
  );
}
