# palette

Generate a complete color system from a starting color using chroma-js (already in the project).

## Usage

```
/palette #2563EB
/palette oklch(0.62 0.25 265)
/palette "Pull from the hero section of the current experiment"
```

## What It Does

1. **Input**: Accept a color in any format (hex, rgb, oklch, hsl) or extract from an existing experiment's CSS
2. **Generate scales**: Use chroma-js to build a 50-950 scale (11 stops) using perceptually uniform interpolation (OKLCH when possible)
3. **Dark mode variants**: Generate inverted scale + adjusted saturation for dark backgrounds
4. **Accessible pairings**: Test every combination against WCAG AA (4.5:1 for text, 3:1 for large text/UI) and flag which pairs work
5. **Accent + neutral**: From the primary, derive a complementary accent and a desaturated neutral scale
6. **Output**: Ready-to-use CSS custom properties file

## Output Format

Create a `palette.css` file in the current experiment directory (or a specified location):

```css
/* Generated palette from [source color] */
/* Light mode */
:root {
  --primary-50: #f0f6ff;
  --primary-100: #dbeafe;
  /* ... through 950 */

  --accent-50: #fef3ee;
  /* ... */

  --neutral-50: #fafafa;
  /* ... */
}

/* Dark mode */
[data-theme="dark"] {
  --primary-50: #0a1628;
  /* ... inverted and adjusted */
}
```

## Steps

1. Parse the input color (or read from specified CSS file)
2. Use `chroma.scale([light, base, dark]).mode('oklch').colors(11)` for perceptual uniformity
3. Generate accent via `chroma(base).set('hsl.h', '+180')` (complementary) — adjust if too close to primary
4. Generate neutrals by desaturating the primary to ~5-10% saturation
5. Test contrast ratios using `chroma.contrast(fg, bg)` for all adjacent scale pairs
6. Write the CSS file with comments noting accessible pairings
7. Present a summary: primary/accent/neutral preview with contrast notes

## Interactive

After generating, ask the user:
- Adjust warmth/coolness of neutrals?
- Shift the accent hue?
- Export as TypeScript object instead of CSS?
- Apply to current experiment?

Use AskUserQuestion with multiSelect for these options.

## Guidelines

- Always use OKLCH interpolation — it produces more natural gradients than HSL
- The 500 stop should be the input color (or closest match)
- Dark mode isn't just inverted — reduce saturation slightly at extremes to avoid neon
- Include hex values as comments even when using oklch() in output for readability
- Neutrals should have a subtle tint of the primary (not pure gray)

## Dependencies

- `chroma-js` (already installed in project)
