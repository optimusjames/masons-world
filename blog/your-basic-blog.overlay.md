---
title: "Your Basic Blog"
subtitle: "How this blog works and why it's just markdown files in a repo"
date: 2026-02-12
author: Josh Coolman
readingTime: 4 min
---

This blog post exists because I was in the middle of building the blog system and said, "Write a blog post about this." That's it. That's the workflow.

## How It Works

There's no CMS. No admin panel. No auth. No database. No deploy pipeline for content. It's markdown files in a `/blog/` directory inside a Next.js repo. Drop a `.md` file with some front matter, and it shows up.

```markdown
---
title: "Your Basic Blog"
subtitle: "How this blog works"
date: 2026-02-12
readingTime: 4 min
---

Content here...
```

The front matter is minimal on purpose. Title, subtitle, date, reading time. Images are auto-detected -- put a `.png` or `.jpg` in `public/blog/` with the same name as the markdown file and it just appears. No image? No problem. The post renders without one.

## How I Write Posts

I'm usually in the middle of something else. Building an experiment, refactoring a component, debugging a layout. Then a thought crystallizes and I say something like:

"Hey, write a blog post about X."

Claude writes the markdown. It lands in the `blog/` directory. The blog index picks it up. Done.

There's no context switch. No opening a different app. No logging into a CMS. No switching mental modes from "building" to "writing." The writing happens inside the same conversation where the thinking happens.

## The Architecture in 60 Seconds

The blog system is modeled after the docs viewer that already existed in this repo. Same patterns, different presentation:

- **`blog/`** -- Markdown files with YAML front matter
- **`lib/blog/loadBlog.ts`** -- Scans the directory, parses front matter with gray-matter, sorts by date
- **`app/(blog)/`** -- Route group with its own layout, card index, and post pages
- **`next-mdx-remote`** -- Renders markdown server-side with remark and rehype plugins

The editorial typography comes from an earlier experiment called "You're Doing It Wrong" -- Cormorant Garamond for headlines and body, DM Sans for metadata, dark background, 680px max-width. When I liked how that experiment looked, I said "codify this into a blog system" and here we are.

## Why Not a Real Blog Platform

Because every layer between thought and published artifact is friction. A CMS means logging in. A deploy pipeline means waiting. A database means managing state. An editor means learning another interface.

Markdown in a repo means the blog is just *files*. Version controlled. Portable. Readable without any tooling. And the authoring happens conversationally, in the same terminal session where I'm already working.

## The Meta Part

This post is the proof of concept. I was building the blog system, got it working, and mid-conversation said "write a blog post about how we made this blog." Claude had all the context -- the file structure, the design decisions, the workflow -- because it just built the thing.

No notes to gather. No outline to write. No draft to revise in a separate tool. The context was already in the conversation.

That's the whole point. The blog isn't a product. It's a side effect of working in public with an AI agent. The writing is a natural extension of the building.
