# CrossFit Design Challenge

Parallel agent team experiment: 4 autonomous agents each built a CrossFit homepage for "IRON REPUBLIC" gym, coordinated by a lead agent.

## Structure
```
page.tsx              # Showcase: 2x2 gallery + full-page viewer (useState toggle)
styles.css            # Showcase styles (Bitter title, Geist Pixel labels, #111 bg)
data/designers.ts     # Designer metadata (name, tags, accent color)
components/
  DesignBrutal.tsx + .module.css     # Marcus Voss - #0a0a0a, Oswald, #ff3333
  DesignMinimal.tsx + .module.css    # Elise Nakamura - #fafafa, Playfair Display, #94a3b8
  DesignEditorial.tsx + .module.css  # Sofia Reyes - #fdf6e3, Lora, #d97706
  DesignTechData.tsx + .module.css   # James Chen - #0f172a, Inter, #6366f1
```

## Key Patterns
- CSS Modules (`.module.css`) per design to prevent collisions
- Showcase page uses plain `styles.css` per repo convention
- Each design: `'use client'`, default export, no props, `min-height: 100vh`
- Google Fonts loaded via `@import` in each CSS module
- No images -- CSS gradients/solid blocks as photo placeholders
- Gallery cards show miniature preview via `transform: scale(0.35)` in overflow-hidden
- Full-page view uses `position: fixed; inset: 0` with floating back button

## Shared Gym Content
IRON REPUBLIC CrossFit, 1847 Industrial Blvd, Austin, TX
- Classes: WOD, Olympic Lifting, Endurance, Mobility, Open Gym
- 4 coaches: Rex Dalton, Maria Santos, Jamal Wright, Kira Volkov
- Pricing: Drop-in $25, Monthly $149, Unlimited $199
- All designs have 6 sections: Hero, Classes, Coaches, Testimonials, Pricing, Footer

## Fonts Used
- Showcase title: Bitter (serif)
- "Agentic Designer" subtitle + tag labels: Geist Pixel Square
- Tag labels styled like design-experiments index page
