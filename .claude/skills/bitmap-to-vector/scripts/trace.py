#!/usr/bin/env python3
"""
Bitmap-to-vector tracer using potrace.

Converts raster images (PNG, JPG, BMP, etc.) to clean SVG vector files.
Handles preprocessing (thresholding, noise removal, cropping) automatically,
with options to tune the output for different use cases.

Usage:
    python trace.py INPUT_IMAGE OUTPUT_SVG [options]

Options:
    --threshold VALUE     Brightness cutoff (0-255). Pixels above this become
                          the traced shape. Default: auto-detect.
    --invert              Trace dark areas instead of light areas.
    --turdsize VALUE      Ignore features smaller than this (in pixels).
                          Higher = cleaner but less detail. Default: 50.
    --smoothing VALUE     Curve smoothness (0.0 = tight corners, 1.34 = max smooth).
                          Default: 1.0.
    --detail VALUE        Shorthand: "high" (turdsize=10, smoothing=0.5),
                          "medium" (turdsize=50, smoothing=1.0),
                          "low" (turdsize=150, smoothing=1.2).
    --blur VALUE          Gaussian blur kernel size (odd number). Reduces texture/grain
                          noise before tracing. Default: 5.
    --no-crop             Don't auto-crop to content bounds.
    --padding VALUE       Padding around cropped content in pixels. Default: 10.
    --preview SIZE        Also render a PNG preview at this width (e.g., --preview 512).
    --fill COLOR          SVG fill attribute. Default: "currentColor".
"""

import sys
import os
import argparse
import json
import numpy as np

def ensure_dependencies():
    """Install required packages if missing."""
    required = {
        'cv2': 'opencv-python-headless',
        'potrace': 'potracer',
    }
    missing = []
    for module, package in required.items():
        try:
            __import__(module)
        except ImportError:
            missing.append(package)

    if missing:
        import subprocess
        for pkg in missing:
            print(f"Installing {pkg}...", file=sys.stderr)
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install', pkg,
                '--break-system-packages', '-q'
            ])

ensure_dependencies()

import cv2
import potrace


def auto_threshold(gray):
    """Determine optimal threshold using Otsu's method."""
    val, _ = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return val


def detect_polarity(gray, threshold):
    """Detect whether the subject is light-on-dark or dark-on-light.

    Returns True if the image should be inverted (subject is light on dark background).
    Checks the border pixels — if most of the border is dark, the subject is likely light.
    """
    h, w = gray.shape
    border = np.concatenate([
        gray[0, :], gray[-1, :],  # top and bottom rows
        gray[:, 0], gray[:, -1],  # left and right columns
    ])
    border_mean = border.mean()
    # If border is mostly dark, subject is light (don't invert — trace light areas)
    # If border is mostly light, subject is dark (invert to trace dark areas)
    return border_mean > threshold


def preprocess(image_path, threshold=None, invert=False, blur_size=5):
    """Load image and create a clean binary bitmap for tracing.

    Returns:
        binary: numpy bool array where True = area to trace
        original_shape: (h, w) of the input image
    """
    img = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(f"Could not load image: {image_path}")

    # Handle alpha channel — composite onto white
    if len(img.shape) == 3 and img.shape[2] == 4:
        alpha = img[:, :, 3].astype(float) / 255.0
        white_bg = np.ones_like(img[:, :, :3], dtype=np.uint8) * 255
        rgb = img[:, :, :3].astype(float)
        composited = (rgb * alpha[:, :, np.newaxis] +
                      white_bg * (1 - alpha[:, :, np.newaxis]))
        img = composited.astype(np.uint8)

    # Convert to grayscale
    if len(img.shape) == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img

    # Apply blur to reduce noise/texture
    if blur_size > 1:
        if blur_size % 2 == 0:
            blur_size += 1
        gray = cv2.GaussianBlur(gray, (blur_size, blur_size), 0)

    # Determine threshold
    if threshold is None:
        threshold = auto_threshold(gray)

    # Auto-detect polarity if not explicitly set
    if not invert and detect_polarity(gray, threshold):
        invert = True

    # Apply threshold
    _, binary = cv2.threshold(gray, threshold, 255, cv2.THRESH_BINARY)

    if invert:
        binary = 255 - binary

    # Light morphological cleanup
    kernel = np.ones((3, 3), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel, iterations=2)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel, iterations=1)

    return (binary > 128).astype(np.bool_), gray.shape


def crop_to_content(bitmap, padding=10):
    """Crop bitmap to bounding box of content, with padding.

    Returns:
        cropped: the cropped bitmap
        offset: (x_offset, y_offset) for coordinate adjustment
    """
    rows = np.any(bitmap, axis=1)
    cols = np.any(bitmap, axis=0)

    if not rows.any():
        return bitmap, (0, 0)

    y_min, y_max = np.where(rows)[0][[0, -1]]
    x_min, x_max = np.where(cols)[0][[0, -1]]

    # Apply padding
    h, w = bitmap.shape
    y_min = max(0, y_min - padding)
    y_max = min(h, y_max + padding + 1)
    x_min = max(0, x_min - padding)
    x_max = min(w, x_max + padding + 1)

    return bitmap[y_min:y_max, x_min:x_max], (x_min, y_min)


def trace_to_svg(bitmap, turdsize=50, alphamax=1.0, opttolerance=0.2, fill="currentColor"):
    """Run potrace on a boolean bitmap and generate SVG path data.

    Args:
        bitmap: numpy bool array
        turdsize: suppress features smaller than this many pixels
        alphamax: corner threshold (0 = sharp corners, 1.34 = smooth)
        opttolerance: curve optimization tolerance (lower = more faithful)
        fill: SVG fill attribute value

    Returns:
        svg: complete SVG string
        stats: dict with path count, viewBox dimensions
    """
    h, w = bitmap.shape

    bmp = potrace.Bitmap(bitmap)
    path = bmp.trace(
        turdsize=turdsize,
        alphamax=alphamax,
        opticurve=True,
        opttolerance=opttolerance,
    )

    svg_paths = []
    for curve in path.curves:
        start = curve.start_point
        d = f"M{start.x:.2f},{start.y:.2f}"

        for seg in curve.segments:
            if seg.is_corner:
                d += f"L{seg.c.x:.2f},{seg.c.y:.2f}"
                d += f"L{seg.end_point.x:.2f},{seg.end_point.y:.2f}"
            else:
                d += (f"C{seg.c1.x:.2f},{seg.c1.y:.2f} "
                      f"{seg.c2.x:.2f},{seg.c2.y:.2f} "
                      f"{seg.end_point.x:.2f},{seg.end_point.y:.2f}")

        d += "Z"
        svg_paths.append(d)

    combined = " ".join(svg_paths)

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {w} {h}" fill="{fill}">\n'
        f'  <path fill-rule="evenodd" d="{combined}"/>\n'
        f'</svg>\n'
    )

    stats = {
        "paths": len(svg_paths),
        "width": w,
        "height": h,
        "svg_bytes": len(svg.encode('utf-8')),
    }

    return svg, stats


def render_preview(svg_path, output_path, width):
    """Render SVG to PNG at the given width."""
    try:
        import cairosvg
    except ImportError:
        import subprocess
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', 'cairosvg',
            '--break-system-packages', '-q'
        ])
        import cairosvg

    cairosvg.svg2png(url=svg_path, write_to=output_path, output_width=width)


def main():
    parser = argparse.ArgumentParser(description='Trace bitmap image to SVG vector')
    parser.add_argument('input', help='Input image path (PNG, JPG, BMP, etc.)')
    parser.add_argument('output', help='Output SVG path')
    parser.add_argument('--threshold', type=int, default=None,
                        help='Brightness threshold (0-255). Default: auto-detect via Otsu.')
    parser.add_argument('--invert', action='store_true',
                        help='Trace dark areas instead of light areas')
    parser.add_argument('--turdsize', type=int, default=50,
                        help='Suppress features smaller than N pixels (default: 50)')
    parser.add_argument('--smoothing', type=float, default=1.0,
                        help='Curve smoothness 0.0-1.34 (default: 1.0)')
    parser.add_argument('--detail', choices=['high', 'medium', 'low'],
                        help='Shorthand for turdsize + smoothing presets')
    parser.add_argument('--blur', type=int, default=5,
                        help='Gaussian blur kernel size (default: 5)')
    parser.add_argument('--no-crop', action='store_true',
                        help="Don't auto-crop to content bounds")
    parser.add_argument('--padding', type=int, default=10,
                        help='Padding around cropped content (default: 10)')
    parser.add_argument('--preview', type=int, default=None,
                        help='Render a PNG preview at this width')
    parser.add_argument('--fill', default='currentColor',
                        help='SVG fill value (default: currentColor)')

    args = parser.parse_args()

    # Apply detail presets
    if args.detail:
        presets = {
            'high':   {'turdsize': 10,  'smoothing': 0.5},
            'medium': {'turdsize': 50,  'smoothing': 1.0},
            'low':    {'turdsize': 150, 'smoothing': 1.2},
        }
        p = presets[args.detail]
        args.turdsize = p['turdsize']
        args.smoothing = p['smoothing']

    # Preprocess
    bitmap, original_shape = preprocess(
        args.input,
        threshold=args.threshold,
        invert=args.invert,
        blur_size=args.blur,
    )

    # Crop
    if not args.no_crop:
        bitmap, offset = crop_to_content(bitmap, padding=args.padding)

    # Trace
    svg, stats = trace_to_svg(
        bitmap,
        turdsize=args.turdsize,
        alphamax=args.smoothing,
        opttolerance=0.2,
        fill=args.fill,
    )

    # Write SVG
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, 'w') as f:
        f.write(svg)

    # Render preview if requested
    if args.preview:
        preview_path = args.output.rsplit('.', 1)[0] + '-preview.png'
        render_preview(args.output, preview_path, args.preview)
        stats['preview'] = preview_path

    # Print stats as JSON for easy parsing
    print(json.dumps(stats, indent=2))


if __name__ == '__main__':
    main()
