'use client';

import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import styles from './LedMatrix.module.css';

interface LedMatrixProps {
  data: number[];
  cols?: number;
  className?: string;
  onTap?: () => void;
}

export interface LedMatrixHandle {
  collapse: () => Promise<void>;
  expand: () => Promise<void>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomDelays(count: number, stagger = 0.003): number[] {
  const order = shuffle(Array.from({ length: count }, (_, i) => i));
  const delays = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    delays[order[i]] = i * stagger;
  }
  return delays;
}

function reshuffleData(data: number[]): number[] {
  return data.map((level) => {
    const shift = Math.floor(Math.random() * 3) - 1;
    return Math.max(0, Math.min(4, level + shift));
  });
}

export const LedMatrix = forwardRef<LedMatrixHandle, LedMatrixProps>(
  function LedMatrix({ data: initialData, cols = 7, className, onTap }, ref) {
    const [data, setData] = useState(initialData);
    const controls = useAnimationControls();
    const animatingRef = useRef(false);

    useEffect(() => {
      const delays = randomDelays(initialData.length);
      controls.start((i: number) => ({
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.15,
          delay: delays[i],
        },
      }));
    }, []);

    const collapse = useCallback(async () => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      const delays = randomDelays(initialData.length, 0.002);
      await controls.start((i: number) => ({
        scale: 0,
        opacity: 0,
        transition: {
          duration: 0.08,
          delay: delays[i],
        },
      }));
      animatingRef.current = false;
    }, [initialData.length, controls]);

    const expand = useCallback(async () => {
      if (animatingRef.current) return;
      animatingRef.current = true;
      setData(reshuffleData(initialData));
      await new Promise((r) => requestAnimationFrame(r));
      const delays = randomDelays(initialData.length);
      await controls.start((i: number) => ({
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.15,
          delay: delays[i],
        },
      }));
      animatingRef.current = false;
    }, [initialData, controls]);

    useImperativeHandle(ref, () => ({ collapse, expand }), [collapse, expand]);

    const gridStyle = { gridTemplateColumns: `repeat(${cols}, 1fr)` };

    return (
      <div
        className={`${styles.container} ${className || ''}`}
        onClick={(e) => { e.stopPropagation(); onTap?.(); }}
      >
        <div className={styles.matrix} style={gridStyle}>
          {initialData.map((_, i) => (
            <div key={i} className={styles.backdropDot} />
          ))}
        </div>
        <div className={`${styles.matrix} ${styles.overlay}`} style={gridStyle}>
          {data.map((level, i) => (
            <motion.div
              key={i}
              custom={i}
              animate={controls}
              initial={{ scale: 0, opacity: 0 }}
              className={`${styles.dot} ${styles[`level${Math.min(level, 4)}`]}`}
            />
          ))}
        </div>
      </div>
    );
  }
);
