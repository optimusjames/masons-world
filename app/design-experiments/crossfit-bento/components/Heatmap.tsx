import { ReactNode } from 'react';

interface HeatmapProps {
  data: number[];
  cols: number;
  colorStops: string[];
  renderCell?: (level: number, index: number) => ReactNode;
}

export function Heatmap({ data, cols, colorStops, renderCell }: HeatmapProps) {
  return (
    <div
      className="streak-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {data.map((level, i) => (
        <div
          key={i}
          className="streak-cell"
          style={{
            background: colorStops[level] ?? colorStops[0],
            display: level === colorStops.length - 1 ? 'flex' : undefined,
            alignItems: level === colorStops.length - 1 ? 'center' : undefined,
            justifyContent: level === colorStops.length - 1 ? 'center' : undefined,
          }}
        >
          {renderCell?.(level, i)}
        </div>
      ))}
    </div>
  );
}
