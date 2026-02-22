---
description: Client-side contact sheet for browsing, selecting, and downloading images from a local folder
---

## Overview

A browser-based contact sheet. Pick a folder of images from your device, browse them in a grid, select picks, and download selections as a zip. Nothing gets uploaded -- everything stays in the browser using `URL.createObjectURL` and JSZip.

## Key Components

- `app/design-experiments/contact-sheet/types.ts` -- `ImageEntry` interface (name, size, url, relPath)
- `app/design-experiments/contact-sheet/components/ContactSheet.tsx` -- grid, selection state, sidebar, zip download
- `app/design-experiments/contact-sheet/components/ContactSheet.module.css` -- all styling
- `app/design-experiments/contact-sheet/index.ts` -- barrel export
- `app/design-experiments/contact-sheet/page.tsx` -- experiment page with folder picker

## Architecture

**Barrel export** makes the component importable by any consumer:

```tsx
import { ContactSheet } from '@/app/design-experiments/contact-sheet'
import type { ImageEntry } from '@/app/design-experiments/contact-sheet'
```

**Props**:

| Prop | Type | Description |
|------|------|-------------|
| `images` | `ImageEntry[]` | Array of images to display |
| `title` | `string` | Header title (default: "Images") |
| `className` | `string` | Additional root class |
| `headerExtra` | `ReactNode` | Slot for extra header controls (e.g. "Change Folder" button) |
| `onSelectionChange` | `(selected: ImageEntry[]) => void` | Callback when selection changes |

**Data flow**: The experiment page owns the file picker and converts `FileList` into `ImageEntry[]` via `URL.createObjectURL`. The `ContactSheet` component is stateless with respect to file I/O -- it only knows about image entries it receives.

## Selection and Download

Click any image to toggle selection. Selected images appear in a slide-out sidebar with:

- **Copy List** -- copies filenames to clipboard, one per line
- **Download** -- bundles selected images into a zip using JSZip and triggers a browser download
- **Clear** -- deselects all

The sidebar opens automatically when any image is selected and collapses when cleared.

## File Handling

The folder picker uses the non-standard `webkitdirectory` attribute (widely supported in Chrome, Edge, Firefox, Safari). Files are filtered to image extensions (`jpg`, `png`, `gif`, `webp`, `avif`, `svg`, `bmp`, `tiff`) and sorted by `lastModified` descending. Object URLs are revoked when a new folder is picked to prevent memory leaks.

## Related Files

- `app/design-experiments/contact-sheet/` -- component, types, experiment page
- `.claude/skills/contact-sheet.md` -- Claude Code skill for generating contact sheets from a directory
