'use client';

import { useEffect, useState } from 'react';
import { SegmentedLedBar } from './SegmentedLedBar';
import styles from './VuMeterBank.module.css';

interface VuMeterBankProps {
  data: { day: string; value: number }[];
  totalCal: string;
  className?: string;
}

export function VuMeterBank({ data, totalCal, className }: VuMeterBankProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`${styles.bank} ${className || ''}`}>
      <div className={styles.header}>
        <span className={styles.readout}>{totalCal}</span>
        <span className={styles.unit}>CAL</span>
      </div>
      <div className={styles.meters}>
        {data.map((d, i) => (
          <div key={i} className={styles.column}>
            <SegmentedLedBar value={animated ? d.value : 0} segments={12} />
            <div className={styles.dayLabel}>{d.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
