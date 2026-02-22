'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useKnob, useFader } from '../hooks/useControls';
import { Knob } from './Knob';
import { Fader } from './Fader';
import { Toggle } from './Toggle';
import { DisplayMeter } from './DisplayMeter';
import { PerfGrid } from './PerfGrid';
import styles from './RetroTechPanel.module.css';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const TRACKS = [
  'TEARS IN RAIN \u2014 VANGELIS \u2014 BLADE RUNNER OST',
  'THE MOON SONG \u2014 KAREN O \u2014 HER OST',
  'DEREZZED \u2014 DAFT PUNK \u2014 TRON LEGACY OST',
];

function useTrackScramble(tracks: string[], cycleMs = 12000) {
  const [display, setDisplay] = useState('');
  const indexRef = useRef(0);
  const resolved = useRef(0);
  const scrambleRef = useRef<ReturnType<typeof setInterval>>(null);
  const cycleRef = useRef<ReturnType<typeof setInterval>>(null);

  const maxLen = Math.max(...tracks.map((t) => t.length));

  const scrambleTo = useCallback((text: string) => {
    resolved.current = 0;
    if (scrambleRef.current) clearInterval(scrambleRef.current);

    const padded = text.padEnd(maxLen);
    const startResolving = { current: false };
    setTimeout(() => { startResolving.current = true; }, 600);

    scrambleRef.current = setInterval(() => {
      if (startResolving.current) resolved.current += 2;

      let out = '';
      for (let i = 0; i < padded.length; i++) {
        if (i < resolved.current) {
          out += padded[i];
        } else {
          out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setDisplay(out);

      if (resolved.current >= padded.length) {
        clearInterval(scrambleRef.current!);
        scrambleRef.current = null;
        setDisplay(text);
      }
    }, 30);
  }, [maxLen]);

  const advance = useCallback(() => {
    indexRef.current = (indexRef.current + 1) % tracks.length;
    scrambleTo(tracks[indexRef.current]);
  }, [tracks, scrambleTo]);

  const replay = useCallback(() => {
    advance();
    // Reset the auto-cycle timer on manual click
    if (cycleRef.current) clearInterval(cycleRef.current);
    cycleRef.current = setInterval(advance, cycleMs);
  }, [advance, cycleMs]);

  useEffect(() => {
    scrambleTo(tracks[0]);
    cycleRef.current = setInterval(advance, cycleMs);
    return () => {
      if (scrambleRef.current) clearInterval(scrambleRef.current);
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [tracks, scrambleTo, advance, cycleMs]);

  return { display, replay };
}

function useEasedValue(target: number, speed = 0.12) {
  const [display, setDisplay] = useState(target);
  const currentRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      const diff = target - currentRef.current;
      if (Math.abs(diff) < 0.5) {
        currentRef.current = target;
        setDisplay(target);
        return;
      }
      currentRef.current += diff * speed;
      setDisplay(Math.round(currentRef.current));
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, speed]);

  return display;
}

export function RetroTechPanel({ className }: { className?: string }) {
  const gain = useKnob(65);
  const freq = useKnob(40, 20, 20000);
  const resonance = useKnob(30);
  const mix = useKnob(50);

  const vol = useFader(72);
  const low = useFader(55);
  const mid = useFader(60);
  const high = useFader(45);

  const { display: trackDisplay, replay: replayTrack } = useTrackScramble(TRACKS);

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
          if (muteOn) return 0;
          const t = i / 31; // 0..1 across frequency range

          // EQ band influence: overlapping bell curves
          const lowGain = low.value / 100;
          const midGain = mid.value / 100;
          const highGain = high.value / 100;

          const lowCurve = Math.exp(-((t - 0.1) ** 2) / 0.02);
          const midCurve = Math.exp(-((t - 0.45) ** 2) / 0.04);
          const highCurve = Math.exp(-((t - 0.85) ** 2) / 0.025);

          const eq = lowGain * lowCurve + midGain * midCurve + highGain * highCurve;

          const base = (vol.value / 100) * 35;
          const shaped = eq * 55;
          const noise = Math.random() * 18;
          return Math.min(100, base + shaped + noise);
        }),
      );
    }, 120);
    return () => clearInterval(id);
  }, [vol.value, low.value, mid.value, high.value, muteOn]);

  const displayVol = useEasedValue(vol.value);
  const displayFreq = useEasedValue(freq.value);
  const displayGain = useEasedValue(gain.value);

  // Fixed-width: 5-digit zero-padded Hz (00020–20000)
  const freqLabel = String(displayFreq).padStart(5, '0');
  // Fixed-width: 3-digit zero-padded percent (000–100)
  const gainLabel = String(displayGain).padStart(3, '0');

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

        <div className={styles.display} onClick={replayTrack}>
          <div className={styles.trackRow}>
            <span className={styles.trackLabel}>{trackDisplay}</span>
            {recording && <span className={styles.recBadge}>REC</span>}
          </div>
          <div className={styles.displayBody}>
            <div className={styles.displayMain}>
              <span className={styles.displayLabel}>Volume</span>
              <span className={styles.displayValue}>{displayVol}</span>
            </div>
            <DisplayMeter levels={meterLevels} />
            <div className={styles.displayRight}>
              <span className={styles.displayStatus}>
                FREQ <span className={styles.displayBright}>{freqLabel}</span>
              </span>
              <span className={styles.displayStatus}>
                GAIN <span className={styles.displayBright}>{gainLabel}</span>
              </span>
            </div>
          </div>
        </div>

        <div className={`${styles.controlsRow} ${styles.knobsRow}`}>
          <Knob label="Gain" knob={gain} />
          <Knob label="Freq" knob={freq} />
          <Knob label="Res" knob={resonance} />
          <Knob label="Mix" knob={mix} />
        </div>

        <div className={styles.divider} />

        <div className={`${styles.controlsRow} ${styles.mixRow}`}>
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
