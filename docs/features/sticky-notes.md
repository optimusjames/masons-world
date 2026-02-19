---
description: Sticky note stack -- a design experiment used by the blog for short thoughts
---

## Overview

A "note to self" sticky note stack. Short thoughts (1-2 paragraphs) rendered as post-it notes. Click to expand, click a note to cycle through, backdrop or Escape to close. Lives as a design experiment with its own showcase page; the blog imports it as a consumer.

## Content Model

Markdown files in any directory, one per thought. The consumer passes the path to `getAllNotes()`. Minimal frontmatter:

```yaml
---
date: 2026-02-18
color: warm  # optional: warm (default) | cool | neutral
---
Note content here. No title -- stickies don't have titles.
```

gray-matter auto-parses YAML dates into Date objects. `loadNotes.ts` converts them back to ISO date strings (`YYYY-MM-DD`) to avoid serialization issues.

## Key Components

- `app/design-experiments/sticky-notes/types.ts` -- `StickyNote` interface (id, date, color, content)
- `app/design-experiments/sticky-notes/loadNotes.ts` -- `getAllNotes(notesDir)`, accepts path to notes directory
- `app/design-experiments/sticky-notes/components/StickyNoteStack.tsx` -- client component, all interaction logic
- `app/design-experiments/sticky-notes/components/stickyNotes.module.css` -- all styling including animations
- `app/design-experiments/sticky-notes/index.ts` -- barrel export
- `app/design-experiments/sticky-notes/page.tsx` -- experiment showcase page
- `app/design-experiments/sticky-notes/data/` -- demo notes for the showcase

## Architecture

**Component location**: Design experiment at `app/design-experiments/sticky-notes/`. Blog imports via barrel export. The loader accepts a `notesDir` parameter so any consumer can point to their own content.

```tsx
// app/(blog)/blog/page.tsx
import { getAllNotes, StickyNoteStack } from '@/app/design-experiments/sticky-notes'

const notes = getAllNotes(path.join(process.cwd(), 'app/(blog)/notes'))
```

**Blog notes**: `app/(blog)/notes/*.md` -- content that belongs to the blog, not to the component.

**Demo notes**: `app/design-experiments/sticky-notes/data/*.md` -- sample notes for the experiment showcase, one per color variant.

**Stack (collapsed)**: 180x140px cards, offset 3px right + 3px down per card, slight rotation. Top card shows teaser text (3 lines clipped). Hover lifts top card.

**Expanded (modal)**: Two notes rendered stacked -- active on top (`z-index: 2`), next underneath (`z-index: 1`, offset 4px). Clicking the note triggers `swipeOff` animation on the top card, then `onAnimationEnd` advances the index revealing the card beneath. Cycles continuously. Backdrop click or Escape closes. Zero chrome -- no X, no arrows, no counter.

**State**: `isExpanded`, `activeIndex`, `swiping` (locks during animation).

## Visual Design

**Font**: `Permanent Marker` (Google Fonts) -- consumer must provide `--font-marker` CSS variable. The experiment page loads it directly; the blog loads it via `app/(blog)/layout.tsx`. Do NOT use `@import url()` in CSS modules -- Turbopack strips them.

**Post-it palette**:

| Variant  | Background | Text               | Border    |
|----------|-----------|--------------------| ----------|
| warm     | `#f5e960` | `rgba(0,0,0,0.7)`  | `#e0d44e` |
| cool     | `#a8d8ea` | `rgba(0,0,0,0.65)` | `#94c4d6` |
| neutral  | `#f5c6d0` | `rgba(0,0,0,0.65)` | `#e0b2bc` |

**Animations**: CSS only, no framer-motion. Spring-like cubic-bezier `(0.34, 1.56, 0.64, 1)` for entrance. `swipeOff` slides top card left and up with fade.

## Known Issue (TODO)

**Text flashes on swipe**: When cycling notes, the active note's text visibly switches to the next note's content before the swipe-off animation completes. The index update (which changes rendered content) fires slightly before the card has fully left the viewport. Fix: either delay the state update until the card is fully offscreen, or render the outgoing card with its own frozen content separate from `activeIndex` state (e.g., keep an `outgoingIndex` ref that holds the previous value during the swipe animation).

## Related Files

- `app/design-experiments/sticky-notes/` -- component, loader, types, showcase page
- `app/(blog)/layout.tsx` -- loads Permanent Marker font via `next/font/google`
- `app/(blog)/blog/page.tsx` -- imports component, passes `app/(blog)/notes` as content source
- `app/(blog)/notes/*.md` -- blog's note content
