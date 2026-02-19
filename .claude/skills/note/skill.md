# note

Quick-fire a sticky note from the command line.

## Usage

```
/note I wouldn't poo poo vibe coding too much
/note This is a random thought I had at 2am
```

## What It Does

1. Takes everything after `/note` as the note content
2. Creates a new markdown file in `app/(blog)/notes/` with today's date and a slug derived from the first few words
3. Picks a color: cycles through `warm`, `cool`, `neutral` based on how many notes already exist (so they vary automatically)

## File Format

```markdown
---
date: YYYY-MM-DDTHH:MM:SS
color: warm|cool|neutral
---
The note content exactly as typed.
```

Use a full ISO timestamp (date + time, no timezone) so notes sort by creation order within the same day. Use the current time when the `/note` command is run.

## Filename Convention

`YYYY-MM-DD-slug.md` where slug is the first 3-5 words, lowercased, hyphenated, stripped of punctuation. If a file with that name already exists, append `-2`, `-3`, etc.

## Rules

- No editing the content -- write it exactly as the user said it
- No confirmation needed -- just create and report back
- Keep it fast -- this is for capturing thoughts in the moment
