'use client';

import type { KnobState } from '../types';
import styles from './Knob.module.css';

function KnobDots() {
  const dots = [];
  const count = 11;
  for (let i = 0; i < count; i++) {
    const angle = -135 + (i / (count - 1)) * 270;
    const rad = (angle * Math.PI) / 180;
    const r = 44;
    const cx = 50 + r * Math.cos(rad - Math.PI / 2);
    const cy = 50 + r * Math.sin(rad - Math.PI / 2);
    dots.push(
      <div
        key={i}
        className={styles.knobDot}
        style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
      />,
    );
  }
  return <div className={styles.knobDotRing}>{dots}</div>;
}

export function Knob({
  label,
  knob,
  className,
}: {
  label: string;
  knob: KnobState;
  className?: string;
}) {
  return (
    <div className={`${styles.controlGroup} ${className ?? ''}`}>
      <div className={styles.knobContainer}>
        <KnobDots />
        <div
          className={styles.knob}
          onPointerDown={knob.onPointerDown}
          onPointerMove={knob.onPointerMove}
          onPointerUp={knob.onPointerUp}
        />
        <div
          className={styles.knobOverlay}
          style={{ transform: `rotate(${knob.rotation}deg)` }}
        >
          <div className={styles.knobIndicator} />
        </div>
      </div>
      <span className={styles.controlLabel}>{label}</span>
    </div>
  );
}
