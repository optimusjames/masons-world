'use client';

import { useState, useMemo } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { Knob } from './Knob';

const PHASE_LABELS = ['Alpha', 'Beta', 'Gamma'];
const BASE_PCTS = [35, 40, 25];
const OPACITIES = [0.8, 0.5, 0.3];

function derivePhases(value: number) {
  // Deterministic but varied proportions based on knob value
  const t = value / 128;
  const shift1 = Math.sin(t * Math.PI * 2) * 15;
  const shift2 = Math.cos(t * Math.PI * 3) * 10;
  const raw = [
    BASE_PCTS[0] + shift1,
    BASE_PCTS[1] + shift2,
    BASE_PCTS[2] - shift1 - shift2,
  ];
  // Normalize to 100
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => Math.max(5, (v / total) * 100));
}

export function PhaseScope() {
  const [resolution, setResolution] = useState(64);
  const randomize = () => setResolution(Math.floor(Math.random() * 128) + 1);

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 58;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * r;

  // Rotation driven by knob
  const rotation = (resolution / 128) * 360 - 90;

  const pcts = useMemo(() => derivePhases(resolution), [resolution]);

  // Build dasharray segments: each arc is a portion of the circumference
  // We render 3 concentric circles, each with a single dash for its segment
  const segments = useMemo(() => {
    let offset = 0;
    return pcts.map((pct, i) => {
      const dashLen = (pct / 100) * circumference;
      const gapLen = circumference - dashLen;
      const dashOffset = -offset;
      offset += dashLen;
      return {
        label: PHASE_LABELS[i],
        dasharray: `${dashLen} ${gapLen}`,
        dashoffset: dashOffset,
        opacity: OPACITIES[i],
        pct: Math.round(pct),
      };
    });
  }, [pcts, circumference]);

  const tickCount = 24;
  const ticks = useMemo(() => Array.from({ length: tickCount }, (_, i) => {
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
  }), [cx, cy, r, strokeWidth]);

  const transitionStyle = 'all 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)';

  return (
    <HardwareCard label="Phase Scope" onClick={randomize}>
      <CrtDisplay>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', display: 'block' }}>
          {ticks.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--display-dim)" strokeWidth="0.8" opacity="0.5" />
          ))}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
          <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: transitionStyle }}>
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="var(--display-text)"
                strokeWidth={strokeWidth}
                strokeDasharray={seg.dasharray}
                strokeDashoffset={seg.dashoffset}
                opacity={seg.opacity}
                style={{ transition: transitionStyle }}
              />
            ))}
          </g>
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
          {segments.map((seg, i) => (
            <span key={i} style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 9, color: 'var(--text-secondary)' }}>
              {seg.label}
            </span>
          ))}
        </div>
        <Knob value={resolution} onChange={setResolution} label="Res" size={32} min={1} max={128} />
      </div>
    </HardwareCard>
  );
}
