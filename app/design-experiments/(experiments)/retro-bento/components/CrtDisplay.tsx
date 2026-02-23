import { ReactNode } from 'react';
import styles from './CrtDisplay.module.css';

interface CrtDisplayProps {
  children: ReactNode;
  className?: string;
}

export function CrtDisplay({ children, className }: CrtDisplayProps) {
  return (
    <div className={`${styles.display} ${className || ''}`}>
      <div className={styles.scanlines} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
