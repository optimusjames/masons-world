'use client';

import { useState } from 'react';
import { HardwareCard } from './HardwareCard';
import { VuMeterBank } from './VuMeterBank';
import { Knob } from './Knob';

const SPECTRAL_DATA = [
  { day: '32', value: 65 },
  { day: '64', value: 82 },
  { day: '128', value: 45 },
  { day: '256', value: 90 },
  { day: '512', value: 72 },
  { day: '1K', value: 55 },
  { day: '2K', value: 38 },
];

export function SpectralAnalyzer() {
  const [gain, setGain] = useState(72);
  return (
    <HardwareCard label="Spectral Analyzer">
      <VuMeterBank data={SPECTRAL_DATA} totalCal={`${gain}dB`} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <Knob value={gain} onChange={setGain} label="Gain" size={36} />
      </div>
    </HardwareCard>
  );
}
