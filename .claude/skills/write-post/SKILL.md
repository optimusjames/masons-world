# write-post

Write and publish a blog post from conversation context. Handles front matter, reading time, file placement, and build verification.

## Usage

```
/write-post                          # Interactive -- asks what to write about
/write-post "Why Static Sites Win"   # Title provided, writes from conversation context
```

## Workflow

### 1. Gather Inputs

- **Title** (required) -- from argument or ask the user
- **Subtitle** (optional) -- ask if not obvious from context
- **Slug** -- derive from title: lowercase, hyphens, no special chars (e.g. "Why Static Sites Win" -> `why-static-sites-win`). User can override.

### 2. Write the Post

Write markdown content based on conversation context or the provided topic. Match the voice and editorial style of existing posts in `blog/`. Posts should read like essays, not documentation.

### 3. Calculate Reading Time

```
words = count all words in markdown body (exclude front matter)
readingTime = ceil(words / 238)
format as "{readingTime} min"
```

### 4. Generate Front Matter

```yaml
---
title: "Post Title"
subtitle: "Optional subtitle"
date: YYYY-MM-DD  # today's date
readingTime: X min
---
```

All four fields required. Date is always today.

### 5. Write File

Save to `blog/{slug}.md` in the sandbox root.

### 6. Handle Image

Ask: "Do you have a hero image for this post?"

- **If user pastes an image**: Copy the temp file to `public/blog/{slug}.{ext}` (preserve original extension -- png, jpg, webp). The blog system auto-detects images matching the slug.
- **If no image**: No action needed. Blog shows a gray placeholder on the card.

### 7. Production Build

```bash
npm run build
```

Fix any errors before reporting success.

### 8. Report

Confirm:
- Post written to `blog/{slug}.md`
- Reading time: X min
- Viewable at `/blog/{slug}`
- Build passed
- If no image: remind that adding `public/blog/{slug}.png` will appear as the hero image

## Content Format

```markdown
---
title: "Post Title"
subtitle: "A subtitle that adds context"
date: 2026-02-12
readingTime: 4 min
---

Opening paragraph that hooks the reader.

## Section Heading

Body content. Use markdown naturally -- code blocks, blockquotes, lists, emphasis.

## Another Section

More content.
```

## Key Decisions

- **Does NOT auto-commit** -- writing is creative, review before committing
- **Does run build** -- catches errors immediately
- **Derives slug from title** -- less friction, can override
- **Auto-calculates reading time** -- 238 wpm, rounded up
- **No image required** -- blog system handles missing images gracefully

## File Locations

- Posts: `blog/{slug}.md`
- Images: `public/blog/{slug}.{ext}` (auto-detected by blog system)
- Blog index: `/blog`
- Individual post: `/blog/{slug}`
