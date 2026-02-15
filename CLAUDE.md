Next.js design experiments sandbox. Each experiment is a self-contained route.

## Commands

```bash
npm run dev      # Dev server :3000
npm run build    # Production build
```

## Structure

```
app/design-experiments/
├── page.tsx                       # Gallery
└── [experiment]/
    ├── page.tsx                   # Experiment page
    ├── styles.css
    ├── components/               # Extract when >500 lines
    ├── hooks/
    └── data/
```

## New Experiment Workflow

1. Create `app/design-experiments/[name]/page.tsx` + `styles.css`
2. Add to gallery in `app/design-experiments/page.tsx`
3. Screenshot to `public/screenshots/[name].png`
4. Use `/ship-experiment` skill when done (handles screenshot, gallery, README, commit, push)

## Component Extraction

Keep inline under 300 lines. Extract to `components/` when file exceeds 500 lines or component has a reusable interface.
