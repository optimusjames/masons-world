import styles from './SegmentedLedBar.module.css';

interface SegmentedLedBarProps {
  value: number;
  segments?: number;
  className?: string;
}

export function SegmentedLedBar({ value, segments = 12, className }: SegmentedLedBarProps) {
  const activeCount = Math.round((value / 100) * segments);

  return (
    <div className={`${styles.bar} ${className || ''}`}>
      {Array.from({ length: segments }, (_, i) => {
        const segIndex = segments - 1 - i;
        const isActive = segIndex < activeCount;
        const pct = segIndex / segments;
        let zone = 'green';
        if (pct >= 0.85) zone = 'red';
        else if (pct >= 0.6) zone = 'yellow';

        return (
          <div
            key={i}
            className={`${styles.segment} ${isActive ? styles[zone] : styles.off}`}
          />
        );
      })}
    </div>
  );
}
