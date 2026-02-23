/*
 * ImageTintProvider
 *
 * Extracts the dominant color from a blog post's hero image and derives a
 * full tint palette so each post feels color-matched to its artwork.
 *
 * Pipeline:
 *   1. Draw the image onto a tiny 32x32 canvas to sample pixels
 *   2. Filter out near-black and desaturated pixels so shadows don't dominate
 *   3. Run k-means clustering (6 clusters, 5 iterations) to find color groups
 *   4. Pick the most prominent chromatic cluster as the "dominant" color
 *   5. Derive heading, subtitle, body, mid, and paper colors via HSL manipulation
 *   6. Set CSS custom properties (--ink, --body, --mid, --paper, etc.) on the wrapper
 *
 * Falls back to default theme colors on CORS errors or achromatic images.
 */
'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ImageTintProviderProps {
  imageSrc?: string
  children: ReactNode
}

type RGB = [number, number, number]
type HSL = [number, number, number]

function rgbToHsl([r, g, b]: RGB): HSL {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * Math.max(0, Math.min(1, c)))
  }
  return '#' + ((1 << 24) | (f(0) << 16) | (f(8) << 8) | f(4)).toString(16).slice(1)
}

function colorDist(a: RGB, b: RGB): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
}

// k-means clustering, 5 iterations
function findClusters(pixels: RGB[], k: number): { centroid: RGB; count: number }[] {
  if (pixels.length === 0) return []

  const step = Math.max(1, Math.floor(pixels.length / k))
  let centroids: RGB[] = Array.from({ length: k }, (_, i) =>
    [...pixels[Math.min(i * step, pixels.length - 1)]] as RGB
  )

  for (let iter = 0; iter < 5; iter++) {
    const sums: RGB[] = centroids.map(() => [0, 0, 0])
    const counts = new Array(k).fill(0)

    for (const px of pixels) {
      let best = 0, bestDist = Infinity
      for (let c = 0; c < k; c++) {
        const d = colorDist(px, centroids[c])
        if (d < bestDist) { bestDist = d; best = c }
      }
      sums[best][0] += px[0]
      sums[best][1] += px[1]
      sums[best][2] += px[2]
      counts[best]++
    }

    centroids = centroids.map((prev, i) =>
      counts[i] > 0
        ? [Math.round(sums[i][0] / counts[i]), Math.round(sums[i][1] / counts[i]), Math.round(sums[i][2] / counts[i])]
        : prev
    )
  }

  const results = centroids.map((centroid) => ({ centroid, count: 0 }))
  for (const px of pixels) {
    let best = 0, bestDist = Infinity
    for (let c = 0; c < k; c++) {
      const d = colorDist(px, centroids[c])
      if (d < bestDist) { bestDist = d; best = c }
    }
    results[best].count++
  }

  results.sort((a, b) => b.count - a.count)
  return results
}

// Filter out near-black and very desaturated pixels before clustering
// so dark shadows don't swamp the actual colorful content
function filterColorfulPixels(pixels: RGB[]): RGB[] {
  const filtered = pixels.filter(px => {
    const [, s, l] = rgbToHsl(px)
    return l > 0.1 && l < 0.9 && s > 0.1
  })
  // Fall back to all pixels if the image is mostly neutral
  return filtered.length > pixels.length * 0.05 ? filtered : pixels
}

// Pick the most dominant chromatic color by pixel count
function pickDominantColor(clusters: { centroid: RGB; count: number }[]): RGB {
  for (const { centroid } of clusters) {
    const [, s, l] = rgbToHsl(centroid)
    if (s > 0.15 && l > 0.1 && l < 0.85) return centroid
  }
  return clusters[0].centroid
}

// Headings: keep the dominant hue, clamp saturation to 45-75% so it pops
// without neon, and fix lightness at 75% for readability on dark backgrounds
function makeHeadingColor(dominant: RGB): string {
  const [h, s] = rgbToHsl(dominant)
  return hslToHex(h, Math.min(Math.max(s, 0.45), 0.75), 0.75)
}

// Subtitle: same hue, lower saturation band (35-55%) and higher lightness (85%)
// so it reads as a softer echo of the heading
function makeSubtitleColor(dominant: RGB): string {
  const [h, s] = rgbToHsl(dominant)
  return hslToHex(h, Math.min(Math.max(s, 0.35), 0.55), 0.85)
}

// Body text: nearly neutral -- just enough hue (8% saturation) to feel warm/cool
// without competing with headings. 68% lightness for comfortable reading
function makeBodyColor(dominant: RGB): string {
  const [h] = rgbToHsl(dominant)
  return hslToHex(h, 0.08, 0.682)
}

// Mid text (meta, byline): same minimal saturation as body, slightly darker (62%)
// to create a subtle hierarchy between body copy and secondary info
function makeMidColor(dominant: RGB): string {
  const [h] = rgbToHsl(dominant)
  return hslToHex(h, 0.08, 0.62)
}

// Paper background: dominant hue at 24% saturation and 10% lightness --
// just enough color to warm/cool the near-black without being visible as a "color"
function makePaperColor(dominant: RGB): string {
  const [h] = rgbToHsl(dominant)
  return hslToHex(h, 0.24, 0.10)
}

export default function ImageTintProvider({ imageSrc, children }: ImageTintProviderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(!imageSrc)

  useEffect(() => {
    if (!imageSrc) { setReady(true); return }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imageSrc

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 32
        canvas.height = 32
        const ctx = canvas.getContext('2d')
        if (!ctx) { setReady(true); return }

        ctx.drawImage(img, 0, 0, 32, 32)
        const data = ctx.getImageData(0, 0, 32, 32).data

        const allPixels: RGB[] = []
        for (let i = 0; i < data.length; i += 4) {
          allPixels.push([data[i], data[i + 1], data[i + 2]])
        }

        // Pre-filter: strip dark/neutral pixels so clustering focuses on color
        const pixels = filterColorfulPixels(allPixels)

        const clusters = findClusters(pixels, 6)
        if (clusters.length === 0) { setReady(true); return }

        const dominant = pickDominantColor(clusters)

        const el = wrapperRef.current
        if (el) {
          el.style.setProperty('--ink', makeHeadingColor(dominant))
          el.style.setProperty('--subtitle-color', makeSubtitleColor(dominant))
          el.style.setProperty('--body', makeBodyColor(dominant))
          el.style.setProperty('--mid', makeMidColor(dominant))
          el.style.setProperty('--paper', makePaperColor(dominant))
          el.style.setProperty('--card-bg', makePaperColor(dominant))
        }
      } catch {
        // CORS or canvas error — fall back to defaults
      }
      setReady(true)
    }

    img.onerror = () => setReady(true)
  }, [imageSrc])

  return (
    <div
      ref={wrapperRef}
      style={{
        opacity: ready ? 1 : 0,
        transition: 'opacity 0.6s ease',
        height: '100%',
      }}
    >
      {children}
    </div>
  )
}
