---
description: Patterns for single-file vs modular component extraction
---

# Component Architecture

**Status:** Active
**Last Updated:** 2026-02-08

## Overview

Established clear patterns for when to keep experiments as single-file components vs extracting into modular architecture. Implemented comprehensive component extraction for the `color-spec` experiment as a reference pattern.

## Key Components

### color-spec Extracted Structure

**Main orchestration:**
- `app/color-spec/page.tsx` - Clean 95-line entry point

**Reusable components:**
- `components/AnalyticsWidget.tsx` - Bar chart widget with animation
- `components/ActivityWidget.tsx` - Line chart with SVG path animations
- `components/ColorSidebar.tsx` - Sidebar with color picker and export modal
- `components/BrandColors.tsx` - Main color grid with state management
- `components/Cards.tsx` - Card component family (Card, CardLabel, CardTitle, CardBody, CardButton)
- `components/GearToggle.tsx` - Settings toggle button
- `components/TypeInfo.tsx` - Typography information portal

**Utilities and data:**
- `hooks/useColorScale.ts` - Color generation with Chroma.js
- `data/fontPairings.ts` - Font pairings and color scale constants

## Usage

### Decision Criteria for Extraction

**Keep single-file when:**
- Experiment < 300 lines total
- Components are simple and not reusable
- Rapidly prototyping/iterating
- Purely visual/static experiment

**Extract components when:**
1. **Portability matters** - Components valuable beyond this experiment
2. **File exceeds ~500 lines** - Hard to navigate
3. **Components are self-contained** - 50+ lines with distinct responsibility
4. **Working with AI on porting** - Easier to say "give me ColorSidebar" than "extract lines 500-650"

### Recommended Structure

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

## Implementation Details

**color-spec refactor:**
- **Before:** Single 2000+ line file with all components, utilities, and data mixed together
- **After:** Modular structure with clear separation of concerns
- **Benefit:** Easy to port individual widgets to other projects, clear dependencies via imports

**Extraction process:**
1. Identified reusable components (widgets, sidebar)
2. Separated pure data (font pairings, color scales)
3. Extracted utilities into hooks (color generation)
4. Left small helpers inline (< 30 lines)
5. Grouped related components (Cards)

**What NOT to extract:**
- Helper functions < 10 lines
- Components < 30 lines (unless highly reusable)
- One-off utility components
- Simple wrappers

## Related Files

- `app/color-spec/` - Full extracted architecture example
- `CLAUDE.md` - Comprehensive guidance on extraction decisions
- All other experiments - Single-file examples (< 300 lines each)

## Future Improvements

- Extract patterns from other experiments as they grow
- Create shared component library for common UI patterns
- Establish storybook for isolated component development
- Add unit tests for extracted, reusable components
- Consider creating hooks library for shared behaviors

## References

- CLAUDE.md section: "Code Organization: When to Extract Components"
- Real example: `app/color-spec/` directory structure
- Related: TypeScript migration for better component interfaces
