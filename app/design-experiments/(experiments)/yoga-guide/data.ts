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
export type SkillLevel = 'beginner' | 'intermediate' | 'experienced'
export type DietaryStyle = 'omnivore' | 'vegetarian' | 'vegan' | 'pescetarian'
export type Step =
  | 'welcome'
  | 'intentions'
  | 'context'
  | 'accommodations'
  | 'dosha'
  | 'results'
  | 'breathe'
  | 'flow'
  | 'rhythm'
  | 'ayurveda'

export type InjuryArea =
  | 'lower-back'
  | 'knee'
  | 'ankle-foot'
  | 'shoulder-arm'
  | 'hip'
  | 'wrist-hand'
  | 'neck'
  | 'limb-difference'

export type LimbSide = 'left' | 'right'
export type LimbLevel = 'full-arm' | 'partial-arm' | 'full-leg' | 'above-knee' | 'below-knee'

export interface LimbDifference {
  side: LimbSide
  level: LimbLevel
}

export interface Accommodations {
  areas: InjuryArea[]
  limbDifference?: LimbDifference
}

export interface Answers {
  intentions: Intention[]
  activityLevel: ActivityLevel
  preferredTime: PreferredTime
  dosha: Dosha
  skillLevel: SkillLevel
  dietaryStyle: DietaryStyle
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
  imageUrl?: string
}

export interface PoseWithAdaptation extends Pose {
  adaptation?: string
  adaptedSide?: LimbSide       // when set, adaptation only applies on this side's flow pass
  oppositeInstruction?: string // side-specific instruction for the unaffected side's flow pass
}

export interface BreathPhase {
  label: string
  duration: number
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
  beginnerNote?: string
}

export interface AyurvedaDetail {
  allTips: string[]
  foodNote: string
  foodNoteByDiet?: Partial<Record<DietaryStyle, string>>
  routineNote: string
  affirmation: string
}

export interface Results {
  summary: string
  poses: PoseWithAdaptation[]
  breathingTechniques: BreathingTechnique[]
  frequencyGuidance: string
  timeGuidance: string
  flowDurationMins: number
  ayurvedicTips: string[]
  accommodationNote?: string
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

export const SKILL_LEVELS: { id: SkillLevel; label: string }[] = [
  { id: 'beginner', label: 'New to yoga' },
  { id: 'intermediate', label: 'Some experience' },
  { id: 'experienced', label: 'Regular practitioner' },
]

export const DIETARY_STYLES: { id: DietaryStyle; label: string }[] = [
  { id: 'omnivore', label: 'No restrictions' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan / Plant-based' },
  { id: 'pescetarian', label: 'Pescetarian' },
]

export const ACCOMMODATION_LABELS: { id: InjuryArea; label: string }[] = [
  { id: 'lower-back', label: 'Lower Back' },
  { id: 'knee', label: 'Knee' },
  { id: 'ankle-foot', label: 'Ankle / Foot' },
  { id: 'shoulder-arm', label: 'Shoulder / Arm' },
  { id: 'hip', label: 'Hip' },
  { id: 'wrist-hand', label: 'Wrist / Hand' },
  { id: 'neck', label: 'Neck' },
  { id: 'limb-difference', label: 'Limb Difference' },
]

export const LIMB_SIDES: { id: LimbSide; label: string }[] = [
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
]

export const LIMB_LEVELS: { id: LimbLevel; label: string }[] = [
  { id: 'full-arm', label: 'Entire arm' },
  { id: 'partial-arm', label: 'Elbow to hand' },
  { id: 'full-leg', label: 'Entire leg' },
  { id: 'above-knee', label: 'Above knee' },
  { id: 'below-knee', label: 'Below knee' },
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
      'From hands and knees, press into the palms and lift hips up and back into an inverted V. Straighten the legs as much as comfortable, pressing heels toward the floor. Feel the spine lengthen away from the hips.',
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
      'Step one foot forward into a deep lunge, back heel grounded at 45°. Bend the front knee directly over the ankle and raise both arms overhead, palms facing or touching. Soften the gaze forward or up.',
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
      'Lie on your back with feet flat on the floor, hip-width apart. Press through the soles to lift the hips toward the ceiling. Arms press into the mat; hold the lift with the glutes. Keep the chin slightly lifted away from the chest.',
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
      'Stand with feet together or hip-width apart. Spread the toes wide. Engage the thighs, lengthen the tailbone down, and lift through the crown of the head. Feel the breath move the ribcage three-dimensionally.',
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
      'From downward dog, bring one knee forward toward the same-side wrist. Extend the back leg straight behind. If the front hip lifts, slide a folded blanket beneath it. Settle the hips evenly toward the floor and fold forward over the front leg.',
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
  {
    id: 'supine-figure-four',
    name: 'Supine Figure-Four',
    benefit: 'Opens the outer hip deeply without loading the knee or requiring balance',
    instruction:
      'Lie on your back with knees bent, feet flat on the floor. Cross one ankle over the opposite thigh just above the knee, flexing the raised foot firmly to protect the knee joint. Draw both legs gently toward the chest — hold the back of the lower thigh or shin. Hold with steady breath, then switch sides.',
    hold: '90s each side',
    howOften: '4× per week',
    doshaAffinity: ['pitta', 'vata'],
    timeAffinity: ['evening', 'flexible'],
  },
  {
    id: 'happy-baby',
    name: 'Happy Baby',
    benefit: 'Releases the inner hips and lower back while calming the nervous system',
    instruction:
      'Lie on your back and draw both knees toward your armpits. Reach for the outer edges of your feet — or hold the shins if that is more comfortable. Flex the feet toward the ceiling, keeping the knees wide and the lower back heavy on the mat. If the lower back lifts off the mat, reduce the draw. Rock gently side to side or simply hold.',
    hold: '90s',
    howOften: 'Daily',
    doshaAffinity: ['vata', 'pitta'],
    timeAffinity: ['evening', 'flexible'],
  },
  {
    id: 'sphinx',
    name: 'Sphinx Pose',
    benefit: 'Gently extends the spine and opens the chest without compressing the lower back',
    instruction:
      'Lie on your stomach with elbows directly under the shoulders, forearms flat on the mat. Press down evenly through the forearms and lift the chest. Press the pubic bone gently into the mat to protect the lumbar — the lower back should feel long, not compressed. Soften the shoulders away from the ears.',
    hold: '90s',
    howOften: 'Daily',
    doshaAffinity: ['vata', 'kapha'],
    timeAffinity: ['morning', 'flexible'],
  },
  {
    id: 'standing-forward-fold',
    name: 'Standing Forward Fold',
    benefit: 'Decompresses the spine, calms the nervous system, and lengthens the hamstrings',
    instruction:
      'Stand with feet hip-width apart. Exhale and hinge forward from the hips, letting the upper body hang heavy. Knees can be soft or gently bent. Let the neck release completely. After 30 seconds, try clasping opposite elbows and letting the weight of the arms deepen the hang.',
    hold: '60s',
    howOften: 'Daily',
    doshaAffinity: ['pitta', 'vata'],
    timeAffinity: ['morning', 'evening', 'flexible'],
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
      'Your sequence is a complete starting session — move through it once, holding each pose fully. As it becomes familiar over the first two weeks, add a second pass. The goal is consistency, not volume.',
    breathingNote:
      'Practice your breathing technique on at least two days per week — on rest days if possible. Even 5 minutes in the morning before the mind gets busy makes a measurable difference. The nervous system learns fastest when the practice is regular, not long.',
    sampleWeek:
      'Monday: flow sequence (20 min) · Wednesday: breathing practice (10 min) · Friday: flow sequence (20 min) · Sunday: breathing + short walk',
    progressNote:
      'After two weeks, transitions between poses will feel more natural and the breathing will require less effort. After four weeks, expect a noticeable shift in how you respond to stress — that is the nervous system adapting.',
    beginnerNote:
      'If you are new to yoga, your first goal is simply familiarity — learning how each pose feels from the inside. Two or three poses done with genuine attention beats a full sequence done on autopilot. Depth and duration come later.',
  },
  light: {
    sessionSummary: '4 sessions per week, 30 minutes each',
    flowNote:
      'Move through your sequence twice per session — once slowly to arrive in the body, once with more depth and intention. This brings the total to roughly 25–30 minutes including natural transition time. On some days, replace one pass with 5 minutes of stillness.',
    breathingNote:
      'Weave 5 minutes of your breathing practice into the end of each flow session. On one day per week, do a standalone breathing session of 10–15 minutes — this is where the deeper regulation work happens.',
    sampleWeek:
      'Monday: flow × 2 (30 min) · Tuesday: breathing standalone (12 min) · Thursday: flow × 2 (30 min) · Saturday: flow × 2 + extended breathing (35 min)',
    progressNote:
      'By week three, sleep quality and stress response should reflect the practice. The breathing work tends to show up first — you will notice you are calmer in situations that previously caused tension.',
    beginnerNote:
      'In your first two weeks, use half the hold time if the full duration feels like too much. The full duration is available to you as each pose becomes familiar. Progress in yoga is measured in weeks and months, not sessions.',
  },
  moderate: {
    sessionSummary: '5 sessions per week, 35–40 minutes each',
    flowNote:
      'Move through your sequence 2–3 times per session. The first pass is warm-up, the second is where you deepen into each pose. A third pass before savasana consolidates the work. At this frequency, the body begins to change structurally — expect real postural improvements.',
    breathingNote:
      'Practice breathing on at least two separate days, ideally not the same days as your longest flow sessions. At this frequency, your parasympathetic baseline will shift measurably within a month.',
    sampleWeek:
      'Mon/Wed/Fri: full flow × 3 (40 min) · Tue/Thu: breathing practice (15 min) + one slow sequence pass · Weekend: one rest day, one light session',
    progressNote:
      'At this frequency, expect real changes within 3 weeks: improved posture, more even energy through the day, and a calmer reaction to pressure. The compounding effect of 5 sessions per week is significant.',
    beginnerNote:
      'If five sessions per week feels ambitious given your experience level, start with three and build from there. The practice you can sustain consistently will always outperform the practice you push through and abandon.',
  },
  active: {
    sessionSummary: '5–6 sessions per week, 40–45 minutes each',
    flowNote:
      'Use your sequence as active recovery alongside your main training. On high-intensity days, do one slow pass through the poses post-workout (15–20 min). On lighter training days, do 2–3 passes as a standalone session.',
    breathingNote:
      'Breathing practice works especially well post-workout to accelerate recovery. Even 8–10 minutes of your recommended technique after training lowers cortisol more efficiently than passive rest alone. On rest days, a longer breathing session (15–20 min) deepens the recovery effect.',
    sampleWeek:
      'Training days: flow post-workout (20 min) + breath (10 min) · Rest days: full flow × 3 (40 min) · One day fully off per week — the nervous system needs at least one complete break',
    progressNote:
      'At this level, yoga and breathwork are recovery tools as much as practice. After four weeks, you should notice improved recovery time between hard sessions, fewer injury-adjacent tightnesses, and more consistent energy.',
    beginnerNote:
      'As an active person new to yoga, your body will adapt quickly — but the nervous system learning is separate from the physical. Let the first two weeks be about breath and alignment rather than depth or duration.',
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
    foodNoteByDiet: {
      vegan:
        'Vata is balanced by warm, oily, and grounding foods. For a plant-based diet: favour thick lentil soups, root vegetable stews, coconut-based curries, nut butters, avocado, and cooked grains like oats, rice, and quinoa. Use coconut oil or cold-pressed olive oil liberally — they replace ghee as warming, grounding fats. Warm oat or coconut milk spiced with cinnamon and cardamom makes an excellent morning drink. Eat at regular times and avoid skipping meals. Avoid raw salads, cold smoothies, crackers, and anything dry or light, particularly in autumn and winter.',
      vegetarian:
        'Vata is balanced by warm, oily, and grounding foods. Favour soups, stews, cooked grains, root vegetables, warm dairy, ghee, cooked eggs, nuts, and seeds. Eat at regular times and avoid skipping meals — irregular eating depletes Vata quickly. Avoid raw salads, cold drinks, crackers, and anything light or dry, particularly in autumn and winter.',
      pescetarian:
        'Vata is balanced by warm, oily, and grounding foods. Favour soups, stews, cooked grains, root vegetables, oily fish like salmon, sardines, and mackerel, warm dairy, nuts, and seeds. Fish is especially well-suited for Vata — warming, oily, and deeply nourishing. Eat at regular times and avoid skipping meals. Avoid raw salads, cold drinks, crackers, and anything light or dry, particularly in autumn and winter.',
    },
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
    foodNoteByDiet: {
      vegan:
        'Pitta is balanced by cooling, mildly spiced foods. For a plant-based diet: favour cucumber, coconut, dark leafy greens, sweet fruits, watermelon, sweet potatoes, tofu, tempeh, and lightly seasoned grains. Coconut milk, oat milk, or almond milk replace dairy well — choose unsweetened varieties. Coconut oil is cooling and ideal for cooking. Avoid skipping meals — Pitta\'s hunger turns quickly to irritability. Reduce alcohol, very spicy foods, and excessive caffeine. Drink room-temperature or lightly cooled water.',
      vegetarian:
        "Pitta is balanced by cooling, mildly spiced foods. Favour cucumber, coconut, leafy greens, sweet fruits, cooling dairy (especially yogurt and milk), and lightly seasoned grains. Avoid skipping meals — Pitta's hunger turns quickly to irritability. Reduce alcohol, very spicy foods, and excessive caffeine. Room-temperature or lightly cooled water serves Pitta better than hot drinks.",
      pescetarian:
        "Pitta is balanced by cooling, mildly spiced foods. Favour cucumber, coconut, leafy greens, sweet fruits, white fish, dairy, and lightly seasoned grains. Favour lighter, cooling fish over heavy oily varieties — salmon is warming and better in moderation for Pitta. Avoid skipping meals. Reduce alcohol, very spicy foods, and excessive caffeine.",
    },
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
    foodNoteByDiet: {
      vegan:
        "Kapha is balanced by light, warm, and strongly spiced foods. For a plant-based diet: favour ginger, black pepper, mustard seeds, turmeric, leafy greens, cruciferous vegetables, legumes, and light grains like millet or quinoa. Use spiced olive oil sparingly or dry-cook where possible — avoid heavy oils. Replace dairy with lighter plant milks like oat, almond, or rice. Eat less than you think you need and wait for genuine hunger between meals — Kapha's digestion benefits from space.",
      vegetarian:
        "Kapha is balanced by light, warm, and strongly spiced foods. Favour ginger, black pepper, mustard, leafy greens, legumes, and light grains like millet or quinoa. Reduce wheat, dairy (especially heavy cheeses and cream), heavy oils, and sweets. Eat less than you think you need and wait for genuine hunger before meals — Kapha's digestion is thorough but slow.",
      pescetarian:
        "Kapha is balanced by light, warm, and strongly spiced foods. Favour ginger, black pepper, mustard, leafy greens, legumes, light white fish like cod, tilapia, or sea bass, and light grains. Heavy oily fish in large amounts adds Kapha — favour lean varieties. Reduce wheat, dairy, heavy oils, and sweets. Eat less than you think you need and wait for genuine hunger before meals.",
    },
    routineNote:
      'The key for Kapha is activation. Rise early and move immediately — even a brisk ten-minute walk changes the energy of the whole day. Keep your environment tidy and varied; Kapha accumulates in cluttered, unchanging spaces. Regular social engagement, novel experiences, and deliberate variation in routine counter the pull toward comfort and sameness that Kapha naturally feels.',
    affirmation:
      'Movement is available to me now. I do not need to feel like it before I begin — the feeling comes after.',
  },
}

// ── Mappings ───────────────────────────────────────────────────────────────

const INTENTION_POSE_MAP: Record<Intention, string[]> = {
  anxiety: ['legs-up-wall', 'childs-pose', 'happy-baby', 'savasana', 'supine-figure-four', 'seated-forward-fold', 'supine-twist'],
  'poor-sleep': ['legs-up-wall', 'savasana', 'happy-baby', 'supine-figure-four', 'supine-twist', 'childs-pose', 'butterfly'],
  'back-pain': ['cat-cow', 'childs-pose', 'sphinx', 'supine-figure-four', 'bridge', 'supine-twist', 'standing-forward-fold'],
  'poor-posture': ['mountain-pose', 'sphinx', 'bridge', 'downward-dog', 'warrior-i', 'cat-cow', 'standing-forward-fold'],
  'digestive-issues': ['supine-twist', 'cat-cow', 'butterfly', 'standing-forward-fold', 'childs-pose', 'happy-baby', 'seated-forward-fold'],
  'low-energy': ['warrior-i', 'downward-dog', 'mountain-pose', 'sphinx', 'bridge', 'standing-forward-fold', 'cat-cow'],
  'stress-relief': ['savasana', 'legs-up-wall', 'happy-baby', 'childs-pose', 'supine-figure-four', 'butterfly', 'seated-forward-fold'],
  flexibility: ['pigeon', 'supine-figure-four', 'standing-forward-fold', 'seated-forward-fold', 'butterfly', 'happy-baby', 'downward-dog', 'supine-twist'],
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
  vata: ['childs-pose', 'savasana', 'happy-baby', 'bridge', 'legs-up-wall', 'supine-figure-four', 'mountain-pose'],
  pitta: ['seated-forward-fold', 'supine-figure-four', 'butterfly', 'standing-forward-fold', 'legs-up-wall', 'supine-twist'],
  kapha: ['warrior-i', 'downward-dog', 'standing-forward-fold', 'cat-cow', 'sphinx', 'mountain-pose', 'bridge'],
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

// ── Accommodation Data ─────────────────────────────────────────────────────

// Soft penalty (-4): pose is manageable with modification
const POSE_SCORE_PENALTIES: Partial<Record<InjuryArea, string[]>> = {
  knee: ['warrior-i', 'butterfly'],
  'wrist-hand': ['downward-dog', 'cat-cow'],
  'shoulder-arm': ['downward-dog', 'cat-cow'],
  'ankle-foot': ['warrior-i'],
  hip: ['warrior-i'],
}

// Hard penalty (-8): pose is genuinely contraindicated — natural scoring will surface an alternative
const POSE_HARD_PENALTIES: Partial<Record<InjuryArea, string[]>> = {
  knee: ['pigeon'],
  hip: ['pigeon'],
  'limb-difference': ['pigeon'],
}

const POSE_PRIORITIES_FOR_ACCOMMODATION: Partial<Record<InjuryArea, string[]>> = {
  'lower-back': ['cat-cow', 'childs-pose', 'sphinx', 'supine-twist', 'happy-baby'],
  knee: ['supine-figure-four', 'happy-baby', 'legs-up-wall', 'savasana', 'seated-forward-fold', 'supine-twist'],
  'ankle-foot': ['legs-up-wall', 'happy-baby', 'sphinx', 'seated-forward-fold', 'butterfly', 'supine-twist'],
  'shoulder-arm': ['legs-up-wall', 'supine-twist', 'savasana', 'butterfly', 'happy-baby'],
  hip: ['supine-figure-four', 'happy-baby', 'supine-twist', 'butterfly', 'legs-up-wall', 'seated-forward-fold'],
  'wrist-hand': ['legs-up-wall', 'supine-twist', 'happy-baby', 'butterfly', 'savasana', 'sphinx'],
  neck: ['savasana', 'supine-twist', 'childs-pose', 'happy-baby'],
  'limb-difference': ['savasana', 'supine-figure-four', 'happy-baby', 'supine-twist', 'seated-forward-fold', 'butterfly'],
}

const POSE_ADAPTATIONS: Partial<Record<InjuryArea, Record<string, string>>> = {
  'lower-back': {
    bridge:
      'Micro-bridge: lift the hips only 2–3 inches off the mat. Avoid pressing into a full arch. Keep the natural lumbar curve neutral and use the glutes, not the lower back, to sustain the lift.',
    'seated-forward-fold':
      'Sit on a folded blanket to tilt the pelvis forward. Bend the knees generously. Hinge from the hips and pause well before any pulling sensation in the lower back — go only as far as feels safe.',
    'warrior-i':
      'Shorten the stance by about a third. Keep the front knee stacked over the ankle. Rest both hands on the front thigh if raising the arms causes lumbar compression.',
    'downward-dog':
      'Bend both knees generously throughout the hold. The goal is spinal decompression and length — not straight legs. Walk the hands further from the feet to reduce the angle of the lower back.',
    'cat-cow':
      'Avoid dropping the belly past neutral in the cow phase if this pulls in the lower back. A small, gentle arc is sufficient. Move slowly and let breath lead the movement.',
    pigeon:
      'Use a folded blanket under the front hip to keep the pelvis level. This prevents the lower back from rotating to compensate. Fold forward only as far as the back stays neutral.',
    'supine-figure-four':
      'Place a folded blanket under the hips if the lower back is sensitive in full supine. Draw the legs only as close to the chest as is comfortable — even a small range opens the hip meaningfully.',
    'happy-baby':
      'If any discomfort arises in the lower back, reduce the range of the draw — let the feet point toward the ceiling without pulling, or rest the soles together in a gentle butterfly instead.',
    sphinx:
      'This is one of the safest backbends for the lower back. If any compression is felt, reduce the height of the lift — even resting with the forehead down while keeping elbows under the shoulders retains the chest-opening benefit. Never force the arch.',
    'standing-forward-fold':
      'Bend the knees generously throughout the hold. This takes the hamstrings out of the picture and allows the lower back to decompress without strain. Hands can rest on the thighs or shins rather than reaching toward the floor.',
    butterfly:
      'Sit on a bolstered blanket to tilt the pelvis forward and avoid rounding into the lower back. The forward fold comes from the hips only — stop well before you feel any pull in the lumbar. A gentle upright seated position is enough.',
    'childs-pose':
      'Place a folded blanket between the thighs and calves to reduce lumbar compression before folding. If the sensation feels sharp at any point, rest in a supported seated position rather than pressing into the full fold.',
    'mountain-pose':
      'Bring a micro-bend into the knees and engage the low belly lightly. Avoid tucking the pelvis aggressively — neutral lumbar is the goal, not a flat back. The lower back should feel long and at ease, not braced.',
    'supine-twist':
      'Keep both knees bent throughout the twist rather than extending the bottom leg — extending creates a rotational pull on the lumbar. The twist comes from the thoracic spine; the lower back simply follows along.',
    'legs-up-wall':
      'Place a folded blanket under the sacrum to elevate the hips slightly before extending the legs. This reduces lumbar strain in the inversion position and allows the lower back to fully release.',
  },
  knee: {
    'warrior-i':
      'Shorten the lunge considerably. The front knee should track the second toe and stay directly over — not past — the ankle. Rest the back knee on a folded blanket if sensitive. Reduce depth until there is zero discomfort.',
    pigeon:
      'Replace with Supine Figure-Four: lie on your back, cross one ankle over the opposite thigh, flex the raised foot firmly to protect the knee, and draw both legs gently toward the chest. Full hip opening, zero knee loading.',
    butterfly:
      'Sit on a folded blanket to elevate the hips. Let the knees rest at whatever height is natural — do not press them toward the floor. Avoid any position that creates sensation inside the knee joint.',
    bridge:
      'Place a yoga block or folded blanket between the thighs to encourage alignment. Reduce the height of the lift if there is any knee discomfort. Stop immediately if a sharp sensation occurs.',
    'childs-pose':
      'Place a tightly rolled blanket behind the knees before folding forward to create more space in the joint. If floor kneeling is too much, fold forward from a chair seat with arms hanging toward the floor.',
    'cat-cow':
      'Place a folded blanket under each knee before beginning. If hands-and-knees is still uncomfortable, do this seated in a chair: arch (cow) and round (cat) the spine with the breath, hands resting on thighs.',
    'supine-figure-four':
      'Keep the flex in the top foot strong throughout — this protects the knee ligaments. Draw the legs toward the chest only as far as the crossed knee remains comfortable. A small range is entirely sufficient.',
    'happy-baby':
      'Hold the shins rather than the feet, keeping the knees at a comfortable angle. Do not draw the knees wider than feels natural. Even a small range of motion opens the inner hips meaningfully.',
    'standing-forward-fold':
      'Keep the knees soft to moderately bent — do not lock the joints at any point. Hands can rest on the thighs to reduce the pull through the back of the legs.',
    'seated-forward-fold':
      'Sit on a folded blanket to reduce hamstring tension that pulls on the knee. Keep a generous bend in both knees throughout — reaching toward the shins rather than the feet removes the leverage that stresses the joint.',
    'downward-dog':
      'Keep a deep bend in both knees throughout the entire hold. The focus here is spinal decompression and length, not leg straightness — a generously bent-knee dog is safer and delivers the full back-body benefit.',
    'mountain-pose':
      'Place a light micro-bend in the knees rather than locking the joints straight. Keep the kneecaps tracking over the second toes and avoid hyperextension at the back of the knee.',
    'legs-up-wall':
      'Place a folded blanket under the hips and keep a slight bend in the knees rather than extending fully straight. This removes hamstring tension that travels back into the knee joint.',
    'supine-twist':
      'Keep both knees bent throughout the twist. Do not extend the bottom leg, which creates a straightening pull through the back of the knee. A folded blanket between the knees is optional extra support.',
  },
  'ankle-foot': {
    'warrior-i':
      'Rest the back knee on a folded blanket (low lunge variation). This removes weight-bearing from the rear ankle entirely while preserving the hip flexor opening and upper body lift.',
    'mountain-pose':
      'Stand near a wall with one hand lightly resting on it. Allow the affected foot to bear only as much weight as is comfortable. Focus on alignment of hip and knee rather than a perfectly symmetrical stance.',
    'downward-dog':
      'Work from the forearms — Dolphin Pose: come onto the elbows with forearms flat on the mat, then press the hips up and back. This eliminates ankle weight-bearing while providing most of the spinal and hamstring benefit.',
    bridge:
      'Ensure the feet are placed flat and close enough to the hips that there is minimal dorsiflexion at the ankle. If heel placement is uncomfortable, try a slightly wider stance.',
    'standing-forward-fold':
      'Distribute weight slightly forward of the heels. A wall behind you for light support removes any concern about ankle stability during the fold.',
    'childs-pose':
      'Place a folded blanket under the tops of the feet and ankles before kneeling — this reduces dorsiflexion pressure significantly. If plantar weight-bearing is uncomfortable, fold forward from a chair seat with arms hanging toward the floor.',
    'cat-cow':
      'Place a folded blanket under the tops of the feet before beginning. If even this is too much, perform cat-cow seated in a chair — the spinal mobility benefit is identical and the ankle is entirely unloaded.',
    butterfly:
      'This seated pose involves minimal ankle load. If placing the soles together creates pressure at the outer ankles, rest the feet slightly further from the hips and place a folded blanket under each knee for support.',
  },
  'shoulder-arm': {
    'downward-dog':
      'Replace with Puppy Pose: from hands and knees, walk the hands forward along the mat and lower the chest and chin toward the floor, keeping the hips stacked over the knees. Same thoracic extension, no shoulder weight-bearing.',
    'cat-cow':
      'Come onto the forearms for the cow phase. For cat, simply round the spine from a forearm or seated position — no pressing through the hands required.',
    bridge:
      'Keep arms flat alongside the body, palms facing down or up — whichever is comfortable. Do not clasp the hands beneath the back. Let the leg drive and glute strength sustain the lift.',
    'warrior-i':
      'Rest the hands on the hips or front thigh rather than raising the arms overhead. The standing, balancing, and hip-opening benefits of the pose are fully intact at hip height.',
    'childs-pose':
      'Rest the arms alongside the body rather than extended forward. This takes all weight and stretch off the shoulders and turns the pose into pure grounding rest.',
    'supine-twist':
      'Let the top arm rest on the torso or hip rather than extending it overhead or out to the side. The T-extension creates traction on the shoulder that may be uncomfortable — the spinal rotation is entirely intact with the arm resting at ease.',
    'seated-forward-fold':
      'Reach toward the shins rather than the feet. Loop a strap or belt around the soles if needed to reach without pulling through the shoulder. The fold comes entirely from the hips — the arms are guides, not levers.',
    butterfly:
      'Rest the hands on the thighs or loosely on the floor in front of you rather than reaching for the feet. Lean forward from the hips with the arms passive and relaxed alongside the body.',
    savasana:
      'Place the affected arm alongside the body in a position of complete ease — a slightly bent elbow or resting on the abdomen is preferable to a fully extended arm if that creates shoulder tension.',
    'supine-figure-four':
      'The arms can rest anywhere comfortable — on the chest, alongside the body, or lightly guiding the shins. There is no overhead component, making this pose well-suited for shoulder sensitivities.',
    'legs-up-wall':
      'Let the arms rest alongside the body with palms facing up. There is no need to extend the arms outward if that position is uncomfortable. A bolster under the hips is an option if lying fully flat creates shoulder tension.',
  },
  hip: {
    pigeon:
      'Replace with Supine Figure-Four: lie on your back, cross one ankle over the opposite thigh, flex the raised foot firmly, and draw both legs gently toward the chest. Equivalent hip external rotation with no joint loading.',
    'warrior-i':
      'Reduce the stride length to half of what feels natural. Add a slight external rotation at the back hip if that creates more ease. Keep the pelvis as neutral as possible.',
    butterfly:
      'Sit on a firm folded blanket or bolster to tilt the pelvis forward. Let the knees rest at their natural height — never press them down. Fold forward only as far as the hips, not the waist, allow.',
    'downward-dog':
      'Bend the knees and focus on the hip crease opening upward toward the ceiling rather than pressing the heels down. A well-bent-knee dog with lifted sit bones is more hip-opening than forcing flat legs.',
    'supine-figure-four':
      'Let the degree of opening be guided entirely by comfort. You do not need to draw the legs close to the chest — even a very small draw opens the hip. Stop at the first sensation of strain.',
    'happy-baby':
      'Hold the shins or knees rather than the feet. Draw the legs only as far as the hips comfortably allow. Side-to-side rocking is optional — omit if the hip is sensitive.',
    bridge:
      'Place a yoga block between the thighs to encourage neutral hip alignment rather than excessive external rotation. If hip flexor pain occurs at the top of the lift, reduce the height and focus on posterior pelvic tilt rather than maximising height.',
    'supine-twist':
      'Keep the knee at a 90° bend rather than drawing it past the hip. A folded blanket under the twisted knee prevents the hip from sinking into a range that creates discomfort. Do not force the knee to the floor.',
    'seated-forward-fold':
      'Sit on a firm blanket to tilt the pelvis forward before folding. The forward fold comes entirely from the hip crease — if the hips are restricted, bend the knees generously and allow the fold to remain shallow. Depth is not the goal.',
    'cat-cow':
      'In the cow phase, let the hip extension be natural and minimal. Avoid exaggerating the tailbone lift if this compresses the hip joint. Small, breath-led movements are entirely sufficient.',
    'standing-forward-fold':
      'Keep the feet hip-width or slightly wider than usual. A wider stance creates more space in the hip crease and reduces pinching at the front of the hip. Bend the knees freely.',
  },
  'wrist-hand': {
    'downward-dog':
      'Substitute with Dolphin Pose: come onto the forearms with elbows at shoulder width, forearms parallel. Press the hips up and back as in a standard dog. Alternatively, make soft fists and place the knuckles on the mat to bring the wrist toward neutral.',
    'cat-cow':
      'Place the forearms on the mat instead of the hands for the cow phase. For cat, simply round the spine while resting on the forearms. Or perform the sequence seated in a chair.',
    bridge:
      'Keep palms facing up alongside the body, fully releasing the wrists. Do not press the hands into the mat at any point.',
    'childs-pose':
      'Extend the arms alongside the body rather than forward. This removes all pressure from the wrists while retaining the grounding and rest qualities of the pose.',
    sphinx:
      'No weight is on the wrists in Sphinx — the forearms bear all load. This pose is an excellent alternative to downward dog for wrist sensitivities.',
    butterfly:
      'Rest the hands loosely on the thighs or wrap them around the shins rather than gripping the feet or ankles. Keep the wrists in a neutral, unclenched position throughout.',
    'seated-forward-fold':
      'Use a strap or belt looped around the feet rather than gripping with the hands. This removes all wrist and hand load while maintaining the full forward fold. Hands can rest gently on the shins instead.',
    'warrior-i':
      'Bring the hands to the hips or rest them on the front thigh rather than pressing palms together overhead. There is no wrist engagement required at any point in this pose.',
    'supine-twist':
      'Let the arms rest wherever is comfortable — on the torso, alongside the body, or gently placed on the floor with unclenched hands. There is no wrist or hand engagement required.',
    'mountain-pose':
      'Let the fingers spread gently rather than pressing the palms flat against the thighs. A soft, unclenched hand position at the sides is all that is required.',
  },
  neck: {
    'downward-dog':
      'Let the head hang fully between the arms — a fully released neck, not tucked chin, not craned up. If neck sensation is too strong, place blocks under the hands to raise the floor and reduce the angle.',
    'childs-pose':
      'Place a folded blanket under the forehead so the neck rests in a supported, neutral position rather than being pressed into the mat. Arms alongside the body release all neck tension.',
    'warrior-i':
      'Keep the gaze softly forward at the horizon. Do not look up toward the hands overhead. A neutral neck with a gentle forward gaze is both safer and more sustainable.',
    'cat-cow':
      'In cow phase, look only slightly forward — let the cervical spine follow the thoracic arc gently. In cat, let the chin drop naturally without forcing it to the chest.',
    savasana:
      'Place a thin folded blanket under the head and neck so the cervical spine rests in neutral — neither pressed into the mat nor extended. Essential for holds longer than a minute.',
    sphinx:
      'Look forward or very slightly downward — avoid extending the neck fully back. A neutral or gently forward gaze protects the cervical spine while the thoracic extension proceeds naturally.',
    'happy-baby':
      'Rest the back of the head on the mat or a thin folded blanket. Keep the chin in a neutral position — there is no need to lift the head during this pose.',
    'supine-twist':
      'Place a thin folded blanket under the head so the cervical spine stays neutral as the thoracic rotates. Allow the gaze to travel only as far as the neck comfortably permits — it does not need to match the full rotation of the spine.',
    bridge:
      'Do not press the chin to the chest or let the neck flatten fully into the mat. A thin folded blanket placed under the shoulders (not the head) elevates slightly and reduces cervical compression. Keep the throat soft throughout.',
    'legs-up-wall':
      'Place a thin folded blanket under the head and neck so the cervical spine rests in neutral. Avoid pressing the chin toward the chest while in the inversion — the weight of the legs should not create any pull at the base of the skull.',
    butterfly:
      'If folding forward creates compression at the back of the neck, support the forehead on stacked fists or a block. Allow the neck to lengthen rather than collapse as the head drops toward the floor.',
    'mountain-pose':
      'Keep the chin level — neither lifted nor tucked. Imagine a light vertical line from the crown of the head through the spine. Let the neck muscles be soft rather than holding the head in position.',
    'supine-figure-four':
      'Place a thin folded blanket under the head so the neck rests supported in neutral. There is no need to lift the head during this pose — let the cervical spine be completely passive.',
    'seated-forward-fold':
      'Let the head hang naturally as the spine folds forward. Do not force the chin toward the chest or add additional cervical flexion. The neck is a continuation of the fold, not its endpoint — it follows, it does not lead.',
  },
}

function getLimbAdaptations(ld: LimbDifference): Record<string, string> {
  const isArm = ld.level === 'full-arm' || ld.level === 'partial-arm'
  const aboveKnee = ld.level === 'full-leg' || ld.level === 'above-knee'
  const opp = ld.side === 'left' ? 'right' : 'left'

  if (isArm) {
    return {
      'downward-dog': `From hands and knees, shift weight onto the ${opp} hand and rest the ${ld.side} forearm or a block for support. Puppy Pose — chest and chin toward the mat, hips over knees — is fully accessible and delivers the same spinal elongation without bilateral hand weight-bearing.`,
      'cat-cow': `If bilateral hand support is not available, rest on the forearm or a yoga block on the ${ld.side} side. The spinal flexion and extension are the core movement — symmetric support is not required.`,
      'warrior-i': `Rest the available hand on the front thigh or extend it for balance. The pose is structurally complete with one arm. The standing strength, hip opening, and breath are unchanged.`,
      bridge: `Arms rest naturally alongside the body. The lift is driven entirely by the legs and glutes — arm engagement is not needed. Focus on pressing evenly through both feet.`,
      'childs-pose': `Let the available arm extend forward or rest alongside the body — whichever is more comfortable. The grounding and nervous system reset of the pose are fully available to you.`,
      sphinx: `The ${opp} forearm does the primary work; rest the ${ld.side} limb alongside the body or on a folded blanket for support. The chest-opening and spinal extension are fully available.`,
      'standing-forward-fold': `Let the available arm hang freely toward the floor. The forward fold is driven entirely by the hips — arm position does not affect the spinal or hamstring benefit.`,
      'happy-baby': `Reach the available hand toward the ${opp} foot or shin. For the ${ld.side} side, let the arm rest comfortably on the shin or thigh. The hip opening is available regardless of arm position.`,
      'supine-figure-four': `This pose involves no arm weight-bearing. Rest the available arm alongside the body or on the chest — whichever is comfortable.`,
      butterfly: `Reach your available hand toward your feet or rest it on your thigh. Your {side} arm rests alongside the body or on your thigh — there is no grip required. The hip opening is driven by the pelvis, not the arms.`,
      'seated-forward-fold': `Reach your available hand toward your {oppSide} foot or shin. Your {side} arm rests naturally alongside the leg. Fold from the hips — the single-arm reach does not change the depth or quality of the pose.`,
      'supine-twist': `Let the available arm extend as a T or rest alongside the body — whichever is comfortable. Your {side} arm rests across the torso or alongside the body in its natural position. The rotation is entirely spinal.`,
      'legs-up-wall': `Let both arms fall where comfortable alongside the body — there is no arm position required for this pose. Your {side} arm rests naturally at your side.`,
      savasana: `Rest both arms alongside the body in a position of complete ease. Your {side} arm rests where it is most comfortable — slightly bent, on the torso, or alongside the body.`,
      'mountain-pose': `Let the available arm hang naturally alongside the body with fingers soft. Your {side} arm rests alongside the body or in its natural resting position. The grounding of this pose is through the feet and the breath — the arms are simply at ease.`,
    }
  }

  return {
    'warrior-i': aboveKnee
      ? `Work near a wall or with a chair for balance support on the ${ld.side} side. The upper body and hip opening are the primary benefits — adapt your base to what feels stable for your prosthetic or residual limb. A shorter stance gives more control.`
      : `Shorten the stance to what feels stable. If using a below-knee prosthetic, check with your prosthetist about deep lunge weight distribution. Keep a wall or chair within reach to offload at any moment.`,
    'mountain-pose': `Stand near a wall with one hand available for support. Find your own centre of gravity — it will differ from a symmetric baseline, and that is the correct position for your body. Steady, even breathing is the whole practice here.`,
    pigeon: aboveKnee
      ? `Supine Figure-Four ({side} hip): lie on your back, rest your {side} limb over your {oppSide} thigh as comfortably as possible, and draw both legs gently toward your chest. Full hip opening, no balance required.`
      : `Supine Figure-Four ({side} hip): lie on your back, rest your {side} limb comfortably over your {oppSide} thigh, and draw both legs gently toward your chest. Full hip opening, no balance required.`,
    'supine-figure-four': aboveKnee
      ? `Lie on your back, {oppSide} knee bent, {oppSide} foot flat on the floor. Rest your {side} residual limb over your {oppSide} thigh in whatever position is accessible — there is no single correct placement. Place your hands behind your {oppSide} thigh and gently draw both legs toward your chest until you feel an opening in the {side} hip. Breathe steadily and hold.`
      : `Lie on your back, {oppSide} knee bent, {oppSide} foot flat on the floor. Rest your {side} limb across your {oppSide} shin or lower thigh — wherever it settles naturally is correct. Place your hands behind your {oppSide} thigh and gently draw both legs toward your chest until you feel the {side} hip begin to open. The position does the work — no foot flexion needed.`,
    butterfly: `Sit on a folded blanket. Your {side} limb can rest in whatever position is most comfortable — there is no symmetry requirement here. Let your {oppSide} knee fall open naturally. Fold forward gently from the hips, not the waist.`,
    'seated-forward-fold': `Extend both legs as is comfortable, with your {side} limb resting naturally. Fold forward over your {oppSide} leg or straight ahead, keeping the spine long. Reach toward your {oppSide} foot or shin. The stretch is in the back body — symmetry is not required.`,
    'childs-pose': aboveKnee
      ? `Fold forward over a bolster or stacked pillows from a comfortable seated position — the full grounding and nervous system reset of the pose is available without bilateral kneeling. Arms alongside the body or extended forward.`
      : `Add extra cushioning beneath the {side} knee before folding forward. If floor kneeling is uncomfortable, fold forward from a chair with arms hanging toward the floor.`,
    'cat-cow': `This sequence can be done seated in a chair: sit upright at the edge of the seat, hands on thighs. Inhale and arch the spine into cow, lifting the chest. Exhale and round into cat. The spinal mobility benefit is identical.`,
    'downward-dog': `Stand facing a wall and place both hands flat on it at chest height. Walk back until the torso is close to parallel with the floor. The spinal decompression and hamstring stretch are fully available at the wall.`,
    bridge: aboveKnee
      ? `Press through the available leg and through the residual limb or prosthetic as appropriate. Place a folded blanket under the ${ld.side} side for support if needed. The opposite leg does most of the driving.`
      : `Press through your {oppSide} foot and through your {side} limb or prosthetic as weight-bearing allows. Reduce the height of the lift if balance is a concern. Engage the core for stability.`,
    'happy-baby': `Lie on your back. Draw both knees toward your chest. Hold your {oppSide} foot or shin in the usual way. For your {side} limb, hold the shin or rest the limb wherever it is comfortable. Rock gently side to side or simply hold.`,
    sphinx: `Lie on your stomach with elbows directly under the shoulders, forearms flat on the mat. Press down through the forearms and lift the chest. Your {side} limb rests naturally alongside the {oppSide} leg — no leg engagement is needed. The entire pose is in the upper body and forearms.`,
    'standing-forward-fold': aboveKnee
      ? `Stand near a wall for support. Fold forward as far as is comfortable, with the wall available at any moment. Your centre of gravity in the forward fold will differ slightly — that is correct for your body.`
      : `Keep a wall or chair nearby for balance as the forward fold shifts your weight. Fold only as far as feels stable. The spinal release is the primary benefit.`,
    'legs-up-wall': aboveKnee
      ? `Lie near the wall and swing your {oppSide} leg up against it. Your {side} residual limb rests naturally — either alongside the other leg against the wall in whatever position is accessible, or draped over a bolster placed alongside the wall. Let the arms fall open and breathe.`
      : `Lie near the wall and swing both legs up. Your {side} limb rests against the wall naturally — your prosthetic or residual limb may not contact the wall as fully as the other side, and that is fine. A folded blanket alongside the wall supports the {side} leg if needed.`,
    'supine-twist': `Lying on your back, draw your {oppSide} knee toward the chest and guide it gently across the body. Your {side} limb rests naturally along the mat — there is no need to match the position of the {oppSide} leg. The twist is felt in the thoracic spine.`,
    savasana: `Lie completely flat. Your {side} limb rests in its natural position — prosthetic can remain on or be removed based on your comfort. Let both limbs be heavy and at ease. There is no correct position for the {side} side — simply allow it to rest.`,
  }
}

// Side-specific instructions for the *unaffected* side of "each side" poses
function getLimbOppositeInstructions(ld: LimbDifference): Record<string, string> {
  const isArm = ld.level === 'full-arm' || ld.level === 'partial-arm'
  const opp = ld.side === 'left' ? 'right' : 'left'

  if (isArm) {
    return {
      'warrior-i': `Step your ${opp} foot forward into a lunge. Ground the back heel at 45° and bend the front knee over the ankle. Raise your ${opp} arm overhead and let the ${ld.side} side rest naturally at whatever height is comfortable. Breathe and hold.`,
    }
  }

  return {
    'supine-figure-four': `Lie on your back with your ${ld.side} limb resting naturally on the mat. Cross your ${opp} ankle over your ${ld.side} thigh just above the knee. Flex your ${opp} foot firmly to protect the knee joint. Place your hands behind your ${ld.side} thigh and gently draw both legs toward your chest until you feel the ${opp} hip open. Hold and breathe.`,
    'supine-twist': `Lying on your back, draw your ${opp} knee toward the chest and guide it across toward the ${ld.side} floor. Your ${ld.side} limb rests naturally along the mat. Extend your arms in a T and let the gaze travel ${opp}.`,
    'warrior-i': `Step your ${opp} foot forward into a lunge. Bring the ${ld.side} limb back — positioning it at 45° or in whatever stance your prosthetic or residual limb allows comfortably. Bend the front knee over the ankle and raise both arms overhead. Soften the gaze forward or up.`,
  }
}

function getAccommodationNote(accommodations: Accommodations): string | undefined {
  if (!accommodations.areas.length) return undefined

  if (accommodations.limbDifference) {
    const { side, level } = accommodations.limbDifference
    const levelLabels: Record<LimbLevel, string> = {
      'full-arm': 'full arm',
      'partial-arm': 'arm (elbow to hand)',
      'full-leg': 'full leg',
      'above-knee': 'above-knee leg',
      'below-knee': 'below-knee leg',
    }
    return `Your practice has been adapted for your ${side} ${levelLabels[level]} difference. Every relevant pose in your sequence includes a specific modification. Where standing balance is involved, keeping a wall or chair nearby gives you full autonomy over depth and stability. Move at your pace — the breath and the intention are the practice.`
  }

  const areaLabels: Partial<Record<InjuryArea, string>> = {
    'lower-back': 'lower back',
    knee: 'knee',
    'ankle-foot': 'ankle and foot',
    'shoulder-arm': 'shoulder and arm',
    hip: 'hip',
    'wrist-hand': 'wrist and hand',
    neck: 'neck',
    'limb-difference': 'limb difference',
  }

  const labels = accommodations.areas.map((a) => areaLabels[a]).filter(Boolean)
  const plural = labels.length > 1
  return `Your practice has been adapted for your ${labels.join(' and ')}${plural ? ' areas' : ''}. Modified instructions appear with each relevant pose during your flow session. Work within a pain-free range — any modification is not a lesser version, it is the version that keeps you practising long-term.`
}

// ── Recommendation Engine ──────────────────────────────────────────────────

export function getRecommendations(answers: Answers, accommodations?: Accommodations): Results {
  const { intentions, activityLevel, preferredTime, dosha, skillLevel } = answers

  // Score poses
  const poseScores = new Map<string, number>()
  for (const intention of intentions) {
    INTENTION_POSE_MAP[intention].forEach((poseId, rank) => {
      poseScores.set(poseId, (poseScores.get(poseId) ?? 0) + (5 - Math.min(rank, 4)))
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

  // Skill level scoring
  if (skillLevel === 'beginner') {
    // Penalise technically demanding poses
    for (const id of ['pigeon', 'warrior-i']) {
      poseScores.set(id, (poseScores.get(id) ?? 0) - 2)
    }
    // Boost accessible poses
    for (const id of ['childs-pose', 'legs-up-wall', 'happy-baby', 'sphinx', 'supine-twist', 'mountain-pose', 'supine-figure-four']) {
      poseScores.set(id, (poseScores.get(id) ?? 0) + 2)
    }
  }

  // Apply accommodation score adjustments
  if (accommodations?.areas.length) {
    for (const area of accommodations.areas) {
      const penalties = POSE_SCORE_PENALTIES[area] ?? []
      for (const id of penalties) poseScores.set(id, (poseScores.get(id) ?? 0) - 4)
      const hardPenalties = POSE_HARD_PENALTIES[area] ?? []
      for (const id of hardPenalties) poseScores.set(id, (poseScores.get(id) ?? 0) - 8)
      const boosts = POSE_PRIORITIES_FOR_ACCOMMODATION[area] ?? []
      for (const id of boosts) poseScores.set(id, (poseScores.get(id) ?? 0) + 4)
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

  // Apply adaptations to selected poses
  const posesWithAdaptations: PoseWithAdaptation[] = topPoses.map((pose) => {
    if (!accommodations?.areas.length) return pose
    for (const area of accommodations.areas) {
      if (area === 'limb-difference' && accommodations.limbDifference) {
        const limbAdaptations = getLimbAdaptations(accommodations.limbDifference)
        if (limbAdaptations[pose.id]) {
          const { side } = accommodations.limbDifference
          const opp = side === 'left' ? 'right' : 'left'
          const resolve = (t: string) => t.replace(/\{side\}/g, side).replace(/\{oppSide\}/g, opp)
          const oppositeMap = getLimbOppositeInstructions(accommodations.limbDifference)
          return {
            ...pose,
            adaptation: resolve(limbAdaptations[pose.id]),
            adaptedSide: side,
            oppositeInstruction: oppositeMap[pose.id] ?? undefined,
          }
        }
      } else {
        const areaAdaptations = POSE_ADAPTATIONS[area]
        if (areaAdaptations?.[pose.id]) return { ...pose, adaptation: areaAdaptations[pose.id] }
      }
    }
    return pose
  })

  // Score breathing
  const breathScores = new Map<string, number>()
  for (const intention of intentions) {
    INTENTION_BREATH_MAP[intention].forEach((breathId, rank) => {
      breathScores.set(breathId, (breathScores.get(breathId) ?? 0) + (2 - rank))
    })
  }
  // Beginners: prefer belly breathing over advanced holds like 4-7-8
  if (skillLevel === 'beginner') {
    breathScores.set('belly-breathing', (breathScores.get('belly-breathing') ?? 0) + 2)
    breathScores.set('four-seven-eight', (breathScores.get('four-seven-eight') ?? 0) - 1)
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
    poses: posesWithAdaptations,
    breathingTechniques: topBreath,
    frequencyGuidance: FREQUENCY_GUIDANCE[activityLevel],
    timeGuidance: TIME_GUIDANCE[preferredTime],
    flowDurationMins,
    ayurvedicTips,
    accommodationNote: accommodations?.areas.length
      ? getAccommodationNote(accommodations)
      : undefined,
  }
}
