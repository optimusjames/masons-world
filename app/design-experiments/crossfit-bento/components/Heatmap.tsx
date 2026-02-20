'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import css from './Heatmap.module.css';

interface HeatmapProps {
  data: number[];
  cols: number;
  colorStops: string[];
  renderCell?: (level: number, index: number) => ReactNode;
}

export function Heatmap({ data, cols, colorStops, renderCell }: HeatmapProps) {
  return (
    <div
      className={css.grid}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {data.map((level, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const waveDelay = (row + col) * 0.02;
        const isMax = level === colorStops.length - 1;

        return (
          <motion.div
            key={i}
            className={css.cell}
            style={{
              background: colorStops[level] ?? colorStops[0],
              display: isMax ? 'flex' : undefined,
              alignItems: isMax ? 'center' : undefined,
              justifyContent: isMax ? 'center' : undefined,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 300,
              delay: waveDelay,
            }}
          >
            {renderCell && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 400,
                  delay: waveDelay + 0.15,
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
