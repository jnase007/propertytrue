#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path("/Users/clawbot/.openclaw/workspace/propertytrue")

css_path = ROOT / "styles.css"
css = css_path.read_text(encoding="utf-8")

old = """.hero.hero-simple .hero-inner {
  padding: 5.2rem 0 4.4rem;
  max-width: 56rem;
}
.hero-simple-copy {
  max-width: 46rem;
}
.hero.hero-simple .eyebrow {
  font-size: 0.82rem;
  letter-spacing: 0.16em;
}
.hero.hero-simple h1 {
  font-size: clamp(2.55rem, 6.2vw, 4.55rem);
  line-height: 0.98;
  max-width: min(18ch, 100%);
}
.hero.hero-simple h1 .hero-line {
  display: block;
}"""

new = """.hero.hero-simple .hero-inner {
  padding: 5.2rem 0 4.4rem;
  max-width: 56rem;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  justify-content: center;
  text-align: center;
}
.hero-simple-copy {
  max-width: 46rem;
  margin: 0 auto;
  text-align: center;
}
.hero.hero-simple .eyebrow {
  font-size: 0.82rem;
  letter-spacing: 0.16em;
  justify-content: center;
}
.hero.hero-simple h1 {
  font-size: clamp(2.55rem, 6.2vw, 4.55rem);
  line-height: 0.98;
  max-width: min(18ch, 100%);
  margin-left: auto;
  margin-right: auto;
}
.hero.hero-simple h1 .hero-line {
  display: block;
}
.hero.hero-simple .lead {
  margin-left: auto;
  margin-right: auto;
}
.hero.hero-simple .hero-actions {
  justify-content: center;
}"""

if old not in css:
    raise SystemExit("hero css block not found")
css_path.write_text(css.replace(old, new), encoding="utf-8")
print("styles.css centered hero")

idx = ROOT / "index.html"
t = idx.read_text(encoding="utf-8")
idx.write_text(re.sub(r"styles\.css\?v=[^\"']+", "styles.css?v=hero-center-1", t, count=1), encoding="utf-8")
print("index cache bump")

calc = ROOT / "truestorage-returns-calculator.html"
c = calc.read_text(encoding="utf-8")

old_sum_css = """    .summary {
      background: linear-gradient(180deg, rgba(212,175,106,0.12), rgba(212,175,106,0.04));
      border: 1px solid rgba(212,175,106,0.28);
      border-radius: 18px;
      padding: 16px;
      display: grid;
      gap: 12px;
    }"""
new_sum_css = """    .summary {
      background: linear-gradient(180deg, rgba(212,175,106,0.12), rgba(212,175,106,0.04));
      border: 1px solid rgba(212,175,106,0.28);
      border-radius: 18px;
      padding: 18px 16px;
      display: grid;
      gap: 14px;
      margin-top: 4px;
      min-height: 11rem;
    }
    .summary-title {
      font-size: 0.72rem;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--gold);
      margin: 0 0 2px;
    }"""
if old_sum_css not in c:
    raise SystemExit("summary css not found")
c = c.replace(old_sum_css, new_sum_css)

old_sum_html = '          <div class="summary" id="summary"></div>'
new_sum_html = """          <div class="summary" id="summary" aria-live="polite">
            <div class="summary-title">Projected returns</div>
            <div class="row"><div class="k">Loading…</div><div class="v">—</div></div>
          </div>"""
if old_sum_html not in c:
    raise SystemExit("summary html not found")
c = c.replace(old_sum_html, new_sum_html)

old_js = """      el.summary.innerHTML = `
        <div class="row"><div class="k">You invest</div><div class="v">${money(invest)}</div></div>
        <div class="row"><div class="k">Avg length / model horizon</div><div class="v">${holdYears} years</div></div>
        <div class="row"><div class="k">Total investment value</div><div class="v big">${money(totalReturn)}</div></div>
        <div class="row"><div class="k">Net gain</div><div class="v" style="color:${profit >= 0 ? "var(--good)" : "#ff8e8e"}">${money(profit)}</div></div>
        <div class="row"><div class="k">Multiple</div><div class="v">${multiple.toFixed(2)}x</div></div>
        <div class="row"><div class="k">Implied annualized</div><div class="v">${(cagrImplied * 100).toFixed(1)}%</div></div>
      `;"""
new_js = """      el.summary.innerHTML = `
        <div class="summary-title">Projected returns</div>
        <div class="row"><div class="k">You invest</div><div class="v">${money(invest)}</div></div>
        <div class="row"><div class="k">Average length to go full-cycle</div><div class="v">${holdYears} years</div></div>
        <div class="row"><div class="k">Total investment return</div><div class="v big">${money(totalReturn)}</div></div>
        <div class="row"><div class="k">Net gain</div><div class="v" style="color:${profit >= 0 ? "var(--good)" : "#ff8e8e"}">${money(profit)}</div></div>
        <div class="row"><div class="k">Multiple on capital</div><div class="v">${multiple.toFixed(2)}x</div></div>
        <div class="row"><div class="k">Implied annualized</div><div class="v">${(cagrImplied * 100).toFixed(1)}%</div></div>
      `;"""
if old_js not in c:
    raise SystemExit("summary js not found")
c = c.replace(old_js, new_js)
calc.write_text(c, encoding="utf-8")
print("calculator updated")

prop = ROOT / "truestorage-menifee.html"
p = prop.read_text(encoding="utf-8")
if 'id="projections"' not in p:
    anchor = """            <p style="margin-top:1rem;font-size:0.9rem;color:var(--muted);">Hold thesis, capital structure, land basis, and projected returns are deal-specific. Use the illustrative calculator for conversation framing only — not an offer to sell securities.</p>
            <div class="hero-actions" style="margin-top:1.15rem;">
              <a class="btn btn-gold" href="/truestorage-returns-calculator.html">Returns Calculator</a>
              <a class="btn btn-outline" href="#timeline">Project Timeline</a>
            </div>"""
    insert = """            <p style="margin-top:1rem;font-size:0.9rem;color:var(--muted);">Hold thesis, capital structure, land basis, and projected returns are deal-specific. Use the illustrative calculator for conversation framing only — not an offer to sell securities.</p>
            <div class="hero-actions" style="margin-top:1.15rem;">
              <a class="btn btn-gold" href="/truestorage-returns-calculator.html#summary">Projected Returns</a>
              <a class="btn btn-outline" href="/truestorage-returns-calculator.html">Returns Calculator</a>
              <a class="btn btn-outline" href="#timeline">Project Timeline</a>
            </div>"""
    if anchor not in p:
        raise SystemExit("property cta block not found")
    p = p.replace(anchor, insert)
    marker = 'id="timeline"'
    idxm = p.find(marker)
    if idxm != -1:
        sec_start = p.rfind("<section", 0, idxm)
        teaser = """    <section class="section section-soft" id="projections">
      <div class="container split">
        <div class="reveal">
          <div class="eyebrow"><span class="eyebrow-dot"></span> Illustrative only</div>
          <h2>Projected returns</h2>
          <p class="lead">Explore an illustrative investment path for TrueStorage Menifee planning conversations — chart, hold length, and total return framing. Not an offer to sell securities. Full LP economics stay private.</p>
          <div class="hero-actions" style="margin-top:1.1rem;">
            <a class="btn btn-gold" href="/truestorage-returns-calculator.html">Open Returns Calculator</a>
            <a class="btn btn-outline" href="/access.html">Contact Us</a>
          </div>
        </div>
        <div class="reveal">
          <article class="card">
            <div class="kicker">What you can model</div>
            <h3 style="margin-top:0.4rem;">Investment · CAGR · Full-cycle path</h3>
            <p>Enter a check size, adjust annualized return, and see projected value over a hold period — or switch to the TrueStorage base path shape for conversation framing.</p>
            <p style="margin-top:0.75rem;font-size:0.9rem;color:var(--muted);">Public calculator is illustrative only. Preferred return, IRR, equity size, and minimums are not published as an offer.</p>
          </article>
        </div>
      </div>
    </section>

"""
        p = p[:sec_start] + teaser + p[sec_start:]
    prop.write_text(p, encoding="utf-8")
    print("property page projections section added")
else:
    print("projections already on property page")

p = prop.read_text(encoding="utf-8")
prop.write_text(re.sub(r"styles\.css\?v=[^\"']+", "styles.css?v=hero-center-1", p), encoding="utf-8")
print("done")
