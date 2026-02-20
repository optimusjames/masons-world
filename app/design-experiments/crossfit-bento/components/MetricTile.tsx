interface MetricTileProps {
  value: string | number;
  label: string;
  variant?: 'light' | 'dark';
}

export function MetricTile({ value, label, variant = 'light' }: MetricTileProps) {
  const tileClass = variant === 'dark' ? 'metric-tile-dark' : 'metric-tile';
  return (
    <div className={tileClass}>
      <span className="metric-value">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}
