# image-prep

Prepare images for use in experiments — resize, crop, convert, and generate Next.js markup.

## Usage

```
/image-prep public/crossfit/*.jpg --sizes hero,card,thumb
/image-prep public/blog/my-image.png --aspect 16:9 --width 1200
/image-prep public/screenshots/ --optimize
```

## What It Does

1. **Analyze**: Report current dimensions, file size, and format for target images
2. **Resize/Crop**: To standard presets or custom dimensions
3. **Optimize**: Compress with sharp-cli (already a dev dependency)
4. **Convert**: Generate WebP variants alongside originals
5. **Output markup**: Next.js `<Image>` component with correct width/height/alt

## Standard Presets

| Preset   | Dimensions  | Aspect | Use Case                    |
|----------|-------------|--------|-----------------------------|
| `hero`   | 1920x1080   | 16:9   | Full-width hero images      |
| `card`   | 800x600     | 4:3    | Gallery cards, thumbnails   |
| `thumb`  | 400x300     | 4:3    | Small previews              |
| `og`     | 1200x630    | ~1.9:1 | Open Graph / social sharing |
| `square` | 800x800     | 1:1    | Profile, avatar, icon       |
| `screenshot` | 1280x720 | 16:9  | Experiment screenshots      |

## Steps

1. **Scan**: Read target files/directory, report what's there (dimensions, size, format)
2. **Plan**: Show what will be generated based on requested presets or dimensions
3. **Confirm**: Use AskUserQuestion — show the plan, let user approve or adjust
4. **Process**: Run sharp-cli commands:
   ```bash
   # Resize maintaining aspect (cover crop from center)
   npx sharp-cli resize <width> <height> --fit cover -i input.jpg -o output.jpg

   # Convert to WebP
   npx sharp-cli --format webp -q 85 -i input.jpg -o output.webp

   # Optimize in place
   npx sharp-cli resize <original-width> --quality 85 -i input.jpg -o input.jpg
   ```
5. **Generate markup**: Output Next.js `<Image>` component code for each processed image

## Output Markup

For each processed image, provide ready-to-paste JSX:

```tsx
import Image from 'next/image';

<Image
  src="/path/to/image.jpg"
  alt="" {/* User fills in */}
  width={1200}
  height={630}
  className={styles.hero}
/>
```

## Optimization-Only Mode

When called with `--optimize` (no resize):
1. Scan all images in the directory
2. Report sizes, flag anything over 500KB
3. Compress oversized images with sharp (quality 85)
4. Report savings (before/after sizes)

## Guidelines

- Never upscale — only downscale or skip if already smaller than target
- Always preserve originals when generating new sizes (suffix: `-hero`, `-card`, etc.)
- WebP conversion: quality 85 is the sweet spot for photo content
- For PNG screenshots, keep as PNG (WebP doesn't always help for flat graphics)
- Report total size savings at the end
- Don't touch images that are already optimized (under 200KB for cards, under 500KB for heroes)

## Dependencies

- `sharp-cli` (already a dev dependency)
- `next/image` (already in project)
