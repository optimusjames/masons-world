// ── Types ──────────────────────────────────────────────────────────────────

export type Intention =
  | 'anxiety'
  | 'poor-sleep'
  | 'back-pain'
  | 'poor-posture'
  | 'digestive-issues'
  | 'low-energy'
  | 'stress-relief'
  | 'flexibility'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active'
export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'flexible'
export type Dosha = 'vata' | 'pitta' | 'kapha'
export type Step =
  | 'welcome'
  | 'intentions'
  | 'context'
  | 'dosha'
  | 'results'
  | 'breathe'
  | 'flow'
  | 'rhythm'
  | 'ayurveda'

export interface Answers {
  intentions: Intention[]
  activityLevel: ActivityLevel
  preferredTime: PreferredTime
  dosha: Dosha
}

export interface Pose {
  id: string
  name: string
  benefit: string
  instruction: string
  hold: string
  howOften: string
  doshaAffinity: Dosha[]
  timeAffinity: PreferredTime[]
}

export interface BreathPhase {
  label: string
  duration: number // seconds
}

export interface BreathingTechnique {
  id: string
  name: string
  ratio: string
  benefit: string
  yogaBreathingId: string
  phases: BreathPhase[]
}

export interface DoshaCard {
  id: Dosha
  name: string
  tagline: string
  teaserText: string
  expandedDescription: string
}

export interface RhythmDetail {
  sessionSummary: string
  flowNote: string
  breathingNote: string
  sampleWeek: string
  progressNote: string
}

export interface AyurvedaDetail {
  allTips: string[]
  foodNote: string
  routineNote: string
  affirmation: string
}

export interface Results {
  summary: string
  poses: Pose[]
  breathingTechniques: BreathingTechnique[]
  frequencyGuidance: string
  timeGuidance: string
  flowDurationMins: number
  ayurvedicTips: string[]
}

// Parse a hold string like "90s", "2 min", "60s each side" → seconds
export function parseHoldToSeconds(hold: string): number {
  const cleaned = hold.replace(/each side/gi, '').trim()
  const minMatch = cleaned.match(/(\d+)\s*min/)
  if (minMatch) return parseInt(minMatch[1]) * 60
  const secMatch = cleaned.match(/(\d+)/)
  if (secMatch) return parseInt(secMatch[1])
  return 60
}

// ── Static label lists ─────────────────────────────────────────────────────

export const INTENTIONS_LIST: { id: Intention; label: string }[] = [
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'poor-sleep', label: 'Poor Sleep' },
  { id: 'back-pain', label: 'Back Pain' },
  { id: 'poor-posture', label: 'Poor Posture' },
  { id: 'digestive-issues', label: 'Digestive Issues' },
  { id: 'low-energy', label: 'Low Energy' },
  { id: 'stress-relief', label: 'Stress Relief' },
  { id: 'flexibility', label: 'Flexibility' },
]

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'light', label: 'Light' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'active', label: 'Active' },
]

export const PREFERRED_TIMES: { id: PreferredTime; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'flexible', label: 'Flexible' },
]

// ── Bento stat data ────────────────────────────────────────────────────────

export const FREQ_COUNT: Record<ActivityLevel, number> = {
  sedentary: 3,
  light: 4,
  moderate: 5,
  active: 5,
}

export const SESSION_LENGTH: Record<ActivityLevel, number> = {
  sedentary: 20,
  light: 30,
  moderate: 40,
  active: 45,
}

// ── Poses ──────────────────────────────────────────────────────────────────

export const POSES: Pose[] = [
  {
    id: 'childs-pose',
    name: "Child's Pose",
    benefit: 'Releases lower back tension and quiets the nervous system',
    instruction:
      'Begin kneeling, then fold forward to rest your forehead on the mat. Arms extended long or alongside the body. Let the hips sink toward the heels and breathe into the back body.',
    hold: '90s',
    howOften: 'Daily',
    doshaAffinity: ['vata', 'kapha'],
    timeAffinity: ['morning', 'evening'],
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow',
    benefit: 'Mobilises the spine and stimulates digestive organs',
    instruction:
      'On hands and knees, sync movement with breath. Inhale: drop the belly, lift tailbone and gaze (cow). Exhale: round the spine up, tuck chin and tailbone (cat). Move slowly.',
    hold: '60s',
    howOften: 'Daily',
    doshaAffinity: ['vata', 'kapha'],
    timeAffinity: ['morning', 'flexible'],
  },
  {
    id: 'downward-dog',
    name: 'Downward Dog',
    benefit: 'Lengthens the spine, hamstrings, and calves',
    instruction:
      'From hands and knees, press into the palms and lift hips up and back into an inverted V. Straighten the legs as much as comfortable, pressing heels toward the floor.',
    hold: '60s',
    howOften: 'Daily',
    doshaAffinity: ['pitta', 'kapha'],
    timeAffinity: ['morning', 'afternoon'],
  },
  {
    id: 'warrior-i',
    name: 'Warrior I',
    benefit: 'Builds leg strength and opens the hip flexors',
    instruction:
      'Step one foot forward into a deep lunge, back heel grounded at 45°. Bend the front knee directly over the ankle and raise both arms overhead, palms facing or touching.',
    hold: '45s each side',
    howOften: '4× per week',
    doshaAffinity: ['kapha'],
    timeAffinity: ['morning', 'afternoon'],
  },
  {
    id: 'legs-up-wall',
    name: 'Legs Up the Wall',
    benefit: 'Reverses blood flow and deeply calms the nervous system',
    instruction:
      'Lie near a wall and swing legs vertically up against it. Hips can rest on a folded blanket for support. Let the arms fall open at your sides, palms facing up.',
    hold: '5 min',
    howOften: 'Daily',
    doshaAffinity: ['vata', 'pitta'],
    timeAffinity: ['evening', 'flexible'],
  },
  {
    id: 'supine-twist',
    name: 'Supine Twist',
    benefit: 'Releases spinal tension and aids digestive motility',
    instruction:
      'Lying on your back, draw one knee to the chest then guide it across the body toward the opposite floor. Extend both arms out as a T and let the gaze go opposite the knee.',
    hold: '60s each side',
    howOften: 'Daily',
    doshaAffinity: ['vata', 'pitta'],
    timeAffinity: ['morning', 'evening'],
  },
  {
    id: 'bridge',
    name: 'Bridge',
    benefit: 'Strengthens the back body and opens the chest',
    instruction:
      'Lie on your back with feet flat on the floor, hip-width apart. Press through the soles to lift the hips toward the ceiling. Arms press into the mat; hold the lift with the glutes.',
    hold: '60s',
    howOften: '4× per week',
    doshaAffinity: ['vata', 'kapha'],
    timeAffinity: ['morning', 'afternoon'],
  },
  {
    id: 'seated-forward-fold',
    name: 'Seated Forward Fold',
    benefit: 'Calms the mind and stretches the entire back body',
    instruction:
      'Sit with legs extended. Inhale to lengthen the spine, then exhale and hinge forward from the hips — not the waist. Reach toward the feet without rounding the lower back excessively.',
    hold: '90s',
    howOften: 'Daily',
    doshaAffinity: ['pitta'],
    timeAffinity: ['evening', 'flexible'],
  },
  {
    id: 'mountain-pose',
    name: 'Mountain Pose',
    benefit: 'Cultivates postural awareness and steady, grounded focus',
    instruction:
      'Stand with feet together or hip-width apart. Spread the toes wide. Engage the thighs, lengthen the tailbone down, and lift through the crown of the head. Breathe evenly.',
    hold: '60s',
    howOften: 'Daily',
    doshaAffinity: ['vata', 'kapha'],
    timeAffinity: ['morning', 'flexible'],
  },
  {
    id: 'butterfly',
    name: 'Butterfly',
    benefit: 'Opens the inner hips and stimulates the lower organs',
    instruction:
      'Sit with soles of feet touching and knees falling open. Hold the feet or ankles, inhale to grow tall, then exhale and fold gently forward from the hips — not by rounding the back.',
    hold: '90s',
    howOften: '4× per week',
    doshaAffinity: ['pitta'],
    timeAffinity: ['afternoon', 'evening'],
  },
  {
    id: 'pigeon',
    name: 'Pigeon',
    benefit: 'Deep hip opener that releases accumulated holding',
    instruction:
      'From downward dog, bring one knee forward toward the same-side wrist. Extend the back leg straight behind. Settle the hips evenly toward the floor and fold forward over the front leg.',
    hold: '2 min each side',
    howOften: '3× per week',
    doshaAffinity: ['pitta'],
    timeAffinity: ['afternoon', 'flexible'],
  },
  {
    id: 'savasana',
    name: 'Savasana',
    benefit: 'Integrates the practice and allows the nervous system to reset',
    instruction:
      'Lie completely flat, legs slightly apart, arms away from the body with palms facing up. Close the eyes. Allow the body to become heavy and release all effort for the full hold.',
    hold: '5 min',
    howOften: 'After every session',
    doshaAffinity: ['vata', 'pitta'],
    timeAffinity: ['morning', 'afternoon', 'evening', 'flexible'],
  },
]

// ── Breathing Techniques ───────────────────────────────────────────────────

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    ratio: '4 · 4 · 4 · 4',
    benefit: 'Balances the nervous system and sharpens focus.',
    yogaBreathingId: 'box',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold', duration: 4 },
    ],
  },
  {
    id: 'four-seven-eight',
    name: '4–7–8 Breath',
    ratio: '4 · 7 · 8',
    benefit: 'Slows the heart rate and prepares the body for deep rest.',
    yogaBreathingId: '478',
    phases: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
  },
  {
    id: 'two-to-one',
    name: '2:1 Calm',
    ratio: '6 · 12',
    benefit: 'Extended exhale activates the parasympathetic response.',
    yogaBreathingId: '21',
    phases: [
      { label: 'Inhale', duration: 6 },
      { label: 'Exhale', duration: 12 },
    ],
  },
  {
    id: 'belly-breathing',
    name: 'Belly Breathing',
    ratio: '5 · 2 · 5',
    benefit: 'Grounds attention in the body and supports digestion.',
    yogaBreathingId: 'belly',
    phases: [
      { label: 'Inhale', duration: 5 },
      { label: 'Hold', duration: 2 },
      { label: 'Exhale', duration: 5 },
    ],
  },
]

// ── Dosha Cards ────────────────────────────────────────────────────────────

export const DOSHA_CARDS: DoshaCard[] = [
  {
    id: 'vata',
    name: 'Vata',
    tagline: 'Air & Ether',
    teaserText: 'The wind type — creative, quick-minded, and prone to anxiety and scattered energy.',
    expandedDescription:
      'Vata energy is quick, imaginative, and light. When in balance, you are vibrant and inspired. When out of balance, anxiety, scattered thinking, and physical dryness arise. A grounding, warm, rhythmic practice brings Vata back into ease.',
  },
  {
    id: 'pitta',
    name: 'Pitta',
    tagline: 'Fire & Water',
    teaserText: 'The fire type — driven, precise, and prone to intensity, inflammation, and burnout.',
    expandedDescription:
      "Pitta energy is focused, purposeful, and intense. When in balance, you are decisive and clear. When out of balance, inflammation, irritability, and burnout follow. A cooling, surrender-focused practice tempers Pitta's fire.",
  },
  {
    id: 'kapha',
    name: 'Kapha',
    tagline: 'Earth & Water',
    teaserText: 'The earth type — steady, nurturing, and prone to heaviness, lethargy, and resistance.',
    expandedDescription:
      "Kapha energy is grounded, compassionate, and enduring. When in balance, you are stable and generous. When out of balance, lethargy, heaviness, and resistance to change set in. An energising, varied practice awakens Kapha's vitality.",
  },
]

// ── Rhythm Detail ──────────────────────────────────────────────────────────

export const RHYTHM_DETAIL: Record<ActivityLevel, RhythmDetail> = {
  sedentary: {
    sessionSummary: '3 sessions per week, 20 minutes each',
    flowNote:
      'Your 4-pose sequence is a complete starting session — move through it once, holding each pose fully. As it becomes familiar over the first two weeks, add a second pass. The goal is consistency, not volume.',
    breathingNote:
      'Practice your breathing technique on at least two days per week — on rest days if possible. Even 5 minutes in the morning before the mind gets busy makes a measurable difference. The nervous system learns fastest when the practice is regular, not long.',
    sampleWeek:
      'Monday: flow sequence (20 min) · Wednesday: breathing practice (10 min) · Friday: flow sequence (20 min) · Sunday: breathing + short walk',
    progressNote:
      'After two weeks, transitions between poses will feel more natural and the breathing will require less effort. After four weeks, expect a noticeable shift in how you respond to stress — that is the nervous system adapting.',
  },
  light: {
    sessionSummary: '4 sessions per week, 30 minutes each',
    flowNote:
      'Move through your 4-pose sequence twice per session — once slowly to arrive in the body, once with more depth and intention. This brings the total to roughly 25–30 minutes including natural transition time. On some days, replace one pass with 5 minutes of stillness.',
    breathingNote:
      'Weave 5 minutes of your breathing practice into the end of each flow session. On one day per week, do a standalone breathing session of 10–15 minutes — this is where the deeper regulation work happens.',
    sampleWeek:
      'Monday: flow × 2 (30 min) · Tuesday: breathing standalone (12 min) · Thursday: flow × 2 (30 min) · Saturday: flow × 2 + extended breathing (35 min)',
    progressNote:
      'By week three, sleep quality and stress response should reflect the practice. The breathing work tends to show up first — you will notice you are calmer in situations that previously caused tension.',
  },
  moderate: {
    sessionSummary: '5 sessions per week, 35–40 minutes each',
    flowNote:
      'Move through your sequence 2–3 times per session. The first pass is warm-up, the second is where you deepen into each pose. A third pass before savasana consolidates the work. At this frequency, the body begins to change structurally — expect real postural improvements.',
    breathingNote:
      'Practice breathing on at least two separate days, ideally not the same days as your longest flow sessions. At this frequency, your parasympathetic baseline will shift measurably within a month. The breathing practice reinforces what the movement builds.',
    sampleWeek:
      'Mon/Wed/Fri: full flow × 3 (40 min) · Tue/Thu: breathing practice (15 min) + one slow sequence pass · Weekend: one rest day, one light session',
    progressNote:
      'At this frequency, expect real changes within 3 weeks: improved posture, more even energy through the day, and a calmer reaction to pressure. The compounding effect of 5 sessions per week is significant.',
  },
  active: {
    sessionSummary: '5–6 sessions per week, 40–45 minutes each',
    flowNote:
      'Use your sequence as active recovery alongside your main training. On high-intensity days, do one slow pass through the poses post-workout (15–20 min). On lighter training days, do 2–3 passes as a standalone session. The poses are chosen specifically to address what your body accumulates under load.',
    breathingNote:
      'Breathing practice works especially well post-workout to accelerate recovery. Even 8–10 minutes of your recommended technique after training lowers cortisol more efficiently than passive rest alone. On rest days, a longer breathing session (15–20 min) deepens the recovery effect.',
    sampleWeek:
      'Training days: flow post-workout (20 min) + breath (10 min) · Rest days: full flow × 3 (40 min) · One day fully off per week — the nervous system needs at least one complete break',
    progressNote:
      'At this level, yoga and breathwork are recovery tools as much as practice. After four weeks, you should notice improved recovery time between hard sessions, fewer injury-adjacent tightnesses, and more consistent energy.',
  },
}

// ── Ayurveda Detail ────────────────────────────────────────────────────────

export const DOSHA_AYURVEDA_DETAIL: Record<Dosha, AyurvedaDetail> = {
  vata: {
    allTips: [
      'Establish a consistent morning routine — Vata thrives on ritual and regularity above all else.',
      'Favour warm, nourishing foods like soups and stews; avoid raw or cold meals especially in winter.',
      'Ground yourself with slow, deliberate movements and build in pauses before reacting.',
      'Oil massage (abhyanga) with sesame oil before your shower calms the nervous system deeply.',
      'Prioritise sleep before 10pm to support nervous system recovery and reduce mental chatter.',
      'Reduce stimulant intake — coffee and alcohol amplify Vata\'s already active quality, especially in the evening.',
      'Create a dedicated practice space, however small. Vata is calmed by familiar, predictable environments.',
      'Warm baths, candlelight, and calm music in the evening signal safety to the nervous system and ease the transition to sleep.',
    ],
    foodNote:
      'Vata is balanced by warm, oily, and grounding foods. Favour soups, stews, cooked grains, root vegetables, warm dairy, nuts, and seeds. Eat at regular times and avoid skipping meals — irregular eating depletes Vata quickly. Avoid raw salads, cold drinks, crackers, and anything light or dry, particularly in autumn and winter.',
    routineNote:
      'Vata is calmed by sameness. Wake, eat, practice, and sleep at consistent times — the nervous system organises itself around predictable rhythms. Wind down screens and stimulation at least an hour before sleep. A short self-massage with warm sesame oil before bathing is one of the most effective Vata practices available.',
    affirmation:
      'I am allowed to slow down. My stillness is not stagnation — it is the ground from which everything else grows.',
  },
  pitta: {
    allTips: [
      "Keep your environment cool — intense heat aggravates Pitta's fire and sharpens the edges.",
      'Favour sweet, bitter, and astringent tastes; reduce spicy, salty, and highly processed foods.',
      'Build deliberate rest into your day and let yourself stop before exhaustion arrives.',
      'Coconut oil massage cools and soothes overheated tissues after vigorous practice.',
      'Practice near water or in natural light when possible — both naturally pacify Pitta energy.',
      'Notice the difference between motivation and compulsion. Pitta benefits from questioning whether effort is being applied by choice or by pressure.',
      'Schedule transitions between activities intentionally — a short walk, five minutes outside, or simply closing the eyes between tasks prevents Pitta accumulation.',
      'Avoid practicing or competing in the hottest part of the day. Pitta is most aggravated between 10am and 2pm.',
    ],
    foodNote:
      "Pitta is balanced by cooling, mildly spiced foods. Favour cucumber, coconut, leafy greens, sweet fruits, dairy, and lightly seasoned grains. Avoid skipping meals — Pitta's hunger turns quickly to irritability. Reduce alcohol, very spicy foods, and excessive caffeine. Room-temperature or lightly cooled water serves Pitta better than hot drinks.",
    routineNote:
      'Pitta benefits from structuring rest as seriously as it structures work. Build deliberate transitions between activities — even a ten-minute walk between sessions changes the day. Cooler environments, evening air, and proximity to water are pacifying. Avoid screens immediately before sleep, which keeps the Pitta mind engaged when it most needs to release.',
    affirmation:
      'I do not need to earn rest. Surrender is not weakness — it is the most precise thing I can do.',
  },
  kapha: {
    allTips: [
      'Rise before 6am and move the body first thing — Kapha stagnates quickly with excess sleep.',
      'Favour light, warm, and spiced foods; reduce heavy, oily, or sweet meals that slow digestion.',
      'Vary your routine and seek novelty — stimulation counters Kapha\'s natural pull toward inertia.',
      'Dry brushing (garshana) before bathing improves circulation and sharpens morning energy.',
      'Surround yourself with vibrant colours and uplifting music to counter the heaviness of Kapha.',
      'Keep social connections active — Kapha tends toward withdrawal, but engagement is genuinely regulating.',
      'Favour vigorous movement when energy allows. Kapha responds well to intensity and variety in practice.',
      'Avoid long afternoon naps. If rest is needed, keep it to 20 minutes maximum — Kapha congests with excess horizontal time.',
    ],
    foodNote:
      "Kapha is balanced by light, warm, and strongly spiced foods. Favour ginger, black pepper, mustard, leafy greens, legumes, and light grains like millet or quinoa. Reduce wheat, dairy, heavy oils, and sweets. Eat less than you think you need and wait for genuine hunger before meals — Kapha's digestion is thorough but slow, and benefits from space between meals.",
    routineNote:
      'The key for Kapha is activation. Rise early and move immediately — even a brisk ten-minute walk changes the energy of the whole day. Keep your environment tidy and varied; Kapha accumulates in cluttered, unchanging spaces. Regular social engagement, novel experiences, and deliberate variation in routine counter the pull toward comfort and sameness that Kapha naturally feels.',
    affirmation:
      'Movement is available to me now. I do not need to feel like it before I begin — the feeling comes after.',
  },
}

// ── Mappings ───────────────────────────────────────────────────────────────

const INTENTION_POSE_MAP: Record<Intention, string[]> = {
  anxiety: ['legs-up-wall', 'childs-pose', 'savasana', 'seated-forward-fold', 'supine-twist'],
  'poor-sleep': ['legs-up-wall', 'savasana', 'supine-twist', 'childs-pose', 'butterfly'],
  'back-pain': ['bridge', 'cat-cow', 'childs-pose', 'supine-twist', 'downward-dog'],
  'poor-posture': ['mountain-pose', 'downward-dog', 'bridge', 'warrior-i', 'cat-cow'],
  'digestive-issues': ['supine-twist', 'butterfly', 'cat-cow', 'childs-pose', 'seated-forward-fold'],
  'low-energy': ['warrior-i', 'downward-dog', 'mountain-pose', 'bridge', 'cat-cow'],
  'stress-relief': ['savasana', 'childs-pose', 'legs-up-wall', 'seated-forward-fold', 'butterfly'],
  flexibility: ['pigeon', 'seated-forward-fold', 'downward-dog', 'butterfly', 'supine-twist'],
}

const INTENTION_BREATH_MAP: Record<Intention, string[]> = {
  anxiety: ['box-breathing', 'four-seven-eight'],
  'poor-sleep': ['four-seven-eight', 'two-to-one'],
  'back-pain': ['belly-breathing', 'box-breathing'],
  'poor-posture': ['belly-breathing', 'box-breathing'],
  'digestive-issues': ['belly-breathing', 'two-to-one'],
  'low-energy': ['box-breathing', 'belly-breathing'],
  'stress-relief': ['two-to-one', 'box-breathing'],
  flexibility: ['belly-breathing', 'two-to-one'],
}

const DOSHA_POSE_BOOST: Record<Dosha, string[]> = {
  vata: ['childs-pose', 'savasana', 'bridge', 'legs-up-wall', 'mountain-pose'],
  pitta: ['seated-forward-fold', 'butterfly', 'pigeon', 'legs-up-wall', 'supine-twist'],
  kapha: ['warrior-i', 'downward-dog', 'cat-cow', 'mountain-pose', 'bridge'],
}

// ── Guidance text ──────────────────────────────────────────────────────────

const FREQUENCY_GUIDANCE: Record<ActivityLevel, string> = {
  sedentary: '3× per week, 20 min per session — build the habit before building the volume.',
  light: '4× per week, 30 min per session — consistency matters more than intensity.',
  moderate: '5× per week, 35–40 min — your body is ready for a dedicated daily practice.',
  active: '5–6× per week, 40–45 min — yoga integrates with your training as active recovery.',
}

const TIME_GUIDANCE: Record<PreferredTime, string> = {
  morning: 'Morning practice sets an intention before the mind fills up. Move before you think.',
  afternoon: 'Afternoon is when the body is warmest and most flexible — a grounding practice prevents the post-lunch slump.',
  evening: 'Evening practice should wind down, not rev up. Favour restorative poses and slow breathing over exertion.',
  flexible: 'Practice at the same time each day when possible — the body learns to prepare. Any time is better than no time.',
}

const DOSHA_TIPS: Record<Dosha, string[]> = {
  vata: [
    'Establish a consistent morning routine — Vata thrives on ritual and regularity above all else.',
    'Favour warm, nourishing foods like soups and stews; avoid raw or cold meals especially in winter.',
    'Ground yourself with slow, deliberate movements and build in pauses before reacting.',
    'Oil massage (abhyanga) with sesame oil before your shower calms the nervous system deeply.',
    'Prioritise sleep before 10pm to support nervous system recovery and reduce mental chatter.',
  ],
  pitta: [
    "Keep your environment cool — intense heat aggravates Pitta's fire and sharpens the edges.",
    'Favour sweet, bitter, and astringent tastes; reduce spicy, salty, and highly processed foods.',
    'Build deliberate rest into your day and let yourself stop before exhaustion arrives.',
    'Coconut oil massage cools and soothes overheated tissues after vigorous practice.',
    'Practice near water or in natural light when possible — both naturally pacify Pitta energy.',
  ],
  kapha: [
    'Rise before 6am and move the body first thing — Kapha stagnates quickly with excess sleep.',
    'Favour light, warm, and spiced foods; reduce heavy, oily, or sweet meals that slow digestion.',
    "Vary your routine and seek novelty — stimulation counters Kapha's natural pull toward inertia.",
    'Dry brushing (garshana) before bathing improves circulation and sharpens morning energy.',
    'Surround yourself with vibrant colours and uplifting music to counter the heaviness of Kapha.',
  ],
}

const DOSHA_SUMMARY_QUALITY: Record<Dosha, string> = {
  vata: 'grounding and warm',
  pitta: 'cooling and surrendered',
  kapha: 'energising and awakened',
}

// ── Recommendation Engine ──────────────────────────────────────────────────

export function getRecommendations(answers: Answers): Results {
  const { intentions, activityLevel, preferredTime, dosha } = answers

  // Score poses
  const poseScores = new Map<string, number>()
  for (const intention of intentions) {
    INTENTION_POSE_MAP[intention].forEach((poseId, rank) => {
      poseScores.set(poseId, (poseScores.get(poseId) ?? 0) + (5 - rank))
    })
  }
  for (const poseId of DOSHA_POSE_BOOST[dosha]) {
    poseScores.set(poseId, (poseScores.get(poseId) ?? 0) + 3)
  }
  for (const pose of POSES) {
    if (preferredTime === 'flexible' || pose.timeAffinity.includes(preferredTime)) {
      poseScores.set(pose.id, (poseScores.get(pose.id) ?? 0) + 1)
    }
  }

  const sortedPoses = [...POSES].sort(
    (a, b) => (poseScores.get(b.id) ?? 0) - (poseScores.get(a.id) ?? 0)
  )
  let topPoses = sortedPoses.slice(0, 4)
  if (topPoses.length < 3) {
    const boostFill = DOSHA_POSE_BOOST[dosha]
      .map((id) => POSES.find((p) => p.id === id))
      .filter((p): p is Pose => !!p)
    topPoses = [...topPoses, ...boostFill].slice(0, 4)
  }

  // Score breathing
  const breathScores = new Map<string, number>()
  for (const intention of intentions) {
    INTENTION_BREATH_MAP[intention].forEach((breathId, rank) => {
      breathScores.set(breathId, (breathScores.get(breathId) ?? 0) + (2 - rank))
    })
  }
  const topBreath = [...BREATHING_TECHNIQUES]
    .sort((a, b) => (breathScores.get(b.id) ?? 0) - (breathScores.get(a.id) ?? 0))
    .slice(0, 2)

  // Ayurvedic tips — always show 3
  const ayurvedicTips = DOSHA_TIPS[dosha].slice(0, 3)

  // Compute actual flow duration from top poses
  const flowDurationMins = Math.max(
    1,
    Math.round(
      topPoses.reduce((sum, p) => {
        const isSide = p.hold.toLowerCase().includes('each side')
        const secs = parseHoldToSeconds(p.hold)
        return sum + (isSide ? secs * 2 : secs)
      }, 0) / 60
    )
  )

  // Summary
  const labels = intentions.map(
    (i) => INTENTIONS_LIST.find((x) => x.id === i)?.label.toLowerCase() ?? i
  )
  const doshaName = dosha.charAt(0).toUpperCase() + dosha.slice(1)
  let summary: string
  if (labels.length === 1) {
    summary = `For ${labels[0]} with a ${doshaName} tendency, your practice should feel ${DOSHA_SUMMARY_QUALITY[dosha]}.`
  } else if (labels.length === 2) {
    summary = `For ${labels[0]} and ${labels[1]} with a ${doshaName} tendency, your practice should feel ${DOSHA_SUMMARY_QUALITY[dosha]}.`
  } else {
    summary = `With ${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]} as your focus, and a ${doshaName} constitution, your practice should feel ${DOSHA_SUMMARY_QUALITY[dosha]}.`
  }

  return {
    summary,
    poses: topPoses,
    breathingTechniques: topBreath,
    frequencyGuidance: FREQUENCY_GUIDANCE[activityLevel],
    timeGuidance: TIME_GUIDANCE[preferredTime],
    flowDurationMins,
    ayurvedicTips,
  }
}
