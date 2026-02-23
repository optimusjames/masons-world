'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { MetricReadout } from './MetricReadout';
import { Toggle } from './Toggle';
import { Fader } from './Fader';
import { ZoneBar } from './ZoneBar';
import { useCountUp } from './useCountUp';

const STASIS_STAGES = [
  { label: 'Cryo', pct: 25 },
  { label: 'Stasis', pct: 45 },
  { label: 'Thaw', pct: 30 },
];

export function StasisChamber() {
  const [active, setActive] = useState(true);
  const [temp, setTemp] = useState(72);
  const hours = useCountUp(active ? 847 : 0, 800, 200);

  return (
    <HardwareCard label="Stasis Chamber">
      <CrtDisplay>
        <div style={{ textAlign: 'center', padding: '4px 0' }}>
          <span style={{ fontSize: 32, fontWeight: 500, color: 'var(--display-active)', lineHeight: 1 }}>
            {hours}
          </span>
          <span style={{ fontSize: 12, color: 'var(--display-dim)', marginLeft: 4 }}>HRS</span>
        </div>
      </CrtDisplay>

      <ZoneBar zones={STASIS_STAGES} style={{ marginTop: 8 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Toggle value={active} onChange={setActive} label="Chamber" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <MetricReadout label="Integrity" value="98%" />
            <MetricReadout label="Coolant" value="-192" />
          </div>
        </div>
        <Fader value={temp} onChange={setTemp} height={80} label="Temp" formatValue={(v) => `${v}K`} />
      </div>
    </HardwareCard>
  );
}
