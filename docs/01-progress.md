---
description: Major changes and milestones as the project evolves
---

# Development Progress

This file tracks major changes and milestones in the project.

---

### SEO Foundation

**Date:** 2026-02-21

Added baseline SEO infrastructure to improve search visibility and crawlability.

**Key changes:**
- Dynamic `sitemap.ts` covering all routes (blog posts, experiments, docs) with `lastModified` dates
- `robots.ts` allowing all crawlers with sitemap reference
- Root layout metadata upgraded: title template so every page includes the site name, `metadataBase`, Open Graph and Twitter card defaults, `authors` field
- Person and WebSite JSON-LD structured data on the root layout
- Blog posts enhanced with OG article type, `publishedTime`, and Article JSON-LD schema
- Docs pages now export `generateMetadata` from document content
- Design experiments section gets metadata via a layout file
- Experiments data extracted to `lib/experiments/data.ts` (shared module, imported by gallery and sitemap)
- Generated favicon via `icon.tsx`

**Key files:**
- `app/sitemap.ts`, `app/robots.ts`, `app/icon.tsx` -- new crawlability and identity files
- `app/layout.tsx` -- metadata upgrade and JSON-LD
- `app/design-experiments/layout.tsx` -- section metadata
- `lib/experiments/data.ts` -- shared experiments data
- `app/(blog)/blog/[slug]/page.tsx` -- enhanced blog metadata and Article JSON-LD
- `app/(docs)/docs/[...slug]/page.tsx` -- added generateMetadata

---

### Sticky Notes: Portal-based Modal for Mobile

**Date:** 2026-02-21

The sticky note expanded overlay was broken on mobile because the blog page's `.stickyNotesWrapper` uses `transform: scale(0.65)` at small viewports. CSS `transform` on any ancestor creates a new containing block for `position: fixed` descendants, so the modal backdrop was sizing and positioning relative to the scaled wrapper instead of the viewport -- appearing clipped and off-center.

Fixed by rendering the modal via `createPortal(jsx, document.body)`, which escapes all ancestor CSS containment (transform, z-index stacking contexts, overflow). The font variable (`--font-marker`) is forwarded to the portal by reading the computed style from the in-tree wrapper ref and inlining it on the backdrop element.

**Key files:**
- `app/design-experiments/sticky-notes/components/StickyNoteStack.tsx` -- createPortal to document.body, wrapperRef for font variable forwarding

---

### Initial Mobile Readiness Pass

**Date:** 2026-02-21

First pass at making design experiments usable on mobile. Focused on the experiments that were most broken at small screen sizes and added a back link to the shared SwissFrame component.

**Key changes:**
- **Retro Tech:** Knobs reflow to 2x2 grid, faders span full width, toggles go horizontal, buttons become 2x2 grid at 520px. Track name display locked to single line with overflow ellipsis to prevent layout shift during scramble animation
- **CrossFit Bento:** Three-column fixed grid collapses to single fluid column
- **Contact Sheet:** Selection sidebar becomes a fixed 50vh bottom drawer on mobile, sliding up from below with independently scrollable file list and smaller thumbnails
- **SwissFrame (shared):** Added inline back link above the top rule using CurtainLink with reverse curtain transition, defaults to `/design-experiments`

**Key files:**
- `app/design-experiments/retro-tech/components/RetroTechPanel.module.css` -- mobile media query with `.knobsRow` and `.mixRow` targets
- `app/design-experiments/retro-tech/components/RetroTechPanel.tsx` -- added explicit class names for mobile CSS targeting
- `app/design-experiments/crossfit-bento/page.module.css` -- single column grid at 520px
- `app/design-experiments/contact-sheet/components/ContactSheet.module.css` -- bottom drawer sidebar
- `app/design-experiments/components/SwissFrame/SwissFrame.tsx` -- back link with `backHref` prop
- `app/design-experiments/components/SwissFrame/SwissFrame.module.css` -- back link styles

---

### Curtain Reveal Page Transitions

**Date:** 2026-02-20

Implemented theatrical wipe-style page transitions using the View Transitions API. The curtain effect creates a cinematic reveal between major sections -- forward navigation wipes up to unveil the new page, back navigation wipes down. Applied to all primary navigation paths (homepage to blog/design/docs, back buttons, docs sidebar). Also simplified the overall navigation architecture by removing redundant global UI (shared sidebar, hamburger menu, floating back button) in favor of focused in-page navigation. Gracefully degrades to standard navigation on unsupported browsers (Firefox, older Chrome/Safari).

**Key changes:**
- Created `CurtainLink` component with clip-path mask animations (0.75s wipe)
- View Transitions API for smooth, GPU-accelerated page transitions
- Directional animation: forward wipes up, back wipes down
- Applied to all section index pages (blog, design experiments, docs)
- Removed redundant global navigation components for cleaner UI
- Also added entrance animations to blog cards using proven pattern from design experiments (fade-in with upward movement, staggered timing, sessionStorage check)

**Key files:**
- `app/components/CurtainLink.tsx` -- curtain transition component
- `app/globals.css` -- View Transitions API styles with clip-path animations
- `app/layout.tsx` -- removed global sidebar
- `app/page.tsx` -- homepage navigation with curtain links
- `app/(blog)/blog/page.tsx`, `app/design-experiments/page.tsx`, `app/(docs)/_components/DocsSidebar.tsx` -- curtain transitions and back links
- `app/(blog)/_components/BlogIndexContent.tsx` -- blog entrance animations

---

### Retro Tech: skeuomorphic audio interface

**Date:** 2026-02-20

Built a skeuomorphic audio control panel -- an RC-1 hardware interface rendered entirely in the browser. The experiment was driven through voice-dictated conversation with an AI agent: no wireframes, no mockups, just iterative refinement of shadows, knob physics, and display readouts until it felt like real hardware.

**Key changes:**
- Interactive controls: four rotary knobs (gain, freq, resonance, mix) with horizontal drag via pointer capture, four vertical faders (vol, low, mid, high), and three toggles (filter, bypass, mute)
- 32-bar EQ visualizer driven by fader values through overlapping bell curves, with volume as a base level
- Track name display with Terminator-style text scramble effect (borrowed from the terminator experiment), auto-cycles every 12s with click-to-advance
- Eased numeric readouts for frequency (5-digit zero-padded Hz) and gain (3-digit zero-padded percent) that interpolate smoothly on knob drag
- LED cluster, recording state with REC badge, chassis screws, serial number -- details that sell the physicality
- Extracted `SwissFrame` to shared component (`app/design-experiments/components/SwissFrame/`) with dark/light variants, reused by crossfit-bento
- Extracted `EditorialBrief` to shared component (`app/design-experiments/components/EditorialBrief/`) for experiment write-ups with headline, lede, images, and body content
- Custom hooks `useKnob` and `useFader` encapsulate all pointer interaction and state

**Key files:**
- `app/design-experiments/retro-tech/` -- page, components, hooks, types, barrel export
- `app/design-experiments/retro-tech/components/RetroTechPanel.tsx` -- main panel with all controls and display logic
- `app/design-experiments/retro-tech/hooks/useControls.ts` -- `useKnob` and `useFader` hooks
- `app/design-experiments/components/SwissFrame/` -- shared frame component
- `app/design-experiments/components/EditorialBrief/` -- shared editorial write-up component

---

### Sticky Notes: portable design experiment with pinning

**Date:** 2026-02-18

Consolidated the sticky note stack into a self-contained design experiment at `app/design-experiments/sticky-notes/` with its own showcase page. The component was previously scattered across `lib/notes/`, `app/(blog)/_components/`, and `notes/`. Now it lives where you'd expect to find it -- as a design experiment that other pages can import.

**Key changes:**
- `getAllNotes(notesDir)` now accepts a path parameter -- the consumer decides where content lives, not the component. The experiment showcase uses demo notes in `data/`, the blog passes `app/(blog)/notes/`
- Fixed text flash bug on swipe cycling: outgoing card now renders from a frozen ref snapshot so content doesn't change mid-animation. Entrance animation (`scaleIn`) is skipped after cycling to prevent the underneath card from flashing through
- Swipe animation changed from lateral to vertical drop (200px down with fade)
- Modal sized to match stack card aspect ratio (300x233, same ~1.3:1 as 180x140)
- Stack now reflects the pinned note: whichever note you're viewing when you close becomes the top card, with a 250ms delayed update so the stack changes after the overlay dismisses
- Stack teaser shows full note text at 11px proportional sizing instead of 3-line clamp
- Updated ship-experiment skill to include homepage `recentExperiments` update step

**Key files:**
- `app/design-experiments/sticky-notes/` -- component, loader, types, showcase page, demo data
- `app/design-experiments/sticky-notes/components/StickyNoteStack.tsx` -- client component
- `app/(blog)/notes/` -- blog's note content (moved from project root)
- `app/(blog)/blog/page.tsx` -- imports from experiment, passes notes path
- `.claude/skills/ship-experiment/skill.md` -- added homepage update step

---

### Contact Sheet: multi-select with sidebar

**Date:** 2026-02-17

Added multi-select functionality to the Contact Sheet experiment. Click images to select them, a sidebar slides in showing thumbnails and filenames of selected images. Copy the full list to clipboard for pasting into LLM conversations. Removed the lightbox and per-image copy actions to focus the tool on its core use case: visually picking images and building filename lists.

**Key files:** `app/design-experiments/contact-sheet/page.tsx`, `app/design-experiments/contact-sheet/styles.css`

---

### Day at a Glance: time-aware enhancement

**Date:** 2026-02-12
**Issue:** #9 - Day at a Glance: time-aware enhancement with dynamic now-line

Rebuilt the Day at a Glance experiment with a full 9am-5pm workday schedule, dynamic now-line that tracks real time, and a partial color fill effect on the current hour's event bar. Added accessibility for checkboxes and fixed hydration mismatch.

**Key files:** `app/day-at-a-glance/page.tsx`, `app/day-at-a-glance/styles.css`

---

### Write-post skill and TypeScript cleanup

**Date:** 2026-02-12

Added `/write-post` skill for blog authoring and eliminated all `any` types from the codebase.

**What changed:**
- New skill `.claude/skills/write-post/SKILL.md` for conversational blog post creation with auto-calculated reading time, slug derivation, and image handling
- Removed `@ts-nocheck` from `NetworkCanvas.tsx`, added typed interfaces (`CanvasNode`, `Organism`, `BlastAnimation`)
- Typed `TextScramble` class in both `geist-pixel` and `terminator` experiments
- Replaced all `any` props in color-spec components (`Cards.tsx`, `ColorSidebar.tsx`, `BrandColors.tsx`, `TypeInfo.tsx`, `ActivityWidget.tsx`, `AnalyticsWidget.tsx`)
- Typed blend recipe state and color scale utilities
- Updated sanity-check skill to remove emojis
- New feature doc: `docs/features/skills.md`

**Key files:** `.claude/skills/write-post/SKILL.md`, `app/components/NetworkCanvas.tsx`, `app/color-spec/components/ColorSidebar.tsx`

---

### Docs Viewer

**Date:** 2026-02-09

Added a `/docs` route that renders markdown files from the `docs/` directory with sidebar navigation, syntax highlighting, table of contents with scroll spy, and dark mode styling.

**What changed:**
- New route group `app/(docs)/` with layout, catch-all slug page, and index redirect
- Utility library `lib/docs/` for scanning the docs directory, parsing filenames, extracting headings
- Client components for sidebar (collapsible categories, mobile drawer), TOC (IntersectionObserver scroll spy), and code blocks (react-syntax-highlighter with VS Code Dark+ theme)
- Server-rendered markdown via next-mdx-remote/rsc with remark-gfm and rehype-slug
- Dark mode CSS Modules with Bitter serif font on headings to match homepage brand
- Homepage redesigned from single text link to two card-style nav links (Design Experiments + Docs)
- Ported 3 reference docs from the notes vault: AI Dev Stack 2026, BYOK Pattern, Stack Overview
- Files prefixed with `_` are excluded from the sidebar (used for templates)
- Subdirectories in `docs/` become collapsible categories; numeric prefixes control sort order

**Key files:**
- `app/(docs)/layout.tsx` - Docs layout with sidebar
- `app/(docs)/docs/[...slug]/page.tsx` - Doc renderer with TOC
- `app/(docs)/_components/` - DocsSidebar, TableOfContents, CodeBlock, DocsContent
- `lib/docs/loadDocs.ts` - Core logic for scanning and loading docs
- `app/(docs)/docs.module.css` - All docs styling
- `app/page.tsx` - Homepage with card nav links
- `docs/stack/` - Ported reference documentation

**Dependencies added:**
- gray-matter, remark-gfm, rehype-slug, react-syntax-highlighter, next-mdx-remote, lucide-react

---

### TypeScript Migration & Component Architecture

**Date:** 2026-02-08

Completed comprehensive TypeScript migration and established component extraction patterns for the design experiments sandbox.

**What changed:**
- Converted all 7 experiments from `.jsx` to `.tsx` with full type safety
- Added TypeScript type definitions (`@types/react-dom`, `@types/chroma-js`)
- Refactored `color-spec` from monolithic 2000+ line file into modular component architecture
- Established clear guidelines in CLAUDE.md for when to extract vs keep single-file

**Key files:**
- All `app/*/page.tsx` - TypeScript conversion
- `app/color-spec/components/*` - Extracted reusable components
- `app/color-spec/hooks/useColorScale.ts` - Color generation utilities
- `app/color-spec/data/fontPairings.ts` - Static data extraction
- `CLAUDE.md` - Added component architecture guidance

**Benefits:**
- Full type safety across all experiments
- Easier to port components to other projects
- Clear separation of concerns in complex experiments
- Better AI agent collaboration on component extraction

---
