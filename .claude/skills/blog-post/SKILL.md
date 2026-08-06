# blog-post

Draft a blog post from conversation context. Creates the markdown file with a placeholder image so it's immediately visible on the homepage and blog index.

## Usage

```
/blog-post                              # Interactive -- asks what to write about
/blog-post "Design as Dialogue"         # Title provided, drafts from conversation context
```

## Workflow

### 1. Gather Inputs

- **Title** (required) -- from argument or ask the user
- **Subtitle** (optional) -- ask if not obvious from context
- **Slug** -- derive from title: lowercase, hyphens, no special chars

### 2. Research

Before writing, gather context:
- Read existing posts in `blog/` to match voice and editorial style
- Check conversation history and any relevant Wispr Flow transcripts
- Check auto memory for notes on the topic

### 3. Draft the Post

Write in the style of the existing posts in `blog/`. The writing philosophy:

- **Short paragraphs.** 2-4 sentences max. White space is structure.
- **Concrete over abstract.** Specific details from real experience, not theory. Metaphors have to land on first read. If the reader stops to work out whether it fits, it costs more than it earns.
- **Sustain the metaphor.** If the title carries one, thread it through the piece instead of bookending it. Stepping outside it is fine when the point needs plain speech, but bridge back with a line that names the turn.
- **One thesis.** Every post makes one point. Say it early, support it with examples, end when the point is made.
- **Edgy and light on the outside, thoughtful and Zen on the inside.** Humor and irony help people connect. Don't be too serious. The depth earns its place because the delivery is fun.
- **Start in first person or in thesis.** Personal posts ground the opening in a real moment ("I can stand at the window..."), then broaden to "we." Philosophical posts can lead with the idea, and the personal comes through perspective, not anecdote. The conversation and subject matter will signal which mode fits.
- **Conversational but not rambling.** Write like you talk, but land on strong statements. No hedging, no "in conclusion." Confident is not the same as overclaiming. Absolutes and superlatives invite an argument the post can't win. Claim what the piece supports.
- **Vary sentence rhythm, but write full sentences.** Comma-joined clauses flow, short declaratives punch, and the contrast between them is what keeps the writing alive. Sentence fragments are the exception, not the tool. They read as AI filler, so use them rarely and never two in a row. If a fragment is sitting there for rhythm, absorb it into the neighboring sentence.
- **End sharp.** The last line should hit. Sometimes it echoes the title.
- **300-600 words.** 400-500 is the sweet spot. Let the idea breathe and develop fully. If it's pushing past 600, check you're not making two points. Recount after every revision. Additions get paid for with cuts. Check the number before reporting it.
- **Essays, not documentation.** No headers unless the post genuinely needs sections. Most don't.
- **Don't force the AI parallel.** It'll appear naturally when it fits. Not every post needs it.
- **Minimize em dashes.** They read as AI filler. Use periods, colons, or parentheses instead. A dash here and there is fine. Defaulting to them is not.

**Voice:** The posts read like someone who thinks deeply but doesn't take themselves too seriously. Warm, a little irreverent, always grounded in something real. The tone is the subtle leader: confident without performing confidence, making the point without lecturing. Use the author's working vocabulary. Idiom that is technically fine but not how he speaks breaks the voice.

Specific qualities to bring:
- Clean declarative sentences. Premise, implication, application. Precise word choice. Abstract ideas made concrete through systems and examples.
- Personal and direct. Name the uncomfortable thing. Be honest about your own loops and failures.
- Slightly contrarian. A little self-deprecating. Wry humor earns more trust than earnestness.
- Light on the outside, genuine on the inside. The depth earns its place because the delivery is fun.

**Watch for the instructional trap.** When a post starts to feel like advice, pull back. The voice earns its depth through lightness, not earnestness. If a paragraph is explaining the lesson rather than showing it, cut or reframe. Preachy is the main failure mode. A related failure is narrating the reader's behavior back at them. Describe the dynamic and let the reader place themselves in it. Watch the pronoun here: "you" points at the reader and slides into telling them what to do, while "we" puts the writer inside the same problem, which is where this voice works best.

**On drafting:** Sometimes the first draft is close and needs minimal polish. Sometimes the idea is still finding its shape and takes more passes. Both are fine. Start from what's in the conversation and let it land where it lands.

**On revising:** Tightening an existing post means cutting and rewording what's already there, not adding new examples or analogies. Go paragraph by paragraph and say what to keep, cut, or reword. Recount the words after each pass.

The final wording pass belongs to James. He reads the post through against the local build and rewrites phrases into his own language, and that pass is what makes it sound like him rather than like a draft. Before calling a post done, check that he has had it.

### 4. Generate Front Matter

```yaml
---
title: "Post Title"
subtitle: "Optional subtitle"
date: YYYY-MM-DD  # today's date
author: James Mason
---
```

### 5. Write File

Save to `blog/{slug}.md` in the sandbox root.

### 6. Create Placeholder Image

Copy the master placeholder to `public/blog/{slug}.png`:

```bash
cp public/blog/placeholder.png public/blog/{slug}.png
```

This is a real 1200x630 dark gray PNG. It shows up correctly in blog cards and on the homepage. To replace it, the user just saves a real image to the same path -- same name, same extension. Everything just works.

**Use PNG or JPEG. Never webp.** The link-preview card is generated at `app/(blog)/blog/[slug]/opengraph-image.tsx`, which embeds the post image and renders it through Satori. Satori cannot decode webp: the route throws `TypeError: u2 is not iterable`, returns nothing, and every shared link falls back to the site favicon. Nothing in the build or the page itself fails, so the breakage is silent. `detectMime` in that file lists webp, which is misleading -- it labels the mime type but Satori still can't read the pixels.

Blog images render through a plain `<img>` tag rather than `next/image` (removed deliberately in `cfaee5b`, because its cache served stale crops after an image was edited). So nothing resizes or compresses them automatically. That is a known, accepted tradeoff: file sizes run large. If you ever do optimize, stay in PNG or JPEG and verify the OG image by fetching the `opengraph-image` URL and confirming it returns 200 with the photo visible. Checking that the code mentions a format is not verification.

### 7. Production Build

```bash
pnpm build
```

Fix any errors before reporting success.

### 8. Report

Confirm:
- Post drafted at `blog/{slug}.md`
- Placeholder image at `public/blog/{slug}.png`
- Viewable at `/blog/{slug}`
- Appears on homepage Blog column and blog index
- Build passed
- Remind: replace placeholder with real image at `public/blog/{slug}.{png,jpg,webp}`

## Image Selection

The image is part of the post. It should feel inevitable — like the title and image were always meant for each other.

- **Symbolic over literal.** A photo of someone literally doing the thing is almost always wrong. Find the image that makes the point sideways. Darth Vader force-choking someone for "You Can't Force It." Chevy Chase grinning with a half-baked plan for "This Is Gonna Be Fun."
- **Cinematic and recognizable.** Something people feel immediately, even if they can't place it. Cultural moments, movie stills, iconic images — the recognizable creates instant connection.
- **A little humor goes a long way.** The image can be funnier than the post. That contrast — irreverent image, genuine depth inside — is the whole vibe.
- **Title and image click together last.** Often the right title only becomes obvious once the right image appears. Don't lock the title until you've thought about the image.
- **Reach for one deep cut.** A reference that reads naturally to any reader but rewards the ones who know it, ideally tied to the image. One is plenty.
- **Suggest image directions, don't just describe a placeholder.** Give the user 2-3 specific directions to explore — a movie scene, a cultural moment, a type of shot — and explain why each one might work.

## Key Decisions

- **This is a draft** -- the post will be iterated on after creation
- **Does NOT auto-commit** -- review before committing
- **Does run build** -- catches errors immediately
- **Always creates placeholder image** -- so cards render properly from the start
- **Reads conversation context** -- the best posts come from real conversations

## File Locations

- Posts: `blog/{slug}.md`
- Master placeholder: `public/blog/placeholder.png` (1200x630 dark gray PNG)
- Post images: `public/blog/{slug}.png` (placeholder initially, save over with real image; PNG or JPEG only, never webp)
- Blog index: `/blog`
- Individual post: `/blog/{slug}`
