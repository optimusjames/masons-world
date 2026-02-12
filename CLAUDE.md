# CLAUDE.md

Next.js design experiments sandbox. Each experiment is a self-contained route.

## Commands

```bash
npm run dev      # Dev server :3000
npm run build    # Production build (run before committing)
```

## Structure

```
app/
├── page.tsx                    # Homepage
├── design-experiments/page.tsx # Gallery
└── [experiment]/
    ├── page.tsx                # Experiment (TypeScript)
    ├── styles.css
    ├── components/             # Extract when >500 lines
    ├── hooks/
    └── data/
```

## New Experiment Workflow

1. Create `app/[name]/page.tsx` + `styles.css`
2. Add to gallery in `app/design-experiments/page.tsx`
3. Screenshot to `public/screenshots/[name].png`
4. `npm run build` to verify
5. Commit

## When to Extract Components

**Keep inline** (<300 lines, simple, prototyping)

**Extract when:**
- File >500 lines
- Components are reusable
- Complex with clear interface

## Code Review

PRs are automatically reviewed by Claude via GitHub Actions. You can also tag `@claude` in any PR or issue comment for interactive help.
