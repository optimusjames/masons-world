'use client';

import { useCallback, useRef, useState } from 'react';
import styles from './Knob.module.css';

interface KnobProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  size?: number;
  min?: number;
  max?: number;
  showValue?: boolean;
  formatValue?: (v: number) => string;
}

export function Knob({ value, onChange, label, size = 48, min = 0, max = 100, showValue = true, formatValue }: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startVal = useRef(0);
  const [dragging, setDragging] = useState(false);

  const pct = (value - min) / (max - min);
  const rotation = -135 + pct * 270;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    knobRef.current?.setPointerCapture(e.pointerId);
    startY.current = e.clientX;
    startVal.current = value;
    setDragging(true);
  }, [value]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - startY.current;
    const range = max - min;
    const newVal = Math.round(Math.min(max, Math.max(min, startVal.current + (delta / 120) * range)));
    onChange(newVal);
  }, [dragging, min, max, onChange]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const display = formatValue ? formatValue(value) : String(value);

  return (
    <div className={styles.wrap}>
      <div
        ref={knobRef}
        className={styles.knob}
        style={{ '--knob-size': `${size}px` } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className={styles.indicator} style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }} />
      </div>
      {showValue && <span className={styles.value}>{display}</span>}
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
