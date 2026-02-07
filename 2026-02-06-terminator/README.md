# Terminator - Text Scramble

**Date:** February 6, 2026
**Type:** Interactive Typography / Text Animation

## Overview

A terminal-style text scramble effect inspired by sci-fi interfaces like Terminator and Ghost in the Shell. Features a two-phase animation where text scrambles chaotically before resolving sequentially line-by-line. Users can input custom text to see it animated with the signature split-flap aesthetic.

## Key Features

- **Two-phase animation**: 1 second of pure scramble, then sequential line-by-line resolution
- **Custom text input**: Textarea with Submit/Clear controls for experimenting with any text
- **Automatic uppercase conversion**: All text converted to terminal-style caps
- **Balanced line breaking**: Smart algorithm distributes text evenly across lines (10-15 words per line)
- **Click to replay**: Tap anywhere on the resolved text to restart the animation
- **Ghost in the Shell default**: Philosophical quote about identity and consciousness

## Design Principles

- **Terminal authenticity**: Black background, monospaced font (Space Mono), character-level precision
- **Split-flap mechanics**: Characters scramble independently like old airport displays
- **Sequential reveal**: Lines resolve top-to-bottom for satisfying read progression
- **Parametric system**: Any text input works with the same high-quality animation

## How to Run

1. Open `index.html` in a browser
2. Watch the default Ghost in the Shell quote animate on load
3. Enter custom text in the textarea and click Submit to see it scramble
4. Click the Clear button to return to the default text
5. Click anywhere on the resolved text to replay the animation

**Keyboard shortcut:** Shift+Enter to submit text from textarea

## Dependencies

- **Space Mono** (Google Fonts) - Monospaced font for terminal aesthetic
- **Geist Pixel Square** (Vercel CDN) - Used in earlier iterations, now referenced but not actively used

## Technical Implementation

- **Line breaking algorithm**: Targets ~75 characters per line, balances character counts while respecting punctuation breaks
- **Animation timing**: 50 ticks/second (20ms intervals), 3 characters resolved per tick
- **Character scramble**: Letters scramble with uppercase, numbers with numbers, spaces/punctuation become random alphanumerics
- **Layout technique**: Placeholder/absolute positioning prevents layout jitter during animation

## Screenshots

See `screenshots/` folder for visual documentation of the experiment.
