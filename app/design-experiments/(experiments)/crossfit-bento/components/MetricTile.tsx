'use client';

import { motion } from 'motion/react';
import { useCountUp } from './useCountUp';
import css from './MetricTile.module.css';

interface MetricTileProps {
  value: string | number;
  label: string;
  variant?: 'light' | 'dark';
}

function parseCountableNumber(v: string | number): { num: number; isFloat: boolean; suffix: string } | null {
  const s = String(v);
  const match = s.match(/^(\d+\.?\d*)(%?)$/);
  if (!match) return null;
  const num = parseFloat(match[1]);
  if (!isFinite(num)) return null;
  return { num, isFloat: match[1].includes('.'), suffix: match[2] };
}

export function MetricTile({ value, label, variant = 'light' }: MetricTileProps) {
  const tileClass = variant === 'dark' ? css.tileDark : css.tile;
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
      <span className={css.value}>{displayValue}</span>
      <span className={css.label}>{label}</span>
    </motion.div>
  );
}
