# recommend

Add a link to the Recommended page.

## Usage

```
/recommend https://youtube.com/watch?v=abc123 Great breakdown of how agents actually work
/recommend https://github.com/user/repo I use this as a reference for building skills
/recommend https://some-tool.com Amazing tool for voice dictation
```

Everything after the URL is your comment. URL must come first.

## What It Does

1. Parses the URL and comment from the arguments
2. Detects the source type: `youtube`, `github`, or `web`
3. Creates a markdown file in `app/(blog)/recommended/items/`
4. For **web** links: uses `agent-browser` to take a screenshot (1200x630 viewport) and saves it to `public/screenshots/recommended/`
5. Runs `npm run build` to trigger automatic thumbnail downloads for YouTube and GitHub links (oEmbed and OG image)
6. Reports back with what was created

## File Format

```markdown
---
url: https://example.com
date: YYYY-MM-DD
---
The user's comment exactly as typed.
```

For web links that need a manual title (non-YouTube, non-GitHub), also include:
```markdown
---
title: Page Title Here
url: https://example.com
date: YYYY-MM-DD
---
```

## Filename Convention

`YYYY-MM-DD-slug.md` where slug is derived from:
- **YouTube**: slugified video title from oEmbed (fetch via `curl -s 'https://www.youtube.com/oembed?url=URL&format=json'`)
- **GitHub**: repo name (e.g., `superpowers`)
- **Web**: domain name or a few words from the title

If a file with that name already exists, append `-2`, `-3`, etc.

## Screenshot Workflow (web links only)

YouTube and GitHub thumbnails are downloaded automatically during build. Only web links need a manual screenshot:

```bash
agent-browser open <url> --viewport 1200x630
agent-browser wait --load networkidle
agent-browser screenshot public/screenshots/recommended/YYYY-MM-DD-slug.png
agent-browser close
```

## Title Resolution

- **YouTube**: auto-resolved from oEmbed at build time -- do NOT add title to frontmatter
- **GitHub**: auto-resolved from GitHub API at build time -- do NOT add title to frontmatter
- **Web**: fetch the page title (curl + grep for `<title>`) and add it to frontmatter

## Rules

- URL must be the first argument, comment is everything after
- No editing the comment -- write it exactly as the user said it
- No confirmation needed -- just create and report back
- Always use today's date (run `date +"%Y-%m-%d"` to get it)
- After creating the file, run `npm run build` to verify and trigger thumbnail downloads
- Keep it fast -- this is for capturing links in the moment
