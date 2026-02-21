'use client';

import { ReactNode } from 'react';
import styles from './SwissFrame.module.css';

interface SwissFrameProps {
  logo: string;
  meta: string;
  subLabels: string[];
  footerLabels: string[];
  variant?: 'dark' | 'light';
  children: ReactNode;
}

export function SwissFrame({
  logo,
  meta,
  subLabels,
  footerLabels,
  variant = 'dark',
  children,
}: SwissFrameProps) {
  return (
    <div className={`${styles.frame} ${styles[variant]}`}>
      <header className={styles.header}>
        <div className={styles.rule} />
        <div className={styles.headerRow}>
          <span className={styles.logo}>{logo}</span>
          <span className={styles.meta}>{meta}</span>
        </div>
        <div className={styles.rule} />
        <div className={styles.subRow}>
          {subLabels.map((label) => (
            <span key={label} className={styles.label}>{label}</span>
          ))}
        </div>
        <div className={styles.rule} />
      </header>

      {children}

      <footer className={styles.footer}>
        <div className={styles.rule} />
        <div className={styles.footerRow}>
          {footerLabels.map((label) => (
            <span key={label} className={styles.label}>{label}</span>
          ))}
        </div>
        <div className={styles.rule} />
      </footer>
    </div>
  );
}
