'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { NeedleGauge } from './NeedleGauge';
import { LabelPlate } from './LabelPlate';
import { Knob } from './Knob';

export function TemporalGauge() {
  const [dilation, setDilation] = useState(78);
  return (
    <HardwareCard label="Temporal Coefficient">
      <NeedleGauge value={dilation} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -40, gap: 6 }}>
        <Knob value={dilation} onChange={setDilation} size={40} />
        <div style={{ marginTop: 10 }}>
          <LabelPlate text="TC-78 MK II" />
        </div>
      </div>
    </HardwareCard>
  );
}
