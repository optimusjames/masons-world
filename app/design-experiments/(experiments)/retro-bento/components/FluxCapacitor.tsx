'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { LedIndicator } from './LedIndicator';
import { Toggle } from './Toggle';

const MODULES = [
  { label: 'Input Flux', value: '1.21' },
  { label: 'Output Flux', value: '0.88' },
  { label: 'Surplus', value: '+0.33' },
];

export function FluxCapacitor() {
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(true);

  return (
    <HardwareCard label="Flux Capacitor">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MODULES.map((m, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); setActive(i); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '2px 0' }}
          >
            <LedIndicator state={active === i ? 'accent' : 'dim'} size={6} />
            <div style={{ flex: 1 }}>
              <CrtDisplay>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--display-dim)' }}>
                    {m.label}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: active === i ? 'var(--display-active)' : 'var(--display-text)' }}>
                    {m.value}
                  </span>
                </div>
              </CrtDisplay>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <Toggle value={armed} onChange={setArmed} label="Armed" />
      </div>
    </HardwareCard>
  );
}
