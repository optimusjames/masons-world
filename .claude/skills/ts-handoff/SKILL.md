---
name: ts-handoff
description: Light TypeScript cleanup pass to make components handoff-ready. Catches real bugs and hygiene issues without over-engineering.
---

# TypeScript Handoff

A light-touch code review focused on making components clean enough to hand off to another engineer. Not a strict audit -- just catch the stuff that would make someone stumble.

## Usage

```
/ts-handoff                              # reviews the current experiment
/ts-handoff crossfit-bento               # reviews a specific experiment
```

## What It Does

1. **Read** all components, page, hooks, and types
2. **Identify** real bugs and hygiene issues
3. **Present** findings ranked by severity
4. **Fix** approved items
5. **Verify** build passes

## Step 1: Identify Target Files

- If no argument: use the most recently modified experiment under `app/design-experiments/`
- If argument is an experiment name: look in `app/design-experiments/[name]/`
- Collect page.tsx, all component files, hooks, and utility files

## Step 2: Review Checklist

Work through each category. Only flag things that would actually cause problems or confusion for the next engineer.

### Props API Clarity

- Does the component do what its props suggest? (e.g., accepts `children` but ignores them)
- Are `string | number` union types handled correctly in all code paths?
- Do optional props have sensible defaults?
- Are prop names clear about what they expect?

### Parser / Transform Safety

- String-to-number parsing: does it handle all values actually passed to it?
- Watch for time formats ("11:15"), percentages ("14%"), signed values ("+470"), commas ("2,340")
- Does parsing fail gracefully (return original value) or break visibly?
- NaN / Infinity guards on numeric operations

### State and Refs

- useRef values that reset on remount when they shouldn't
- State that could derive from props but is duplicated
- Callbacks that capture stale closures
- Key-based remount patterns: does derived state survive correctly?

### Client / Server Boundaries

- Components using hooks, event handlers, or browser APIs need `'use client'`
- Components that only render JSX from props do NOT need it
- Implicit client boundaries (imported by a client component) should be made explicit

### Animation-Specific (if motion/framer-motion is present)

- Do animation initial states match the visual expectation? (e.g., opacity:0 means flash of nothing on remount)
- Are spring parameters reasonable? (damping < 5 = too bouncy, stiffness > 500 = too snappy)
- Do counters/tweens guard against non-finite targets?

### What NOT to Flag

- Missing prop validation for misuse that can't happen with current data
- Suggesting new abstractions or utilities
- Style/formatting preferences
- Adding generics or complex type gymnastics
- Defensive checks for empty arrays, null, etc. when the data is static
- Performance optimizations (memo, useMemo) unless there's a real render loop

## Step 3: Present Findings

Rank findings into two tiers:

### Bugs (should fix)
Things that produce wrong output, break on edge cases that exist in the current usage, or would confuse another engineer reading the code.

### Hygiene (quick wins)
Things that are technically fine but fragile, implicit, or unconventional. Easy to fix, prevents future stumbling.

For each finding, include:
- File and line number
- What's wrong in one sentence
- What the fix is in one sentence

Present via AskUserQuestion so the user can approve which items to fix.

## Step 4: CSS Modules Conversion

If the experiment uses a single global `styles.css` with extracted components, suggest converting to CSS Modules for portability. This makes each component self-contained -- grab the `.tsx` + `.module.css` and it works anywhere.

### How to split:
- Each component gets its own `ComponentName.module.css` with only the styles it references
- Page-level layout styles (grid, card wrappers, typography) go in `page.module.css`
- Font imports (`@import url(...)`, `@font-face`) stay in the page module
- Use camelCase for multi-word class names (`cardGoal` not `card-goal`)
- Components import their module: `import css from './Component.module.css'`
- Page imports its module: `import s from './page.module.css'`

### API cleanup during conversion:
- If a component receives CSS class names as props (e.g., `className: 'bar-dark'`), replace with semantic props like `color: string` so the component doesn't depend on external stylesheets
- Components that accept a `className` prop for wrapper styling (like SegmentedBar) -- that's fine, keep it

### When NOT to convert:
- Single-file experiments that haven't been extracted into components yet
- Experiments the user considers "just poking around" -- only convert polished work
- Ask first if unsure

## Step 5: Implement Fixes

For each approved fix:
- Make the minimal change needed
- Don't restructure surrounding code
- Don't add types, comments, or abstractions beyond the fix itself

## Step 6: Verify

1. `npm run build` -- must pass clean
2. List what was changed
3. Do NOT commit -- user will review first

## Guidelines

- This is a handoff pass, not a refactor. Change as little as possible.
- If a component works correctly with its current usage, it's probably fine.
- Prefer fixing the component over adding validation. If a parser can't handle a value, make it skip gracefully rather than adding input validation.
- Real bugs > hygiene > style. If you find more than 8 items, you're being too strict.
- The goal: another engineer opens this code and nothing surprises them.
