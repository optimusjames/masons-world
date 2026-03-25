# ship-experiment

Ship a design experiment with automated screenshot, updates, and commit workflow for Next.js sandbox.

## Usage

```
/ship-experiment
/ship-experiment "Custom commit message"
```

## What It Does

1. **Screenshot**: Take 1280x720 screenshot of experiment with agent-browser
2. **Save screenshot**: To `public/screenshots/experiment-name.png`
3. **Review description**: Display the current description from `lib/experiments/data.ts` and ask the user to confirm or update it before proceeding
4. **Update gallery**: Move experiment to top of `lib/experiments/data.ts`, update date to today
5. **Update README**: Move experiment to top of README.md experiments list, sync description if changed
6. **Commit**: All changes with descriptive message
7. **Push**: To GitHub (triggers Vercel deploy)

## Workflow

```bash
# From sandbox root directory

# 0. Ensure OG files exist (create if missing — older experiments may lack them)
#    Check for app/design-experiments/(experiments)/[name]/opengraph-image.tsx
#    If missing, create it:
#
#    export const runtime = 'nodejs'
#    export const size = { width: 1200, height: 630 }
#    export const contentType = 'image/png'
#    import { experimentOgImage } from '@/lib/og/experimentOgImage'
#    export default function OgImage() { return experimentOgImage('[name]') }
#
#    Also check that page.tsx exports metadata via experimentMetadata('[name]').
#    If missing, add the import and export at the top of page.tsx.

# 1. Start dev server and take screenshot
npm run dev &
sleep 3
agent-browser open "http://localhost:3000/experiment-name" --viewport 1280x720
agent-browser screenshot ./public/screenshots/experiment-name.png
# Close browser and stop server

# 2. Review description
#    Read current description from lib/experiments/data.ts
#    Show it to the user: "Current description: '...'"
#    Ask: "Does this still accurately describe the experiment, or would you like to update it?"
#    If updated, apply the new description to both lib/experiments/data.ts and README.md

# 3. Update lib/experiments/data.ts
#    Move this experiment's entry to top of experiments array
#    Update date to today's date

# 4. Update README.md
#    Move experiment section to top of list
#    Update date to today's date
#    Ensure links point to /experiment-name

# 5. Commit and push
git add -A
git commit -m "Ship Experiment Name"
git push
```

## Deployment

- **Platform**: Vercel
- **Auto-deploys** on push to main branch
- **Live URL**: Check Vercel dashboard or README for current deployment URL

## Link Format

Gallery (app/design-experiments/page.jsx):
```jsx
{
  slug: 'experiment-name',
  date: 'February 8, 2026',
  title: 'Experiment Name',
  description: '...',
  screenshot: '/screenshots/experiment-name.png',
  tags: ['Tag1', 'Tag2']
}
```

Homepage (app/page.tsx):
```jsx
{
  slug: 'experiment-name',
  title: 'Experiment Name',
  date: 'Feb 8, 2026',
  screenshot: '/screenshots/experiment-name.png',
}
```

README.md - relative paths:
```markdown
[![Experiment Name](./public/screenshots/experiment-name.png)](/experiment-name)
**[View Live →](/experiment-name)**
```

## Requirements

- agent-browser skill must be available
- Dev server must be running on localhost:3000

## Notes

- Screenshot size: 1280x720 (16:9 aspect ratio)
- Move experiment to top of both gallery and README (most recently updated first)
- Date should be today's date in format: "Month Day, Year"
- Routes are `/experiment-name` (no dated folders)
