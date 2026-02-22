---
name: bitmap-to-vector
description: >
  Convert raster/bitmap images (PNG, JPG, BMP, etc.) to clean SVG vector files
  using potrace-based tracing. Use this skill whenever the user wants to vectorize
  an image, trace a bitmap, convert a raster image to SVG, create an icon from a
  photo or illustration, or extract vector shapes from a bitmap. Also trigger when
  the user uploads an image and asks for it "as a vector", "as SVG", "as an icon",
  or mentions "tracing" in the context of images. This includes logos, icons,
  illustrations, silhouettes, pixel art, hand-drawn sketches, or any raster artwork
  the user wants in vector format.
---

# bitmap-to-vector

Turn raster images into clean SVG vectors. Logos, icons, illustrations, sketches, silhouettes — anything you'd normally open Illustrator or Inkscape for, but without leaving the terminal.

## Usage

```
"Vectorize this skull image for me"
"I need this logo as an SVG"
"Trace this sketch and put it in src/assets"
[pasted image] "make this an icon"
```

## How It Works

There's a bundled Python script at `scripts/trace.py` (relative to this skill's directory) that wraps potrace — the same tracing engine behind Inkscape. It handles the full pipeline: load the image, figure out what's foreground vs background, threshold to black and white, clean up noise, crop to content, trace smooth bezier curves, strip any bounding rectangle, and output a single-path SVG.

The script auto-installs its own dependencies (`potracer`, `opencv-python-headless`, `cairosvg`) so it works in any environment without prior setup.

## What the Output SVG Is

The SVG is a **flat icon-ready vector**. The paths trace the subject (the dark ink, the logo shape, the silhouette) as filled regions. The background is transparent. `fill="currentColor"` means the icon inherits whatever CSS color is set on its parent — white text context = white icon, dark text context = dark icon.

This is the same format as any standard inline SVG icon (GitHub, Twitter, etc.). It works at any size, in any color, in light or dark themes.

## Workflow

### 1. Find the image

The user will upload an image, reference a file on disk, or paste one inline. Locate it — check uploads, the working directory, or ask if you can't find it.

### 2. Run the tracer

```bash
python3 SKILL_DIR/scripts/trace.py INPUT_IMAGE OUTPUT.svg --preview 512
```

Replace `SKILL_DIR` with the actual path to this skill directory. The `--preview 512` flag renders a PNG alongside the SVG so you can visually verify the result.

For most images, the defaults work well. The script auto-detects:
- **Threshold** via Otsu's method (adaptive to the image's histogram)
- **Polarity** by checking border pixels (figures out light-on-dark vs dark-on-light)
- **Bounding rectangle removal** — potrace sometimes wraps output in a full-image rectangle that inverts the fill. The script detects and strips this automatically.

### 3. Check the preview

Read the generated preview PNG and look at it. The preview always renders **black shapes on a white background** — it shows exactly what the traced paths look like as a dark icon on a light page. The JSON output also includes a `polarity` field describing how the script decided what to trace.

You're checking for:
- The black shapes in the preview ARE the subject (the icon, logo, figure) — not a filled rectangle with the subject cut out as a hole
- All the important features came through (nothing missing)
- No noise or texture artifacts crept in

If you see a filled rectangle with the subject as negative space, something went wrong with the bounding rect detection — see "Adjust if needed" below.

### 4. Adjust if needed

If the first pass isn't right, tune with flags:

| Problem | Fix |
|---------|-----|
| Missing fine detail | `--detail high` |
| Noisy / texture artifacts | `--detail low` or `--blur 9` |
| Traced the background instead of subject | `--invert` |
| Too much or too little traced | `--threshold 80` (lower captures more) |
| Want maximum fidelity | `--detail high --blur 3` |
| Want a clean silhouette | `--detail low --blur 9` |

### 5. Place the SVG

Put it where the user expects:
- Their project's asset directory (`src/assets/`, `public/icons/`, etc.)
- The working directory / Desktop
- Wherever they tell you

Clean up the preview PNG after you've verified the trace — the user only needs the SVG.

### 6. Using the SVG in code

**The SVG uses `fill="currentColor"` — it only works correctly when the browser can resolve that value.** This is critical for getting the icon to render as expected.

How to use it:

| Method | Works with currentColor? | Notes |
|--------|--------------------------|-------|
| **Inline `<svg>`** | Yes | Best option. Paste the SVG markup directly. Color inherits from parent CSS `color`. |
| **CSS mask** | Yes | `mask: url('/icon.svg') center/contain no-repeat` on a `<span>` with a `background` color. |
| **`<img>` / Next.js `<Image>`** | **No** | `currentColor` has no CSS context inside `<img>`. The icon renders black or invisible. |

**Do NOT use `<img>` or framework image components for currentColor SVGs.** This is the most common mistake. If you need to use `<img>`, re-run the tracer with `--fill black` or `--fill white` to bake in a fixed color.

For React/Next.js, the CSS mask pattern is clean and minimal:

```css
.icon {
  width: 24px;
  height: 24px;
  background: currentColor;
  mask: url('/icon.svg') center / contain no-repeat;
  -webkit-mask: url('/icon.svg') center / contain no-repeat;
}
```

## Script Options

```
python3 trace.py INPUT OUTPUT.svg [options]

  --threshold N      Brightness cutoff 0-255 (default: auto)
  --invert           Trace dark regions instead of light
  --detail LEVEL     "high" / "medium" / "low" — presets for detail vs cleanliness
  --turdsize N       Suppress features < N pixels (default: 50)
  --smoothing N      Curve smoothness 0.0-1.34 (default: 1.0)
  --blur N           Gaussian blur kernel size (default: 5)
  --no-crop          Keep original image dimensions
  --padding N        Content padding in px (default: 10)
  --preview N        Render a PNG preview at width N
  --fill VALUE       SVG fill attribute (default: "currentColor")
```

## Notes on the Output

- **`fill="currentColor"`** — the SVG inherits whatever text color is set in CSS context. Perfect for icons that need to work in light and dark themes. Override with `--fill black` or `--fill "#e00"` for a fixed color.
- **Single `<path>` element** with `fill-rule="evenodd"` — holes (eye sockets, letter counters, cutouts) render correctly without extra markup.
- **No bounding rectangle** — the script auto-strips any full-viewBox rectangle that potrace generates, so the paths are just the subject with transparent background.
- **Scalable** — viewBox is set to content dimensions, so the SVG works at any size from favicon to billboard.
- **~5-15KB** for typical icons. Complex illustrations will be larger but still much smaller than the source bitmap.

## Dependencies

The script installs these automatically on first run:
- `opencv-python-headless` — image loading and preprocessing
- `potracer` — Python bindings for potrace
- `cairosvg` — PNG preview rendering (only needed with `--preview`)

If auto-install fails: `pip install opencv-python-headless potracer cairosvg --break-system-packages`
