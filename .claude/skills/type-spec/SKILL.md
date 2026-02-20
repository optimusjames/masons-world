# type-spec

Generate a typographic system from a font pairing — modular scale, fluid sizing, CSS custom properties, and a specimen preview.

## Usage

```
/type-spec "Cormorant Garamond" "DM Sans"
/type-spec "Space Grotesk" "IBM Plex Mono"
/type-spec --from font-pairings 12
```

## What It Does

1. **Input**: Accept a heading + body font pairing (or pick from the font-pairings experiment)
2. **Generate scale**: Build a modular type scale with harmonious ratios
3. **Fluid sizing**: CSS clamp() values that scale between mobile and desktop
4. **Vertical rhythm**: Line heights and spacing that maintain a baseline grid
5. **Output**: CSS custom properties + a specimen page to preview

## Type Scale

Generate 7 steps using a chosen ratio:

| Token       | Ratio   | Use Case           |
|-------------|---------|-------------------|
| `--text-xs` | -2      | Captions, labels   |
| `--text-sm` | -1      | Small text, meta   |
| `--text-base` | 0     | Body copy          |
| `--text-lg` | +1      | Lead paragraphs    |
| `--text-xl` | +2      | H3, subheadings    |
| `--text-2xl` | +3     | H2, section heads  |
| `--text-3xl` | +4     | H1, display        |

### Scale Ratios

Ask the user to pick (or suggest based on the font pairing):

| Name           | Ratio | Character                    |
|----------------|-------|------------------------------|
| Minor Third    | 1.2   | Subtle, compact layouts      |
| Major Third    | 1.25  | Balanced, general purpose    |
| Perfect Fourth | 1.333 | Strong hierarchy, editorial  |
| Golden Ratio   | 1.618 | Dramatic, display-heavy      |

## Output Format

### CSS Custom Properties

```css
/* Typography System: [Heading Font] + [Body Font] */
/* Scale: [ratio name] ([ratio value]) */
/* Base: 18px (1.125rem) */

:root {
  /* Font families */
  --font-heading: '[Heading Font]', [fallback stack];
  --font-body: '[Body Font]', [fallback stack];
  --font-mono: 'JetBrains Mono', monospace; /* optional, if relevant */

  /* Fluid type scale — scales from 375px to 1440px viewport */
  --text-xs: clamp(0.694rem, 0.65rem + 0.22vw, 0.79rem);
  --text-sm: clamp(0.833rem, 0.78rem + 0.27vw, 0.889rem);
  --text-base: clamp(1rem, 0.93rem + 0.33vw, 1.125rem);
  --text-lg: clamp(1.2rem, 1.1rem + 0.45vw, 1.406rem);
  --text-xl: clamp(1.44rem, 1.3rem + 0.6vw, 1.758rem);
  --text-2xl: clamp(1.728rem, 1.55rem + 0.8vw, 2.197rem);
  --text-3xl: clamp(2.074rem, 1.83rem + 1.1vw, 2.747rem);

  /* Line heights */
  --leading-tight: 1.1;    /* Display/heading */
  --leading-snug: 1.3;     /* Subheadings */
  --leading-normal: 1.6;   /* Body copy */
  --leading-relaxed: 1.8;  /* Long-form reading */

  /* Spacing (based on base size) */
  --space-paragraph: 1.5em;
  --space-section: 3rem;
  --space-heading-above: 2em;
  --space-heading-below: 0.5em;

  /* Measure (max line width for readability) */
  --measure: 65ch;
  --measure-narrow: 45ch;
  --measure-wide: 80ch;
}
```

### Google Fonts Import

```css
@import url('https://fonts.googleapis.com/css2?family=[Heading+Font]:wght@400;700&family=[Body+Font]:wght@400;500;600&display=swap');
```

## Steps

1. **Parse input**: Identify the heading and body fonts
2. **Suggest ratio**: Based on the font pairing character (serif display = golden ratio, geometric sans = major third, etc.)
3. **Ask user**: Present ratio options via AskUserQuestion
4. **Calculate scale**: Compute all 7 steps with fluid clamp() values
5. **Determine line heights**: Tighter for headings, relaxed for body — adjusted per font (tall x-height fonts need more leading)
6. **Generate fallback stacks**: Proper fallbacks (e.g., `'Cormorant Garamond', 'Garamond', 'Georgia', serif`)
7. **Write CSS file**: Save to current experiment directory or specified location
8. **Optionally generate specimen**: If user wants a preview, create a minimal HTML specimen showing the full scale in action

## Specimen Preview

When requested, generate a specimen page showing:
- All 7 scale steps with the heading font
- Body copy paragraph with the body font at base size
- Heading + body combination (article-style preview)
- Dark mode variant (inverted, adjusted weights)
- The actual CSS being used (code block)

## Guidelines

- Base size: 18px (1.125rem) is the default for editorial/design content — adjust to 16px for UI-heavy layouts
- Fluid range: 375px (mobile) to 1440px (desktop) — the clamp() values interpolate between these
- Heading weights: Default to 700 for headings, but suggest 500-600 for geometric sans fonts
- Body weights: 400 for body, 600 for emphasis — avoid bold (700) in body copy
- Measure: Always include `--measure` — designers forget line length more than anything
- Don't include a mono font unless the pairing naturally calls for one (tech/data content)

## Notes

- Pairs well with `/palette` — generate type system and color system together for a full design foundation
- The font-pairings experiment at `app/design-experiments/font-pairings/` has 40 curated pairs to choose from
- Avoids the same fonts as the design-experiment skill: no Montserrat, Roboto, Open Sans, Lato, Poppins, Inter as primaries
- Do NOT commit — user will review first
