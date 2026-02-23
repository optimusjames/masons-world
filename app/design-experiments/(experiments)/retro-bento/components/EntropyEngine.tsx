'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { MetricReadout } from './MetricReadout';
import { Toggle } from './Toggle';
import { useCountUp } from './useCountUp';
import { useTextScramble } from './useTextScramble';

export function EntropyEngine() {
  const [armed, setArmed] = useState(false);
  const state = useTextScramble(armed ? 'CONVERGE' : 'DORMANT', 400);
  const index = useTextScramble(armed ? '07:X4' : '--:--', 600);
  const cycles = useCountUp(armed ? 2048 : 0, 700, 200);
  const events = useCountUp(armed ? 12 : 0, 700, 400);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Toggle value={armed} onChange={setArmed} label="Engage" />
        <div style={{ display: 'flex', gap: 6 }}>
          <MetricReadout label="Cycles" value={cycles} />
          <MetricReadout label="Events" value={events} />
        </div>
      </div>
    </HardwareCard>
  );
}
