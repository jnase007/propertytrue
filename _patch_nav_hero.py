#!/usr/bin/env python3
from pathlib import Path
import re

path = Path("/Users/clawbot/.openclaw/workspace/propertytrue/truestorage-menifee.html")
html = path.read_text(encoding="utf-8")

old_nav = """                  <nav class="nav-desktop">
        <a href="/">Home</a>
        <a href="/track-record.html">Track Record</a>
        <a href="/thesis.html">Thesis</a>
        <a href="/about.html">About</a>
        <a class="btn btn-outline is-active" href="/truestorage-menifee.html">Latest Offering</a>
        <a class="btn btn-outline" href="/truestorage-menifee-deck.html">Pitch Deck</a>
            <a class="btn btn-outline" href="/ie-self-storage-market-report.html">Market Brief</a>
            <a class="btn btn-gold" href="/access.html">Contact Us</a>
      </nav>"""

new_nav = """                  <nav class="nav-desktop">
        <a href="/">Home</a>
        <a href="/track-record.html">Track Record</a>
        <a href="/thesis.html">Thesis</a>
        <a href="/about.html">About</a>
        <a class="btn btn-outline is-active" href="/truestorage-menifee.html">Latest Offering</a>
        <a class="btn btn-gold" href="/access.html">Contact Us</a>
      </nav>"""

if old_nav not in html:
    raise SystemExit("nav block not found")
html = html.replace(old_nav, new_nav)

old_hero = """    <section class="page-hero">
      <div class="bg-type bg-type-page" aria-hidden="true"></div>
      <div class="container reveal">
        <div class="kicker">Property Mark · TrueStorage</div>
        <h1>TrueStorage Menifee</h1>
        <p>Principal co-invest self-storage chapter — land + approximately 10,000 sq ft ground-up in the Menifee / Inland Empire corridor. Planning stage. Partner-safe overview only.</p>
      </div>
    </section>"""

new_hero = """    <section class="page-hero">
      <div class="bg-type bg-type-page" aria-hidden="true"></div>
      <div class="container reveal">
        <div class="kicker">Property Mark · TrueStorage</div>
        <h1>TrueStorage Menifee</h1>
        <p>Principal co-invest self-storage chapter — land + approximately 10,000 sq ft ground-up in the Menifee / Inland Empire corridor. Planning stage. Partner-safe overview only.</p>
        <div class="hero-actions" style="margin-top:1.25rem;">
          <a class="btn btn-gold" href="/truestorage-menifee-deck.html">Pitch Deck</a>
          <a class="btn btn-outline" href="/ie-self-storage-market-report.html">Market Brief</a>
          <a class="btn btn-outline" href="#projections">Projected Returns</a>
        </div>
      </div>
    </section>"""

if old_hero not in html:
    raise SystemExit("page-hero block not found")
html = html.replace(old_hero, new_hero)

m = re.search(
    r'<div id="mobileMenu" class="mobile-menu">.*?</div>\s*</div>\s*</header>',
    html,
    re.S,
)
if not m:
    raise SystemExit("mobile menu not found")

new_mobile = """    <div id="mobileMenu" class="mobile-menu">
      <div class="container">
        <a href="/">Home</a>
        <a href="/track-record.html">Track Record</a>
        <a href="/thesis.html">Thesis</a>
        <a href="/approach.html">Approach</a>
        <a href="/truestorage-menifee.html" class="is-active">TrueStorage Menifee</a>
        <a href="/truestorage-menifee-deck.html">Pitch Deck</a>
        <a href="/ie-self-storage-market-report.html">Market Brief</a>
        <a href="/about.html">About</a>
        <a href="/network.html">Network</a>
        <a href="/partners.html">Partners</a>
        <a href="/access.html">Contact Us</a>
      </div>
    </div>
  </header>"""
html = html[: m.start()] + new_mobile + html[m.end() :]

html = re.sub(r"styles\.css\?v=[^\"']+", "styles.css?v=nav-hero-1", html)
path.write_text(html, encoding="utf-8")

head, rest = html.split("page-hero", 1)
assert "truestorage-menifee-deck.html" not in head
assert "ie-self-storage-market-report.html" not in head
assert "Pitch Deck" in rest
assert "Market Brief" in rest
print("ok")
