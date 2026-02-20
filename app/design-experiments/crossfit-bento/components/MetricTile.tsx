'use client';

import { motion } from 'motion/react';
import { useCountUp } from './useCountUp';

interface MetricTileProps {
  value: string | number;
  label: string;
  variant?: 'light' | 'dark';
}

function parseCountableNumber(v: string | number): { num: number; isFloat: boolean; suffix: string } | null {
  const s = String(v);
  // Only match pure numbers with optional trailing unit (e.g. "72", "8.2", "14%")
  // Skip time-like values ("11:15"), mixed formats ("7:28"), or non-numeric strings
  const match = s.match(/^(\d+\.?\d*)(%?)$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (!isFinite(num)) return null;
  return { num, isFloat: match[1].includes('.'), suffix: match[2] };
}

export function MetricTile({ value, label, variant = 'light' }: MetricTileProps) {
  const tileClass = variant === 'dark' ? 'metric-tile-dark' : 'metric-tile';
  const parsed = parseCountableNumber(value);
  const countTarget = parsed ? (parsed.isFloat ? Math.round(parsed.num * 10) : parsed.num) : 0;
  const count = useCountUp(countTarget, 700, 50);
  const displayValue = parsed
    ? `${parsed.isFloat ? (count / 10).toFixed(1) : count}${parsed.suffix}`
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
