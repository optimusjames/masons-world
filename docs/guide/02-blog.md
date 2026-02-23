---
description: The editorial space, its typography, and how posts get made
---

# Blog

The blog is where longer thinking lives. Posts are markdown files with frontmatter, rendered through a layout that pairs warm serif typography with a print-editorial aesthetic. It's designed to feel like reading a small press magazine, not scrolling a feed.

## Writing a Post

The fastest path is `/blog-post` -- it drafts from conversation context, reads existing posts to match the voice, and creates the markdown with frontmatter and a placeholder hero image. Posts land in `blog/` and aren't auto-committed, so there's room to edit before publishing.

Posts support a few frontmatter options:

```yaml
---
title: "Your Basic Blog"
subtitle: "What makes a good reading experience on the web"
date: 2026-02-14
image: /blog/your-basic-blog.png
overlay: true
tags: [design, typography]
---
```

Setting `overlay: true` gives the post a full-bleed hero image with a gradient fade and the title rendered over the bottom of the image -- a cinematic treatment that works well for visual topics.

## Typography

The blog pairs four typefaces, each with a clear job:

| Font | Where | Size |
|------|-------|------|
| Bitter 700 | Page titles, card titles | `clamp(36px, 6vw, 56px)` |
| Lora 400 | Body prose, subtitles | 17px, line-height 1.72 |
| DM Sans 500 | Meta labels, dates | 10-11px, uppercase |
| Space Mono | Publication details | 12px, monospace |

Body text runs at 17px Lora with 1.72 line-height -- generous spacing that makes longer essays comfortable. Letter-spacing is 0.008em, just enough to feel natural without looking tracked.

## Card Grid

The blog index displays posts as cards with 16:9 hero images, staggered fade-up animations on first visit, and two-line title clamping. The grid responds to available width:

```css
grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
```

Cards lift 2px on hover. The entrance animation uses `cubic-bezier(0.16, 1, 0.3, 1)` with 50ms stagger per card, capping at 300ms. Return visits skip it entirely via `sessionStorage`.

## Prose Styling

The rendered markdown has some opinionated choices that give posts their character:

- **Blockquotes** render as centered pullquotes with large italic text and horizontal rules above and below -- no left border. They read as emphasis, not citation.
- **Lists** use em-dashes instead of bullets.
- **Links** are cyan with a subtle underline that strengthens on hover.
- **Horizontal rules** get 64px of vertical margin, creating natural section breaks.

## Color Palette

The blog defaults to warm neutrals on dark:

```css
--body: #d5d0c8;    /* warm beige text */
--mid: #a09888;     /* secondary, muted */
--accent: #8FF7F9;  /* links, selections */
--paper: #0b0b0b;   /* background */
```

Light mode flips through `data-theme="light"` with a toggle in the top corner, swapping to dark text on a warm paper background.

## Quick Capture

Not everything needs to be an essay. `/note` creates a sticky note -- a single thought in a handwritten typeface on a colored card. Notes stack in the top-right corner of the blog index, clickable into a lightbox with proximity-based navigation (click near the edges to flip through, click away to close). They use ISO timestamps for ordering, cycle through warm/cool/neutral colors automatically, and persist your position across page navigations.

## Link Worthy

`/link` saves a link with a comment. The build system auto-fetches thumbnails (from OEmbed for YouTube, og:image for web pages) and detects the source type. Links render as a list with 200px thumbnails, Lora titles, and small source badges (YouTube, GitHub, or Globe). The `/link` command handles screenshot capture for generic web links too.
