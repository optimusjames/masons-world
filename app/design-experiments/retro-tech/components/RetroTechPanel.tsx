'use client';

import { useState, useEffect } from 'react';
import { useKnob, useFader } from '../hooks/useControls';
import { Knob } from './Knob';
import { Fader } from './Fader';
import { Toggle } from './Toggle';
import { DisplayMeter } from './DisplayMeter';
import { PerfGrid } from './PerfGrid';
import styles from './RetroTechPanel.module.css';

export function RetroTechPanel({ className }: { className?: string }) {
  const gain = useKnob(65);
  const freq = useKnob(40, 20, 20000);
  const resonance = useKnob(30);
  const mix = useKnob(50);

  const vol = useFader(72);
  const low = useFader(55);
  const mid = useFader(60);
  const high = useFader(45);

  const [filterOn, setFilterOn] = useState(true);
  const [bypassOn, setBypassOn] = useState(false);
  const [muteOn, setMuteOn] = useState(false);

  const [recording, setRecording] = useState(false);
  const [meterLevels, setMeterLevels] = useState<number[]>(
    Array.from({ length: 32 }, () => 0),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setMeterLevels(
        Array.from({ length: 32 }, (_, i) => {
          const base = muteOn ? 0 : (vol.value / 100) * 60;
          const noise = Math.random() * 40;
          const curve = Math.sin((i / 31) * Math.PI) * 20;
          return Math.min(100, base + noise + curve);
        }),
      );
    }, 120);
    return () => clearInterval(id);
  }, [vol.value, muteOn]);

  const freqDisplay =
    freq.value >= 1000
      ? `${(freq.value / 1000).toFixed(1)}k`
      : `${freq.value}`;

  return (
    <div className={`${styles.device} ${className ?? ''}`}>
      <div className={styles.chassis}>
        <div className={`${styles.screw} ${styles.screwTl}`} />
        <div className={`${styles.screw} ${styles.screwTr}`} />
        <div className={`${styles.screw} ${styles.screwBl}`} />
        <div className={`${styles.screw} ${styles.screwBr}`} />

        <div className={styles.topBar}>
          <span className={styles.modelName}>RC-1 CONTROL</span>
          <div className={styles.ledCluster}>
            <div className={`${styles.led} ${!bypassOn ? styles.ledActive : ''}`} />
            <div className={`${styles.led} ${filterOn ? styles.ledActive : ''}`} />
            <div className={`${styles.led} ${recording ? styles.ledActive : ''}`} />
          </div>
        </div>

        <div className={styles.display}>
          <div className={styles.displayMain}>
            <span className={styles.displayLabel}>Frequency</span>
            <span className={styles.displayValue}>{freqDisplay}</span>
            <span className={styles.displayUnit}>Hz</span>
          </div>
          <DisplayMeter levels={meterLevels} />
          <div className={styles.displayRight}>
            <span className={`${styles.displayStatus} ${recording ? styles.displayStatusActive : ''}`}>
              {recording ? 'REC' : 'IDLE'}
            </span>
            <span className={styles.displayStatus}>
              GAIN {gain.value}%
            </span>
            <span className={styles.displayStatus}>
              MIX {mix.value}%
            </span>
          </div>
        </div>

        <div className={styles.controlsRow}>
          <Knob label="Gain" knob={gain} />
          <Knob label="Freq" knob={freq} />
          <Knob label="Res" knob={resonance} />
          <Knob label="Mix" knob={mix} />
        </div>

        <div className={styles.divider} />

        <div className={styles.controlsRow}>
          <div className={styles.fadersSection}>
            <Fader label="Vol" fader={vol} />
            <Fader label="Low" fader={low} />
            <Fader label="Mid" fader={mid} />
            <Fader label="High" fader={high} />
          </div>
          <div className={styles.togglesColumn}>
            <Toggle label="Filter" on={filterOn} onToggle={() => setFilterOn((p) => !p)} />
            <Toggle label="Bypass" on={bypassOn} onToggle={() => setBypassOn((p) => !p)} />
            <Toggle label="Mute" on={muteOn} onToggle={() => setMuteOn((p) => !p)} />
          </div>
          <div className={styles.buttonsColumn}>
            <button
              className={`${styles.btn} ${recording ? styles.btnAccent : styles.btnDefault}`}
              onClick={() => setRecording((p) => !p)}
            >
              {recording ? 'STOP' : 'RECORD'}
            </button>
            <button className={`${styles.btn} ${styles.btnDefault}`}>RESET</button>
            <button className={`${styles.btn} ${styles.btnDefault}`}>SAVE</button>
            <button className={`${styles.btn} ${styles.btnAccent}`}>SEND</button>
          </div>
          <PerfGrid inline />
        </div>

        <div className={styles.bottomInfo}>
          <span className={styles.serial}>SN 2024-0847</span>
          <span className={styles.badge}>48kHz / 24bit</span>
        </div>
      </div>
    </div>
  );
}
