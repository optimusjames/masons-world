'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import s from './styles.module.css';

type Duration = 'quick' | 'flow' | 'long';
type Level = 'gentle' | 'moderate' | 'strong';
type Theme = 'sage' | 'ocean' | 'dusk';

interface Pose {
  name: string;
  description: string;
  hold: string;
  sides?: boolean;
}

const THEMES = [
  { id: 'sage' as const, color: '#7fa882' },
  { id: 'ocean' as const, color: '#7aafc4' },
  { id: 'dusk' as const, color: '#a882a8' },
];

const DURATIONS: { key: Duration; label: string }[] = [
  { key: 'quick', label: 'Quick' },
  { key: 'flow', label: 'Flow' },
  { key: 'long', label: 'Long' },
];

const LEVELS: { key: Level; label: string }[] = [
  { key: 'gentle', label: 'Gentle' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'strong', label: 'Strong' },
];

// Hold times shown are per side when sides: true.
// formatTotal() doubles them. Targets: quick ~5 min, flow ~15 min, long ~30 min.

const flows: Record<Duration, Record<Level, Pose[]>> = {
  quick: {
    gentle: [
      // 60+60+60+(30×2)+60 = 300s = 5 min
      { name: "Child's Pose", description: 'Rest on knees, forehead to floor', hold: '60s' },
      { name: 'Cat-Cow', description: 'Spinal waves on hands and knees', hold: '60s' },
      { name: 'Seated Forward Fold', description: 'Hinge forward over extended legs', hold: '60s' },
      { name: 'Supine Twist', description: 'Lie back, knee crosses toward floor', hold: '30s', sides: true },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '60s' },
    ],
    moderate: [
      // 30+45+45+(30×2)+(45×2)+30 = 300s = 5 min
      { name: 'Mountain Pose', description: 'Stand tall, feet grounded', hold: '30s' },
      { name: 'Forward Fold', description: 'Hinge at hips, reach toward floor', hold: '45s' },
      { name: 'Downward Dog', description: 'Inverted V shape, heels press down', hold: '45s' },
      { name: 'Warrior I', description: 'Lunge with arms raised overhead', hold: '30s', sides: true },
      { name: 'Low Lunge', description: 'Back knee down, hip flexor stretch', hold: '45s', sides: true },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '30s' },
    ],
    strong: [
      // 30+30+45+(30×2)+45+30+20+30 = 290s ≈ 5 min
      { name: 'Mountain Pose', description: 'Stand tall, feet grounded', hold: '30s' },
      { name: 'Forward Fold', description: 'Hinge at hips, reach toward floor', hold: '30s' },
      { name: 'Downward Dog', description: 'Inverted V shape, heels press down', hold: '45s' },
      { name: 'Warrior I', description: 'Lunge with arms raised overhead', hold: '30s', sides: true },
      { name: 'Chair Pose', description: 'Sit back into an imaginary chair', hold: '45s' },
      { name: 'Plank Hold', description: 'Straight body, arms extended', hold: '30s' },
      { name: 'Upward Dog', description: 'Chest lifted, legs off the floor', hold: '20s' },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '30s' },
    ],
  },
  flow: {
    gentle: [
      // 90+90+(60×2)+(90×2)+90+90+(60×2)+120 = 900s = 15 min
      { name: "Child's Pose", description: 'Rest on knees, forehead to floor', hold: '90s' },
      { name: 'Cat-Cow', description: 'Spinal waves on hands and knees', hold: '90s' },
      { name: 'Thread the Needle', description: 'Arm sweeps under body from all-fours', hold: '60s', sides: true },
      { name: 'Lizard Pose', description: 'Deep lunge, front foot outside of hand', hold: '90s', sides: true },
      { name: 'Seated Forward Fold', description: 'Hinge forward over extended legs', hold: '90s' },
      { name: 'Butterfly', description: 'Soles together, fold gently forward', hold: '90s' },
      { name: 'Supine Twist', description: 'Lie back, knee crosses toward floor', hold: '60s', sides: true },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '2 min' },
    ],
    moderate: [
      // 30+45+45+(45×2)+(45×2)+(60×2)+(60×2)+60+180 = 900s = 15 min
      { name: 'Mountain Pose', description: 'Stand tall, feet grounded', hold: '30s' },
      { name: 'Forward Fold', description: 'Hinge at hips, reach toward floor', hold: '45s' },
      { name: 'Downward Dog', description: 'Inverted V shape, heels press down', hold: '45s' },
      { name: 'Warrior I', description: 'Lunge with arms raised overhead', hold: '45s', sides: true },
      { name: 'Warrior II', description: 'Wide stance, arms extended sideways', hold: '45s', sides: true },
      { name: 'Triangle', description: 'Wide legs, reach down and open up', hold: '60s', sides: true },
      { name: 'Low Lunge', description: 'Back knee down, hip flexor stretch', hold: '60s', sides: true },
      { name: "Child's Pose", description: 'Rest on knees, forehead to floor', hold: '60s' },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '3 min' },
    ],
    strong: [
      // 20+30+45+(45×2)+(45×2)+(45×2)+(60×2)+45+30+(120×2)+120 = 920s ≈ 15 min
      { name: 'Mountain Pose', description: 'Stand tall, feet grounded', hold: '20s' },
      { name: 'Forward Fold', description: 'Hinge at hips, reach toward floor', hold: '30s' },
      { name: 'Downward Dog', description: 'Inverted V shape, heels press down', hold: '45s' },
      { name: 'Warrior I', description: 'Lunge with arms raised overhead', hold: '45s', sides: true },
      { name: 'Warrior II', description: 'Wide stance, arms extended sideways', hold: '45s', sides: true },
      { name: 'Side Angle', description: 'Lunge, forearm on thigh, arm extends overhead', hold: '45s', sides: true },
      { name: 'Crescent Lunge', description: 'High lunge, arms raised overhead', hold: '60s', sides: true },
      { name: 'Chair Pose', description: 'Sit back into an imaginary chair', hold: '45s' },
      { name: 'Crow Pose', description: 'Balance on hands, knees on upper arms', hold: '30s' },
      { name: 'Pigeon', description: 'Deep hip opener, one leg folded forward', hold: '2 min', sides: true },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '2 min' },
    ],
  },
  long: {
    gentle: [
      // 180+180+120+(120×2)+(120×2)+120+(90×2)+240+300 = 1800s = 30 min
      { name: 'Centering Breath', description: 'Seated, eyes closed, breathe deeply', hold: '3 min' },
      { name: "Child's Pose", description: 'Rest on knees, forehead to floor', hold: '3 min' },
      { name: 'Cat-Cow', description: 'Spinal waves on hands and knees', hold: '2 min' },
      { name: 'Thread the Needle', description: 'Arm sweeps under body from all-fours', hold: '2 min', sides: true },
      { name: 'Lizard Pose', description: 'Deep lunge, front foot outside of hand', hold: '2 min', sides: true },
      { name: 'Butterfly', description: 'Soles together, fold gently forward', hold: '2 min' },
      { name: 'Supine Twist', description: 'Lie back, knee crosses toward floor', hold: '90s', sides: true },
      { name: 'Legs Up the Wall', description: 'Lie back, legs rest vertically up wall', hold: '4 min' },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '5 min' },
    ],
    moderate: [
      // 60+60+90+(90×2)+(45×2)+(45×2)+(60×2)+(45×2)+(180×2)+120+120+(60×2)+300 = 1800s = 30 min
      { name: 'Mountain Pose', description: 'Stand tall, feet grounded', hold: '60s' },
      { name: 'Forward Fold', description: 'Hinge at hips, reach toward floor', hold: '60s' },
      { name: 'Downward Dog', description: 'Inverted V shape, heels press down', hold: '90s' },
      { name: 'Low Lunge', description: 'Back knee down, hip flexor stretch', hold: '90s', sides: true },
      { name: 'Warrior I', description: 'Lunge with arms raised overhead', hold: '45s', sides: true },
      { name: 'Warrior II', description: 'Wide stance, arms extended sideways', hold: '45s', sides: true },
      { name: 'Triangle', description: 'Wide legs, reach down and open up', hold: '60s', sides: true },
      { name: 'Half Moon', description: 'Balance on one leg, body opens sideways', hold: '45s', sides: true },
      { name: 'Pigeon', description: 'Deep hip opener, one leg folded forward', hold: '3 min', sides: true },
      { name: 'Bridge', description: 'Lie back, press hips toward the ceiling', hold: '2 min' },
      { name: 'Happy Baby', description: 'On back, hold soles with knees wide', hold: '2 min' },
      { name: 'Seated Twist', description: 'Torso rotates over a bent knee', hold: '60s', sides: true },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '5 min' },
    ],
    strong: [
      // 30+45+60+(90×2)+(90×2)+(60×2)+(60×2)+60+45+90+(240×2)+90+300 = 1800s = 30 min
      { name: 'Mountain Pose', description: 'Stand tall, feet grounded', hold: '30s' },
      { name: 'Forward Fold', description: 'Hinge at hips, reach toward floor', hold: '45s' },
      { name: 'Downward Dog', description: 'Inverted V shape, heels press down', hold: '60s' },
      { name: 'Warrior Sequence', description: 'Flow through Warrior I, II, and III', hold: '90s', sides: true },
      { name: 'Crescent Lunge', description: 'High lunge, arms raised overhead', hold: '90s', sides: true },
      { name: 'Side Angle', description: 'Lunge, forearm on thigh, arm extends overhead', hold: '60s', sides: true },
      { name: 'Half Moon', description: 'Balance on one leg, body opens sideways', hold: '60s', sides: true },
      { name: 'Chair Pose', description: 'Sit back into an imaginary chair', hold: '60s' },
      { name: 'Crow Pose', description: 'Balance on hands, knees on upper arms', hold: '45s' },
      { name: 'Headstand Prep', description: 'Forearms grounded, crown of head down', hold: '90s' },
      { name: 'Pigeon', description: 'Deep hip opener, one leg folded forward', hold: '4 min', sides: true },
      { name: 'Bridge', description: 'Lie back, press hips toward the ceiling', hold: '90s' },
      { name: 'Savasana', description: 'Lie flat, complete stillness', hold: '5 min' },
    ],
  },
};

const MANTRAS: Record<Duration, Record<Level, string>> = {
  quick: {
    gentle: 'A few minutes is enough.',
    moderate: 'Short, sharp, present.',
    strong: 'Move well. That\'s the whole thing.',
  },
  flow: {
    gentle: 'Rest. Restore. Arrive.',
    moderate: 'Settle in. Breathe into it.',
    strong: 'Find strength in stillness.',
  },
  long: {
    gentle: 'Time is the practice.',
    moderate: 'Depth takes time. Take it.',
    strong: 'Challenge and surrender, both.',
  },
};

function parseHoldToSeconds(hold: string): number {
  if (hold.includes('min')) return parseInt(hold) * 60;
  if (hold.endsWith('s')) return parseInt(hold);
  return 30;
}

// sides: true = hold is per side, doubled in total
function formatTotal(poses: Pose[]): number {
  const total = poses.reduce((sum, p) => {
    const secs = parseHoldToSeconds(p.hold);
    return sum + (p.sides ? secs * 2 : secs);
  }, 0);
  return Math.round(total / 60);
}

export default function YogaFlow() {
  const [view, setView] = useState<'setup' | 'flow'>('setup');
  const [duration, setDuration] = useState<Duration>('flow');
  const [level, setLevel] = useState<Level>('moderate');
  const [theme, setTheme] = useState<Theme>('sage');

  const poses = flows[duration][level];
  const totalMins = formatTotal(poses);

  return (
    <div className={s.page} data-theme={theme}>

      <div className={s.header}>
        <p className={s.eyebrow}>yoga flow</p>
        <div className={s.swatches}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`${s.swatch} ${theme === t.id ? s.swatchActive : ''}`}
              style={{ '--swatch-color': t.color } as React.CSSProperties}
              onClick={() => setTheme(t.id)}
              aria-label={t.id}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'setup' ? (
          <motion.div
            key="setup"
            className={s.setupPanel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={s.selectors}>
              <div>
                <div className={s.sectionLabel}>Duration</div>
                <div className={s.pillRow}>
                  {DURATIONS.map((d) => (
                    <button
                      key={d.key}
                      className={`${s.pill} ${duration === d.key ? s.pillActive : ''}`}
                      onClick={() => setDuration(d.key)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={s.sectionLabel}>Level</div>
                <div className={s.pillRow}>
                  {LEVELS.map((l) => (
                    <button
                      key={l.key}
                      className={`${s.pill} ${level === l.key ? s.pillActive : ''}`}
                      onClick={() => setLevel(l.key)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className={s.mantra}>{MANTRAS[duration][level]}</p>

            <button className={s.beginBtn} onClick={() => setView('flow')}>
              begin flow
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="flow"
            className={s.flowPanel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={s.flowHeader}>
              <div>
                <h2 className={s.flowTitle}>Today&apos;s Flow</h2>
                <p className={s.flowMeta}>{totalMins} min · {poses.length} poses</p>
              </div>
              <button className={s.backBtn} onClick={() => setView('setup')}>← setup</button>
            </div>

            <div className={s.poseList}>
              {poses.map((pose, i) => (
                <motion.div
                  key={`${duration}-${level}-${i}`}
                  className={s.poseRow}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200, delay: i * 0.04 }}
                >
                  <div className={s.poseLeft}>
                    <div className={s.poseName}>{pose.name}</div>
                    <div className={s.poseDesc}>{pose.description}</div>
                  </div>
                  <div className={s.poseRight}>
                    <span className={s.poseHold}>{pose.hold}</span>
                    {pose.sides && <span className={s.poseSides}>each side</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
