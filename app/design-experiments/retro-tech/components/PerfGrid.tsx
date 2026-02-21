import styles from './PerfGrid.module.css';

export function PerfGrid({ inline, className }: { inline?: boolean; className?: string }) {
  return (
    <div
      className={`${styles.perfGrid} ${inline ? styles.inline : ''} ${className ?? ''}`}
    />
  );
}
