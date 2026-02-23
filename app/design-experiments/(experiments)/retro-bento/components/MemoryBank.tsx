'use client';

import { useRef, useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { LedIndicator } from './LedIndicator';
import { Fader } from './Fader';

function generateEpochs(count: number) {
  const entries = [];
  let epoch = 2184.7;
  for (let i = 0; i < count; i++) {
    entries.push({
      name: `Epoch ${epoch.toFixed(1)}`,
      weight: `${(0.65 + Math.sin(i * 0.7) * 0.17 + Math.cos(i * 1.3) * 0.15).toFixed(2)} c`,
      pr: i % 3 === 0 || i % 7 === 0,
    });
    epoch -= 0.3 + (Math.sin(i * 2.1) * 0.15 + 0.15);
  }
  return entries;
}

const MEMORY_LOG = generateEpochs(70);
const DISPLAY_HEIGHT = 200;
const ROW_HEIGHT = 20;
const LIST_HEIGHT = MEMORY_LOG.length * ROW_HEIGHT;
const MAX_SCROLL = LIST_HEIGHT - DISPLAY_HEIGHT + 20;

export function MemoryBank() {
  const [scrollPos, setScrollPos] = useState(100);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollPct = 1 - scrollPos / 100;

  return (
    <HardwareCard label="Memory Bank">
      <div style={{ display: 'flex', gap: 10, flex: 1 }}>
        <div style={{ flex: 1, overflow: 'hidden', height: DISPLAY_HEIGHT }}>
          <CrtDisplay>
            <div
              ref={listRef}
              style={{
                transform: `translateY(${-scrollPct * MAX_SCROLL}px)`,
                transition: 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {MEMORY_LOG.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      height: ROW_HEIGHT,
                      padding: '0',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                    }}
                  >
                    <span style={{ fontSize: 10, color: 'var(--display-text)', whiteSpace: 'nowrap' }}>{entry.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', color: 'var(--display-text)' }}>
                        {entry.weight}
                      </span>
                      {entry.pr && <LedIndicator state="accent" size={5} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CrtDisplay>
        </div>
        <Fader value={scrollPos} onChange={setScrollPos} height={DISPLAY_HEIGHT} label="Seek" showValue={false} />
      </div>
    </HardwareCard>
  );
}
