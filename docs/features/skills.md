---
description: Repeatable Claude Code workflows triggered by slash commands
---

# Skills

**Status:** Active
**Last Updated:** 2026-02-22

## Overview

Claude Code skills codify repeatable workflows so they can be invoked mid-conversation without breaking creative flow. Each skill lives in `.claude/skills/` and is triggered with a slash command.

Some skills are **repo-specific** -- they depend on this project's conventions (file paths, naming, aspect ratios, etc.) and would need adaptation for other repos. Others are **general-purpose** and work anywhere. Each skill below is labeled accordingly.

## Available Skills

### Design Experiment Pipeline

Skills that take an experiment from sketch to shipped, in order:

### `/sketch` <sub>repo-specific</sub>
Rapid visual prototyping -- paint with code. Two files (page.tsx + styles.css), plain CSS, no component libraries. Get a visual idea on screen fast and iterate.

- **Skill file:** `.claude/skills/sketch/skill.md`
- **Output:** `app/design-experiments/[name]/page.tsx` + `styles.css`

### `/design-experiment` <sub>repo-specific</sub>
Create a new design experiment in the sandbox. Scaffolds the route, page, and styles following project conventions.

- **Skill file:** `.claude/skills/design-experiment/skill.md`
- **Output:** `app/design-experiments/[name]/page.tsx` + `styles.css`

### `/design-audit` <sub>general-purpose</sub>
Audit a design experiment's CSS for color and type consistency. Extracts every color and font-size, flags near-duplicates, suggests unifications. Interactive -- select which fixes to apply.

- **Skill file:** `.claude/skills/design-audit/skill.md`
- **Workflow:** Extract -> categorize -> flag duplicates -> present fixes -> apply

### `/animation-audit` <sub>general-purpose</sub>
Audit a design experiment for entrance animations, stagger timing, and interaction feedback. Proposes spring presets for consistency, wires up click-to-replay.

- **Skill file:** `.claude/skills/animation-audit/skill.md`
- **Workflow:** Map layout -> identify motion candidates -> propose presets -> implement

### `/ts-handoff` <sub>general-purpose</sub>
Light TypeScript cleanup to make components handoff-ready. Catches real bugs and hygiene issues without over-engineering. The final pass before shipping.

- **Skill file:** `.claude/skills/ts-handoff/skill.md`
- **Workflow:** Scan -> categorize by impact -> fix bugs and hygiene issues

### `/promote` <sub>repo-specific</sub>
Make a design experiment importable. Runs the full quality pipeline, extracts components, designs a public API, and creates a barrel export (`index.ts`).

- **Skill file:** `.claude/skills/promote/skill.md`
- **Output:** Barrel export in experiment directory

### `/ship-experiment` <sub>repo-specific</sub>
Ship a design experiment: automated screenshot, gallery update, README update, commit, and push.

- **Skill file:** `.claude/skills/ship-experiment/skill.md`
- **Requires:** agent-browser skill, dev server running

### Content

### `/blog-post` <sub>repo-specific</sub>
Draft a blog post from conversation context. Creates markdown with a placeholder image so it's immediately visible on the homepage and blog index.

- **Skill file:** `.claude/skills/blog-post/SKILL.md`
- **Output:** `blog/{slug}.md` + `public/blog/{slug}.svg` (placeholder)

### `/replace` <sub>repo-specific</sub>
Replace a blog post's hero image using natural language. Accepts a blog title (fuzzy matched) and a source image, crops to the standard 1.87:1 hero aspect ratio, overwrites the existing hero, and cleans up the source file.

- **Skill file:** `.claude/skills/replace/SKILL.md`
- **Usage:** `/replace The Memoirs of an Agent with @public/new-image.jpg`
- **Also works:** `/replace its happening with public/some-photo.jpg` -- the `@` reference and "with" keyword are optional
- **Crop behavior:** Top-crop when reducing height, center-crop when reducing width
- **No confirmation** -- crops and replaces immediately

### `/recommend` <sub>repo-specific</sub>
Add a link to the Recommended page. Pass a URL and a comment -- the skill detects the source type (YouTube, GitHub, web), creates a dated markdown file, takes screenshots for web links via agent-browser, and runs a production build to trigger thumbnail downloads.

- **Skill file:** `.claude/skills/recommend/SKILL.md`
- **Output:** `app/(blog)/recommended/items/YYYY-MM-DD-slug.md` + optional screenshot
- **Usage:** `/recommend https://example.com Great tool for voice dictation`
- **No confirmation** -- creates the file and builds immediately

### `/note` <sub>repo-specific</sub>
Quick-fire a sticky note from the command line. Everything after `/note` becomes a new markdown file with auto-derived filename and rotating color.

- **Skill file:** `.claude/skills/note/skill.md`
- **Output:** `app/(blog)/notes/YYYY-MM-DD-slug.md`
- **No confirmation** -- captures the thought instantly

### Utilities

### `/sanity-check` <sub>general-purpose</sub>
Quick React/TypeScript/Next.js code review from a senior engineer perspective. Scans the codebase for issues, presents interactive selection, implements selected fixes.

- **Skill file:** `.claude/skills/sanity-check/SKILL.md`
- **Workflow:** Scan -> categorize by impact -> present multi-select -> implement picks

### `/supabase` <sub>general-purpose</sub>
Supabase CLI wrapper for database operations: schema migrations with validation, TypeScript type generation, edge function deployment, and postgres best practices.

- **Skill file:** `.claude/skills/supabase/skill.md`

### `/bitmap-to-vector` <sub>general-purpose</sub>
Convert raster images (PNG, JPG, etc.) to clean, icon-ready SVG vectors using potrace. Auto-detects threshold and polarity, strips bounding rectangles, outputs `fill="currentColor"` SVGs ready for inline use or CSS masks.

- **Skill file:** `.claude/skills/bitmap-to-vector/skill.md`
- **Script:** `.claude/skills/bitmap-to-vector/scripts/trace.py`
- **Output:** Single-path SVG with `fill="currentColor"` and `fill-rule="evenodd"`

## Key Patterns

- Skills are invoked via `/skill-name` -- natural language won't trigger them
- Each skill is self-contained in its own directory under `.claude/skills/`
- Skills reference project conventions (file locations, front matter format) but avoid framework-specific magic
- The design pipeline flows naturally: `/sketch` -> `/design-audit` -> `/animation-audit` -> `/ts-handoff` -> `/promote` -> `/ship-experiment`

## Related Files

- `.claude/skills/` - All skill definitions
- `CLAUDE.md` - Project conventions referenced by skills
- `README.md` - Public-facing skill documentation
