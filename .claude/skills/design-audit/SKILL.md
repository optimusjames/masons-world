---
name: design-audit
description: Audit a design experiment's CSS for color and type consistency, suggest unifications
---

# Design Audit

Analyze a page or component's CSS to surface redundant colors, near-duplicate type sizes, and inconsistent tokens. Propose a tighter system, then implement on approval.

## Usage

```
/design-audit                              # audits the current experiment
/design-audit crossfit-bento               # audits a specific experiment
/design-audit app/components/Header.tsx     # audits a specific component
```

## What It Does

1. **Read** the target CSS (and any inline styles in TSX/JSX)
2. **Extract** every color value and font-size into frequency tables
3. **Analyze** for near-duplicates and inconsistencies
4. **Present** findings + suggested changes
5. **Implement** approved changes
6. **Summarize** the before/after as a reference table

## Step 1: Identify Target Files

- If no argument: use the most recently modified experiment under `app/design-experiments/`
- If argument is an experiment name: look in `app/design-experiments/[name]/`
- If argument is a file path: use that file directly
- Collect the CSS file(s) and all TSX/JSX files that may contain inline styles or style objects

## Step 2: Extract Raw Inventory

### Colors

Collect every color declaration from:
- CSS `color`, `background`, `background-color`, `border-color`, `border-top`, `border-bottom`, `stroke`, `fill` properties
- Inline `style={{ color: ... }}` in JSX
- SVG attributes (`stroke`, `fill`)

Normalize formats for comparison:
- `#000` and `#000000` are the same
- `rgba(42, 40, 32, 1)` and `#2a2820` are the same
- Note opacity variants separately (e.g., `rgba(42, 40, 32, 0.12)` is distinct)

Group by context:
- **On light backgrounds** (light cards, warm grays like `#b8b4aa`)
- **On dark backgrounds** (dark cards, page bg)
- **Accent/brand colors** (saturated, intentional)
- **SVG/chart colors** (data visualization, may be intentionally varied)

### Type Sizes

Collect every `font-size` value. Record:
- The pixel value
- Which selector uses it
- The font-weight paired with it
- The font-family (body vs mono vs heading)

### Letter Spacing

Note any `letter-spacing` values for consistency check.

## Step 3: Analyze and Find Issues

### Color Issues

Flag:
- **Near-duplicate grays**: values within ~15% lightness of each other used in the same context (e.g., `#666` and `#777` both as dark-bg meta text)
- **Inconsistent roles**: same semantic role (e.g., "primary text on light bg") using different values across cards
- **One-off values**: a color used exactly once that could align with an existing token

Do NOT flag:
- Card-specific brand colors (orange, olive, brown, blue) — these are intentionally distinct
- SVG visualization colors that form a deliberate scale (heatmap stops, zone colors)
- Opacity variants of a consistent base color
- Colors on unique backgrounds (like the orange goal card) where contrast needs are different

### Type Size Issues

Flag:
- **Near-duplicates**: sizes within 2px of each other used for similar roles (e.g., `11px` and `12px` both for sub-labels)
- **Orphan sizes**: a size used only once that could merge with an adjacent step
- **Scale gaps**: jumps that break the visual rhythm (e.g., going 9, 10, 13, 19 with nothing at ~16)

Do NOT flag:
- The smallest size (badges, micro labels) — these are often intentionally distinct
- The largest size (hero/display) — same reasoning
- Sizes that serve clearly different roles even if numerically close

## Step 4: Present Findings

Format findings as two tables, then a suggested change list.

### Color Inventory

```
COLORS ON LIGHT BACKGROUNDS
Role              Current Values              Suggested
Primary text      #2a2820, #000, #222, #444   #2a2820
Meta text         #777, #888                  #2a2820

COLORS ON DARK BACKGROUNDS
Role              Current Values              Suggested
Primary text      #d4d0c8, #bbb              #d4d0c8
Meta text         #666, #888, #5a5a52        #666

ACCENT COLORS (no changes needed)
#e87000 (orange), #6b7355 (olive), #8b5e3c (brown), #6b8f6b (green)
```

### Type Inventory

```
TYPE SIZES
Step      Current    Suggested  Role
Micro     7px        7px        Badge only
Caption   8px, 9px   9px        Labels, legends
Meta      10px       10px       Units (Geist Pixel)
Small     11px, 12px 12px       Sub-labels, exercise names
Body      13px       13px       Card labels
Title     15px, 17px 17px       Secondary headings
Heading   19px       19px       Card titles
...
```

### Suggested Changes

Present each change group using AskUserQuestion with multiSelect:

```
Found N inconsistencies across colors and type. Select which to fix:
```

Options:
- "Unify light-bg text to #2a2820 (affects N declarations)"
- "Unify dark-bg text to #d4d0c8 (affects N declarations)"
- "Unify dark-bg meta to #666 (affects N declarations)"
- "Collapse 8px/9px to 9px (affects N declarations)"
- "Collapse 11px/12px to 12px (affects N declarations)"
- etc.

## Step 5: Implement Approved Changes

For each approved change:
1. Edit the CSS file(s) with the unified values
2. Check for inline styles in TSX/JSX that also need updating
3. Run `npm run build` to verify nothing breaks

## Step 6: Summary

After implementation, output a final reference showing the cleaned system:

### Color System

| Role | Light BG | Dark BG | Notes |
|---|---|---|---|
| Primary text | `#2a2820` | `#d4d0c8` | All headings, values, labels |
| Meta text | `#2a2820` | `#666` | Units, sub-labels, captions |
| Accent | — | — | Per-card brand colors, unchanged |

### Type Scale

| Step | Size | Weight | Font | Role |
|---|---|---|---|---|
| Micro | 7px | 700 | Geist Pixel | Badge |
| Caption | 9px | 500-600 | Both | Labels, legends |
| Meta | 10px | 500 | Geist Pixel | Units |
| ... | ... | ... | ... | ... |

## Guidelines

- This is a consistency pass, not a redesign. Preserve the visual character.
- When two near-duplicate values exist, prefer the one used more frequently.
- If a value is used on a unique background (like the orange goal card), it may need its own treatment — don't force it into the general palette.
- Card-specific accent colors and data visualization colors are exempt from unification.
- Always verify with `npm run build` after changes.
- Do NOT commit — the user will review visually first.
