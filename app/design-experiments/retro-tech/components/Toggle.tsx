'use client';

import styles from './Toggle.module.css';

export function Toggle({
  label,
  on,
  onToggle,
  className,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <div className={`${styles.controlGroup} ${className ?? ''}`}>
      <div
        className={`${styles.toggleSwitch} ${on ? styles.on : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') onToggle();
        }}
      >
        <div className={styles.toggleHandle} />
      </div>
      <span className={styles.controlLabel}>{label}</span>
    </div>
  );
}
