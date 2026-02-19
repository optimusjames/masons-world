---
description: What this docs viewer is and how it works
---

# Overview

A self-hosted documentation viewer built into the sandbox at `/docs`. It reads markdown files from the `docs/` directory and renders them with a sidebar, syntax-highlighted code blocks, and a table of contents.

Drop a `.md` file in the `docs/` folder and it shows up here. No config, no frontmatter required. The file system is the API.

## How It's Organized

The docs directory structure maps directly to the sidebar:

- Files at the root of `docs/` appear under "General"
- Subdirectories become collapsible categories (e.g., `docs/stack/` becomes "Stack", `docs/features/` becomes "Features")
- Numeric prefixes control sort order (`01-progress.md` comes before `02-something.md`) but get stripped from the URL
- Files starting with `_` are excluded (used for templates)

The title for each doc is pulled from the first `# heading` in the file. If there isn't one, it falls back to converting the filename to title case.

## What You See

- **Sidebar** -- Collapsible categories with active state highlighting. On mobile it becomes a slide-out drawer.
- **Content area** -- Rendered markdown with prose styling. Tables, code blocks, blockquotes, lists all work.
- **Code blocks** -- Syntax highlighted with a VS Code Dark+ theme.
- **Table of contents** -- Appears on wide screens, tracks scroll position.
- **Dark mode** -- The entire viewer uses a dark color scheme with Bitter serif headings.

## Architecture

Uses a Next.js route group (`app/(docs)/`) so the docs layout doesn't affect other routes. Docs are server-rendered at build time using `next-mdx-remote/rsc`. All styling lives in a single CSS Modules file, no Tailwind or component library.
