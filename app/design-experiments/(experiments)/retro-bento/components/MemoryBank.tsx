'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { HardwareCard } from './HardwareCard';
import { CrtDisplay } from './CrtDisplay';
import { LedIndicator } from './LedIndicator';
import { Fader } from './Fader';

const MEMORY_LOG = [
  { name: 'Epoch 2184.7', weight: '0.97 c', pr: true },
  { name: 'Epoch 2184.3', weight: '0.84 c', pr: false },
  { name: 'Epoch 2183.9', weight: '0.92 c', pr: true },
  { name: 'Epoch 2183.1', weight: '0.78 c', pr: false },
  { name: 'Epoch 2182.6', weight: '0.88 c', pr: false },
  { name: 'Epoch 2181.4', weight: '0.95 c', pr: true },
];

export function MemoryBank() {
  const [scrollPos, setScrollPos] = useState(50);
  return (
    <HardwareCard label="Memory Bank">
      <div style={{ display: 'flex', gap: 10 }}>
        <CrtDisplay>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
            {MEMORY_LOG.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '3px 0',
                  borderBottom: i < MEMORY_LOG.length - 1 ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--display-text)' }}>{entry.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', color: 'var(--display-text)' }}>
                    {entry.weight}
                  </span>
                  {entry.pr && <LedIndicator state="accent" size={5} />}
                </div>
              </motion.div>
            ))}
          </div>
        </CrtDisplay>
        <Fader value={scrollPos} onChange={setScrollPos} height={120} label="Seek" showValue={false} />
      </div>
    </HardwareCard>
  );
}
