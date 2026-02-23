'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { Knob } from './Knob';

const PHASE_DATA = [
  { label: 'Alpha', value: 42, pct: 35 },
  { label: 'Beta', value: 31, pct: 40 },
  { label: 'Gamma', value: 19, pct: 25 },
];

export function PhaseScope() {
  const [resolution, setResolution] = useState(64);

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const strokeWidth = 14;

  const opacities = [0.8, 0.5, 0.3];
  let currentAngle = -90;
  const arcs = PHASE_DATA.map((phase, idx) => {
    const startAngle = currentAngle;
    const sweep = (phase.pct / 100) * 360;
    currentAngle += sweep;
    const endAngle = startAngle + sweep;

    const rad1 = (startAngle * Math.PI) / 180;
    const rad2 = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad1);
    const y1 = cy + r * Math.sin(rad1);
    const x2 = cx + r * Math.cos(rad2);
    const y2 = cy + r * Math.sin(rad2);
    const largeArc = sweep > 180 ? 1 : 0;

    return {
      ...phase,
      path: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      opacity: opacities[idx],
    };
  });

  const tickCount = 24;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const inner = r + strokeWidth / 2 + 2;
    const outer = inner + 4;
    return {
      x1: cx + inner * Math.cos(rad),
      y1: cy + inner * Math.sin(rad),
      x2: cx + outer * Math.cos(rad),
      y2: cy + outer * Math.sin(rad),
    };
  });

  return (
    <HardwareCard label="Phase Scope">
      <CrtDisplay>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', display: 'block' }}>
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--display-dim)" strokeWidth="0.8" opacity="0.5" />
          ))}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
          {arcs.map((arc, i) => (
            <path key={i} d={arc.path} fill="none" stroke="var(--display-text)" strokeWidth={strokeWidth} strokeLinecap="butt" opacity={arc.opacity} />
          ))}
          <text x={cx} y={cx - 4} textAnchor="middle" fill="var(--display-text)" style={{ fontSize: 14, fontFamily: 'var(--font-mono), monospace', fontWeight: 500 }}>
            {resolution} Hz
          </text>
          <text x={cx} y={cx + 10} textAnchor="middle" fill="var(--display-dim)" style={{ fontSize: 8, fontFamily: 'var(--font-display), sans-serif', letterSpacing: 1 }}>
            PHASE
          </text>
        </svg>
      </CrtDisplay>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8, padding: '0 4px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {PHASE_DATA.map((m, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, color: 'var(--text-secondary)' }}>
              {m.label}
            </span>
          ))}
        </div>
        <Knob value={resolution} onChange={setResolution} label="Res" size={32} min={1} max={128} />
      </div>
    </HardwareCard>
  );
}
