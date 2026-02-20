'use client';

import { motion } from 'motion/react';
import css from './StackedBarChart.module.css';

interface BarSegment {
  height: string;
  color: string;
}

interface Bar {
  label: string;
  segments: BarSegment[];
}

interface StackedBarChartProps {
  bars: Bar[];
  footer?: { label: string; value: string };
}

export function StackedBarChart({ bars, footer }: StackedBarChartProps) {
  return (
    <>
      <div className={css.chart}>
        {bars.map((b, colIdx) => (
          <div key={b.label} className={css.col}>
            <div className={css.stack}>
              {b.segments.map((seg, i) => (
                <motion.div
                  key={i}
                  className={css.segment}
                  style={{ background: seg.color }}
                  initial={{ height: '0%' }}
                  animate={{ height: seg.height }}
                  transition={{
                    type: 'spring',
                    damping: 18,
                    stiffness: 120,
                    delay: colIdx * 0.06 + i * 0.04,
                  }}
                />
              ))}
            </div>
            <span className={css.dayLabel}>{b.label}</span>
          </div>
        ))}
      </div>
      {footer && (
        <motion.div
          className={css.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <span className={css.footerLabel}>{footer.label}</span>
          <span className={css.footerValue}>{footer.value}</span>
        </motion.div>
      )}
    </>
  );
}
