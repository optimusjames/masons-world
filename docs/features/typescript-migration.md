# TypeScript Migration

**Status:** Active
**Last Updated:** 2026-02-08

## Overview

Complete migration of the Next.js design experiments sandbox from JavaScript (.jsx) to TypeScript (.tsx), establishing type safety across all experiments and components.

## Key Components

- **All experiment pages** (`app/*/page.tsx`) - Converted to TypeScript with proper typing
- **Type definitions** - Added `@types/react-dom` and `@types/chroma-js` for third-party libraries
- **tsconfig.json** - Configured with strict mode enabled
- **Build verification** - All experiments build without TypeScript errors

## Implementation Details

**Migration approach:**
1. Renamed all `.jsx` files to `.tsx`
2. Added type annotations for:
   - React component props
   - Event handlers (KeyboardEvent, MouseEvent, etc.)
   - State hooks (useState with explicit types)
   - Ref hooks (useRef with HTMLElement types)
3. Fixed all TypeScript strict mode errors
4. Verified production build passes

**Type patterns used:**
- `Record<string, string>` for object maps
- `React.CSSProperties` for inline styles with CSS variables
- `React.KeyboardEvent<HTMLElement>` for keyboard handlers
- `HTMLElement` type assertions for DOM manipulation
- Custom types for domain objects (FontPairing, etc.)

**Strategic use of `any`:**
- Animation classes with complex dynamic properties
- DOM manipulation code that's self-contained
- Interim states to avoid massive type rewrites in experiments

## Related Files

- `app/blend/page.tsx` - TypeScript conversion with intersection observer
- `app/day-at-a-glance/page.tsx` - Record type for checkbox state
- `app/geist-pixel/page.tsx` - Text scramble class with proper types
- `app/spec-sheet/page.tsx` - FontPairing type definition
- `app/terminator/page.tsx` - TextScramble class with full typing
- `app/youre-doing-it-wrong/page.tsx` - Simple conversion
- `app/color-spec/page.tsx` - Refactored with extracted components
- `tsconfig.json` - TypeScript configuration
- `package.json` - Added type definition packages

## Future Improvements

- Replace strategic `any` uses with proper interface definitions
- Add stricter typing for animation classes
- Create shared type definitions for common patterns
- Add prop type interfaces for all extracted components
- Consider using Zod for runtime validation of external data

## References

- TypeScript strict mode: All experiments compile without errors
- Build verification: `npm run build` passes successfully
