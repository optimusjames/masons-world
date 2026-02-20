'use client';

import { useState } from 'react';
import { Flame } from 'lucide-react';
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

// Activity heatmap (10 cols x 7 rows = 70 cells, ~10 weeks)
const heatmapData = [
  0,1,3,2,0,4,3,1,0,2,
  2,4,3,0,1,3,4,2,3,0,
  0,3,4,2,4,0,1,3,2,4,
  1,0,2,3,4,3,0,2,4,3,
  3,2,0,4,3,1,2,4,3,0,
  0,2,4,3,2,4,1,0,3,4,
  2,3,4,0,3,4,3,2,4,3,
];

export default function FitnessBento() {
  const [activeTab, setActiveTab] = useState<'consumed' | 'burned'>('consumed');

  return (
    <div className="bento-page">
      <div className="bento-grid">

        {/* Orange — Goal Progress */}
        <div className="card card-goal">
          <div className="goal-ring-wrap">
            <svg viewBox="0 0 180 180" className="goal-ring-svg">
              {/* Track */}
              <circle
                cx="90" cy="90" r="72"
                fill="none"
                stroke="rgba(42,40,32,0.22)"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Progress arc — 78% */}
              <circle
                cx="90" cy="90" r="72"
                fill="none"
                stroke="rgba(90,50,10,0.82)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 72 * 0.78} ${2 * Math.PI * 72 * 0.22}`}
                transform="rotate(-90 90 90)"
              />
            </svg>
            <div className="goal-ring-center">
              <span className="goal-ring-pct">78</span>
            </div>
          </div>
          <div className="goal-footer">
            <hr className="goal-rule" />
            <div className="goal-meta">
              <div className="label">Monthly Goal</div>
              <div className="date">Feb 2026</div>
            </div>
          </div>
        </div>

        {/* Calories — unified card with dividers */}
        <div className="cal-stack">
          <button
            className={`cal-card ${activeTab === 'consumed' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('consumed')}
          >
            <span className="cal-label">Consumed</span>
            <div className="cal-row">
              <span className="cal-unit">kcal</span>
              <span className="cal-value">2,340</span>
            </div>
          </button>
          <button
            className={`cal-card ${activeTab === 'burned' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('burned')}
          >
            <span className="cal-label">Burned</span>
            <div className="cal-row">
              <span className="cal-unit">kcal</span>
              <span className="cal-value">1,870</span>
            </div>
          </button>
          <div className="cal-card active" style={{ borderBottom: 'none' }}>
            <span className="cal-label">Surplus</span>
            <div className="cal-row">
              <span className="cal-unit">kcal</span>
              <span className="cal-value" style={{ color: '#6b8f6b' }}>+470</span>
            </div>
          </div>
        </div>

        {/* Olive — Weekly Activity */}
        <div className="card card-activity">
          <div className="title">Weekly<br />Training Load</div>
          <div className="bar-chart">
            {weekBars.map((b) => (
              <div key={b.day} className="bar-col">
                <div className="bar-stack">
                  <div className="bar-dark" style={{ height: `${b.strength}%` }} />
                  <div className="bar-black" style={{ height: `${b.cardio}%` }} />
                </div>
                <span className="bar-day">{b.day}</span>
              </div>
            ))}
          </div>
          <div className="activity-footer">
            <span className="ft-label">This Week:</span>
            <span className="ft-value">12,480 cal</span>
          </div>
        </div>

        {/* Activity heatmap card */}
        <div className="card card-streak">
          <div className="streak-header">
            <div className="streak-header-left">
              <Flame size={22} strokeWidth={2} color="#e87000" />
              <span className="streak-number">14</span>
            </div>
            <span className="streak-count">Day<br />Streak</span>
          </div>
          <div className="streak-grid">
            {heatmapData.map((level, i) => (
              <div key={i} className={`streak-cell l${level}`}>
                {level === 4 && i % 3 === 0 && (
                  <Flame size={8} strokeWidth={2} color="rgba(0,0,0,0.3)" />
                )}
              </div>
            ))}
          </div>
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

        {/* Donut — Macro split (larger, smoother) */}
        <div className="donut-wrap">
          {(() => {
            const r = 78;
            const cx = 100;
            const cy = 100;
            const circumference = 2 * Math.PI * r;
            const gap = 6; // gap in px between segments
            const segments = [
              { pct: 0.35, color: '#e87000' },  // Protein
              { pct: 0.40, color: '#6b7355' },  // Carbs
              { pct: 0.25, color: '#8b5e3c' },  // Fat
            ];
            let offset = 0;
            return (
              <svg viewBox="0 0 200 200" className="donut-svg">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a3830" strokeWidth="24" />
                {segments.map((seg, i) => {
                  const segLen = circumference * seg.pct - gap;
                  const dasharray = `${segLen} ${circumference - segLen}`;
                  const dashoffset = -offset;
                  offset += circumference * seg.pct;
                  return (
                    <circle
                      key={i}
                      cx={cx} cy={cy} r={r}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth="24"
                      strokeLinecap="round"
                      strokeDasharray={dasharray}
                      strokeDashoffset={dashoffset}
                      transform={`rotate(-90 ${cx} ${cy})`}
                    />
                  );
                })}
              </svg>
            );
          })()}
          <div className="donut-center">
            <span className="donut-label">2,340</span>
            <span className="donut-sub">kcal</span>
          </div>
        </div>

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
            <div className="hr-title">Avg Heart Rate</div>
            <div className="hr-sub">During WOD</div>
            <div className="hr-row">
              <span className="hr-unit">bpm</span>
              <span className="hr-num">164</span>
            </div>
            <div className="zone-wrap">
              <div className="zone-bars">
                <div className="zone-bar" style={{ flex: 1, background: '#5a8a5a' }} />
                <div className="zone-bar" style={{ flex: 1.5, background: '#b8b840' }} />
                <div className="zone-bar" style={{ flex: 2, background: '#d08030' }} />
                <div className="zone-bar" style={{ flex: 1.2, background: '#c84040' }} />
              </div>
              <div className="zone-labels">
                <span className="zone-label">Easy</span>
                <span className="zone-label">Moderate</span>
                <span className="zone-label">Hard</span>
                <span className="zone-label">Max</span>
              </div>
            </div>
          </div>
          <div className="metric-grid">
            <div className="metric-tile">
              <span className="metric-value">8.2</span>
              <span className="metric-label">Sleep</span>
            </div>
            <div className="metric-tile">
              <span className="metric-value">72</span>
              <span className="metric-label">HRV</span>
            </div>
            <div className="metric-tile">
              <span className="metric-value">186</span>
              <span className="metric-label">lbs</span>
            </div>
            <div className="metric-tile">
              <span className="metric-value">14%</span>
              <span className="metric-label">Body Fat</span>
            </div>
          </div>
        </div>

        {/* Sleep stack — mirrors HR layout */}
        <div className="sleep-stack">
          <div className="card-sleep">
            <div className="sleep-title">Last Night</div>
            <div className="sleep-row">
              <span className="sleep-unit-label">hrs</span>
              <span className="sleep-hours">8.2</span>
            </div>
            <div className="sleep-stages">
              <div className="sleep-stage" style={{ flex: 1.5, background: '#2d4a6b' }} />
              <div className="sleep-stage" style={{ flex: 3, background: '#3a6b8b' }} />
              <div className="sleep-stage" style={{ flex: 1, background: '#2d4a6b' }} />
              <div className="sleep-stage" style={{ flex: 2, background: '#5a8bab' }} />
              <div className="sleep-stage" style={{ flex: 0.5, background: '#2d4a6b' }} />
              <div className="sleep-stage" style={{ flex: 1.5, background: '#3a6b8b' }} />
            </div>
            <div className="sleep-legend">
              <div className="sleep-legend-item">
                <span className="sleep-legend-dot" style={{ background: '#2d4a6b' }} />Deep
              </div>
              <div className="sleep-legend-item">
                <span className="sleep-legend-dot" style={{ background: '#3a6b8b' }} />Light
              </div>
              <div className="sleep-legend-item">
                <span className="sleep-legend-dot" style={{ background: '#5a8bab' }} />REM
              </div>
            </div>
          </div>
          <div className="metric-grid-dark">
            <div className="metric-tile-dark">
              <span className="metric-value">92</span>
              <span className="metric-label">Score</span>
            </div>
            <div className="metric-tile-dark">
              <span className="metric-value">11:15</span>
              <span className="metric-label">Bedtime</span>
            </div>
            <div className="metric-tile-dark">
              <span className="metric-value">7:28</span>
              <span className="metric-label">Wake</span>
            </div>
            <div className="metric-tile-dark">
              <span className="metric-value">2</span>
              <span className="metric-label">Wakes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
