# Yoga Guide — Roadmap & Future Vision

A living doc for where this goes after the prototype. Not public-facing.

---

## What the prototype does (v0)

Five-step questionnaire → static scoring engine → personalized prescription (poses, breathwork, Ayurvedic guidance, rhythm). Includes in-app breathing and flow practice screens. Fully static, no auth, no persistence.

---

## Product vision

A lightweight, personal yoga guidance platform built around James as a real teacher — not a generic app. The static engine is the free hook; the ongoing relationship (tracking, sessions, community) is the subscription.

---

## Free tier (always)

- Full questionnaire + prescription (poses, breathwork, Ayurveda, rhythm guidance)
- In-app breathing and flow practice
- Deep-dive rhythm and Ayurveda screens
- One-time, stateless — no account required

The first result should always be free. This is the trust moment.

---

## Subscription tiers (rough)

### Basic — ~$9/mo
- Save your profile (dosha, intentions, activity level, preferred time)
- Update it over time as your practice evolves
- Practice log — track what you did, when, for how long
- Practice streak + consistency stats
- Monthly prescription refresh based on updated profile

### Pro — ~$19/mo
- Everything in Basic
- One 1:1 virtual session with James per month (included)
- Deeper pose library with video cues
- Seasonal/Ayurvedic calendar — prescription shifts with the time of year
- Priority response on questions

### Sessions à la carte
- Additional 1:1 virtual sessions bookable outside subscription
- Group sessions / workshops (could be lower price point, higher volume)

---

## Feature backlog

### Near-term (would meaningfully improve the prototype)
- More intentions + finer-grained scoring (e.g. injury-aware modifications)
- Pose instruction video thumbnails or illustrated cues in flow view
- Ability to swap out a pose you don't like and get an alternative
- Duration preference for the flow (10 / 20 / 30 min) that adjusts pose count and hold times
- "Practice again" shortcut that re-enters flow without re-taking the questionnaire

### Auth + persistence layer
- Auth via Clerk or similar (low friction, magic link / Google)
- Profile stored in Supabase (dosha, intentions, activityLevel, preferredTime)
- Practice log table — date, poses completed, breathing technique, duration
- Supabase already in the stack, so this is a natural extension

### Deeper personalization
- Monthly re-check: "How has your practice felt this month?" → minor prescription adjustments
- Time-of-day awareness (morning vs evening prescription differs automatically)
- Seasonal Ayurvedic shifts (Vata season in autumn/winter, Pitta in summer, etc.)
- Injury or limitation flags (bad knees, tight hips) → pose modifications surfaced automatically

### Teacher presence
- James intro video on the welcome screen
- Short audio cues during flow (James's voice guiding each pose)
- "Ask James" async Q&A for subscribers
- Live group sessions via embedded video (Zoom or similar)

---

## Go-to-market ideas

- **Business card + QR code** — hand to people at studios, gyms, retreats, wellness events
- **Pinboards** — local community boards near yoga studios, coffee shops, health food stores
- **LinkedIn** — behind-the-scenes of building it + demo of the product
- **YouTube** — demo walkthrough, "what's your dosha?" explainer, AI-assisted building process
- **Instagram** — short-form clips of the flow view in action, Ayurvedic tips pulled from the content

The real differentiator is James as a real teacher who people trust before they ever pay. Content builds that trust.

---

## Tech milestones (production build)

### Milestone 1 — Standalone route
- Move from `/design-experiments/yoga-guide` to `/guide` (or `/yoga`)
- Own layout, own nav, own OG image
- Still fully static — no auth yet

### Milestone 2 — Auth + profile (Supabase)
- Supabase Auth (email magic link or Google OAuth — low friction, no password)
- `profiles` table: `user_id`, `dosha`, `intentions[]`, `activity_level`, `preferred_time`, `created_at`, `updated_at`
- `practice_logs` table: `user_id`, `date`, `poses_completed[]`, `breathing_technique`, `duration_mins`
- On login: load saved profile → skip questionnaire or offer "retake"
- Practice log UI: simple list of past sessions with streak counter
- Supabase is already in the stack — use `@supabase/ssr` for Next.js App Router

### Milestone 3 — Payments (Stripe)
- Stripe subscriptions: Basic and Pro tiers
- Lemon Squeezy as simpler alternative if going solo operator
- Paywall enforced server-side via Supabase `subscriptions` table + Stripe webhook sync
- Free tier: questionnaire + prescription always accessible, no auth required

### Milestone 4 — Session booking
- Cal.com embed for 1:1 virtual sessions with James
- Stripe-integrated so Pro subscribers have one session/month auto-applied
- À la carte booking for non-subscribers at a fixed rate

### Milestone 5 — AI-assisted refinement (optional, Pro tier)
- Keep static engine as the base
- Add Claude API call on Pro tier: pass prescription + recent practice log → suggest adjustments
- Could also power a "how has your practice been?" monthly check-in

---

## Notes

- Don't over-engineer the free tier. It should feel complete, not crippled.
- The subscription hook isn't features — it's memory and relationship. "It knows me" is the pitch.
- Virtual sessions are the highest-margin offering and the hardest to scale. Start with them being genuinely limited and personal.
