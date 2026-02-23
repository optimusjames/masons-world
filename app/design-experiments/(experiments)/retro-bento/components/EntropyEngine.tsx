'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { MetricReadout } from './MetricReadout';
import { Toggle } from './Toggle';
import { useCountUp } from './useCountUp';
import { useTextScramble } from './useTextScramble';

const STATES = ['DORMANT', 'PRIMING', 'CONVERGE', 'CRITICAL'];

export function EntropyEngine() {
  const [engage, setEngage] = useState(false);
  const [invert, setInvert] = useState(false);
  const [dampen, setDampen] = useState(false);

  const activeCount = [engage, invert, dampen].filter(Boolean).length;
  const stateLabel = STATES[activeCount];

  const state = useTextScramble(stateLabel, 400);
  const index = useTextScramble(activeCount > 0 ? `0${activeCount}:X${activeCount + 3}` : '--:--', 600);

  // Engage metrics
  const cycles = useCountUp(engage ? 2048 : 0, 700, 200);
  const events = useCountUp(engage ? 12 : 0, 700, 400);

  // Invert metrics
  const flux = useCountUp(invert ? 773 : 0, 700, 250);
  const drift = useCountUp(invert ? 41 : 0, 700, 350);

  // Dampen metrics
  const decay = useCountUp(dampen ? 196 : 0, 700, 300);
  const lambda = useCountUp(dampen ? 8 : 0, 700, 450);

  const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } as const;
  const metricsStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: 120 } as const;

  return (
    <HardwareCard label="Entropy Engine">
      <CrtDisplay>
        <div style={{ textAlign: 'center', padding: '6px 0' }}>
          <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--display-active)', letterSpacing: 2, minHeight: 28 }}>
            {state}
          </div>
          <div style={{ fontSize: 14, color: 'var(--display-text)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
            {index}
          </div>
        </div>
      </CrtDisplay>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
        <div style={rowStyle}>
          <Toggle value={engage} onChange={setEngage} label="Engage" />
          <div style={metricsStyle}>
            <MetricReadout label="Cycles" value={cycles} />
            <MetricReadout label="Events" value={events} />
          </div>
        </div>
        <div style={rowStyle}>
          <Toggle value={invert} onChange={setInvert} label="Invert" />
          <div style={metricsStyle}>
            <MetricReadout label="Flux" value={flux} />
            <MetricReadout label="Drift" value={drift} />
          </div>
        </div>
        <div style={rowStyle}>
          <Toggle value={dampen} onChange={setDampen} label="Dampen" />
          <div style={metricsStyle}>
            <MetricReadout label="Decay" value={decay} />
            <MetricReadout label="Lambda" value={lambda} />
          </div>
        </div>
      </div>
    </HardwareCard>
  );
}
