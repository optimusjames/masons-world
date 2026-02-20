'use client';

import { motion } from 'motion/react';
import { useCountUp } from './useCountUp';

interface StatDisplayProps {
  label?: string;
  unit: string;
  value: string | number;
  valueColor?: string;
  className?: string;
}

function parseNumeric(v: string | number): { num: number; prefix: string; suffix: string } | null {
  const s = String(v);
  const match = s.match(/^([+-]?)([0-9,]+)(.*)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    num: parseInt(match[2].replace(/,/g, ''), 10),
    suffix: match[3],
  };
}

function formatWithCommas(n: number): string {
  return n.toLocaleString();
}

export function StatDisplay({ label, unit, value, valueColor, className }: StatDisplayProps) {
  const parsed = parseNumeric(value);
  const count = useCountUp(parsed?.num ?? 0, 800, 100);

  const displayValue = parsed
    ? `${parsed.prefix}${formatWithCommas(count)}${parsed.suffix}`
    : value;

  return (
    <div className={className}>
      {label && (
        <motion.span
          className="cal-label"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          {label}
        </motion.span>
      )}
      <div className="cal-row">
        <span className="cal-unit">{unit}</span>
        <span className="cal-value" style={valueColor ? { color: valueColor } : undefined}>
          {displayValue}
        </span>
      </div>
    </div>
  );
}
