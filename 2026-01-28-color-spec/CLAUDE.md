# Color-Spec Experiment - Technical Guide

## Overview
Brand guideline experiment exploring React-based composable component architecture with single-file implementation. Built to explore minimal prop APIs and color scale inheritance patterns.

## File Structure
```
2026-01-28-color-spec/
├── index.html          # Single-file React app (no build step)
├── README.md           # User-facing documentation
├── CLAUDE.md          # This file - technical implementation guide
└── screenshots/        # Visual snapshots
```

## Key Concept: Single-File React Architecture

This is a **single HTML file** that includes:
- React & ReactDOM via CDN (React 18)
- Babel Standalone for JSX transformation
- Complete component system
- All styles in `<style>` tag
- All components in `<script type="text/babel">` tag

**No build step required** - just open in browser.

## Component System Architecture

### Color Scale System
Four semantic color scales with 50-950 values each:
- **Primary** (green) - Main brand color
- **Secondary** (ember/red) - Warm accent color
- **Accent** (blue) - Cool accent color
- **Neutral** (stone/gray) - Neutral/gray scale

Each scale defined in:
1. **CSS variables** (`:root`) - Both semantic (`--primary-*`) and color-specific (`--green-*`) names available
2. **React `colorScales` object** - Both naming systems supported for backward compatibility

#### Semantic Naming Approach

The system uses **semantic color names** (primary, secondary, accent, neutral) rather than descriptive color names (green, ember, blue, stone). This provides:

**Benefits:**
- **Palette swapping**: Change primary from green to purple without touching component code
- **Theme variants**: Create dark/light themes by swapping semantic mappings
- **Clearer intent**: "primary" communicates role better than "green"
- **Future flexibility**: Easy to test different color palettes

**Implementation:**
- Color-specific names (green, ember, stone, blue) still work for backward compatibility
- Semantic names are aliases pointing to the same scale objects
- New development should use semantic names
- BrandColors component displays semantic names

**Display order:**
1. Primary → Secondary → Accent → Neutral → Black/Gray/White

### React Components Built

#### Card Component Family
```jsx
<Card colorScale="primary">
  <CardLabel>Label text</CardLabel>
  <CardTitle>Heading</CardTitle>
  <CardBody>Body text</CardBody>
  <CardButton>Button text</CardButton>
</Card>
```

**Key Innovation: Context-based Inheritance**
- Set `colorScale` once on `<Card>`
- All children automatically inherit via React Context
- No prop drilling required
- Minimal API surface

#### Component Props

**Card:**
- `colorScale`: `'primary' | 'secondary' | 'accent' | 'neutral'` (default: 'neutral')
  - Legacy names also supported: `'green' | 'ember' | 'blue' | 'stone'`
- `bg`: Override background value (default: '900')

**CardLabel, CardButton:**
- Inherit `colorScale` from parent Card via Context
- Can override individual color values if needed

**CardTitle, CardBody:**
- No color props needed - use standard white/opacity values

### Sensible Defaults Pattern

All components use sensible defaults from a `defaults` object:
```javascript
const defaults = {
    bg: '900',           // Card background
    label: '300',        // Label text color
    buttonBg: '700',     // Button background
    buttonBorder: '600', // Button border
    buttonText: '200',   // Button text
};
```

**Result:** Minimal props achieve complete theming.

### Auto-Detecting Components

**BrandColors Component:**
Automatically generates color swatches from `colorScales` object:
- Reads scale names from array: `['primary', 'secondary', 'accent', 'neutral']`
- Shows samples at: 900, 600, 400
- Adds neutrals column (black, gray, white)
- Uses CSS Grid with `auto-fit` for responsive layout

**To add a new color:**
1. Add scale to CSS variables (`:root`) with both semantic and descriptive names
2. Add scale definition and reference to `colorScales` object
3. Add semantic name to `scales` array in BrandColors
4. Automatically appears in display

## Layout System

### Grid Structure
4-column modular grid using CSS Grid:
```css
.grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}
```

### Card Spanning
Cards span columns using utility classes:
- `.card-span-1` - 1 column (25% width)
- `.card-span-2` - 2 columns (50% width)
- `.card-span-3` - 3 columns (75% width)
- `.card-span-4` - 4 columns (100% width)

### Equal Height Cards
Cards in same row have equal heights via:
```css
.card-span-N {
    align-self: stretch;  /* Stretch container to grid cell */
}

.card {
    height: 100%;  /* Fill container */
}
```

**How it works:**
- Grid row sizes to tallest card's content
- All containers stretch to row height
- Cards fill 100% of their containers
- Result: equal height, content-driven sizing

## Responsive Breakpoints

- **Desktop (>1024px):** Full 4-column grid
- **Tablet (768px-1024px):** 2-column grid
- **Mobile (<768px):** 1-column grid

Cards automatically reflow based on grid changes.

## Current Cards Using React Components

6 editorial cards converted to React:
1. **Brand Personality** - primary-900
2. **Motion** - primary-900
3. **Hierarchy** - neutral-900
4. **Tone of Voice** - accent-900
5. **Application** - neutral-900
6. **Evolution** - secondary-900

## Typography
- **Font:** Space Grotesk (400, 500, 700)
- **Loaded via:** Google Fonts CDN

## Adding New Color Scales

**Complete workflow:**

1. Add CSS variables (both descriptive and semantic names):
```css
/* Descriptive color name */
--purple-50: #faf5ff;
--purple-100: #f3e8ff;
/* ... through purple-950 */

/* Semantic alias (if replacing existing semantic) */
--tertiary-50: var(--purple-50);
--tertiary-100: var(--purple-100);
/* ... through tertiary-950 */
```

2. Define scale and add to React colorScales:
```javascript
const purpleScale = {
    50: '#faf5ff',
    100: '#f3e8ff',
    // ... etc
};

const colorScales = {
    // ... existing scales ...
    purple: purpleScale,      // Descriptive name
    tertiary: purpleScale,    // Semantic name
};
```

3. Add semantic name to BrandColors scales array:
```javascript
const scales = ['primary', 'secondary', 'accent', 'neutral', 'tertiary'];
```

4. Use immediately with semantic name:
```jsx
<Card colorScale="tertiary">
  <CardLabel>New Section</CardLabel>
  <CardTitle>Purple themed card</CardTitle>
  <CardBody>Uses all purple scale values automatically.</CardBody>
  <CardButton>Learn More</CardButton>
</Card>
```

## Interactive Color Picker Feature

The BrandColors component now includes interactive color editing:

**User Interaction:**
- Click any 900-value swatch (darkest row) to open color picker modal
- Edit icon (✎) appears on hover for clickable swatches
- Non-900 swatches are not clickable (by design)

**Color Picker Modal:**
- Native `<input type="color">` for base color selection
- Live preview showing generated 50-950 scale using Chroma.js
- Three actions: Apply Changes, Cancel, Reset to Default
- Modal closes on backdrop click or Escape key
- Confirm dialog for reset action

**Scale Generation:**
Uses Chroma.js (loaded via CDN) with LCH color space:
- Generates perceptually uniform scales from single base color (900)
- Creates 50-900 from light to dark (10 colors)
- Adds 950 as darker variant
- Maintains consistent lightness progression

**Persistence:**
- Changes saved to localStorage as JSON
- Survives page refreshes
- Falls back to defaults if localStorage unavailable
- Reset button restores original default colors

**CSS Variable Synchronization:**
- Updates both semantic (`--primary-*`) and color-specific (`--green-*`) CSS variables
- All cards and components automatically reflect new colors
- No page reload needed - live updates

**Implementation Details:**
- State managed in BrandColors component via React hooks
- Uses useEffect to sync CSS variables and localStorage
- Modal component receives scale data via props
- Immutable defaultScales object preserved for reset functionality

## Design Philosophy

**Single Prop Theming:**
Entire card theme controlled by one prop (`colorScale`). Everything else uses sensible defaults.

**Semantic Color Naming:**
Use role-based names (primary, secondary, accent, neutral) instead of color-specific names. This decouples design intent from implementation, enabling palette swaps and theme variations without code changes.

**Interactive Customization:**
Users can experiment with different color palettes directly in the browser, making the brand guideline a living, interactive tool rather than static documentation.

**Composable Components:**
Mix and match child components. Can omit CardLabel, skip CardButton, reorder elements - all works.

**No Build Complexity:**
Entire system in one HTML file. No webpack, no npm build, no compilation step. React via CDN makes it portable and easy to understand.

**Extensibility:**
Adding features (new colors, new components) follows clear patterns. System designed to grow without breaking existing usage.

## Common Tasks

**Customize a color scale interactively:**
1. Click the 900 swatch (darkest) for any color scale
2. Use the color picker to select a new base color
3. Preview shows the generated 50-950 scale in real-time
4. Click "Apply Changes" to update entire system
5. Changes persist across page refreshes via localStorage

**Reset colors to defaults:**
1. Click any 900 swatch to open modal
2. Click "Reset to Default" button
3. Confirm the reset action
4. Colors revert to original brand palette

**Change a card's theme:**
```jsx
// Change from primary to accent
<Card colorScale="accent">  // Changed this one prop
  <CardLabel>Motion</CardLabel>
  // ... everything else inherits
</Card>
```

**Add a new card:**
```jsx
// 1. Add container div
<div id="my-card" class="card-span-2"></div>

// 2. Render in React script
const myCardRoot = ReactDOM.createRoot(document.getElementById('my-card'));
myCardRoot.render(
  <Card colorScale="secondary">
    <CardLabel>My Section</CardLabel>
    <CardTitle>My Title</CardTitle>
    <CardBody>My content here.</CardBody>
    <CardButton>Call to Action</CardButton>
  </Card>
);
```

**Override a specific color:**
```jsx
<Card colorScale="primary" bg="600">  // Lighter background
  <CardButton bg="400">  // Override button background
    Learn More
  </CardButton>
</Card>
```

## Context Pattern Implementation

Using React Context for prop inheritance:

```javascript
// 1. Create context
const CardContext = createContext();

// 2. Provider wraps children
function Card({ colorScale, children }) {
    return (
        <CardContext.Provider value={colorScale}>
            <div className="card">
                {children}
            </div>
        </CardContext.Provider>
    );
}

// 3. Children consume context
function CardButton({ children }) {
    const colorScale = useContext(CardContext);
    // Use colorScale for styling
}
```

This eliminates prop drilling while keeping the API clean.

## Performance Notes

- React loaded from CDN (development build for debugging)
- Babel transforms JSX in browser (fine for single-file experiments)
- For production, would want to pre-compile JSX and use production React build
- Current setup prioritizes ease of understanding over performance

## Why This Approach?

**Learning Goals:**
- Explore component composition patterns
- Test minimal prop APIs
- Understand Context for theming
- Build without build tools
- Single-file portability

**Not Production:**
This is an experiment/scratchpad for exploring ideas, not a production design system. Perfect for rapid iteration and learning.
