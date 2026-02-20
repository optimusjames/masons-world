'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { SwissFrame } from './components/SwissFrame';
import { ProgressRing } from './components/ProgressRing';
import { StatDisplay } from './components/StatDisplay';
import { StackedBarChart } from './components/StackedBarChart';
import { Heatmap } from './components/Heatmap';
import { DonutChart } from './components/DonutChart';
import { SegmentedBar } from './components/SegmentedBar';
import { MetricTile } from './components/MetricTile';
import { AnimatedCard } from './components/AnimatedCard';
import { useCountUp } from './components/useCountUp';
import './styles.css';

const exercises = [
  { name: 'Back Squat', detail: '315 x 3', pr: true },
  { name: 'Deadlift', detail: '365 x 5', pr: false },
  { name: 'Bench Press', detail: '225 x 5', pr: false },
  { name: 'Power Clean', detail: '185 x 3', pr: true },
  { name: 'Pull-ups', detail: '25 unbroken', pr: false },
  { name: 'Box Jumps', detail: '30" x 20', pr: false },
];

const weekBars = [
  { day: 'Mon', strength: 75, cardio: 40 },
  { day: 'Tue', strength: 50, cardio: 80 },
  { day: 'Wed', strength: 0, cardio: 30 },
  { day: 'Thu', strength: 85, cardio: 55 },
  { day: 'Fri', strength: 60, cardio: 90 },
  { day: 'Sat', strength: 70, cardio: 45 },
  { day: 'Sun', strength: 0, cardio: 20 },
];

const heatmapData = [
  0,1,3,2,0,4,3,1,0,2,
  2,4,3,0,1,3,4,2,3,0,
  0,3,4,2,4,0,1,3,2,4,
  1,0,2,3,4,3,0,2,4,3,
  3,2,0,4,3,1,2,4,3,0,
  0,2,4,3,2,4,1,0,3,4,
  2,3,4,0,3,4,3,2,4,3,
];

const heatmapColors = ['#33332e', '#6b4a20', '#a06020', '#cc7020', '#e87000'];

function CounterSpan({ value, className, delay = 0 }: { value: number; className: string; delay?: number }) {
  const count = useCountUp(value, 700, delay);
  return <span className={className}>{count}</span>;
}

export default function FitnessBento() {
  const [activeTab, setActiveTab] = useState<'consumed' | 'burned'>('consumed');

  return (
    <div className="bento-page">
      <SwissFrame
        logo="Iron Republic"
        meta="Athlete Dashboard"
        subLabels={['Week 07 / Feb 2026', 'Training Block: Strength', 'Day 14 of 42']}
        footerLabels={['System v2.4.1', 'Last Sync 08:42', 'Next Session: 17:30']}
      >
      <div className="bento-grid">

        {/* Orange -- Goal Progress */}
        <AnimatedCard className="card card-goal" delay={0}>
          <ProgressRing percentage={78}>
            <span className="goal-ring-pct">78</span>
          </ProgressRing>
          <div className="goal-footer">
            <hr className="goal-rule" />
            <div className="goal-meta">
              <div className="label">Monthly Goal</div>
              <div className="date">Feb 2026</div>
            </div>
          </div>
        </AnimatedCard>

        {/* Calories */}
        <AnimatedCard className="cal-stack" delay={0.08}>
          <button
            className={`cal-card ${activeTab === 'consumed' ? 'active' : 'inactive'}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('consumed'); }}
          >
            <StatDisplay label="Consumed" unit="kcal" value="2,340" />
          </button>
          <button
            className={`cal-card ${activeTab === 'burned' ? 'active' : 'inactive'}`}
            onClick={(e) => { e.stopPropagation(); setActiveTab('burned'); }}
          >
            <StatDisplay label="Burned" unit="kcal" value="1,870" />
          </button>
          <div className="cal-card active" style={{ borderBottom: 'none' }}>
            <StatDisplay label="Surplus" unit="kcal" value="+470" valueColor="#6b8f6b" />
          </div>
        </AnimatedCard>

        {/* Olive -- Weekly Activity */}
        <AnimatedCard className="card card-activity" delay={0.16}>
          <div className="title">Weekly<br />Training Load</div>
          <StackedBarChart
            bars={weekBars.map((b) => ({
              label: b.day,
              segments: [
                { height: `${b.strength}%`, className: 'bar-dark' },
                { height: `${b.cardio}%`, className: 'bar-black' },
              ],
            }))}
            footer={{ label: 'This Week:', value: '12,480 cal' }}
          />
        </AnimatedCard>

        {/* Activity heatmap */}
        <AnimatedCard className="card card-streak" delay={0.24}>
          <div className="streak-header">
            <div className="streak-header-left">
              <Flame size={22} strokeWidth={2} color="#e87000" />
              <CounterSpan value={14} className="streak-number" delay={200} />
            </div>
            <span className="streak-count">Day<br />Streak</span>
          </div>
          <Heatmap
            data={heatmapData}
            cols={10}
            colorStops={heatmapColors}
            renderCell={(level, i) =>
              level === 4 && i % 3 === 0
                ? <Flame size={8} strokeWidth={2} color="rgba(0,0,0,0.3)" />
                : null
            }
          />
          <div className="streak-months">
            <span className="streak-month">Jan</span>
            <span className="streak-month">Feb</span>
          </div>
        </AnimatedCard>

        {/* Workout Stats */}
        <AnimatedCard className="stats-stack" delay={0.32}>
          <div className="card-workout">
            <div className="w-title">Today&apos;s WOD</div>
            <motion.div
              className="w-amount"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              Fran<span className="w-unit"> 3:42</span>
            </motion.div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Workouts</div>
              <div className="stat-sub">This month</div>
            </div>
            <CounterSpan value={18} className="stat-num" delay={200} />
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">PRs Hit</div>
              <div className="stat-sub">Last 30 days</div>
            </div>
            <CounterSpan value={5} className="stat-num" delay={300} />
          </div>
        </AnimatedCard>

        {/* Donut -- Macro split */}
        <AnimatedCard delay={0.40}>
          <DonutChart
            segments={[
              { pct: 0.35, color: '#e87000' },
              { pct: 0.40, color: '#6b7355' },
              { pct: 0.25, color: '#8b5e3c' },
            ]}
          >
            <span className="donut-label">2,340</span>
            <span className="donut-sub">kcal</span>
          </DonutChart>
        </AnimatedCard>

        {/* Brown -- Workout Log */}
        <AnimatedCard className="card card-log" delay={0.48}>
          <div className="log-title">Today&apos;s<br />Lifts</div>
          <div className="exercise-list">
            {exercises.map((e, i) => (
              <motion.div
                key={e.name}
                className="exercise-row"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: 'spring',
                  damping: 20,
                  stiffness: 200,
                  delay: i * 0.06,
                }}
              >
                <div className="exercise-name">
                  {e.pr && (
                    <motion.span
                      className="pr-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        damping: 10,
                        stiffness: 300,
                        delay: i * 0.06 + 0.15,
                      }}
                    >
                      PR
                    </motion.span>
                  )}
                  {e.name}
                </div>
                <span className="exercise-detail">{e.detail}</span>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        {/* Heart Rate Zone */}
        <AnimatedCard className="hr-stack" delay={0.56}>
          <div className="card-hr">
            <div className="hr-upper">
              <div className="hr-title">Avg Heart Rate</div>
              <div className="hr-sub">During WOD</div>
            </div>
            <div className="hr-lower">
              <div className="hr-row">
                <span className="hr-unit">bpm</span>
                <CounterSpan value={164} className="hr-num" delay={200} />
              </div>
              <SegmentedBar
                segments={[
                  { flex: 1, color: '#5a8a5a' },
                  { flex: 1.5, color: '#b8b840' },
                  { flex: 2, color: '#d08030' },
                  { flex: 1.2, color: '#c84040' },
                ]}
                labels={['Easy', 'Moderate', 'Hard', 'Max']}
                className="zone-bars-wrap"
              />
            </div>
          </div>
          <div className="metric-grid">
            <MetricTile value="8.2" label="Sleep" />
            <MetricTile value="72" label="HRV" />
            <MetricTile value="186" label="lbs" />
            <MetricTile value="14%" label="Body Fat" />
          </div>
        </AnimatedCard>

        {/* Sleep stack */}
        <AnimatedCard className="sleep-stack" delay={0.64}>
          <div className="card-sleep">
            <div className="sleep-title">Last Night</div>
            <div className="sleep-row">
              <span className="sleep-unit-label">hrs</span>
              <CounterSpan value={8} className="sleep-hours" delay={200} />
            </div>
            <SegmentedBar
              segments={[
                { flex: 1.5, color: '#2d4a6b' },
                { flex: 3, color: '#3a6b8b' },
                { flex: 1, color: '#2d4a6b' },
                { flex: 2, color: '#5a8bab' },
                { flex: 0.5, color: '#2d4a6b' },
                { flex: 1.5, color: '#3a6b8b' },
              ]}
              legend={[
                { color: '#2d4a6b', label: 'Deep' },
                { color: '#3a6b8b', label: 'Light' },
                { color: '#5a8bab', label: 'REM' },
              ]}
              className="sleep-bar-wrap"
            />
          </div>
          <div className="metric-grid-dark">
            <MetricTile value="92" label="Score" variant="dark" />
            <MetricTile value="11:15" label="Bedtime" variant="dark" />
            <MetricTile value="7:28" label="Wake" variant="dark" />
            <MetricTile value="2" label="Wakes" variant="dark" />
          </div>
        </AnimatedCard>
      </div>
      </SwissFrame>
    </div>
  );
}
