#!/usr/bin/env python3
from pathlib import Path
import re
import subprocess

root = Path(__file__).resolve().parent
svg = root / "assets/pt-mark.svg"
out32 = root / "assets/favicon-32.png"
out180 = root / "assets/apple-touch-icon.png"
ico = root / "assets/favicon.ico"
ok = False

try:
    import cairosvg
    cairosvg.svg2png(url=str(svg), write_to=str(out32), output_width=32, output_height=32)
    cairosvg.svg2png(url=str(svg), write_to=str(out180), output_width=180, output_height=180)
    ok = True
    print("cairosvg ok")
except Exception as e:
    print("cairosvg fail", e)

if not ok:
    ok32 = ok180 = False
    for cmd in (
        ["rsvg-convert", "-w", "32", "-h", "32", str(svg), "-o", str(out32)],
        ["magick", "-background", "none", str(svg), "-resize", "32x32", str(out32)],
    ):
        try:
            subprocess.check_call(cmd)
            print("used", cmd[0], "for 32")
            ok32 = True
            break
        except Exception as e:
            print("fail", cmd[0], e)
    for cmd in (
        ["rsvg-convert", "-w", "180", "-h", "180", str(svg), "-o", str(out180)],
        ["magick", "-background", "none", str(svg), "-resize", "180x180", str(out180)],
    ):
        try:
            subprocess.check_call(cmd)
            print("used", cmd[0], "for 180")
            ok180 = True
            break
        except Exception as e:
            print("fail", cmd[0], e)
    ok = ok32 and ok180

if not ok:
    from PIL import Image, ImageDraw

    def make(size, path):
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        for y in range(size):
            t = y / (size - 1)
            r = int(2 + (29 - 2) * t)
            g = int(6 + (95 - 6) * t)
            b = int(23 + (214 - 23) * t)
            if t < 0.4:
                k = t / 0.4
                r = int(2 * (1 - k) + r * k)
                g = int(6 * (1 - k) + g * k)
                b = int(23 * (1 - k) + b * k)
            d.line([(0, y), (size, y)], fill=(r, g, b, 255))
        mask = Image.new("L", (size, size), 0)
        md = ImageDraw.Draw(mask)
        rad = int(size * 0.25)
        md.rounded_rectangle([0, 0, size - 1, size - 1], radius=rad, fill=255)
        base = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        base.paste(img, (0, 0))
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(base, (0, 0), mask)
        d = ImageDraw.Draw(out)
        m = float(size)
        x0, x1 = m * 0.25, m * 0.75
        y0, y1 = m * 0.22, m * 0.38
        stem_w = m * 0.18
        sx0 = (m - stem_w) / 2
        sx1 = sx0 + stem_w
        sy1 = m * 0.78
        rr = max(2, int(m * 0.04))
        d.rounded_rectangle([x0, y0, x1, y1], radius=rr, fill=(255, 255, 255, 255))
        d.rounded_rectangle([sx0, y0 + m * 0.08, sx1, sy1], radius=rr, fill=(255, 255, 255, 255))
        overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.rounded_rectangle([x0, y0, x1, y1], radius=rr, fill=(158, 192, 255, 40))
        od.rounded_rectangle([sx0, y0 + m * 0.08, sx1, sy1], radius=rr, fill=(158, 192, 255, 70))
        out = Image.alpha_composite(out, overlay)
        out.save(path)
        print("wrote pillow", path, size)

    make(32, out32)
    make(180, out180)

from PIL import Image
im = Image.open(out32).convert("RGBA")
im.save(ico, format="ICO", sizes=[(32, 32)])
print("ico ok", ico.stat().st_size)
print("png sizes", out32.stat().st_size, out180.stat().st_size)

ver = "t-letter-2"
old_patterns = [
    r"v=t-mark-1",
    r"v=capital-3",
    r"v=skyline-2",
    r"v=building-mark-1",
    r"v=header-stack-1",
    r"v=t-letter-\d+",
]
count = 0
for p in root.rglob("*.html"):
    if "private" in p.parts:
        continue
    txt = p.read_text()
    new = txt
    for pat in old_patterns:
        new = re.sub(pat, f"v={ver}", new)
    new2 = re.sub(r"(pt-mark\.svg)(\?v=[^\"]+)?", rf"\1?v={ver}", new)
    new2 = re.sub(r"(favicon\.svg)(\?v=[^\"]+)?", rf"\1?v={ver}", new2)
    new2 = re.sub(r"(favicon\.ico)(\?v=[^\"]+)?", rf"\1?v={ver}", new2)
    new2 = re.sub(r"(favicon-32\.png)(\?v=[^\"]+)?", rf"\1?v={ver}", new2)
    new2 = re.sub(r"(apple-touch-icon\.png)(\?v=[^\"]+)?", rf"\1?v={ver}", new2)
    if new2 != txt:
        p.write_text(new2)
        count += 1
        print("updated", p.name)
print("files", count)
