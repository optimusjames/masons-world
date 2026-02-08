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
3. **Update gallery**: Move experiment to top of `app/design-experiments/page.jsx`
4. **Update README**: Move experiment to top of README.md experiments list
5. **Commit**: All changes with descriptive message
6. **Push**: To GitHub (triggers Vercel deploy)

## Workflow

```bash
# From sandbox root directory

# 1. Start dev server and take screenshot
npm run dev &
sleep 3
agent-browser open "http://localhost:3000/experiment-name" --viewport 1280x720
agent-browser screenshot ./public/screenshots/experiment-name.png
# Close browser and stop server

# 2. Update app/design-experiments/page.jsx
#    Move this experiment's entry to top of experiments array
#    Update date to today's date

# 3. Update README.md
#    Move experiment section to top of list
#    Update date if needed
#    Ensure links point to /experiment-name

# 4. Commit and push
git add -A
git commit -m "Update Experiment Name"
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
