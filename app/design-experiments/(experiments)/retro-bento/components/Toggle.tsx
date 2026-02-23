import styles from './Toggle.module.css';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <div className={styles.wrap} onClick={(e) => { e.stopPropagation(); onChange(!value); }}>
      <div className={`${styles.track} ${value ? styles.trackOn : ''}`}>
        <div className={`${styles.thumb} ${value ? styles.thumbOn : ''}`} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
