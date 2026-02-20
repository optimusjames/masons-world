# promote

Graduate a design experiment into a reusable component. The inverse of `/design-experiment`.

## Usage

```
/promote sticky-notes
/promote color-spec "ColorPicker"
/promote day-at-a-glance "Timeline"
```

## What It Does

Takes a proven experiment and extracts its reusable core into a portable component with proper TypeScript interfaces, clean props API, and documentation.

## Steps

### Step 1: Analyze the Experiment

Read the experiment at `app/design-experiments/[name]/` and identify:
- The core reusable piece vs. the demo/page wrapper
- State management patterns (hooks, context, localStorage)
- Data dependencies (hardcoded vs. configurable)
- Style dependencies (CSS Modules, CSS variables, font imports)
- External dependencies (npm packages, Google Fonts)

Present findings to the user:

```
Experiment: sticky-notes
Total lines: 380
Reusable core: StickyNoteStack component (~220 lines)
Props needed: notes directory path, color scheme
Dependencies: CSS Modules, Permanent Marker font
Hooks: useSwipe (custom), useState
```

### Step 2: Propose Component API

Design the TypeScript interface and ask for approval:

```tsx
interface StickyNoteStackProps {
  notesDir: string;
  colorScheme?: 'warm' | 'cool' | 'neutral' | 'mixed';
  maxVisible?: number;
  className?: string;
}
```

Use AskUserQuestion to confirm the API, component name, and target location.

### Step 3: Extract

1. **Create component directory** at the chosen location:
   ```
   app/_components/[ComponentName]/
   ├── [ComponentName].tsx       # Main component
   ├── [ComponentName].module.css  # Scoped styles
   ├── types.ts                  # TypeScript interfaces (if complex)
   └── hooks/                    # Custom hooks (if extracted)
   ```

2. **Build the component**:
   - Extract the reusable JSX and logic
   - Replace hardcoded values with typed props
   - Add sensible defaults for optional props
   - Keep styles scoped via CSS Modules
   - Export types alongside the component

3. **Update the original experiment**:
   - Import the new component
   - Replace inline code with the component usage
   - The experiment page becomes a demo/showcase of the component

4. **Verify**: Run `npm run build` to ensure no errors

### Step 4: Summary

Report what was created:
- Component location and files
- Props API quick reference
- Import example
- What changed in the original experiment

## Component Quality Bar

- **Typed**: Full TypeScript — no `any`, explicit prop interfaces, exported types
- **Portable**: No assumptions about parent layout or global styles
- **Composable**: Accept `className` prop for style overrides
- **Documented**: JSDoc on the main export with usage example
- **Self-contained**: CSS Modules for styles, no global CSS leakage
- **Defaults**: Every optional prop has a sensible default

## Target Locations

Ask the user where to place the component:
- `app/_components/` — shared across the app (default)
- `app/(blog)/_components/` — blog-specific components
- `lib/components/` — truly generic, could be used in other projects

## Guidelines

- The experiment page should still work identically after extraction — it just imports the component now
- Don't over-abstract on first extraction. Keep the API minimal; it can grow later
- If the component needs data loading, keep that in the consumer (page), not the component
- Preserve the original experiment's visual design exactly
- One component per promotion — don't try to extract multiple things at once

## Notes

- This skill pairs with `/design-experiment` — one creates, this one harvests
- After promoting, the experiment page serves as living documentation of the component
- Do NOT commit — user will review the extraction first
