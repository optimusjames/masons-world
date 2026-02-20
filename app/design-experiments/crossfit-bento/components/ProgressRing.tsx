'use client';

import { motion } from 'motion/react';
import { useCountUp } from './useCountUp';

interface ProgressRingProps {
  percentage: number;
  trackColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export function ProgressRing({
  percentage,
  trackColor = 'rgba(42,40,32,0.22)',
  fillColor = 'rgba(90,50,10,0.82)',
  strokeWidth = 18,
}: ProgressRingProps) {
  const r = 72;
  const circumference = 2 * Math.PI * r;
  const count = useCountUp(percentage, 1000, 100);

  return (
    <div className="goal-ring-wrap">
      <svg viewBox="0 0 180 180" className="goal-ring-svg">
        <circle
          cx="90" cy="90" r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <motion.circle
          cx="90" cy="90" r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{
            strokeDasharray: `${circumference * (percentage / 100)} ${circumference * (1 - percentage / 100)}`,
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 60, delay: 0.1 }}
        />
      </svg>
      <div className="goal-ring-center">
        <span className="goal-ring-pct">{count}</span>
      </div>
    </div>
  );
}
