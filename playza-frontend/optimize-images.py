#!/usr/bin/env python3
"""
Playza image optimizer
Run from the playza-frontend directory:
  python3 optimize-images.py

Converts all PNG/JPG in public/ to WebP (quality 82) and keeps the original
so nothing breaks immediately. After verifying the site works, delete originals.

WebP is ~30-60% smaller than PNG and supported by all modern browsers (98%+ global).
"""

import os
import sys
from pathlib import Path
from PIL import Image

PUBLIC = Path(__file__).parent / "public"
SKIP_DIRS = {"gameLib"}  # game engine assets — don't touch
QUALITY = 82             # good balance: visually lossless, ~40% smaller than PNG
MAX_DIM = 1200           # downscale anything wider/taller than this (game thumbnails don't need 4K)

converted = 0
skipped = 0
saved_bytes = 0

for img_path in sorted(PUBLIC.rglob("*")):
    # Skip game engine folders
    if any(skip in img_path.parts for skip in SKIP_DIRS):
        continue
    if img_path.suffix.lower() not in (".png", ".jpg", ".jpeg"):
        continue

    webp_path = img_path.with_suffix(".webp")
    if webp_path.exists():
        skipped += 1
        continue

    try:
        with Image.open(img_path) as im:
            # Preserve RGBA for PNGs with transparency
            if im.mode in ("RGBA", "LA"):
                out = im.convert("RGBA")
            else:
                out = im.convert("RGB")

            # Downscale if larger than MAX_DIM on either axis
            w, h = out.size
            if w > MAX_DIM or h > MAX_DIM:
                out.thumbnail((MAX_DIM, MAX_DIM), Image.LANCZOS)

            out.save(webp_path, "WEBP", quality=QUALITY, method=6)

        orig_size = img_path.stat().st_size
        webp_size = webp_path.stat().st_size
        saving = orig_size - webp_size
        saved_bytes += saving
        converted += 1
        print(f"  ✓ {img_path.relative_to(PUBLIC)}  {orig_size//1024}KB → {webp_size//1024}KB  (saved {saving//1024}KB)")

    except Exception as e:
        print(f"  ✗ {img_path.name}: {e}", file=sys.stderr)

print(f"\nDone: {converted} converted, {skipped} already existed")
print(f"Total saved: {saved_bytes / 1024 / 1024:.1f} MB")
print()
print("Next step: update src references from .png/.jpg → .webp")
print("Run:  grep -r '\\.png\\|.jpg' src/ --include='*.tsx' --include='*.ts' | grep -v node_modules")
