'use client';

import { motion } from 'motion/react';
import { useCountUp } from './useCountUp';

interface MetricTileProps {
  value: string | number;
  label: string;
  variant?: 'light' | 'dark';
}

function parseLeadingNumber(v: string | number): { num: number; suffix: string } | null {
  const s = String(v);
  const match = s.match(/^([0-9.]+)(.*)$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return null;
  return { num, suffix: match[2] };
}

export function MetricTile({ value, label, variant = 'light' }: MetricTileProps) {
  const tileClass = variant === 'dark' ? 'metric-tile-dark' : 'metric-tile';
  const parsed = parseLeadingNumber(value);
  const isFloat = parsed ? String(parsed.num).includes('.') : false;
  const countTarget = parsed ? (isFloat ? Math.round(parsed.num * 10) : parsed.num) : 0;
  const count = useCountUp(countTarget, 700, 50);
  const displayValue = parsed
    ? `${isFloat ? (count / 10).toFixed(1) : count}${parsed.suffix}`
    : value;

  return (
    <motion.div
      className={tileClass}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 250 }}
    >
      <span className="metric-value">{displayValue}</span>
      <span className="metric-label">{label}</span>
    </motion.div>
  );
}
