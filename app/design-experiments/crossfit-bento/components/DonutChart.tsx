import { ReactNode } from 'react';

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
    <div className="donut-wrap">
      <svg viewBox="0 0 200 200" className="donut-svg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a3830" strokeWidth="24" />
        {segments.map((seg, i) => {
          const segLen = circumference * seg.pct - gap;
          const dasharray = `${segLen} ${circumference - segLen}`;
          const dashoffset = -offset;
          offset += circumference * seg.pct;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="24"
              strokeLinecap="round"
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
      </svg>
      {children && (
        <div className="donut-center">
          {children}
        </div>
      )}
    </div>
  );
}
