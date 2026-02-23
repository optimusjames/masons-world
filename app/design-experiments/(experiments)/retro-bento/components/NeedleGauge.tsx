'use client';

import { useEffect, useState } from 'react';
import styles from './NeedleGauge.module.css';

interface NeedleGaugeProps {
  value: number;
  className?: string;
}

export function NeedleGauge({ value, className }: NeedleGaugeProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const startAngle = -110;
  const endAngle = 110;
  const currentValue = animated ? value : 0;
  const needleAngle = startAngle + (currentValue / 100) * (endAngle - startAngle);

  const cx = 100;
  const cy = 100;
  const r = 70;

  function polar(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const arcStart = polar(startAngle, r);
  const arcEnd = polar(endAngle, r);
  const trackPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 1 1 ${arcEnd.x} ${arcEnd.y}`;

  const valuePt = polar(needleAngle, r);
  const sweep = needleAngle - startAngle > 180 ? 1 : 0;
  const fillPath = `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${sweep} 1 ${valuePt.x} ${valuePt.y}`;

  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className={`${styles.gauge} ${className || ''}`}>
      <svg viewBox="0 0 200 160" className={styles.svg}>
        <path d={trackPath} fill="none" stroke="var(--surface-deep)" strokeWidth="8" strokeLinecap="round" />
        <path d={fillPath} fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" />

        {ticks.map((tick) => {
          const tickAngle = startAngle + (tick / 100) * (endAngle - startAngle);
          const inner = polar(tickAngle, r + 8);
          const outer = polar(tickAngle, r + 14);
          const label = polar(tickAngle, r + 22);
          return (
            <g key={tick}>
              <line
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke="var(--text-secondary)" strokeWidth="1.5"
              />
              <text
                x={label.x} y={label.y}
                textAnchor="middle" dominantBaseline="middle"
                className={styles.tickText}
              >
                {tick}
              </text>
            </g>
          );
        })}

        <g className={styles.needle} style={{ transform: `rotate(${needleAngle}deg)` }}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - 40} stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <circle cx={cx} cy={cy} r="5" fill="var(--text-primary)" />
        <circle cx={cx} cy={cy} r="2.5" fill="var(--surface-raised)" />
      </svg>
    </div>
  );
}
