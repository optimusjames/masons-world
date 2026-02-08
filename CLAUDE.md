# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Design experiments sandbox built with Next.js for rapid visual exploration. Each experiment is a self-contained design exercise with its own route.

## Repository Structure

```
/
├── app/
│   ├── page.tsx                       # Animated homepage (TypeScript)
│   ├── design-experiments/
│   │   └── page.tsx                   # Experiments gallery
│   ├── [experiment-name]/
│   │   ├── page.tsx                   # Experiment component (TypeScript)
│   │   ├── styles.css                 # Experiment styles
│   │   ├── components/                # Extracted components (when needed)
│   │   ├── hooks/                     # Custom hooks (when needed)
│   │   └── data/                      # Static data (when needed)
│   ├── layout.tsx                     # Root layout
│   └── globals.css                    # Global styles
├── public/
│   ├── screenshots/                   # Preview images
│   └── [media files]                  # Videos, images, etc.
├── next.config.js                     # Next.js configuration
└── CLAUDE.md                          # This file
```

## Development Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Build for production
npm start        # Run production build
```

## Workflow for New Experiments

When creating a new experiment:

1. **Create experiment route**: `app/[experiment-name]/page.tsx` (TypeScript)
2. **Add styles**: Create `app/[experiment-name]/styles.css`
3. **Verify with browser**: Use agent-browser to check the design
4. **Capture screenshot**: Save to `public/screenshots/experiment-name.png`
5. **Update gallery**: Add entry to `app/design-experiments/page.tsx` with:
   - Date
   - Title
   - Description
   - Screenshot path
   - Tags
6. **Extract components** if needed (see "Code Organization" section)
7. **Verify build**: Run `npm run build` to ensure TypeScript compiles
8. **Ship it**: Commit with descriptive message

## Workflow for Modifying Experiments

When updating an existing experiment:

1. **Make changes**: Edit the experiment's `index.html`
2. **Verify with browser**: Use agent-browser to check the updates
3. **Update screenshot**: Retake screenshot and save to `/screenshots/experiment-name.png`
4. **Move to top**: Reorder both `index.html` and `README.md` to move this experiment to the **top of the list**
   - This keeps most recently modified work visible first
   - Maintains chronological order by last activity, not creation date
5. **Update experiment README**: Add notes about what changed
6. **Ship it**: Commit with descriptive message noting the modifications

## Experiment README Template

```markdown
# Experiment Name

**Date:** Month Day, Year
**Type:** Brief categorization

## Overview
What it is and what it explores

## Key Features
- Bullet list of notable elements

## Design Principles
- Core aesthetic concepts

## How to Run
Steps to view the experiment

## Dependencies
- List external dependencies

## Screenshots
Reference to screenshots folder
```

## Design Philosophy

- **Self-contained**: Each experiment folder can be copied out independently
- **TypeScript-first**: All experiments use `.tsx` for type safety and better DX
- **Rapid exploration**: Focus on visual aesthetics over functionality
- **Documented**: Each experiment explains its design thinking
- **Chronological**: Easy to see design progression over time

## Code Organization: When to Extract Components

This repo balances **rapid iteration** (single-file experiments) with **maintainability** (extracted components). Use this guidance to decide when to extract:

### Default: Single-File Experiments

**Keep everything in `page.tsx` when:**
- Experiment is < 300 lines total
- Components are simple and not reusable
- You're rapidly prototyping/iterating
- The experiment is purely visual/static

**Example structure:**
```
experiment-name/
├── page.tsx        # All components inline
└── styles.css      # All styles
```

### Extract Components When:

**1. Portability matters**
- You might reuse components in other projects
- Components have value beyond this experiment
- Example: `color-spec` widgets are genuinely reusable

**2. File size exceeds ~500 lines**
- Hard to navigate and understand
- Mixing too many concerns
- Example: `color-spec` was 2000+ lines before extraction

**3. Components are self-contained and complex**
- 50+ lines with distinct responsibility
- Clear props interface
- Independent functionality
- Examples: `AnalyticsWidget`, `ColorSidebar`

**4. Working with AI agents on porting**
- Easier to say "give me ColorSidebar" than "extract lines 500-650"
- Clear dependencies via imports
- Can port incrementally

### Recommended Extracted Structure

When you do extract, organize by type:

```
experiment-name/
├── page.tsx                    # Main orchestration (~200 lines)
├── styles.css                  # All styles
├── components/
│   ├── MainWidget.tsx          # Reusable interactive component
│   ├── Sidebar.tsx             # Self-contained UI piece
│   └── Cards.tsx               # Related small components grouped
├── hooks/
│   └── useFeature.ts           # Custom hooks
└── data/
    └── constants.ts            # Static data/config
```

### What NOT to Extract

- Helper functions < 10 lines (keep in `page.tsx`)
- Components < 30 lines unless highly reusable
- One-off utility components
- Simple wrappers

### Real Example: color-spec

**Before:** Single 2000+ line file
**After:** Extracted structure
```
color-spec/
├── page.tsx                    # 95 lines - clean orchestration
├── styles.css                  # All styles (unchanged)
├── components/
│   ├── AnalyticsWidget.tsx     # Reusable chart widget
│   ├── ActivityWidget.tsx      # Reusable chart widget
│   ├── ColorSidebar.tsx        # Complex sidebar UI
│   ├── BrandColors.tsx         # Main color grid logic
│   ├── Cards.tsx               # Simple card components grouped
│   ├── GearToggle.tsx          # Small but self-contained
│   └── TypeInfo.tsx            # Portal component
├── hooks/
│   └── useColorScale.ts        # Color generation utilities
└── data/
    └── fontPairings.ts         # Static font data
```

**Benefits of this structure:**
- Easy to port individual widgets to other projects
- Clear what each piece does
- Can work on sidebar without touching charts
- AI agents can focus on one component at a time

**When porting to another project:**
- "I want the color sidebar" → Just take `ColorSidebar.tsx` + `useColorScale.ts`
- "I want the analytics widget" → Just take `AnalyticsWidget.tsx`
- Clear dependencies via imports make porting straightforward

## React-Based Experiments (with Vite)

Some experiments use React + Vite for interactivity.

### File Structure
```
experiment-folder/
├── index.html          # Entry point (auto-managed by build script)
├── src/
│   ├── main.jsx        # React entry point
│   ├── App.jsx         # Main component
│   └── *.jsx           # Other components (widgets, etc.)
├── assets/             # Built files (generated by pnpm build)
├── scripts/
│   └── build.js        # Automated build script
├── package.json
└── vite.config.js
```

### Build Workflow (Simplified)

The build script handles everything automatically:

1. **Edit source files** in `src/`
2. **Build**: `pnpm build` (cleans old assets, resets index.html, runs vite, outputs prod-ready)
3. **Verify**: `pnpm serve` + agent-browser
4. **Ship**: Commit and push (or use `/ship-experiment`)

### Quick Reference

| Task | Command |
|------|---------|
| Development | `pnpm dev` |
| Build for production | `pnpm build` |
| Verify build locally | `pnpm serve` |
| Full ship workflow | `/ship-experiment` |

### What the Build Script Does

- Removes old hashed assets from `assets/`
- Resets index.html to dev mode (required for Vite)
- Runs `vite build` (generates new hashed assets, updates index.html to prod mode)
- Result: index.html ready to commit with correct hashed references

### Creating New Widgets

Pattern from existing widgets (DashboardWidget, CalendarWidget, AnalyticsWidget, ProgressRingsWidget):

```jsx
import { useState, useEffect, useCallback } from 'react'
import { useSpring, animated } from '@react-spring/web'

const MyWidget = () => {
  const [loadKey, setLoadKey] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  const getRandomValues = useCallback(() => ({
    // Random values for the widget
  }), [])

  const [values, setValues] = useState(getRandomValues)

  // Click to regenerate
  const handleReload = () => {
    setIsLoaded(false)
    setValues(getRandomValues())
    setLoadKey(k => k + 1)
    setTimeout(() => setIsLoaded(true), 100)
  }

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Spring animations
  const spring = useSpring({
    from: { opacity: 0 },
    to: { opacity: isLoaded ? 1 : 0 },
    config: { tension: 200, friction: 20 }
  })

  return (
    <div key={loadKey} onClick={handleReload} style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      cursor: 'pointer',
      userSelect: 'none'
    }}>
      {/* Widget content */}
    </div>
  )
}

export default MyWidget
```

Then import in App.jsx:
```jsx
import MyWidget from './MyWidget'
// Use in a card:
<div className="card card-orange tall">
  <MyWidget />
</div>
```

## Current Experiments

1. **Spec Sheet** (2026-02-02): Type specimen with colorful font pairing selector
2. **Design Festival** (2026-02-02): Card-based layout with festival aesthetics and LCD widgets
3. **Day at a Glance** (2026-02-02): Timeline calendar interface with event blocks
4. **Blend** (2026-02-02): Gradient showcase with bento box/masonry grid layout
5. **Color Spec** (2026-01-28): Green-focused brand color palette with type specimens
