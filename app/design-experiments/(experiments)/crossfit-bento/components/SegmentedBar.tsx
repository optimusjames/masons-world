'use client';

import { motion } from 'motion/react';
import css from './SegmentedBar.module.css';

interface Segment {
  flex: number;
  color: string;
}

interface LegendItem {
  color: string;
  label: string;
}

interface SegmentedBarProps {
  segments: Segment[];
  labels?: string[];
  legend?: LegendItem[];
  className?: string;
}

export function SegmentedBar({ segments, labels, legend, className }: SegmentedBarProps) {
  return (
    <div className={className}>
      <div style={{ display: 'flex', gap: segments.length > 4 ? '2px' : '3px', height: '22px', borderRadius: '3px', overflow: 'hidden' }}>
        {segments.map((seg, i) => (
          <motion.div
            key={i}
            style={{ background: seg.color, height: '100%' }}
            initial={{ flex: 0 }}
            animate={{ flex: seg.flex }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 150,
              delay: i * 0.06,
            }}
          />
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          {labels.map((l) => (
            <span key={l} className={css.zoneLabel}>{l}</span>
          ))}
        </div>
      )}
      {legend && (
        <div className={css.legend}>
          {legend.map((item) => (
            <div key={item.label} className={css.legendItem}>
              <span className={css.legendDot} style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
