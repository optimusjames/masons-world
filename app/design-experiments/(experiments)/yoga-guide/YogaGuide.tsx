'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import s from './styles.module.css';
import {
  type Intention,
  type ActivityLevel,
  type PreferredTime,
  type Dosha,
  type SkillLevel,
  type DietaryStyle,
  type Step,
  type Results,
  type BreathingTechnique,
  type InjuryArea,
  type Accommodations,
  type AccommodationSide,
  INTENTIONS_LIST,
  ACTIVITY_LEVELS,
  PREFERRED_TIMES,
  SKILL_LEVELS,
  DIETARY_STYLES,
  ACCOMMODATION_LABELS,
  BILATERAL_AREAS,
  AREA_SIDES,
  LIMB_SIDES,
  LIMB_LEVELS,
  DOSHA_CARDS,
  RHYTHM_DETAIL,
  DOSHA_AYURVEDA_DETAIL,
  parseHoldToSeconds,
  getRecommendations,
} from './data';

// ── Theme ──────────────────────────────────────────────────────────────────

type Theme = 'sage' | 'ocean' | 'dusk' | 'orange';

const THEMES = [
  { id: 'sage' as const, color: '#62b86c' },
  { id: 'ocean' as const, color: '#50b8d4' },
  { id: 'dusk' as const, color: '#bc7abc' },
  { id: 'orange' as const, color: '#cc7a4a' },
];

// ── Progress Dots ──────────────────────────────────────────────────────────

const QUESTIONNAIRE_STEPS: Step[] = ['intentions', 'context', 'accommodations', 'dosha', 'results'];

function ProgressDots({ step }: { step: Step }) {
  if (!QUESTIONNAIRE_STEPS.includes(step)) return null;
  const activeIndex = QUESTIONNAIRE_STEPS.indexOf(step);
  return (
    <div className={s.progressDots}>
      {QUESTIONNAIRE_STEPS.map((_, i) => (
        <div key={i} className={`${s.progressDot} ${i <= activeIndex ? s.progressDotActive : ''}`} />
      ))}
    </div>
  );
}

// ── Breathe View ───────────────────────────────────────────────────────────

const BREATH_DURATIONS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '20 min', seconds: 1200 },
  { label: '∞', seconds: Infinity },
];

function BreatheView({
  techniques,
  onBack,
}: {
  techniques: BreathingTechnique[];
  onBack: () => void;
}) {
  const [activeTech, setActiveTech] = useState(techniques[0]);
  const [targetSecs, setTargetSecs] = useState(600);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phaseIdxRef = useRef(0);
  const [secsLeft, setSecsLeft] = useState(techniques[0].phases[0].duration);
  const [elapsed, setElapsed] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);

  const currentPhase = activeTech.phases[phaseIdx];
  const elapsedMins = Math.floor(elapsed / 60);
  const elapsedSecs = elapsed % 60;

  function switchTechnique(t: BreathingTechnique) {
    setRunning(false);
    setActiveTech(t);
    phaseIdxRef.current = 0;
    setPhaseIdx(0);
    setSecsLeft(t.phases[0].duration);
    setElapsed(0);
    setSessionDone(false);
  }

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (isFinite(targetSecs) && next >= targetSecs) {
          setRunning(false);
          setSessionDone(true);
        }
        return next;
      });
      setSecsLeft((prev) => {
        if (prev > 1) return prev - 1;
        const nextIdx = (phaseIdxRef.current + 1) % activeTech.phases.length;
        phaseIdxRef.current = nextIdx;
        setPhaseIdx(nextIdx);
        return activeTech.phases[nextIdx].duration;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, activeTech, targetSecs]);

  function startSession() {
    phaseIdxRef.current = 0;
    setPhaseIdx(0);
    setSecsLeft(activeTech.phases[0].duration);
    setElapsed(0);
    setSessionDone(false);
    setRunning(true);
  }

  function stopSession() {
    setRunning(false);
    phaseIdxRef.current = 0;
    setPhaseIdx(0);
    setSecsLeft(activeTech.phases[0].duration);
    setElapsed(0);
  }

  const isInhale = currentPhase.label === 'Inhale';
  const isExhale = currentPhase.label === 'Exhale';
  const prevLabel = activeTech.phases[(phaseIdx - 1 + activeTech.phases.length) % activeTech.phases.length]?.label;
  const circleScale = !running
    ? 'scale(1)'
    : isInhale
    ? 'scale(1.28)'
    : isExhale
    ? 'scale(0.72)'
    : prevLabel === 'Inhale'
    ? 'scale(1.28)'
    : 'scale(0.72)';

  const transitionDuration = currentPhase.label === 'Hold' ? 0.25 : currentPhase.duration;

  return (
    <div className={s.subView}>
      <button className={s.backBtn} onClick={onBack}>← back to results</button>

      {techniques.length > 1 && (
        <div className={s.pillRow}>
          {techniques.map((t) => (
            <button key={t.id}
              className={`${s.pill} ${activeTech.id === t.id ? s.pillActive : ''}`}
              onClick={() => switchTechnique(t)}
            >{t.name}</button>
          ))}
        </div>
      )}

      <div className={s.breathViewHeader}>
        <h2 className={s.breathViewName}>{activeTech.name}</h2>
        <p className={s.breathViewRatio}>{activeTech.ratio}</p>
        <p className={s.breathViewBenefit}>{activeTech.benefit}</p>
      </div>

      {!running && !sessionDone && elapsed === 0 && (
        <div className={s.breathDurationRow}>
          <div className={s.sectionLabel}>session length</div>
          <div className={s.pillRow}>
            {BREATH_DURATIONS.map((d) => (
              <button key={d.label}
                className={`${s.pill} ${targetSecs === d.seconds ? s.pillActive : ''}`}
                onClick={() => setTargetSecs(d.seconds)}
              >{d.label}</button>
            ))}
          </div>
        </div>
      )}

      <div className={s.breathCircleWrap}>
        <div
          className={s.breathCircle}
          style={{
            transform: circleScale,
            transition: `transform ${transitionDuration}s ease-in-out`,
          }}
        >
          <span className={s.breathPhaseLabel}>
            {sessionDone ? 'Complete' : running ? currentPhase.label : 'Ready'}
          </span>
          {running && !sessionDone && (
            <span className={s.breathCountdown}>{secsLeft}</span>
          )}
        </div>
      </div>

      {(running || elapsed > 0) && !sessionDone && (
        <p className={s.breathCycleLabel}>
          {elapsedMins}:{elapsedSecs.toString().padStart(2, '0')} elapsed
        </p>
      )}
      {sessionDone && (
        <p className={s.breathCycleLabel}>
          Session complete — {isFinite(targetSecs) ? `${targetSecs / 60} min` : `${elapsedMins} min ${elapsedSecs}s`}
        </p>
      )}

      {!running ? (
        <button className={s.beginBtn} onClick={startSession}>
          {sessionDone || elapsed > 0 ? 'begin again' : 'begin'}
        </button>
      ) : (
        <button className={s.beginBtn} onClick={stopSession}>stop</button>
      )}
    </div>
  );
}

// ── Pose Placeholder ───────────────────────────────────────────────────────

function PosePlaceholder() {
  return (
    <div className={s.posePlaceholder}>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={s.posePlaceholderSvg}>
        <ellipse cx="40" cy="44" rx="6" ry="12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <ellipse cx="40" cy="44" rx="6" ry="12" stroke="currentColor" strokeWidth="1" opacity="0.5" transform="rotate(45 40 44)" />
        <ellipse cx="40" cy="44" rx="6" ry="12" stroke="currentColor" strokeWidth="1" opacity="0.5" transform="rotate(90 40 44)" />
        <ellipse cx="40" cy="44" rx="6" ry="12" stroke="currentColor" strokeWidth="1" opacity="0.5" transform="rotate(135 40 44)" />
        <circle cx="40" cy="44" r="5" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <circle cx="40" cy="44" r="2" fill="currentColor" opacity="0.4" />
      </svg>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function resolveAdaptation(text: string, side: 'left' | 'right' | null): string {
  if (!side || (!text.includes('{side}') && !text.includes('{oppSide}'))) return text
  const opp = side === 'left' ? 'right' : 'left'
  return text.replace(/\{side\}/g, side).replace(/\{oppSide\}/g, opp)
}

// ── Flow View ──────────────────────────────────────────────────────────────

interface FlowItem {
  pose: Results['poses'][number];
  side: 'left' | 'right' | null;
  holdSeconds: number;
}

function FlowView({ poses, accommodationNote, onBack }: { poses: Results['poses']; accommodationNote?: string; onBack: () => void }) {
  const sequence: FlowItem[] = useMemo(() => {
    const items: FlowItem[] = [];
    for (const pose of poses) {
      const isSide = pose.hold.toLowerCase().includes('each side');
      const holdSeconds = parseHoldToSeconds(pose.hold);
      if (isSide) {
        items.push({ pose, side: 'left', holdSeconds });
        items.push({ pose, side: 'right', holdSeconds });
      } else {
        items.push({ pose, side: null, holdSeconds });
      }
    }
    return items;
  }, [poses]);

  const totalMins = useMemo(
    () => Math.round(sequence.reduce((sum, item) => sum + item.holdSeconds, 0) / 60),
    [sequence]
  );

  const [started, setStarted] = useState(false);
  const [previewShown, setPreviewShown] = useState(false);
  const [current, setCurrent] = useState(0);
  const [secsLeft, setSecsLeft] = useState(sequence[0]?.holdSeconds ?? 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const adaptedPoses = useMemo(
    () => poses.filter((p) => p.adaptation),
    [poses]
  );

  const item = sequence[current];

  useEffect(() => {
    if (!timerRunning) return;
    if (secsLeft <= 0) {
      setTimerRunning(false);
      if (current < sequence.length - 1) setAutoCountdown(2);
      return;
    }
    const id = setInterval(() => setSecsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [timerRunning, secsLeft, current, sequence.length]);

  useEffect(() => {
    if (autoCountdown === null) return;
    if (autoCountdown <= 0) { setAutoCountdown(null); advancePose(); return; }
    const id = setTimeout(() => setAutoCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [autoCountdown]); // eslint-disable-line react-hooks/exhaustive-deps

  function advancePose() {
    if (current >= sequence.length - 1) { setTimerRunning(false); setDone(true); return; }
    const next = current + 1;
    setCurrent(next);
    setSecsLeft(sequence[next].holdSeconds);
    setTimerRunning(true);
  }

  function beginFlow() {
    setStarted(true);
    setPreviewShown(false);
    setCurrent(0);
    setSecsLeft(sequence[0].holdSeconds);
    setTimerRunning(true);
    setDone(false);
    setAutoCountdown(null);
  }

  function handleBeginClick() {
    if (adaptedPoses.length > 0 && !previewShown) {
      setPreviewShown(true);
    } else {
      beginFlow();
    }
  }

  function restartFlow() {
    setDone(false);
    setStarted(false);
    setPreviewShown(false);
    setCurrent(0);
    setSecsLeft(sequence[0].holdSeconds);
    setTimerRunning(false);
    setAutoCountdown(null);
  }

  function fmtTime(secs: number): string {
    if (secs >= 60) {
      const m = Math.floor(secs / 60);
      const sc = secs % 60;
      return `${m}:${sc.toString().padStart(2, '0')}`;
    }
    return `${secs}`;
  }

  if (!started && previewShown) {
    return (
      <div className={s.subView}>
        <button className={s.backBtn} onClick={() => setPreviewShown(false)}>← back</button>
        <div className={s.previewHeader}>
          <h2 className={s.previewTitle}>Before you begin</h2>
          <p className={s.previewSubtitle}>
            {adaptedPoses.length} pose{adaptedPoses.length !== 1 ? 's' : ''} in your sequence include specific instructions.
            Here is what changes for each one.
          </p>
        </div>
        <div className={s.previewList}>
          {adaptedPoses.map((pose) => {
            const sentences = pose.adaptation!.split(/(?<=\.)\s+/).filter(Boolean);
            const preview = sentences.slice(0, 2).join(' ');
            return (
              <div key={pose.id} className={s.previewItem}>
                <span className={s.previewPoseName}>{pose.name}</span>
                <span className={s.previewAdaptationNote}>{preview}</span>
              </div>
            );
          })}
        </div>
        <button className={s.beginBtn} onClick={beginFlow}>got it — begin flow</button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className={s.subView}>
        <button className={s.backBtn} onClick={onBack}>← back to results</button>
        <div className={s.flowViewHeader}>
          <h2 className={s.flowViewTitle}>Your Flow</h2>
          <p className={s.flowViewMeta}>{sequence.length} poses · ~{totalMins} min</p>
        </div>
        <div className={s.flowPreList}>
          {sequence.map((item, i) => (
            <div key={i} className={s.flowPreRow}>
              <div className={s.flowPreLeft}>
                <span className={s.flowPreName}>{item.pose.name}</span>
                {item.side && <span className={s.flowPreSide}>{item.side} side</span>}
              </div>
              <span className={s.flowPreHold}>{item.pose.hold.replace(' each side', '')}</span>
            </div>
          ))}
        </div>
        <button className={s.beginBtn} onClick={handleBeginClick}>begin flow</button>
      </div>
    );
  }

  if (done) {
    return (
      <div className={s.subView}>
        <div className={s.flowDone}>
          <p className={s.flowDoneTitle}>Practice complete.</p>
          <p className={s.flowDoneSubtitle}>Take a moment in stillness before moving on.</p>
        </div>
        <div className={s.flowDoneActions}>
          <button className={s.beginBtn} onClick={restartFlow}>begin again</button>
          <button className={s.backBtn} style={{ alignSelf: 'center' }} onClick={onBack}>← back to results</button>
        </div>
      </div>
    );
  }

  const isTimerDone = secsLeft === 0;
  const isAdaptedSide =
    !item.pose.adaptedSide || item.side === null || item.side === item.pose.adaptedSide;
  const instruction = isAdaptedSide
    ? (item.pose.adaptation ?? item.pose.instruction)
    : (item.pose.oppositeInstruction ?? item.pose.instruction);
  const instructionText = resolveAdaptation(instruction, item.side);

  return (
    <div className={s.subView}>
      <div className={s.flowActiveHeader}>
        <button className={s.backBtn} onClick={onBack}>← back</button>
        <span className={s.flowProgress}>{current + 1} / {sequence.length}</span>
      </div>

      <motion.div key={current} className={s.flowActivePose}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {item.side && <span className={s.flowActiveSide}>{item.side} side</span>}
        {item.pose.imageUrl ? (
          <img src={item.pose.imageUrl} alt={item.pose.name} className={s.poseImage} />
        ) : (
          <PosePlaceholder />
        )}
        <h2 className={s.flowActiveName}>{item.pose.name}</h2>
        <p className={s.flowActiveBenefit}>{item.pose.benefit}</p>
        <p className={s.flowActiveInstruction}>{instructionText}</p>
        <div className={`${s.flowTimer} ${isTimerDone ? s.flowTimerDone : ''}`}>
          {fmtTime(secsLeft)}
          {secsLeft >= 60 ? (
            <span className={s.flowTimerUnit}> min</span>
          ) : secsLeft > 0 ? (
            <span className={s.flowTimerUnit}>s</span>
          ) : null}
        </div>
        {autoCountdown !== null && (
          <p className={s.autoAdvanceNote}>next pose in {autoCountdown}s</p>
        )}
      </motion.div>

      <div className={s.flowControls}>
        {!timerRunning && secsLeft > 0 && autoCountdown === null && (
          <button className={s.beginBtn} onClick={() => setTimerRunning(true)}>resume</button>
        )}
        {timerRunning && (
          <button className={s.beginBtn} onClick={() => setTimerRunning(false)}>pause</button>
        )}
        <button
          className={`${s.ctaBtn} ${isTimerDone || autoCountdown !== null ? s.ctaBtnReady : ''}`}
          onClick={() => { setAutoCountdown(null); advancePose(); }}
        >
          <span>{current >= sequence.length - 1 ? 'finish' : 'next pose'}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

// ── Rhythm View ────────────────────────────────────────────────────────────

function RhythmView({
  activityLevel,
  skillLevel,
  flowDurationMins,
  accommodationNote,
  onBack,
}: {
  activityLevel: ActivityLevel;
  skillLevel: SkillLevel;
  flowDurationMins: number;
  accommodationNote?: string;
  onBack: () => void;
}) {
  const detail = RHYTHM_DETAIL[activityLevel];

  return (
    <div className={s.subView}>
      <button className={s.backBtn} onClick={onBack}>← back to results</button>
      <div className={s.deepDiveHeader}>
        <h2 className={s.deepDiveTitle}>Movement & Breath Rhythm</h2>
        <p className={s.deepDiveSummary}>{detail.sessionSummary}</p>
      </div>

      {accommodationNote && (
        <div className={s.deepDiveSection}>
          <div className={s.sectionLabel}>practice accommodations</div>
          <p className={s.deepDiveText}>{accommodationNote}</p>
        </div>
      )}

      <div className={s.deepDiveSection}>
        <div className={s.sectionLabel}>your flow practice</div>
        <p className={s.deepDiveText}>
          Your recommended sequence runs about {flowDurationMins} minute{flowDurationMins !== 1 ? 's' : ''} end-to-end.
          {' '}{detail.flowNote}
        </p>
      </div>

      <div className={s.deepDiveSection}>
        <div className={s.sectionLabel}>your breathing practice</div>
        <p className={s.deepDiveText}>{detail.breathingNote}</p>
      </div>

      <div className={s.deepDiveSection}>
        <div className={s.sectionLabel}>sample week</div>
        <p className={s.deepDiveText}>{detail.sampleWeek}</p>
      </div>

      <div className={s.deepDiveSection}>
        <div className={s.sectionLabel}>what to expect</div>
        <p className={s.deepDiveText}>{detail.progressNote}</p>
        {skillLevel === 'beginner' && detail.beginnerNote && (
          <p className={s.deepDiveText} style={{ marginTop: 10, opacity: 0.85 }}>{detail.beginnerNote}</p>
        )}
      </div>
    </div>
  );
}

// ── Ayurveda View ──────────────────────────────────────────────────────────

function AyurvedaView({
  dosha,
  dietaryStyle,
  onBack,
}: {
  dosha: Dosha;
  dietaryStyle: DietaryStyle;
  onBack: () => void;
}) {
  const detail = DOSHA_AYURVEDA_DETAIL[dosha];
  const card = DOSHA_CARDS.find((c) => c.id === dosha)!;
  const foodNote = detail.foodNoteByDiet?.[dietaryStyle] ?? detail.foodNote;

  return (
    <div className={s.subView}>
      <button className={s.backBtn} onClick={onBack}>← back to results</button>
      <div className={s.deepDiveHeader}>
        <h2 className={s.deepDiveTitle}>{card.name} — {card.tagline}</h2>
        <p className={s.deepDiveSubtitle}>{card.expandedDescription}</p>
      </div>

      <div className={s.deepDiveSection}>
        <div className={s.sectionLabel}>lifestyle guidance</div>
        {detail.allTips.map((tip, i) => (
          <div key={i} className={s.tipRow}>
            <span className={s.tipDot} />
            <span className={s.tipText}>{tip}</span>
          </div>
        ))}
      </div>

      <div className={s.deepDiveSection}>
        <div className={s.sectionLabel}>food & nourishment</div>
        <p className={s.deepDiveText}>{foodNote}</p>
      </div>

      <div className={s.deepDiveSection}>
        <div className={s.sectionLabel}>daily rhythm</div>
        <p className={s.deepDiveText}>{detail.routineNote}</p>
      </div>

      <p className={s.ayurvedaAffirmation}>{detail.affirmation}</p>
    </div>
  );
}

// ── Results View ───────────────────────────────────────────────────────────

interface ResultsViewProps {
  results: Results;
  intentions: Intention[];
  activityLevel: ActivityLevel;
  onBack: () => void;
  onStartOver: () => void;
  onStartBreathe: () => void;
  onStartFlow: () => void;
  onViewRhythm: () => void;
  onViewAyurveda: () => void;
}

function ResultsView({
  results,
  intentions,
  onBack,
  onStartOver,
  onStartBreathe,
  onStartFlow,
  onViewRhythm,
  onViewAyurveda,
}: ResultsViewProps) {
  const [copied, setCopied] = useState(false);

  function copyResults() {
    const intentionLabels = intentions
      .map((i) => INTENTIONS_LIST.find((x) => x.id === i)?.label ?? i)
      .join(', ');
    const poseLines = results.poses
      .map((p) => `  · ${p.name} — ${p.benefit} (${p.hold}, ${p.howOften})`).join('\n');
    const breathLines = results.breathingTechniques
      .map((b) => `  · ${b.name} (${b.ratio}) — ${b.benefit}`).join('\n');
    const tipLines = results.ayurvedicTips.map((t) => `  · ${t}`).join('\n');

    const text = [
      'YOGA GUIDE — YOUR PRACTICE PRESCRIPTION',
      '─────────────────────────────────────────',
      '', results.summary, '',
      'GOOD POSES FOR YOU', poseLines, '',
      'BREATHWORK', breathLines, '',
      'MOVEMENT & BREATH RHYTHM',
      `  ${results.frequencyGuidance}`,
      `  ${results.timeGuidance}`, '',
      'AYURVEDIC GUIDANCE', tipLines, '',
      `Focus areas: ${intentionLabels}`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <div className={s.resultsContent}>
      <button className={s.backBtn} onClick={onBack}>← back</button>

      <p className={s.resultsSummary}>{results.summary}</p>

      {/* Accommodation note */}
      {results.accommodationNote && (
        <div className={s.accommodationNoteBox}>
          <div className={s.sectionLabel}>practice accommodations</div>
          <p className={s.accommodationNoteText}>{results.accommodationNote}</p>
        </div>
      )}

      {/* Poses */}
      <div>
        <div className={s.resultsSectionTitle}>good poses for you</div>
        <div className={s.poseList}>
          {results.poses.map((pose, i) => (
            <motion.div key={pose.id} className={s.poseRow}
              initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200, delay: i * 0.05 }}
            >
              <div className={s.poseLeft}>
                <div className={s.poseName}>{pose.name}</div>
                <div className={s.poseBenefit}>{pose.benefit}</div>
              </div>
              <div className={s.poseRight}>
                <span className={s.poseMeta}>{pose.hold}</span>
                <span className={s.poseMetaSub}>{pose.howOften}</span>
              </div>
            </motion.div>
          ))}
        </div>
        <button className={s.ctaBtn} onClick={onStartFlow}>
          <span>begin your flow</span><span>→</span>
        </button>
      </div>

      {/* Breathwork */}
      <div>
        <div className={s.resultsSectionTitle}>breathwork</div>
        <div className={s.breathCards}>
          {results.breathingTechniques.map((b) => (
            <div key={b.id} className={s.breathCard}>
              <div className={s.breathName}>{b.name}</div>
              <div className={s.breathRatio}>{b.ratio}</div>
              <div className={s.breathBenefit}>{b.benefit}</div>
            </div>
          ))}
        </div>
        <button className={s.ctaBtn} onClick={onStartBreathe} style={{ marginTop: 10 }}>
          <span>start breathing practice</span><span>→</span>
        </button>
      </div>

      {/* Rhythm */}
      <div>
        <div className={s.resultsSectionTitle}>movement & breath rhythm</div>
        <div className={s.guidanceRow}>
          <div className={s.guidanceText}>
            {results.frequencyGuidance} Your sequence runs about {results.flowDurationMins} min — repeat it 2–3× for a full session.
          </div>
          <div className={s.guidanceText}>{results.timeGuidance}</div>
        </div>
        <button className={s.learnMoreBtn} onClick={onViewRhythm}>learn more →</button>
      </div>

      {/* Ayurvedic */}
      <div>
        <div className={s.resultsSectionTitle}>ayurvedic guidance</div>
        {results.ayurvedicTips.map((tip, i) => (
          <div key={i} className={s.tipRow}>
            <span className={s.tipDot} />
            <span className={s.tipText}>{tip}</span>
          </div>
        ))}
        <button className={s.learnMoreBtn} onClick={onViewAyurveda}>learn more →</button>
      </div>

      {/* Save */}
      <div className={s.saveRow}>
        <button className={`${s.saveBtn} ${copied ? s.saveBtnConfirmed : ''}`} onClick={copyResults}>
          {copied ? 'copied ✓' : 'copy text'}
        </button>
        <button className={s.saveBtn} onClick={() => window.print()}>save as PDF</button>
      </div>

      <button className={s.startOverBtn} onClick={onStartOver}>start over</button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function YogaGuide() {
  const [step, setStep] = useState<Step>('welcome');
  const [theme, setTheme] = useState<Theme>('sage');
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [preferredTime, setPreferredTime] = useState<PreferredTime | null>(null);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [dietaryStyle, setDietaryStyle] = useState<DietaryStyle | null>(null);
  const [accommodations, setAccommodations] = useState<Accommodations>({ areas: [] });
  const [expandedDosha, setExpandedDosha] = useState<Dosha | null>(null);
  const [selectedDosha, setSelectedDosha] = useState<Dosha | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  function toggleIntention(i: Intention) {
    setIntentions((prev) => {
      if (prev.includes(i)) return prev.filter((x) => x !== i);
      if (prev.length >= 3) return prev;
      return [...prev, i];
    });
  }

  function toggleAccommodation(area: InjuryArea) {
    setAccommodations((prev) => {
      const newAreas = prev.areas.includes(area)
        ? prev.areas.filter((a) => a !== area)
        : [...prev.areas, area];
      const limbDifference = newAreas.includes('limb-difference') ? prev.limbDifference : undefined;
      const newSides = { ...prev.sides };
      if (!newAreas.includes(area)) delete newSides[area];
      const sides = Object.keys(newSides).length ? newSides : undefined;
      return { areas: newAreas, limbDifference, sides };
    });
  }

  function setAreaSide(area: InjuryArea, side: AccommodationSide) {
    setAccommodations((prev) => ({
      ...prev,
      sides: { ...prev.sides, [area]: side },
    }));
  }

  function handleDoshaChoose(dosha: Dosha) {
    const r = getRecommendations(
      { intentions, activityLevel: activityLevel!, preferredTime: preferredTime!, dosha, skillLevel: skillLevel!, dietaryStyle: dietaryStyle! },
      accommodations.areas.length > 0 ? accommodations : undefined
    );
    setSelectedDosha(dosha);
    setResults(r);
    setStep('results');
  }

  function goBack() {
    if (step === 'intentions') setStep('welcome');
    else if (step === 'context') setStep('intentions');
    else if (step === 'accommodations') setStep('context');
    else if (step === 'dosha') setStep('accommodations');
    else if (step === 'results') {
      setExpandedDosha(null); setSelectedDosha(null); setResults(null);
      setStep('dosha');
    } else if (['breathe', 'flow', 'rhythm', 'ayurveda'].includes(step)) {
      setStep('results');
    }
  }

  function startOver() {
    setStep('welcome');
    setIntentions([]);
    setActivityLevel(null);
    setPreferredTime(null);
    setSkillLevel(null);
    setDietaryStyle(null);
    setAccommodations({ areas: [], sides: undefined });
    setExpandedDosha(null);
    setSelectedDosha(null);
    setResults(null);
  }

  return (
    <div className={s.page} data-theme={theme}>

      <div className={s.header}>
        <p className={s.eyebrow}>yoga guide</p>
        <div className={s.swatches}>
          {THEMES.map((t) => (
            <button key={t.id}
              className={`${s.swatch} ${theme === t.id ? s.swatchActive : ''}`}
              style={{ '--swatch-color': t.color } as React.CSSProperties}
              onClick={() => setTheme(t.id)} aria-label={t.id}
            />
          ))}
        </div>
      </div>

      <ProgressDots step={step} />

      <AnimatePresence mode="wait">

        {step === 'welcome' && (
          <motion.div key="welcome" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={s.welcomeContent}>
              <h1 className={s.welcomeTitle}>Your Practice,<br />Personalised</h1>
              <p className={s.welcomeTagline}>A few questions. A prescription built for you.</p>
              <button className={s.beginBtn} onClick={() => setStep('intentions')}>begin</button>
            </div>
          </motion.div>
        )}

        {step === 'intentions' && (
          <motion.div key="intentions" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={s.stepContent}>
              <button className={s.backBtn} onClick={goBack}>← back</button>
              <div>
                <h2 className={s.stepTitle}>What brings you to the mat?</h2>
                <p className={s.stepSubtitle}>Choose up to three.</p>
              </div>
              <div className={s.intentionsGrid}>
                {INTENTIONS_LIST.map((item) => {
                  const selected = intentions.includes(item.id);
                  const maxed = intentions.length >= 3 && !selected;
                  return (
                    <button key={item.id}
                      className={`${s.intentionPill} ${selected ? s.intentionPillActive : ''} ${maxed ? s.intentionPillDimmed : ''}`}
                      onClick={() => toggleIntention(item.id)}
                    >{item.label}</button>
                  );
                })}
              </div>
              <button className={s.beginBtn} disabled={intentions.length === 0} onClick={() => setStep('context')}>
                continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 'context' && (
          <motion.div key="context" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={s.stepContent}>
              <button className={s.backBtn} onClick={goBack}>← back</button>
              <div className={s.contextSection}>
                <div className={s.sectionLabel}>How active are you?</div>
                <div className={s.pillRow}>
                  {ACTIVITY_LEVELS.map((l) => (
                    <button key={l.id}
                      className={`${s.pill} ${activityLevel === l.id ? s.pillActive : ''}`}
                      onClick={() => setActivityLevel(l.id)}
                    >{l.label}</button>
                  ))}
                </div>
              </div>
              <div className={s.contextSection}>
                <div className={s.sectionLabel}>When do you prefer to practice?</div>
                <div className={s.pillRow}>
                  {PREFERRED_TIMES.map((t) => (
                    <button key={t.id}
                      className={`${s.pill} ${preferredTime === t.id ? s.pillActive : ''}`}
                      onClick={() => setPreferredTime(t.id)}
                    >{t.label}</button>
                  ))}
                </div>
              </div>
              <div className={s.contextSection}>
                <div className={s.sectionLabel}>Your yoga experience?</div>
                <div className={s.pillRow}>
                  {SKILL_LEVELS.map((sl) => (
                    <button key={sl.id}
                      className={`${s.pill} ${skillLevel === sl.id ? s.pillActive : ''}`}
                      onClick={() => setSkillLevel(sl.id)}
                    >{sl.label}</button>
                  ))}
                </div>
              </div>
              <div className={s.contextSection}>
                <div className={s.sectionLabel}>Dietary approach?</div>
                <div className={s.pillRow}>
                  {DIETARY_STYLES.map((ds) => (
                    <button key={ds.id}
                      className={`${s.pill} ${dietaryStyle === ds.id ? s.pillActive : ''}`}
                      onClick={() => setDietaryStyle(ds.id)}
                    >{ds.label}</button>
                  ))}
                </div>
              </div>
              <button className={s.beginBtn} disabled={!activityLevel || !preferredTime || !skillLevel || !dietaryStyle} onClick={() => setStep('accommodations')}>
                continue
              </button>
            </div>
          </motion.div>
        )}

        {step === 'accommodations' && (
          <motion.div key="accommodations" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={s.stepContent}>
              <button className={s.backBtn} onClick={goBack}>← back</button>
              <div>
                <h2 className={s.stepTitle}>Any physical accommodations?</h2>
                <p className={s.stepSubtitle}>Select all that apply — or continue if none.</p>
              </div>
              <div className={s.intentionsGrid}>
                {ACCOMMODATION_LABELS.map((item) => {
                  const selected = accommodations.areas.includes(item.id);
                  return (
                    <button key={item.id}
                      className={`${s.intentionPill} ${selected ? s.intentionPillActive : ''}`}
                      onClick={() => toggleAccommodation(item.id)}
                    >{item.label}</button>
                  );
                })}
              </div>

              <AnimatePresence>
                {accommodations.areas.includes('limb-difference') && (
                  <motion.div
                    key="limb-detail"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className={s.limbDetailSection}
                  >
                    <div className={s.contextSection}>
                      <div className={s.sectionLabel}>Which side?</div>
                      <div className={s.pillRow}>
                        {LIMB_SIDES.map((ls) => (
                          <button key={ls.id}
                            className={`${s.pill} ${accommodations.limbDifference?.side === ls.id ? s.pillActive : ''}`}
                            onClick={() => setAccommodations((prev) => ({
                              ...prev,
                              limbDifference: {
                                side: ls.id,
                                level: prev.limbDifference?.level ?? 'below-knee',
                              },
                            }))}
                          >{ls.label}</button>
                        ))}
                      </div>
                    </div>
                    <div className={s.contextSection}>
                      <div className={s.sectionLabel}>Level</div>
                      <div className={s.pillRow}>
                        {LIMB_LEVELS.map((ll) => (
                          <button key={ll.id}
                            className={`${s.pill} ${accommodations.limbDifference?.level === ll.id ? s.pillActive : ''}`}
                            onClick={() => setAccommodations((prev) => ({
                              ...prev,
                              limbDifference: {
                                side: prev.limbDifference?.side ?? 'left',
                                level: ll.id,
                              },
                            }))}
                          >{ll.label}</button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {accommodations.areas.some((a) => BILATERAL_AREAS.includes(a)) && (
                  <motion.div
                    key="bilateral-sides"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className={s.limbDetailSection}
                  >
                    {accommodations.areas.filter((a) => BILATERAL_AREAS.includes(a)).map((area) => (
                      <div key={area} className={s.contextSection}>
                        <div className={s.sectionLabel}>
                          {ACCOMMODATION_LABELS.find((a2) => a2.id === area)?.label} — which side?
                        </div>
                        <div className={s.pillRow}>
                          {AREA_SIDES.map((side) => (
                            <button key={side.id}
                              className={`${s.pill} ${accommodations.sides?.[area] === side.id ? s.pillActive : ''}`}
                              onClick={() => setAreaSide(area, side.id)}
                            >{side.label}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button className={s.beginBtn} onClick={() => setStep('dosha')}>
                {accommodations.areas.length === 0 ? 'skip' : 'continue'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'dosha' && (
          <motion.div key="dosha" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className={s.stepContent}>
              <button className={s.backBtn} onClick={goBack}>← back</button>
              <div>
                <h2 className={s.stepTitle}>What is your constitution?</h2>
                <p className={s.stepSubtitle}>Tap a card to learn more, then choose.</p>
              </div>
              <div className={s.doshaCards}>
                {DOSHA_CARDS.map((card) => {
                  const expanded = expandedDosha === card.id;
                  return (
                    <div key={card.id}
                      className={`${s.doshaCard} ${expanded ? s.doshaCardExpanded : ''}`}
                      onClick={() => setExpandedDosha(expanded ? null : card.id)}
                    >
                      <div className={s.doshaCardHeader}>
                        <div className={s.doshaName}>{card.name}</div>
                        <div className={s.doshaTagline}>{card.tagline}</div>
                        {!expanded && <p className={s.doshaTeaserText}>{card.teaserText}</p>}
                      </div>
                      <AnimatePresence>
                        {expanded && (
                          <motion.div key="expanded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                            className={s.doshaExpanded}
                          >
                            <p className={s.doshaDesc}>{card.expandedDescription}</p>
                            <button className={s.doshaChooseBtn}
                              onClick={(e) => { e.stopPropagation(); handleDoshaChoose(card.id); }}
                            >choose {card.name}</button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && results && (
          <motion.div key="results" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <ResultsView
              results={results} intentions={intentions}
              activityLevel={activityLevel!}
              onBack={goBack} onStartOver={startOver}
              onStartBreathe={() => setStep('breathe')}
              onStartFlow={() => setStep('flow')}
              onViewRhythm={() => setStep('rhythm')}
              onViewAyurveda={() => setStep('ayurveda')}
            />
          </motion.div>
        )}

        {step === 'breathe' && results && (
          <motion.div key="breathe" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <BreatheView techniques={results.breathingTechniques} onBack={goBack} />
          </motion.div>
        )}

        {step === 'flow' && results && (
          <motion.div key="flow" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <FlowView poses={results.poses} accommodationNote={results.accommodationNote} onBack={goBack} />
          </motion.div>
        )}

        {step === 'rhythm' && results && activityLevel && (
          <motion.div key="rhythm" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <RhythmView
              activityLevel={activityLevel}
              skillLevel={skillLevel!}
              flowDurationMins={results.flowDurationMins}
              accommodationNote={results.accommodationNote}
              onBack={goBack}
            />
          </motion.div>
        )}

        {step === 'ayurveda' && selectedDosha && dietaryStyle && (
          <motion.div key="ayurveda" className={s.stepPanel}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <AyurvedaView dosha={selectedDosha} dietaryStyle={dietaryStyle} onBack={goBack} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
