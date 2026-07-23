---
description: Major changes and milestones as the project evolves
---

# Development Progress

This file tracks major changes and milestones in the project.

---

## July 2026

**Home identity flip card, sharpened pitch, grouped gallery**
Turned the static identity block into a flippable card (`app/components/IdentityCard.tsx`), reusing the CSS 3D recipe from the Yoga Cards experiment: the front carries the pitch, an "About" flip reveals a short bio. Both faces render real DOM text (crawlable) and the offscreen face is `inert` so it drops out of the tab order; `prefers-reduced-motion` swaps the spin for an instant flip. Sharpened the front tagline to add direction ("...and I'm moving toward the operations side of how a city runs"). Removed the "an experiment" tag from the home Writing section so the blog reads as genuine thinking, not an undersell. Gave the experiments gallery a real hierarchy: added a `category` field to the experiment type and grouped the gallery into Civic & Data (lead), Wellness & Movement, and Tools & Craft, each with a section header and blurb.

**Home page — "living resume" redesign**
Reworked the landing page from a playful personal site into a professional, employer-facing home while keeping its character. Fixed the randomized greeting to a single "Oh, hello there." flourish, added a contained identity card (monogram, name, role, tagline, links), and promoted the three Portland civic-map projects (McLoughlin / 99E, Fix It PDX, Cool PDX) to a Featured Work section with per-project impact/scope lines. Second pass went further: off pure black onto a layered "ink" surface system with elevated cards and hairline borders, consolidated the type to Space Grotesk + Space Mono (retiring Michroma and Lora on the home page), wired the previously-unused NetworkCanvas as a subtle constellation backdrop, and introduced a commanding eyebrow-plus-display-heading hierarchy ("Civic maps, built on Portland's open data."). Writing and Recommendations demoted to clearly secondary planes; the Writing section now carries a subtle "written with Claude" tag acknowledging the blog as an AI-assisted writing experiment.

---

## June 2026

**Cool PDX**  
New design experiment — a heat-relief map for Portland, and the third in the Portland Leaflet series. One light map answering a single question: on a hot day, where's the nearest shade, water, and cool air? A tree-canopy shade gradient — built by paging the city's full street-tree inventory (253,951 trees) into a 1,350-cell density grid — sits beneath drinking fountains (OpenStreetMap, Benson Bubblers flagged) and air-conditioned public refuges (libraries and community centers). A "relief near me" button uses browser geolocation to find and line-connect the nearest fountain and cool space, with a graceful fallback when location is denied. Context recalls the 2021 heat dome that killed 69 people in Multnomah County and the eastside canopy gap. A new public-health angle on the civic-mapping toolchain proven in McLoughlin / 99E and Fix It PDX, with two new techniques: a density gradient layer and geolocation. Data fetched via `pnpm fetch:cool-pdx` and committed static.

**Fix It PDX**  
New design experiment — an intuitive refresh of the City of Portland's PDX Reporter. One light Leaflet map that does two things: tap a pin to see what got fixed (and how fast), or tap anywhere to report a street issue with no login. Lands already alive with ~370 real pothole records from the city's public PBOT Maintenance feature layer plus illustrative pins for the other categories on real Portland streets. Map-first report flow with reverse geocoding, a 5-common-plus-search category step, and three honest handling patterns — inline mock-submit (reference number + optional email opt-in), phone handoff with a pre-filled script, and external handoff to the real Portland.gov form. Campsite reporting kept out as a respectful pointer to the Impact Reduction Program. A pitch-ready front-end vision prototype aimed at PBOT: "here's the replacement experience — you build the backend." Reuses the Leaflet bones from McLoughlin / 99E.

---

## May 2026

**Blog post, *Proof of Person***
New essay on authenticity and AI simulation. Argues that in an age when anyone can generate a convincing version of you, trust doesn't come from being verifiable — it comes from being knowable. The non-linear accumulation of a real life, the vulnerability, the imperfect process, has a texture simulation can't source.

---

## April 2026

**McLoughlin / 99E**  
New design experiment, then redesigned as a four-chapter scrollytelling case study. Sticky Leaflet map paired with narrative cards walking through the 3-year effort to reduce the posted speed on SE McLoughlin Blvd / OR-99E — the original 2-mile petition, the cross-agency path from PBOT to ODOT to Salem, the safety record (Portland and ODOT crash data, SE Holgate as Portland's #12 most dangerous intersection), and a modern-corridor view connecting MAX Orange, the Springwater Trail, schools, and parks. Signed off January 2026 as a 4-mile, 45 → 40 mph reduction in both directions.

**Blog post, *Who's the Smartest?***  
New essay riffing on Jensen Huang's definition of smart as the ability to feel the vibe. Grounds the idea in a concrete AWS-era scene and widens to why this kind of intelligence is about to matter more in an AI-amplified world.

---

## March 2026

**Yoga Cards**  
New design experiment. Flippable pose cards in five layouts with CSS 3D transforms, deep-linkable share URLs, and staggered entrance animations. Later simplified to single-column on mobile.

**Yoga Guide**  
New design experiment. Five-step questionnaire (intentions, activity level, preferred time, Ayurvedic constitution) that scores a personalized yoga prescription from a static engine. Results include a ranked pose sequence, pranayama recommendations, frequency/timing guidance, Ayurvedic tips, and a bento stats grid with count-up animation.

**Blog posts and skill refinement**  
First original posts published, *This Is Gonna Be Fun* and *You Can't Force It*, followed by *Close Your Eyes* (on reps, feel, and intuition) and *Remarkable Is a Direction*. Updated the blog-post skill with clearer voice, tone, and image guidance.

**OG images and share buttons**  
Added Open Graph image cards and a share button across experiments and blog posts. Clipboard-first sharing for blog, deep-link sharing for yoga cards. Baked OG metadata generation into the design-experiment and ship-experiment skills so new experiments inherit it.

**Homepage polish**  
Staggered entrance animation on the greeting, brighter glow and ambient pulse on the greeting-tap easter egg. Shell icon replacing the "J" favicon.

**Cleanup**  
Removed old spinner videos and stale screenshots left over from the previous project. Brought llms.txt and llms-full.txt up to date.

---

## February 2026

**Forked and restarted**  
Rebranded the site. Cleared out inherited experiments, blog posts, and images to start fresh. Swapped Space Grotesk in for Bitter across the site UI.

**Yoga Breathing**  
New design experiment. Animated breathing timer with five techniques, color themes, and duration options.

**Footer easter egg**  
Replaced the skull icon with a shell, added the phrase *Todo pasa*.

---
