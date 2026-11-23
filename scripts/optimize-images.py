"""Refresh WebP variants without altering the CMS originals. Requires Pillow."""
import json
from pathlib import Path

from PIL import Image


def optimize(source, sizes):
    with Image.open(source) as image:
        variants = {}
        for label, limit in sizes.items():
            target = source.with_name(f"{source.stem}-{label}.webp")
            rendition = image.copy()
            rendition.thumbnail((limit, limit), Image.Resampling.LANCZOS)
            if rendition.mode not in ("RGB", "RGBA"):
                rendition = rendition.convert("RGBA" if "transparency" in image.info else "RGB")
            rendition.save(target, "WEBP", quality=86, method=6)
            variants[label] = {
                "url": "/" + target.as_posix(),
                "width": rendition.width,
                "height": rendition.height,
            }
        return variants


assets = Path("assets")
manifest = {}
for folder in ("portfolio", "blog"):
    for source in sorted((assets / folder).iterdir()):
        if source.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        sizes = {"full": 1600, "preview": 680}
        manifest["/" + source.as_posix()] = optimize(source, sizes)
profile = assets / "mustafa-anil-aslakci.jpg"
manifest["/" + profile.as_posix()] = optimize(profile, {"full": 800, "preview": 400})
Path("data/image-variants.json").write_text(
    json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
)
