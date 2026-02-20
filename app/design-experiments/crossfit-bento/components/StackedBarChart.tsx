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
        {bars.map((b) => (
          <div key={b.label} className="bar-col">
            <div className="bar-stack">
              {b.segments.map((seg, i) => (
                <div key={i} className={seg.className} style={{ height: seg.height }} />
              ))}
            </div>
            <span className="bar-day">{b.label}</span>
          </div>
        ))}
      </div>
      {footer && (
        <div className="activity-footer">
          <span className="ft-label">{footer.label}</span>
          <span className="ft-value">{footer.value}</span>
        </div>
      )}
    </>
  );
}
