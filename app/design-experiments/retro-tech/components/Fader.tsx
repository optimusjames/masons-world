'use client';

import type { FaderState } from '../types';
import styles from './Fader.module.css';

export function Fader({
  label,
  fader,
  className,
}: {
  label: string;
  fader: FaderState;
  className?: string;
}) {
  return (
    <div className={`${styles.controlGroup} ${className ?? ''}`}>
      <div
        className={styles.faderTrack}
        ref={fader.trackRef}
        onPointerDown={fader.onPointerDown}
        onPointerMove={fader.onPointerMove}
        onPointerUp={fader.onPointerUp}
      >
        <div className={styles.faderFill} style={{ height: `${fader.pct}%` }} />
        <div className={styles.faderThumb} style={{ bottom: `${fader.pct}%` }} />
      </div>
      <span className={styles.controlLabel}>{label}</span>
    </div>
  );
}
