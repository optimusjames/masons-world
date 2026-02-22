'use client';

import { ReactNode } from 'react';
import CurtainLink from '../../../components/CurtainLink';
import styles from './SwissFrame.module.css';

interface SwissFrameProps {
  logo: string;
  meta: string;
  subLabels: string[];
  footerLabels: string[];
  variant?: 'dark' | 'light';
  fluid?: boolean;
  backHref?: string;
  children: ReactNode;
}

export function SwissFrame({
  logo,
  meta,
  subLabels,
  footerLabels,
  variant = 'dark',
  fluid = false,
  backHref = '/design-experiments',
  children,
}: SwissFrameProps) {
  return (
    <div className={`${styles.frame} ${styles[variant]}${fluid ? ` ${styles.fluid}` : ''}`}>
      <header className={styles.header}>
        <CurtainLink href={backHref} className={styles.backLink} curtainTransition={true} curtainReverse={true}>
          <span className={styles.backArrow}>&larr;</span> Design
        </CurtainLink>
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
