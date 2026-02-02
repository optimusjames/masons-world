# Day at a Glance

**Date:** January 28, 2026 (Updated February 2, 2026)
**Type:** Timeline / UI Component

## Overview
A timeline-based daily schedule interface using a clean 3-column CSS grid layout. Features colored sidebar bars with icons, hourly event cards, and a subtle "now" indicator line that shows through semi-transparent elements.

## Key Features
- 3-column grid layout (hour numbers, colored bars, event cards)
- Fixed 100px row height with continuous horizontal hour lines
- SVG icons on colored sidebar bars (workout, shower, breakfast, email)
- Subtle "now" indicator line visible through 90% opacity cards
- Split color bar showing past/upcoming time division
- Past events displayed with grayed styling
- Interactive checkboxes with color-coded borders

## Design Principles
- Dark theme (#1a1a1a background)
- Vibrant accent colors (blue, orange, purple, pink)
- 3-column CSS grid with 8px gaps
- Z-index layering for now-line visibility through cards
- Continuous hour lines extended with negative margins
- Clean visual hierarchy without unnecessary UI chrome

## Grid Structure
```
| Col 1 (50px)  | Col 2 (28px)    | Col 3 (1fr)    |
|---------------|-----------------|----------------|
| 07 + v-line   | gray bar + icon | Morning Workout|
| 08 + v-line   | split bar       | Shower         |
| 09 + v-line   | orange bar      | Breakfast      |
| 10 + v-line   | purple bar      | Check Email    |
```

## How to Run
Open `index.html` in a browser or use:
```bash
npm run dev
```

## Dependencies
- Google Fonts: Inter (400, 500, 600, 700)

## Screenshots
See `screenshots/` folder for design iterations.
