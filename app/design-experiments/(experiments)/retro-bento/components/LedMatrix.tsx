'use client';

import { useCallback, useState } from 'react';
import styles from './LedMatrix.module.css';

interface LedMatrixProps {
  data: number[];
  cols?: number;
  className?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function LedMatrix({ data: initialData, cols = 7, className }: LedMatrixProps) {
  const [data, setData] = useState(initialData);

  const handleShuffle = useCallback(() => {
    setData(shuffle(initialData));
  }, [initialData]);

  return (
    <div
      className={`${styles.matrix} ${className || ''}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      onClick={handleShuffle}
    >
      {data.map((level, i) => (
        <div
          key={i}
          className={`${styles.dot} ${styles[`level${Math.min(level, 4)}`]}`}
        />
      ))}
    </div>
  );
}
