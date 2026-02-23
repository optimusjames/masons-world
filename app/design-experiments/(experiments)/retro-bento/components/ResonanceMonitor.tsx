'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { MetricReadout } from './MetricReadout';
import { Knob } from './Knob';
import { ZoneBar } from './ZoneBar';
import { useCountUp } from './useCountUp';

const RESONANCE_ZONES = [
  { label: 'Sub', pct: 15 },
  { label: 'Fund', pct: 35 },
  { label: 'Harm', pct: 40 },
  { label: 'Over', pct: 10 },
];

export function ResonanceMonitor() {
  const [freq, setFreq] = useState(164);
  const display = useCountUp(freq, 600, 200);

  return (
    <HardwareCard label="Resonance">
      <CrtDisplay>
        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          <div style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--display-dim)' }}>
            FREQUENCY
          </div>
          <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--display-active)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
            {display} <span style={{ fontSize: 12, color: 'var(--display-dim)' }}>Hz</span>
          </div>
        </div>
      </CrtDisplay>

      <ZoneBar zones={RESONANCE_ZONES} style={{ marginTop: 8 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, flex: 1, marginRight: 10 }}>
          <MetricReadout label="Peak" value="248" />
          <MetricReadout label="Floor" value="12" />
          <MetricReadout label="Q Factor" value="4.2" />
          <MetricReadout label="Damping" value="0.68" />
        </div>
        <Knob value={freq} onChange={setFreq} label="Tune" size={40} min={20} max={440} formatValue={(v) => `${v}`} />
      </div>
    </HardwareCard>
  );
}
