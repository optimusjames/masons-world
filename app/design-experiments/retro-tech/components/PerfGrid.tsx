'use client';

import { useRef, useState, useEffect } from 'react';
import styles from './PerfGrid.module.css';

export function PerfGrid({ inline, className }: { inline?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const dot = 4;
  const gap = 4;
  const pitch = dot + gap;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const cols = Math.floor((width + gap) / pitch);
      const rows = Math.floor((height + gap) / pitch);
      setCount(cols * rows);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.perfGrid} ${inline ? styles.inline : ''} ${className ?? ''}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.perfHole} />
      ))}
    </div>
  );
}
