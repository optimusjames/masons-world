'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'motion/react';
import css from './Heatmap.module.css';

interface HeatmapProps {
  data: number[];
  cols: number;
  colorStops: string[];
  renderCell?: (level: number, index: number) => ReactNode;
  onShuffle?: () => void;
}

/** Fisher-Yates shuffle returning a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a random delay map: each cell index gets a staggered delay based on a shuffled order */
function randomDelays(count: number, stagger = 0.015): number[] {
  const order = shuffle(Array.from({ length: count }, (_, i) => i));
  const delays = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    delays[order[i]] = i * stagger;
  }
  return delays;
}

export function Heatmap({ data, cols, colorStops, renderCell, onShuffle }: HeatmapProps) {
  const controls = useAnimation();
  const delaysRef = useRef<number[]>([]);
  const [mounted, setMounted] = useState(false);

  // Kick off the entrance animation after hydration (client-only)
  useEffect(() => {
    const delays = randomDelays(data.length);
    delaysRef.current = delays;
    setMounted(true);

    controls.start((i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 300,
        delay: delays[i],
      },
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = useCallback(async () => {
    const collapseDelays = randomDelays(data.length);

    // Scale everything down with random order
    await controls.start((i: number) => ({
      scale: 0,
      opacity: 0,
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 400,
        delay: collapseDelays[i] * 0.5,
      },
    }));

    // Shuffle data + generate new random delay order
    onShuffle?.();
    const newDelays = randomDelays(data.length);
    delaysRef.current = newDelays;

    // Wait a frame so React re-renders with the new colors
    await new Promise((r) => requestAnimationFrame(r));

    // Scale everything back up with new random delays
    await controls.start((i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 15,
        stiffness: 300,
        delay: newDelays[i],
      },
    }));
  }, [controls, data.length, onShuffle]);

  return (
    <div
      className={css.grid}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, cursor: 'pointer' }}
      onClick={handleClick}
    >
      {data.map((level, i) => {
        const isMax = level === colorStops.length - 1;

        return (
          <motion.div
            key={i}
            custom={i}
            className={css.cell}
            animate={controls}
            style={{
              background: colorStops[level] ?? colorStops[0],
              display: isMax ? 'flex' : undefined,
              alignItems: isMax ? 'center' : undefined,
              justifyContent: isMax ? 'center' : undefined,
            }}
            initial={{ scale: 0, opacity: 0 }}
          >
            {mounted && renderCell && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 400,
                  delay: (delaysRef.current[i] ?? 0) + 0.15,
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {renderCell(level, i)}
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
