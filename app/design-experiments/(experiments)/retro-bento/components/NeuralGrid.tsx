'use client';

import { useRef, useState, useCallback } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { LedMatrix, LedMatrixHandle } from './LedMatrix';
import { LabelPlate } from './LabelPlate';
import { Toggle } from './Toggle';
import { useCountUp } from './useCountUp';

function generateGrid(cols: number, rows: number): number[] {
  const data: number[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = Math.abs(Math.sin(r * 3.1 + c * 1.7) * 2 + Math.cos(r * 0.8 - c * 2.3) * 1.5);
      data.push(Math.min(4, Math.floor(v)));
    }
  }
  return data;
}

const COLS = 24;
const ROWS = 18;
const NEURAL_DATA = generateGrid(COLS, ROWS);

export function NeuralGrid() {
  const [sync, setSync] = useState(true);
  const count = useCountUp(sync ? COLS * ROWS : 0, 800, 300);
  const matrixRef = useRef<LedMatrixHandle>(null);

  const toggle = useCallback(async (next: boolean) => {
    setSync(next);
    if (next) {
      await matrixRef.current?.expand();
    } else {
      await matrixRef.current?.collapse();
    }
  }, []);

  const handleTap = useCallback(() => {
    toggle(!sync);
  }, [sync, toggle]);

  return (
    <HardwareCard label="Neural Pathways">
      <LedMatrix ref={matrixRef} data={NEURAL_DATA} cols={COLS} onTap={handleTap} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <Toggle value={sync} onChange={(v) => toggle(v)} label="Sync" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CrtDisplay>
            <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--display-active)', display: 'block', textAlign: 'left', lineHeight: 1, padding: '0 4px', width: 42, fontVariantNumeric: 'tabular-nums' }}>
              {count}
            </span>
          </CrtDisplay>
          <LabelPlate text="Nodes" />
        </div>
      </div>
    </HardwareCard>
  );
}
