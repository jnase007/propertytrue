#!/usr/bin/env python3
import re
import ssl
import urllib.request
from pathlib import Path

base = "https://propertytrue.com"
ctx = ssl.create_default_context()
paths = [
    "/",
    "/about.html",
    "/track-record.html",
    "/thesis.html",
    "/partners.html",
    "/network.html",
    "/access.html",
    "/approach.html",
    "/privacy.html",
    "/truestorage-menifee.html",
    "/truestorage-menifee-deck.html",
    "/truestorage-returns-calculator.html",
    "/ie-self-storage-market-report.html",
    "/menifee-storage-plan.html",
    "/truehold-menifee.html",
    "/truehold-menifee-deck.html",
    "/truehold-returns-calculator.html",
    "/trustorage-menifee.html",
    "/assets/pt-mark.svg",
    "/assets/favicon.svg",
    "/styles.css?v=about-contrast-1",
    "/site.js",
    "/robots.txt",
    "/sitemap.xml",
]


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "PropertyTrueQA/1.0", "Cache-Control": "no-cache"},
    )
    with urllib.request.urlopen(req, context=ctx, timeout=25) as response:
        return (
            response.status,
            response.geturl(),
            response.read(),
            response.headers.get("content-type", ""),
        )


print("STATUS CHECK")
bodies = {}
for path in paths:
    try:
        code, final, data, ctype = fetch(base + path)
        bodies[path] = data
        print(f"{code} {path} -> {final} [{ctype}] {len(data)}b")
    except Exception as exc:
        print("ERR", path, exc)

issues = []
print("\nHTML QA")
for path in [p for p in paths if p.endswith(".html") or p == "/"]:
    data = bodies.get(path)
    if not data:
        continue
    text = data.decode("utf-8", "replace")
    css = re.findall(r"styles\.css\?v=([^\"']+)", text)
    marks = re.findall(r"pt-mark\.svg\?v=([^\"']+)", text)
    bgs = re.findall(r"bg-type bg-type-([a-z-]+)", text)
    title = re.search(r"<title>(.*?)</title>", text)
    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", text, re.S)
    h1_clean = [" ".join(re.sub(r"<[^>]+>", " ", h).split()) for h in h1s]
    imgs = re.findall(r"<img\b[^>]*>", text)
    missing_alt = [i for i in imgs if "alt=" not in i]
    leak_terms = [
        "preferred return",
        "pref coupon",
        "minimum investment",
        "cash-on-cash",
        "invest now",
        "wire instructions",
    ]
    leaks = [t for t in leak_terms if t.lower() in text.lower()]
    print(f"\n{path}")
    print(" title:", title.group(1) if title else None)
    print(" css:", set(css), "marks", set(marks), "bgs", set(bgs))
    print(" h1s:", h1_clean)
    print(" imgs", len(imgs), "missing_alt", len(missing_alt))
    if leaks:
        print(" LEAK?", leaks)
        issues.append((path, "leak", leaks))
    if missing_alt:
        issues.append((path, "missing_alt", len(missing_alt)))
    if css and any(v != "about-contrast-1" for v in css):
        issues.append((path, "css_version", css))
    if "page-hero" in text and "bg-type-page" in text:
        issues.append((path, "old_bg_type_page", True))
    for h in h1_clean:
        if len(h) > 72:
            issues.append((path, "long_h1", h))
    if path == "/about.html" and "section-after-hero" not in text:
        issues.append((path, "about_missing_section_after", True))
    if "propertytrue.vercel.app/assets" in text:
        issues.append((path, "vercel_app_asset_host", True))

print("\nSITEMAP")
sm = bodies.get("/sitemap.xml", b"").decode()
for url in re.findall(r"<loc>(.*?)</loc>", sm):
    try:
        code, final, data, ctype = fetch(url)
        print(code, url, len(data))
    except Exception as exc:
        print("ERR", url, exc)
        issues.append(("sitemap", url, str(exc)))

print("\nASSETS")
assets = set()
for path, data in bodies.items():
    if not (path.endswith(".html") or path == "/"):
        continue
    text = data.decode("utf-8", "replace")
    for asset in re.findall(r'(?:href|src)="(/assets/[^"?]+)', text):
        assets.add(asset)
for asset in sorted(assets):
    try:
        code, final, data, ctype = fetch(base + asset)
        print(code, asset, len(data))
    except Exception as exc:
        print("ERR", asset, exc)
        issues.append(("asset", asset, str(exc)))

css = bodies.get("/styles.css?v=about-contrast-1", b"").decode("utf-8", "replace")
print("\nCSS LIVE")
checks = {
    "full_night": ("never split mid-copy" in css) or ("Full night field" in css),
    "page_hero_white_important": "color: #fff !important" in css,
    "section_after_hero": ".section-after-hero" in css,
    "hero_center": ("was end" in css) or ("optical lift" in css),
    "side_card_gap": "gap: clamp(2.75rem" in css,
    "no_mid_split_mobile": "eef3f9 62.1%" not in css,
    "body_ink_after_hero": "color: var(--ink) !important" in css,
}
for key, ok in checks.items():
    print(key, ok)
    if not ok:
        issues.append(("css", key, False))

mark = Path("/Users/clawbot/.openclaw/workspace/propertytrue/assets/pt-mark.svg").read_text()
print("MARK simple T", ('x="14"' in mark and 'width="36"' in mark))
print("\nISSUES", len(issues))
for item in issues:
    print(" -", item)
