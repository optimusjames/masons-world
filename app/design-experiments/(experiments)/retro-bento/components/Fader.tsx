'use client';

import { useCallback, useRef, useState } from 'react';
import styles from './Fader.module.css';

interface FaderProps {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  height?: number;
  min?: number;
  max?: number;
  showValue?: boolean;
  formatValue?: (v: number) => string;
}

export function Fader({ value, onChange, label, height = 100, min = 0, max = 100, showValue = true, formatValue }: FaderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pct = (value - min) / (max - min);

  const updateFromPointer = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const y = 1 - (clientY - rect.top) / rect.height;
    const clamped = Math.max(0, Math.min(1, y));
    onChange(Math.round(min + clamped * (max - min)));
  }, [min, max, onChange]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    trackRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromPointer(e.clientY);
  }, [updateFromPointer]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    updateFromPointer(e.clientY);
  }, [dragging, updateFromPointer]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const display = formatValue ? formatValue(value) : String(value);

  return (
    <div className={styles.wrap}>
      {showValue && <span className={styles.value}>{display}</span>}
      <div
        ref={trackRef}
        className={styles.track}
        style={{ '--fader-height': `${height}px` } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className={styles.fill} style={{ height: `${pct * 100}%` }} />
        <div className={styles.thumb} style={{ bottom: `calc(${pct * 100}% - 6px)` }} />
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
