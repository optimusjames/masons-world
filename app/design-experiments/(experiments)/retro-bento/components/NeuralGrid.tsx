'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { LedMatrix } from './LedMatrix';
import { LabelPlate } from './LabelPlate';
import { Toggle } from './Toggle';
import { useCountUp } from './useCountUp';

const NEURAL_DATA: number[] = [
  0,1,2,0,3,4,2, 1,0,3,2,4,1,0, 2,3,1,0,4,2,3,
  0,2,4,3,1,2,0, 1,3,2,4,0,1,2, 3,4,2,1,0,3,4,
  2,1,3,0,2,4,1, 0,3,2,1,4,3,2, 1,0,2,3,4,2,1,
  3,2,4,1,0,3,2,
];

export function NeuralGrid() {
  const count = useCountUp(47, 800, 300);
  const [sync, setSync] = useState(true);
  return (
    <HardwareCard label="Neural Pathways">
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <LedMatrix data={NEURAL_DATA} cols={7} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
          <CrtDisplay>
            <span style={{ fontSize: 28, fontWeight: 500, color: 'var(--display-active)', display: 'block', textAlign: 'center', lineHeight: 1 }}>
              {count}
            </span>
          </CrtDisplay>
          <LabelPlate text="Nodes" />
        </div>
      </div>
      <div style={{ marginTop: 8 }}>
        <Toggle value={sync} onChange={setSync} label="Sync" />
      </div>
    </HardwareCard>
  );
}
