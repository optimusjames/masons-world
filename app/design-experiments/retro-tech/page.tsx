'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import './styles.css';

function useKnob(initial: number, min = 0, max = 100) {
  const [value, setValue] = useState(initial);
  const dragRef = useRef<{ startY: number; startVal: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { startY: e.clientY, startVal: value };
    },
    [value],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const delta = (dragRef.current.startY - e.clientY) * 0.5;
      const next = Math.round(
        Math.min(max, Math.max(min, dragRef.current.startVal + delta)),
      );
      setValue(next);
    },
    [min, max],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  return { value, rotation, onPointerDown, onPointerMove, onPointerUp };
}

function useFader(initial: number, min = 0, max = 100) {
  const [value, setValue] = useState(initial);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback(
    (clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const pct = 1 - (clientY - rect.top) / rect.height;
      setValue(Math.round(Math.min(max, Math.max(min, pct * (max - min) + min))));
    },
    [min, max],
  );

  const dragRef = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = true;
      handleInteraction(e.clientY);
    },
    [handleInteraction],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      handleInteraction(e.clientY);
    },
    [handleInteraction],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = false;
  }, []);

  const pct = ((value - min) / (max - min)) * 100;

  return { value, pct, trackRef, onPointerDown, onPointerMove, onPointerUp };
}

function KnobDots() {
  const dots = [];
  const count = 11;
  for (let i = 0; i < count; i++) {
    const angle = -135 + (i / (count - 1)) * 270;
    const rad = (angle * Math.PI) / 180;
    const r = 44;
    const cx = 50 + r * Math.cos(rad - Math.PI / 2);
    const cy = 50 + r * Math.sin(rad - Math.PI / 2);
    dots.push(
      <div
        key={i}
        className="knob-dot"
        style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%,-50%)' }}
      />,
    );
  }
  return <div className="knob-dot-ring">{dots}</div>;
}

function Knob({
  label,
  knob,
}: {
  label: string;
  knob: ReturnType<typeof useKnob>;
}) {
  return (
    <div className="control-group">
      <div className="knob-container">
        <KnobDots />
        <div
          className="knob"
          style={{ transform: `rotate(${knob.rotation}deg)` }}
          onPointerDown={knob.onPointerDown}
          onPointerMove={knob.onPointerMove}
          onPointerUp={knob.onPointerUp}
        >
          <div className="knob-indicator" />
        </div>
      </div>
      <span className="control-label">{label}</span>
    </div>
  );
}

function Fader({
  label,
  fader,
}: {
  label: string;
  fader: ReturnType<typeof useFader>;
}) {
  return (
    <div className="control-group">
      <div
        className="fader-track"
        ref={fader.trackRef}
        onPointerDown={fader.onPointerDown}
        onPointerMove={fader.onPointerMove}
        onPointerUp={fader.onPointerUp}
      >
        <div className="fader-fill" style={{ height: `${fader.pct}%` }} />
        <div className="fader-thumb" style={{ bottom: `${fader.pct}%` }} />
      </div>
      <span className="control-label">{label}</span>
    </div>
  );
}

function Toggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="control-group">
      <div
        className={`toggle-switch ${on ? 'on' : ''}`}
        onClick={onToggle}
        role="switch"
        aria-checked={on}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') onToggle();
        }}
      >
        <div className="toggle-handle" />
      </div>
      <span className="control-label">{label}</span>
    </div>
  );
}

function DisplayMeter({ levels }: { levels: number[] }) {
  return (
    <div className="display-meter">
      {levels.map((l, i) => (
        <div
          key={i}
          className={`display-meter-bar ${l > 0 ? 'filled' : ''} ${l > 80 ? 'peak' : ''}`}
          style={{ height: `${Math.max(4, l)}%` }}
        />
      ))}
      <div className="display-meter-scanlines" />
    </div>
  );
}

function PerfGrid({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const dot = 4;
  const gap = 4;
  const pitch = dot + gap;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const cols = Math.floor((width + gap) / pitch);
      const rows = Math.floor((height + gap) / pitch);
      setCount(cols * rows);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className={`perf-grid ${className ?? ''}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="perf-hole" />
      ))}
    </div>
  );
}

export default function RetroTechPanel() {
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

  // Animate meters
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

  // Format freq display
  const freqDisplay =
    freq.value >= 1000
      ? `${(freq.value / 1000).toFixed(1)}k`
      : `${freq.value}`;

  return (
    <div className="device">
      <div className="chassis">
        {/* Screws */}
        <div className="screw tl" />
        <div className="screw tr" />
        <div className="screw bl" />
        <div className="screw br" />

        {/* Top bar */}
        <div className="top-bar">
          <span className="model-name">RC-1 CONTROL</span>
          <div className="led-cluster">
            <div className={`led ${!bypassOn ? 'active' : ''}`} />
            <div className={`led ${filterOn ? 'active' : ''}`} />
            <div className={`led ${recording ? 'active' : ''}`} />
          </div>
        </div>

        {/* Display */}
        <div className="display">
          <div className="display-main">
            <span className="display-label">Frequency</span>
            <span className="display-value">{freqDisplay}</span>
            <span className="display-unit">Hz</span>
          </div>
          <DisplayMeter levels={meterLevels} />
          <div className="display-right">
            <span className={`display-status ${recording ? 'active' : ''}`}>
              {recording ? 'REC' : 'IDLE'}
            </span>
            <span className="display-status">
              GAIN {gain.value}%
            </span>
            <span className="display-status">
              MIX {mix.value}%
            </span>
          </div>
        </div>

        {/* Knobs */}
        <div className="controls-row">
          <Knob label="Gain" knob={gain} />
          <Knob label="Freq" knob={freq} />
          <Knob label="Res" knob={resonance} />
          <Knob label="Mix" knob={mix} />
        </div>

        <div className="divider" />

        {/* Faders + Toggles */}
        <div className="controls-row">
          <div className="faders-section">
            <Fader label="Vol" fader={vol} />
            <Fader label="Low" fader={low} />
            <Fader label="Mid" fader={mid} />
            <Fader label="High" fader={high} />
          </div>
          <div className="toggles-column">
            <Toggle label="Filter" on={filterOn} onToggle={() => setFilterOn((p) => !p)} />
            <Toggle label="Bypass" on={bypassOn} onToggle={() => setBypassOn((p) => !p)} />
            <Toggle label="Mute" on={muteOn} onToggle={() => setMuteOn((p) => !p)} />
          </div>
          <div className="buttons-column">
            <button
              className={`btn btn-stacked ${recording ? 'btn-accent' : 'btn-default'}`}
              onClick={() => setRecording((p) => !p)}
            >
              {recording ? 'STOP' : 'RECORD'}
            </button>
            <button className="btn btn-stacked btn-default">RESET</button>
            <button className="btn btn-stacked btn-default">SAVE</button>
            <button className="btn btn-stacked btn-accent">SEND</button>
          </div>
          <PerfGrid className="perf-grid-inline" />
        </div>

        {/* Bottom info */}
        <div className="bottom-info">
          <span className="serial">SN 2024-0847</span>
          <span className="badge">48kHz / 24bit</span>
        </div>
      </div>
    </div>
  );
}
