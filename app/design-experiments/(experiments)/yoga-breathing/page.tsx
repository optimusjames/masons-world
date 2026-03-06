'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './styles.module.css';

type Phase = 'idle' | 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface Technique {
  id: string;
  label: string;
  ratio: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
}

const TECHNIQUES: Technique[] = [
  { id: 'box', label: 'Focus & stress relief', ratio: '4 · 4 · 4 · 4', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: '478', label: 'Sleep & anxiety', ratio: '4 · 7 · 8', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { id: 'belly', label: 'Foundation', ratio: '5 · 5', inhale: 5, holdIn: 0, exhale: 5, holdOut: 0 },
  { id: '2to1', label: 'Nervous system reset', ratio: '4 · 8', inhale: 4, holdIn: 0, exhale: 8, holdOut: 0 },
  { id: 'triangle', label: 'Mindfulness', ratio: '4 · 4 · 4', inhale: 4, holdIn: 4, exhale: 4, holdOut: 0 },
];

const THEMES = [
  { id: 'sage' as const, color: '#7fa882' },
  { id: 'ocean' as const, color: '#7aafc4' },
  { id: 'dusk' as const, color: '#a882a8' },
];
type Theme = 'sage' | 'ocean' | 'dusk';

const DURATION_OPTIONS: { label: string; value: number | null }[] = [
  { label: '∞', value: null },
  { label: '2m', value: 2 },
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
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
  const [theme, setTheme] = useState<Theme>('sage');
  const [duration, setDuration] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseIdxRef = useRef(0);
  const seqRef = useRef<PhaseStep[]>([]);
  const runningRef = useRef(false);
  const elapsedRef = useRef(0);
  const durationRef = useRef<number | null>(null);

  function clearPhaseTimers() {
    if (tickRef.current) clearInterval(tickRef.current);
    if (nextRef.current) clearTimeout(nextRef.current);
  }

  function stop() {
    runningRef.current = false;
    clearPhaseTimers();
    if (elapsedTickRef.current) clearInterval(elapsedTickRef.current);
    setRunning(false);
    setPhase('idle');
    setCountdown(0);
    setRingOffset(CIRC);
    setRingTransDuration(0);
    setElapsed(0);
    elapsedRef.current = 0;
  }

  function runPhase() {
    if (!runningRef.current) return;
    clearPhaseTimers();
    const step = seqRef.current[phaseIdxRef.current % seqRef.current.length];
    const { phase: p, duration: phaseDuration } = step;

    setPhase(p);
    setCountdown(phaseDuration);

    if (p === 'inhale') {
      setRingTransDuration(phaseDuration);
      setRingOffset(0);
    } else if (p === 'exhale') {
      setRingTransDuration(phaseDuration);
      setRingOffset(CIRC);
    }

    let rem = phaseDuration - 1;
    tickRef.current = setInterval(() => {
      setCountdown(rem);
      rem--;
    }, 1000);

    nextRef.current = setTimeout(() => {
      phaseIdxRef.current++;
      runPhase();
    }, phaseDuration * 1000);
  }

  function start() {
    elapsedRef.current = 0;
    durationRef.current = duration;
    seqRef.current = buildSequence(technique);
    phaseIdxRef.current = 0;
    runningRef.current = true;
    setRingOffset(CIRC);
    setRingTransDuration(0);
    setElapsed(0);
    setRunning(true);

    elapsedTickRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
      if (durationRef.current !== null && elapsedRef.current >= durationRef.current * 60) {
        stop();
      }
    }, 1000);

    setTimeout(runPhase, 80);
  }

  useEffect(() => () => {
    runningRef.current = false;
    clearPhaseTimers();
    if (elapsedTickRef.current) clearInterval(elapsedTickRef.current);
  }, []);

  const progressPct = duration !== null && running
    ? Math.min((elapsed / (duration * 60)) * 100, 100)
    : 0;

  return (
    <div className={styles.page} data-theme={theme}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>pranayama</p>
        <div className={styles.swatches}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`${styles.swatch} ${theme === t.id ? styles.swatchActive : ''}`}
              style={{ '--swatch-color': t.color } as React.CSSProperties}
              onClick={() => setTheme(t.id)}
              aria-label={t.id}
            />
          ))}
        </div>
      </div>

      <div className={styles.ringWrap}>
        <svg viewBox="0 0 200 200" className={styles.svg}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="100" cy="100" r={R}
            fill="none"
            stroke="var(--accent)"
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
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              className={styles.phaseLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {PHASE_LABEL[phase]}
            </motion.span>
          </AnimatePresence>
          {running && <span className={styles.countdown}>{countdown}</span>}
        </div>
      </div>

      <button
        className={`${styles.btn} ${running ? styles.btnStop : ''}`}
        onClick={running ? stop : start}
      >
        {running ? 'stop' : 'begin'}
      </button>

      <div className={styles.durationPills}>
        {DURATION_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            className={`${styles.pill} ${duration === opt.value ? styles.pillActive : ''}`}
            onClick={() => { if (!running) setDuration(opt.value); }}
            disabled={running}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={`${styles.techniques} ${running ? styles.techniquesRunning : ''}`}>
        {TECHNIQUES.map((t, i) => (
          <motion.button
            key={t.id}
            className={`${styles.card} ${technique.id === t.id ? styles.cardActive : ''}`}
            onClick={() => { if (!running) setTechnique(t); }}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: running ? (technique.id === t.id ? 0.75 : 0.2) : 1,
              y: 0,
            }}
            transition={{
              type: 'spring', damping: 20, stiffness: 200,
              delay: running ? 0 : i * 0.07,
            }}
          >
            <span className={styles.techBenefit}>{t.label}</span>
            <span className={styles.techRatio}>{t.ratio}</span>
          </motion.button>
        ))}
      </div>

      {running && duration !== null && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
        </div>
      )}
    </div>
  );
}
