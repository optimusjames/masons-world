'use client';

import { motion } from 'motion/react';

interface BarSegment {
  height: string;
  className: string;
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
      <div className="bar-chart">
        {bars.map((b, colIdx) => (
          <div key={b.label} className="bar-col">
            <div className="bar-stack">
              {b.segments.map((seg, i) => (
                <motion.div
                  key={i}
                  className={seg.className}
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
            <span className="bar-day">{b.label}</span>
          </div>
        ))}
      </div>
      {footer && (
        <motion.div
          className="activity-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <span className="ft-label">{footer.label}</span>
          <span className="ft-value">{footer.value}</span>
        </motion.div>
      )}
    </>
  );
}
