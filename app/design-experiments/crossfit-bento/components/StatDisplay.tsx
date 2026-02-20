interface StatDisplayProps {
  label?: string;
  unit: string;
  value: string | number;
  valueColor?: string;
  className?: string;
}

export function StatDisplay({ label, unit, value, valueColor, className }: StatDisplayProps) {
  return (
    <div className={className}>
      {label && <span className="cal-label">{label}</span>}
      <div className="cal-row">
        <span className="cal-unit">{unit}</span>
        <span className="cal-value" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </span>
      </div>
    </div>
  );
}
