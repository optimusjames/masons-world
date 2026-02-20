'use client';

import { useState } from 'react';
import { Flame } from 'lucide-react';
import { SwissFrame } from './components/SwissFrame';
import { ProgressRing } from './components/ProgressRing';
import { StatDisplay } from './components/StatDisplay';
import { StackedBarChart } from './components/StackedBarChart';
import { Heatmap } from './components/Heatmap';
import { DonutChart } from './components/DonutChart';
import { SegmentedBar } from './components/SegmentedBar';
import { MetricTile } from './components/MetricTile';
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

        {/* Orange — Goal Progress */}
        <div className="card card-goal">
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
        </div>

        {/* Calories */}
        <div className="cal-stack">
          <button
            className={`cal-card ${activeTab === 'consumed' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('consumed')}
          >
            <StatDisplay label="Consumed" unit="kcal" value="2,340" />
          </button>
          <button
            className={`cal-card ${activeTab === 'burned' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('burned')}
          >
            <StatDisplay label="Burned" unit="kcal" value="1,870" />
          </button>
          <div className="cal-card active" style={{ borderBottom: 'none' }}>
            <StatDisplay label="Surplus" unit="kcal" value="+470" valueColor="#6b8f6b" />
          </div>
        </div>

        {/* Olive — Weekly Activity */}
        <div className="card card-activity">
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
        </div>

        {/* Activity heatmap */}
        <div className="card card-streak">
          <div className="streak-header">
            <div className="streak-header-left">
              <Flame size={22} strokeWidth={2} color="#e87000" />
              <span className="streak-number">14</span>
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
        </div>

        {/* Workout Stats */}
        <div className="stats-stack">
          <div className="card-workout">
            <div className="w-title">Today&apos;s WOD</div>
            <div className="w-amount">Fran<span className="w-unit"> 3:42</span></div>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">Workouts</div>
              <div className="stat-sub">This month</div>
            </div>
            <span className="stat-num">18</span>
          </div>
          <div className="stat-card">
            <div>
              <div className="stat-label">PRs Hit</div>
              <div className="stat-sub">Last 30 days</div>
            </div>
            <span className="stat-num">5</span>
          </div>
        </div>

        {/* Donut — Macro split */}
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

        {/* Brown — Workout Log */}
        <div className="card card-log">
          <div className="log-title">Today&apos;s<br />Lifts</div>
          <div className="exercise-list">
            {exercises.map((e) => (
              <div key={e.name} className="exercise-row">
                <div className="exercise-name">
                  {e.pr && <span className="pr-badge">PR</span>}
                  {e.name}
                </div>
                <span className="exercise-detail">{e.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heart Rate Zone */}
        <div className="hr-stack">
          <div className="card-hr">
            <div className="hr-upper">
              <div className="hr-title">Avg Heart Rate</div>
              <div className="hr-sub">During WOD</div>
            </div>
            <div className="hr-lower">
              <div className="hr-row">
                <span className="hr-unit">bpm</span>
                <span className="hr-num">164</span>
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
        </div>

        {/* Sleep stack */}
        <div className="sleep-stack">
          <div className="card-sleep">
            <div className="sleep-title">Last Night</div>
            <div className="sleep-row">
              <span className="sleep-unit-label">hrs</span>
              <span className="sleep-hours">8.2</span>
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
        </div>
      </div>
      </SwissFrame>
    </div>
  );
}
