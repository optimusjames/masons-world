---
name: animation-audit
description: Audit a design experiment for entrance animations, stagger timing, and interaction feedback. Suggest and implement motion.
---

# Animation Audit

Analyze a page's components and layout to identify animation opportunities, audit existing motion for consistency, and implement a cohesive animation layer. Uses Framer Motion (`motion/react`).

## Usage

```
/animation-audit                              # audits the current experiment
/animation-audit crossfit-bento               # audits a specific experiment
```

## What It Does

1. **Read** the page, components, and CSS to understand the layout
2. **Inventory** existing animations and identify components without motion
3. **Analyze** timing consistency and suggest a motion system
4. **Present** findings + suggested animation plan
5. **Implement** approved changes
6. **Verify** build passes

## Step 1: Identify Target Files

- If no argument: use the most recently modified experiment under `app/design-experiments/`
- If argument is an experiment name: look in `app/design-experiments/[name]/`
- Collect page.tsx, all component files, and CSS

## Step 2: Understand the Layout

Before proposing animations, map the spatial layout:

- **Grid structure**: columns, rows, how components flow
- **Component types**: charts, numbers, lists, tiles, rings, bars
- **Visual hierarchy**: which cards are hero/primary vs supporting

This determines stagger order and animation intensity.

## Step 3: Inventory Existing Motion

Check for:
- Framer Motion imports and usage
- CSS transitions/animations
- Inline transition properties
- Any existing stagger patterns

Build a table:

```
MOTION INVENTORY
Component          Has Animation?   Type
ProgressRing       yes             SVG stroke draw + counter
StatDisplay        no              —
StackedBarChart    no              —
Heatmap            no              —
...
```

## Step 4: Analyze and Propose

### Animation Patterns to Consider

Match animation type to component type:

| Component Type | Animation Pattern |
|---|---|
| SVG rings/arcs | Stroke draws from 0 to target (spring) |
| Numbers/stats | Count up from 0 (eased tween, ~700-800ms) |
| Bar charts | Bars grow from 0 height, staggered per column |
| Heatmaps/grids | Diagonal wave — delay by `(row + col) * interval` |
| Donut/pie charts | Segments draw sequentially via strokeDasharray |
| Segmented bars | Flex grows from 0, left-to-right stagger |
| Metric tiles | Scale spring (0.85→1) + opacity |
| List rows | Slide from left, staggered per row |
| Badges/icons | Pop with overshoot spring after parent lands |
| Labels/meta text | Fade + slight slideUp |

### Card Entrance

Every card should be wrapped in an AnimatedCard-style component that provides:
- **Initial load**: `opacity: 0, y: ~12-14` → `opacity: 1, y: 0` with spring physics
- **Stagger**: delays based on grid position, not DOM order
- **Click-to-replay**: remount children via key increment, but use a subtle scale pulse (not full fade-out) so the card stays visible

### Stagger Strategy

Use spatial position for delay calculation:
- **Diagonal sweep**: `(row + col) * interval` — top-left to bottom-right
- **Row-first**: `(row * cols + col) * interval` — strict reading order
- Recommend diagonal sweep as default (feels more organic)
- Interval of 100-120ms between diagonal steps is perceptible but not slow
- Total cascade should complete in under 1 second

### Spring Consistency

Flag inconsistent spring parameters. Suggest a small set:

```
SPRING PRESETS
Name       Damping  Stiffness  Use Case
snappy     20       200        Card entrances, slides
gentle     20       60         SVG draws, arc animations
bouncy     12       300        Pops, badges, cell scales
stiff      18       120        Bar growth, flex expansion
```

Not every value needs to match exactly, but wild variance (e.g., damping ranging from 5 to 40 across components) should be flagged.

### Counter Timing

Number counters should:
- Duration: 600-800ms
- Easing: cubic ease-out (fast start, gentle land)
- Delay: start after card entrance completes (not simultaneously)

## Step 5: Present Findings

Format as a motion plan grouped by change type:

### Components Needing Animation

```
1. ProgressRing — add stroke draw + number counter
2. StatDisplay — add number counter + label fade
3. StackedBarChart — add bar growth stagger
4. Heatmap — add diagonal wave
...
```

### Card Entrance System

```
- Install motion (if not present)
- Create AnimatedCard wrapper with spring entrance + click-to-replay
- Wrap each grid card with stagger delays:
  (0,0)=0s  (0,1)=0.12s  (0,2)=0.24s
  (1,0)=0.12s  (1,1)=0.24s  (1,2)=0.36s
  ...
```

### Consistency Fixes (if auditing existing animations)

```
- Normalize spring damping: ProgressRing uses 25, StackedBarChart uses 14 → suggest 20
- Counter durations vary from 500ms to 1200ms → suggest 700ms
```

Present via AskUserQuestion with multiSelect so user can approve/reject each group.

## Step 6: Implement

For each approved change:

### If adding motion from scratch:
1. Install `motion` if not in package.json
2. Create shared utilities: `AnimatedCard.tsx`, `useCountUp.ts`
3. Update each component to add its specific animation
4. Update page.tsx to wrap cards in AnimatedCard with stagger delays

### If auditing existing animations:
1. Normalize spring parameters to the agreed presets
2. Fix stagger timing to use spatial positioning
3. Add missing animations to un-animated components
4. Ensure click-to-replay uses scale pulse (not fade-out)

### Implementation notes:
- Add `'use client'` directive to any component that gains motion
- Internal animations (stroke draws, counters, bar growth) live inside each component
- Card entrance animation lives in the wrapper
- Use `e.stopPropagation()` on interactive elements (buttons, tabs) inside animated cards so clicks don't trigger replay
- Numbers that include formatting (commas, units, prefixes like +/-) need parsing before counting

## Step 7: Verify

1. `npm run build` — must pass clean
2. Report what was added/changed
3. Do NOT commit — user will review visually first

## Guidelines

- This is a motion pass, not a redesign. Don't change colors, typography, or layout.
- Animations should feel organic, not mechanical. Springs over linear tweens.
- Less is more: a card that just fades in is fine. Not everything needs a complex multi-stage animation.
- The heatmap/grid diagonal wave is the showpiece animation — give it attention.
- Click-to-replay should feel playful, not disorienting. The card must never fully disappear.
- Keep total page entrance under 1 second. Individual component animations can extend beyond that (counters, draws) but the grid should feel settled quickly.
- Respect the existing component API — add animation without changing props or behavior.
