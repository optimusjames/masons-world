import styles from './MetricReadout.module.css';

interface MetricReadoutProps {
  label: string;
  value: string | number;
  className?: string;
}

export function MetricReadout({ label, value, className }: MetricReadoutProps) {
  return (
    <div className={`${styles.readout} ${className || ''}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
}
