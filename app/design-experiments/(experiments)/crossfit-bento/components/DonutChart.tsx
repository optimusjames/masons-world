'use client';

import { ReactNode } from 'react';
import { motion } from 'motion/react';
import css from './DonutChart.module.css';

interface DonutSegment {
  pct: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  gap?: number;
  children?: ReactNode;
}

export function DonutChart({ segments, gap = 6, children }: DonutChartProps) {
  const r = 78;
  const cx = 100;
  const cy = 100;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className={css.wrap}>
      <svg viewBox="0 0 200 200" className={css.svg}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a3830" strokeWidth="24" />
        {segments.map((seg, i) => {
          const segLen = circumference * seg.pct - gap;
          const dasharray = `${segLen} ${circumference - segLen}`;
          const dashoffset = -offset;
          offset += circumference * seg.pct;
          return (
            <motion.circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeLinecap="round"
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: dasharray }}
              transition={{
                type: 'spring',
                damping: 20,
                stiffness: 60,
                delay: i * 0.12,
              }}
            />
          );
        })}
      </svg>
      {children && (
        <motion.div
          className={css.center}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
