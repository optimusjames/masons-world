# Docs Viewer

**Status:** Active
**Last Updated:** 2026-02-09

## Overview

A self-hosted documentation viewer built into the sandbox at `/docs`. It reads markdown files from the `docs/` directory and renders them with a sidebar, syntax-highlighted code blocks, and a table of contents. The route is publicly accessible but intentionally not in the main nav -- it's linked from the homepage cards.

The idea is simple: drop a `.md` file in the `docs/` folder and it shows up in the viewer. No config, no frontmatter required. The file system is the API.

## How It's Organized

The docs directory structure maps directly to the sidebar:

- Files at the root of `docs/` appear under "General"
- Subdirectories become collapsible categories (e.g., `docs/stack/` becomes "Stack", `docs/features/` becomes "Features")
- Numeric prefixes control sort order (`01-progress.md` comes before `02-something.md`) but get stripped from the URL
- Files starting with `_` are excluded (used for templates like `_TEMPLATE.md`)

The title for each doc is pulled from the first `# heading` in the file. If there isn't one, it falls back to converting the filename to title case.

## What You See

- **Sidebar** -- Collapsible categories with active state highlighting. On mobile it becomes a slide-out drawer with an overlay.
- **Content area** -- Rendered markdown with prose styling. Tables, code blocks, blockquotes, lists all work as expected.
- **Code blocks** -- Syntax highlighted with a VS Code Dark+ theme. Supports all common languages.
- **Table of contents** -- Appears on wide screens. Tracks your scroll position and highlights the current section.
- **Dark mode** -- The entire viewer uses a dark color scheme with Bitter serif headings to match the homepage.

## Architecture Decisions

**Route group** -- Uses `app/(docs)/` so the docs layout (sidebar + main content) doesn't affect other routes. The parentheses make it a Next.js route group -- it provides a layout without adding a URL segment.

**Server-rendered markdown** -- Docs are rendered at build time using `next-mdx-remote/rsc` with `format: 'md'`. The `md` format is important -- it prevents the MDX parser from choking on dollar signs, angle brackets, and curly braces that naturally appear in technical documentation.

**File system scanning** -- No config file or manifest. `lib/docs/loadDocs.ts` scans the directory at build time, which means adding a doc is just adding a file. The trade-off is you need to rebuild to see new docs (fine for this use case).

**CSS Modules** -- All styling lives in a single `docs.module.css` file, consistent with the rest of the project. No Tailwind, no component library.

**Client/server split** -- The sidebar and TOC are client components (they need state for collapse/expand and scroll tracking). The content renderer is a server component.

## Related Files

- `app/(docs)/layout.tsx` -- Docs layout shell
- `app/(docs)/docs/[...slug]/page.tsx` -- Dynamic doc page
- `app/(docs)/_components/` -- Sidebar, TOC, CodeBlock, DocsContent
- `lib/docs/` -- File scanning, heading extraction, slug parsing
- `app/(docs)/docs.module.css` -- All styling
- `docs/` -- The actual markdown content
