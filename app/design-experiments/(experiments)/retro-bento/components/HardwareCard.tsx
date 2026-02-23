import { ReactNode } from 'react';
import styles from './HardwareCard.module.css';

interface HardwareCardProps {
  children: ReactNode;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function HardwareCard({ children, label, className, onClick }: HardwareCardProps) {
  return (
    <div className={`${styles.panel} ${className || ''}`} onClick={onClick}>
      <div className={`${styles.screw} ${styles.tl}`} />
      <div className={`${styles.screw} ${styles.tr}`} />
      <div className={`${styles.screw} ${styles.bl}`} />
      <div className={`${styles.screw} ${styles.br}`} />
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
