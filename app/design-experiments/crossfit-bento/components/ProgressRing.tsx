import { ReactNode } from 'react';

interface ProgressRingProps {
  percentage: number;
  trackColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  children?: ReactNode;
}

export function ProgressRing({
  percentage,
  trackColor = 'rgba(42,40,32,0.22)',
  fillColor = 'rgba(90,50,10,0.82)',
  strokeWidth = 18,
  children,
}: ProgressRingProps) {
  const r = 72;
  const circumference = 2 * Math.PI * r;
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
        <circle
          cx="90" cy="90" r={r}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference * (percentage / 100)} ${circumference * (1 - percentage / 100)}`}
          transform="rotate(-90 90 90)"
        />
      </svg>
      <div className="goal-ring-center">
        {children}
      </div>
    </div>
  );
}
