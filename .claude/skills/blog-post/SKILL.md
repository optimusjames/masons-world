# blog-post

Draft a blog post from conversation context. Creates the markdown file with a placeholder image so it's immediately visible on the homepage and blog index.

## Usage

```
/blog-post                              # Interactive -- asks what to write about
/blog-post "Design as Dialogue"         # Title provided, drafts from conversation context
```

## Workflow

### 1. Gather Inputs

- **Title** (required) -- from argument or ask the user
- **Subtitle** (optional) -- ask if not obvious from context
- **Slug** -- derive from title: lowercase, hyphens, no special chars

### 2. Research

Before writing, gather context:
- Read existing posts in `blog/` to match voice and editorial style
- Check conversation history and any relevant Wispr Flow transcripts
- Check auto memory for notes on the topic

### 3. Draft the Post

Write in the style of the existing posts in `blog/`, especially `just-say-what-you-want.md` -- that's the benchmark. The writing philosophy:

- **Short paragraphs.** 2-4 sentences max. White space is structure.
- **Concrete over abstract.** "200 pixels to 100 pixels" not "iterative refinement." Specific details from real work, not theory.
- **One thesis.** Every post makes one point. Say it early, support it with examples, end when the point is made.
- **Conversational but declarative.** Write like you talk, but land on strong statements. No hedging, no "in conclusion."
- **No preamble.** Start with the meat. Open with a concrete observation, not a setup.
- **End sharp.** The last line should hit. One sentence. Sometimes one word.
- **200-400 words is the sweet spot.** If it's longer, you're probably making two points. Split it.
- **Essays, not documentation.** No headers unless the post genuinely needs sections. Most don't.

### 4. Calculate Reading Time

```
words = count all words in markdown body (exclude front matter)
readingTime = ceil(words / 238)
format as "{readingTime} min"
```

### 5. Generate Front Matter

```yaml
---
title: "Post Title"
subtitle: "Optional subtitle"
date: YYYY-MM-DD  # today's date
author: Josh Coolman
readingTime: X min
---
```

### 6. Write File

Save to `blog/{slug}.md` in the sandbox root.

### 7. Create Placeholder Image

Copy the master placeholder to `public/blog/{slug}.png`:

```bash
cp public/blog/placeholder.png public/blog/{slug}.png
```

This is a real 1200x630 dark gray PNG. It shows up correctly in blog cards and on the homepage. To replace it, the user just saves a real image to the same path -- same name, same extension. Everything just works.

### 8. Production Build

```bash
npm run build
```

Fix any errors before reporting success.

### 9. Report

Confirm:
- Post drafted at `blog/{slug}.md`
- Placeholder image at `public/blog/{slug}.png`
- Reading time: X min
- Viewable at `/blog/{slug}`
- Appears on homepage Blog column and blog index
- Build passed
- Remind: replace placeholder with real image at `public/blog/{slug}.{png,jpg,webp}`

## Key Decisions

- **This is a draft** -- the post will be iterated on after creation
- **Does NOT auto-commit** -- review before committing
- **Does run build** -- catches errors immediately
- **Always creates placeholder image** -- so cards render properly from the start
- **Reads conversation context** -- the best posts come from real conversations

## File Locations

- Posts: `blog/{slug}.md`
- Master placeholder: `public/blog/placeholder.png` (1200x630 dark gray PNG)
- Post images: `public/blog/{slug}.png` (placeholder initially, save over with real image)
- Blog index: `/blog`
- Individual post: `/blog/{slug}`
