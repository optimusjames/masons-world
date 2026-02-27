'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './styles.module.css';

type Phase = 'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface Technique {
  id: string;
  name: string;
  ratio: string;
  benefit: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const TECHNIQUES: Technique[] = [
  { id: 'box', name: 'Box', ratio: '4 · 4 · 4 · 4', benefit: 'Focus & stress relief', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: '478', name: '4-7-8', ratio: '4 · 7 · 8', benefit: 'Sleep & anxiety', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { id: 'belly', name: 'Belly', ratio: '4 · 4', benefit: 'Foundation', inhale: 4, holdIn: 0, exhale: 4, holdOut: 0 },
];

type PhaseStep = { phase: Exclude<Phase, 'idle'>; duration: number };

function buildSequence(t: Technique): PhaseStep[] {
  const steps: PhaseStep[] = [];
  if (t.inhale > 0) steps.push({ phase: 'inhale', duration: t.inhale });
  if (t.holdIn > 0) steps.push({ phase: 'hold-in', duration: t.holdIn });
  if (t.exhale > 0) steps.push({ phase: 'exhale', duration: t.exhale });
  if (t.holdOut > 0) steps.push({ phase: 'hold-out', duration: t.holdOut });
  return steps;
}

const PHASE_LABEL: Record<Phase, string> = {
  idle: 'ready',
  inhale: 'inhale',
  'hold-in': 'hold',
  exhale: 'exhale',
  'hold-out': 'hold',
};

const R = 90;
const CIRC = 2 * Math.PI * R;

export default function YogaBreathing() {
  const [technique, setTechnique] = useState(TECHNIQUES[0]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(0);
  const [ringOffset, setRingOffset] = useState(CIRC);
  const [ringTransDuration, setRingTransDuration] = useState(0);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseIdxRef = useRef(0);
  const seqRef = useRef<PhaseStep[]>([]);
  const runningRef = useRef(false);

  function clearTimers() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (nextRef.current) clearTimeout(nextRef.current);
  }

  function runPhase() {
    if (!runningRef.current) return;
    clearTimers();
    const step = seqRef.current[phaseIdxRef.current % seqRef.current.length];
    const { phase: p, duration } = step;

    setPhase(p);
    setCountdown(duration);

    if (p === 'inhale') {
      setRingTransDuration(duration);
      setRingOffset(0);
    } else if (p === 'exhale') {
      setRingTransDuration(duration);
      setRingOffset(CIRC);
    }

    let rem = duration - 1;
    tickRef.current = setInterval(() => {
      setCountdown(rem);
      rem--;
    }, 1000);

    nextRef.current = setTimeout(() => {
      phaseIdxRef.current++;
      runPhase();
    }, duration * 1000);
  }

  function start() {
    seqRef.current = buildSequence(technique);
    phaseIdxRef.current = 0;
    runningRef.current = true;
    setRingOffset(CIRC);
    setRingTransDuration(0);
    setRunning(true);
    setTimeout(runPhase, 80);
  }

  function stop() {
    runningRef.current = false;
    clearTimers();
    setRunning(false);
    setPhase('idle');
    setCountdown(0);
    setRingOffset(CIRC);
    setRingTransDuration(0);
  }

  useEffect(() => () => { runningRef.current = false; clearTimers(); }, []);

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>pranayama</p>

      <div className={styles.ringWrap}>
        <svg viewBox="0 0 200 200" className={styles.svg}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="100" cy="100" r={R}
            fill="none"
            stroke="#7fa882"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={ringOffset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '100px 100px',
              transition: ringTransDuration > 0 ? `stroke-dashoffset ${ringTransDuration}s linear` : 'none',
            }}
          />
        </svg>
        <div className={styles.center}>
          <span className={styles.phaseLabel}>{PHASE_LABEL[phase]}</span>
          {running && <span className={styles.countdown}>{countdown}</span>}
        </div>
      </div>

      <button
        className={`${styles.btn} ${running ? styles.btnStop : ''}`}
        onClick={running ? stop : start}
      >
        {running ? 'stop' : 'begin'}
      </button>

      <div className={styles.techniques}>
        {TECHNIQUES.map((t) => (
          <button
            key={t.id}
            className={`${styles.card} ${technique.id === t.id ? styles.cardActive : ''}`}
            onClick={() => { if (running) stop(); setTechnique(t); }}
          >
            <span className={styles.techName}>{t.name}</span>
            <span className={styles.techRatio}>{t.ratio}</span>
            <span className={styles.techBenefit}>{t.benefit}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
