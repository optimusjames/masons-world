---
description: Repeatable Claude Code workflows triggered by slash commands
---

# Skills

**Status:** Active
**Last Updated:** 2026-02-12

## Overview

Claude Code skills codify repeatable workflows so they can be invoked mid-conversation without breaking creative flow. Each skill lives in `.claude/skills/` and is triggered with a slash command.

## Available Skills

### `/write-post`
Write and publish a blog post from conversation context. Handles front matter, slug derivation, reading time calculation (238 wpm), file placement, image handling, and build verification.

- **Skill file:** `.claude/skills/write-post/SKILL.md`
- **Output:** `blog/{slug}.md` with YAML front matter
- **Image convention:** `public/blog/{slug}.{ext}` (auto-detected)

### `/sanity-check`
Quick code review from a senior engineer perspective. Scans the codebase for React/TS/Next.js issues, presents interactive selection of improvements, implements selected fixes.

- **Skill file:** `.claude/skills/sanity-check/SKILL.md`
- **Workflow:** Scan -> categorize by impact -> present multi-select -> implement picks

### `/ship-experiment`
Ship a design experiment with automated screenshot, gallery update, homepage update, README update, commit, and push.

- **Skill file:** `.claude/skills/ship-experiment/skill.md`
- **Requires:** agent-browser skill, dev server running

### `/note`
Quick-fire a sticky note from the command line. Everything after `/note` becomes a new markdown file in `app/(blog)/notes/` with auto-derived filename and rotating color.

- **Skill file:** `.claude/skills/note/skill.md`
- **Output:** `app/(blog)/notes/YYYY-MM-DD-slug.md`
- **No confirmation** -- captures the thought instantly

## Key Patterns

- Skills are invoked via `/skill-name` -- natural language won't trigger them
- Each skill is self-contained in its own directory under `.claude/skills/`
- Skills reference project conventions (file locations, front matter format) but avoid framework-specific magic
- `/write-post` and `/ship-experiment` don't auto-commit -- creative work gets reviewed first
- `/sanity-check` is interactive -- presents findings for user selection before making changes

## Related Files

- `.claude/skills/write-post/SKILL.md` - Blog authoring workflow
- `.claude/skills/sanity-check/SKILL.md` - Code review workflow
- `.claude/skills/ship-experiment/skill.md` - Experiment shipping workflow
- `.claude/skills/note/skill.md` - Quick sticky note capture
