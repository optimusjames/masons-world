---
description: Major changes and milestones as the project evolves
---

# Development Progress

This file tracks major changes and milestones in the project.

---

## August 2026

**Smoke PDX: the refresh button tells the truth, and the map stops fighting you**
Four fixes that all came from the same habit of letting one thing stand in for
another. The Refresh button was declared `revalidate = 900`, so a press could
only ever hand back a response Next had already frozen, timestamp and all. It is
`force-dynamic` now, and the button asks for `?force=1`, which skips the upstream
cache for the AirNow monitors alone, since Open-Meteo counts coordinates against
a quota and NIFC has handed us 429s. A sixty second floor on the server keeps a
held-down button from turning into a load test. The footer stopped asking one
line to carry two clocks: "Readings from 8:00 PM" moves only when AirNow
publishes, and "checked just now" moves on every press. What the client compares
across a refresh is the hour the readings are for, not when the payload was
assembled, because the second one changes on every request and would call every
press new.

The camera was clamped to the exact box we fetched data for, which meant a
monitor near the north edge could never be centered and its card opened clipped
by the top of the frame. The camera has its own padded box now, and every popup
reserves the strips where the legend, the fullscreen control, and the credit
live. The headline sentence averaged wind across all 651 cells in the smoke shed
and printed a Pacific Northwest average directly under a Portland-only AQI, so it
is scoped to the metro cells. The stat is clickable and flies the map to the
station behind the number, building the card itself rather than reaching for a
marker that may not survive the zoom.

**Home page: the featured maps derive themselves, and the newest one leads**
The home page hardcoded three map slugs with blurbs written inline, so Smoke
PDX shipped and simply never appeared. The featured set is now derived from
`lib/experiments/data.ts`: filter to Civic & Data, sort by date, take four, lead
with the newest. Scoped to that one category on purpose, since the section
heading makes a claim about Portland's open data and a new yoga experiment must
never land there just for being recent. Blurb and scope moved onto the
experiment records themselves as optional fields, with a first-sentence fallback
so a map that forgets them still renders. Ship the next civic map and it leads
this section with no edit here.

Presentation follows the same logic: a lead card with a large screenshot, a
pulsing LATEST marker, and its own call to action, over a row of three. A flat
row of four would have made the strongest piece in the set look interchangeable.
Two CSS traps worth remembering, both found by measuring rather than looking.
Entrance animations use `animation-fill-mode: backwards`, because a forward fill
keeps applying the final keyframe's `transform: none` at animation priority and
silently kills the hover lift. And `backwards` must not be paired with a base
`opacity: 0`, or the base declaration reasserts itself the instant the animation
ends and blanks the card, which is exactly what happened on the first attempt.

**Smoke PDX: all three layers go live, and the map stops opening on stale data**
Two problems that read as one. Fire perimeters were never refetched, so
containment froze at whatever the build captured: Grasshopper showed 23%
contained for a week while the real fire reached 47%, and Big Grass showed
553,972 acres at 35% against a live 579,135 at 71%. Separately, the page opened
on the committed snapshot and only reached current data after a click, so the
first thing a visitor saw was the oldest thing we had. The fix moves all the
fetching into `data/live.ts`, shared by the page and the refresh route, and
makes the page ISR so it server-renders current readings once per window instead
of firing a fetch per visitor. Perimeters refresh hourly rather than every 15
minutes, since the geometry moves on the order of days and NIFC returned 429
twice during the original source hunt. The provenance footer now separates two
things it had been conflating: what the publisher's cadence is, and how often we
actually poll it. One Refresh button still covers everything, because splitting
it per layer would have advertised freshness the data did not have.

The button itself needed no new fetching, only honesty. Because the server
caches for 15 minutes, a press often correctly returns the same payload, and
saying nothing made a working button look broken. It now reports what it found:
plain data age by default ("Updated 12 minutes ago"), and "Already current,
checked just now" when the press confirmed nothing had changed. Also took the
plate off the Leaflet credit, which now sits on the map on a text halo rather
than a white box, and drops the data-source names on phones since the provenance
footer repeats them immediately below, fullscreen included, since a phone has no
room for the long form and exiting lands you on the footer anyway.

Fullscreen was also never actually fullscreen on a phone. `.mapWrapperFullscreen`
set `height: 100dvh`, but the responsive `.mapWrapper { height: 58dvh }` came
later in the file at equal specificity, and media queries contribute none, so the
takeover was pinned to 58% of the screen (measured 390x490 in an 844-tall
viewport). The rule is now compound, `.mapWrapper.mapWrapperFullscreen`, so it
outranks any plain `.mapWrapper` rule regardless of source order. Verified
filling the viewport at six widths from 390 to 1920.

**The `/map` skill, and Smoke PDX as its first output**
Three Portland map experiments in (McLoughlin / 99E, Fix It PDX, Cool PDX) it was clear the map chrome was a solved pattern being rebuilt by hand each time, while the genuinely hard part — finding and proving a real data source — was being redone from scratch. `/map` splits those apart. Templates in `.claude/skills/map/templates/` carry the Leaflet scaffold, a shared `map-tokens.css` so every map reads as one family, and the non-negotiables learned the hard way (dynamic import, `preferCanvas`, `ResizeObserver` calling `invalidateSize`, escaped popup HTML). The skill's actual substance is a six-step flow whose third step is a hard stop: hunt sources across city, county, state, and federal, hit every candidate endpoint for real, then present a ranked list with a **provenance tier** (A primary agency, B aggregator, C community, D unverified) and let the user pick. A layer may only be drawn as real if it was fetched and counted; anything else is dropped or labeled in the interface, not just in a doc. Claude cannot create API keys (signup means email verification and accepting terms), so the skill ranks keyless sources first, hands over signup URL and env var name when a keyed source is clearly better, and keeps building with a fallback rather than blocking. Confirmed endpoints accumulate in `references/known-sources.md`, which is the part that compounds.

First run produced **Smoke PDX**, a live wildfire-smoke map. Three keyless sources: EPA AirNow hourly files (22 PM2.5 monitors run by Oregon DEQ and Washington Ecology), Open-Meteo wind on a two-density grid, and NIFC current fire perimeters (67 across Oregon and SW Washington at snapshot). The detail worth keeping: AirNow's published AQI is **NowCast**, a decay-weighted average over 12 hours, not a raw hourly reading — so the build script pulls 12 hourly files and computes it properly, honoring EPA's own validity rule (2 of the 3 most recent hours must be present) and the PM2.5 breakpoints as revised in the 2024 NAAQS update. Monitors failing that rule render as hollow grey dots reading "No current reading" rather than disappearing. NASA FIRMS satellite hotspots were fetched, verified at 3,297 detections in Oregon, and then **deliberately dropped**: a VIIRS detection means a satellite saw heat in a 375m cell, which includes ag burns and hot roofs, so 3,297 ambiguous dots would invite a wrong conclusion where 67 named perimeters do not. The map opens on the metro but data covers the whole regional smoke shed, so zooming out reveals the causal picture. Two incidental fixes: `.env*.local` was not in `.gitignore`, and skill templates needed `.tpl` extensions because `tsconfig.json` includes `**/*.tsx` with no exclude for `.claude/`.

**Salt to Taste, and blog skill refinements**
New post on fast tools and slow systems: when tools can automate nearly anything, all slowness starts to look like a defect, and most of the skill is telling which slowness is waste and which one is the actual work. Six revision passes, and the edits fed back into `.claude/skills/blog-post/SKILL.md`. Added a ceiling on consecutive sentence fragments, a first-read legibility test for metaphors, a rule to thread a title's metaphor through the whole piece rather than bookending it, a distinction between confident and overclaiming, word-count discipline (additions get paid for with cuts, verified before reporting), the reader-accusation variant of the preachy trap, a vocabulary check against how James actually speaks, and a prompt to reach for one deep cut tied to the image. Also fixed two small bugs in the skill: two steps were numbered 7 with no step 6, and the build command said `npm` where the project uses pnpm.

**Blog images: webp attempted, reverted, constraint documented**
Converted all eight blog post images from PNG to webp to cut page weight (8.9MB down to 279KB), which silently broke every link preview. The OG card at `app/(blog)/blog/[slug]/opengraph-image.tsx` embeds the post image and renders it through Satori, and Satori cannot decode webp: the route threw `TypeError: u2 is not iterable`, returned nothing, and shared links fell back to the site favicon. The build passed and the pages rendered fine, so nothing surfaced the problem until links were tested from a phone. Reverted to the original PNGs out of git. The `detectMime` helper in that file lists webp, which reads like support but only labels the mime type; Satori still can't read the pixels. Recorded the constraint in the blog-post skill: PNG or JPEG only, never webp, and verify by fetching the `opengraph-image` URL and confirming a 200 with the photo visible rather than by reading the code. Related context for anyone revisiting this: blog images render through a plain `<img>` tag rather than `next/image`, removed deliberately in `cfaee5b` because its optimizer cache kept serving stale crops after an image was edited. Large image files are a known, accepted tradeoff of that choice.

---

## July 2026

**Fix: McLoughlin / 99E scrollytelling frozen until reload**
The active-chapter tracker (`useActiveChapter`) cancelled its pending animation frame on cleanup but never reset the ref handle to null, so `schedule()` stayed permanently jammed (it early-returns while a frame looks "pending"). After a client-side navigation into the page the map never advanced with scroll until a hard reload. Reset the handle in cleanup.

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
