# Design Experiments

A Next.js-based sandbox for exploring visual design systems, widgets, and layouts and ux interaction patterns.

---

## Experiments

### Terminator - Text Scramble

**February 6, 2026**

[![Terminator Text Scramble](./screenshots/terminator.png)](https://sandbox-47z.pages.dev/2026-02-06-terminator/)

Interactive terminal-style text scramble effect with two-phase animation. Enter custom text to see it scramble chaotically for 1 second, then resolve sequentially line-by-line. Features balanced line breaking and automatic uppercase conversion. Default text: Ghost in the Shell quote on identity and consciousness.

**Tags:** Text Animation • Terminal UI • Interactive • Split-Flap Effect

**[View Code ->](/terminator)**

---

### Geist Pixel

**February 6, 2026**

[![Geist Pixel](./screenshots/geist-pixel.png)](https://www.joshcoolman.com/2026-02-06-geist-pixel/)

Typographic specimen featuring Vercel's Geist Pixel display font with 5 bitmap-inspired variants. Includes a split-flap text scramble effect using Space Mono - solid wall of characters that resolves line-by-line into readable text. Click to replay the animation.

**Tags:** Typography • Split-Flap Effect • Text Animation • Monospace

**[View Code ->](/geist-pixel)**

---

### Color Spec

**February 6, 2026**

[![Color Spec](./screenshots/color-spec.png)](https://www.joshcoolman.com/2026-01-28-color-spec/)

Interactive brand guidelines with live color and typography customization. Features animated Activity line chart and Analytics bar chart widgets with CSS-only animations. Click the gear icon for a push-in sidebar with color pickers using Chroma.js scale generation and 9 curated font pairings. All changes persist via localStorage.

**Tags:** React Components • Animated Charts • Color Systems • Typography

**[View Code ->](/color-spec)**

---

### A Day in the life...

**February 2, 2026**

[![Day at a Glance](./screenshots/day-at-a-glance.png)](https://www.joshcoolman.com/2026-01-28-day-at-a-glance/)

Clean 3-column CSS grid timeline with colored sidebar bars, SVG icons, and a subtle "now" indicator line that shows through semi-transparent event cards. Features split color bars for past/upcoming visualization and continuous horizontal hour lines.

**Tags:** CSS Grid • Timeline • Z-Index Layering • Dark Theme

**[View Code →](/day-at-a-glance)**

---

### Blend

**February 2, 2026**

[![Gradient Explorer](./screenshots/blend.png)](https://www.joshcoolman.com/2026-01-28-blend/)

Swiss modernist gradient specimen system featuring organic mesh gradients via SVG blur technique. Includes 27 gradient cards across linear and mesh styles, systematic labeling (G-01 through G-09, M-01 through M-18), scroll-triggered animations, and an analytics dashboard mockup.

**Tags:** Gradients • SVG Mesh • Swiss Design • Scroll Animation

**[View Code →](/blend)**

---

### Spec Sheet

**January 28, 2026**

[![Type Specimine](./screenshots/spec-sheet.png)](https://www.joshcoolman.com/2026-01-28-spec-sheet/)

Bold typographic layout with dark/light mode toggle. Features strong hierarchy through scale contrast, clean sectioning, and a professional two-color aesthetic.

**Tags:** Typography • Dark Mode • Minimal • Two Column

**[View Code →](/spec-sheet)**

---

## Development

```bash
npm run dev    # Start Next.js dev server on port 3000
npm run build  # Build for production
npm start      # Run production build
```

## Structure

```
/
├── app/                          # Next.js App Router
│   ├── page.jsx                  # Homepage with visual gallery
│   ├── layout.jsx                # Root layout
│   ├── globals.css               # Global styles
│   └── [experiment]/             # Dynamic experiment routes
│       └── page.jsx              # Individual experiment pages
├── public/
│   └── screenshots/              # Preview images for homepage/README
├── YYYY-MM-DD-experiment-name/   # Original experiment folders (preserved)
│   ├── index.html                # Original HTML
│   ├── README.md                 # Documentation
│   └── screenshots/              # Design iterations
└── CLAUDE.md                     # Workflow guidance
```

## Purpose

This sandbox is for rapid design exploration—building visual systems, testing layouts, and creating reusable design patterns. Each experiment is self-contained and can be copied out independently.

### Adding New Experiments

To add a new experiment to the Next.js app:

1. Create a new page in `/app/[experiment-name]/page.jsx`
2. Add screenshot to `/public/screenshots/experiment-name.png`
3. Update homepage gallery in `/app/page.jsx`
4. Keep original HTML version in dated folder for reference

---

**View live experiments:** https://www.joshcoolman.com/
