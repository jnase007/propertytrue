from pathlib import Path
import re

changed = []
for p in Path(".").glob("*.html"):
    t = p.read_text()
    nt = re.sub(r"styles\.css\?v=[^\"']+", "styles.css?v=private-club-5", t)
    nt = re.sub(r"site\.js\?v=[^\"']+", "site.js?v=private-club-5", nt)
    if nt != t:\n        p.write_text(nt)\n        changed.append(p.name)\n\nprint("cache busted", len(changed))
print(sorted(changed))

t = Path("index.html").read_text()
for s in [
    "hero-club",
    "marquee-band",
    "bento-feature",
    "marks-rail",
    "feature-night",
    "private-club-5",
    "</main>",
]:
    print(s, s in t)
print("css has private club", "PRIVATE CLUB v5" in Path("styles.css").read_text())
print("index lines", t.count("\n"))
