# TypeScript Setup

This project has been partially migrated to TypeScript while maintaining backward compatibility with JavaScript files.

## What's Been Done

### 1. TypeScript Configuration
- `tsconfig.json` configured with strict mode
- JSX handling via Next.js
- Path aliases set up (`@/*`)

### 2. Converted Files
- `app/layout.tsx` - Root layout with proper prop types
- `app/page.tsx` - Homepage with typed refs
- `app/design-experiments/page.tsx` - Gallery with typed experiments array
- `app/components/NetworkCanvas.tsx` - Canvas animation component
- `app/types/experiments.ts` - Shared type definitions

### 3. Type Safety Improvements
- **Experiment interface**: Ensures all experiment entries have required fields (slug, date, title, description, screenshot, tags)
- **Component props**: NetworkCanvas and RootLayout have explicit prop types
- **React refs**: Video and canvas refs are properly typed
- **Map keys**: Fixed potential duplicate key warnings in experiments gallery

## How to Use TypeScript Going Forward

### For New Files
Simply use `.tsx` extension for React components or `.ts` for utilities:

```typescript
// app/types/widgets.ts
export interface Widget {
  id: string
  title: string
  data: any
}

// app/components/MyWidget.tsx
import type { Widget } from '../types/widgets'

interface MyWidgetProps {
  widget: Widget
  onUpdate?: (id: string) => void
}

export default function MyWidget({ widget, onUpdate }: MyWidgetProps) {
  // Component code
}
```

### For Existing JavaScript Files
Keep them as `.jsx` - the project allows mixed JS/TS. Convert to TypeScript when:
- You're making significant changes
- Type safety would catch bugs
- You want autocomplete for complex data structures

### Common Patterns

**Typed experiments array:**
```typescript
import type { Experiment } from '../types/experiments'

const experiments: Experiment[] = [
  {
    slug: 'my-experiment',
    date: 'Month Day, Year',
    title: 'Experiment Title',
    description: 'Description text',
    screenshot: '/screenshots/my-experiment.png',
    tags: ['Tag1', 'Tag2']
  }
]
```

**Typed refs:**
```typescript
const videoRef = useRef<HTMLVideoElement>(null)
const canvasRef = useRef<HTMLCanvasElement>(null)
const divRef = useRef<HTMLDivElement>(null)
```

**Props with children:**
```typescript
interface LayoutProps {
  children: React.ReactNode
  className?: string
}
```

## Note on Editor Warnings

You may see JSX warnings in VS Code - these are false positives. Next.js handles JSX automatically. As long as `npm run build` succeeds, the code is fine.

## Benefits

- **Autocomplete**: IDE suggestions for experiment properties, component props
- **Compile-time errors**: Catch typos and missing fields before runtime
- **Refactoring safety**: Rename fields with confidence
- **Documentation**: Types serve as inline documentation

## Mixed JS/TS Approach

This project intentionally uses a mixed approach:
- **TypeScript** for structured data (experiments, types) and new code
- **JavaScript** for rapid prototyping and simple experiments
- **Gradual migration** as files are modified

This balances type safety with the rapid exploration goals of a design experiments sandbox.
