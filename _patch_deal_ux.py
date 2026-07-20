#!/usr/bin/env python3
from pathlib import Path
import re

path = Path("/Users/clawbot/.openclaw/workspace/propertytrue/truestorage-menifee.html")
html = path.read_text(encoding="utf-8")

new_style = r"""<style>
  /* TrueStorage deal page — 10x single-page UX */
  .deal-page .page-hero {
    padding: 4.2rem 0 2.4rem;
    position: relative;
    overflow: hidden;
  }
  .deal-page .page-hero .container { position: relative; z-index: 1; max-width: 52rem; }
  .deal-page .page-hero h1 {
    font-size: clamp(2.6rem, 6vw, 4.2rem);
    line-height: 0.98;
    letter-spacing: -0.02em;
  }
  .deal-page .page-hero p {
    font-size: 1.08rem;
    line-height: 1.65;
    max-width: 40rem;
    color: var(--ink-soft);
  }
  .hero-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 1.15rem;
  }
  .hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.42rem 0.75rem;
    border-radius: 999px;
    background: rgba(47,111,237,0.08);
    border: 1px solid rgba(47,111,237,0.16);
    color: var(--gold-deep);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .hero-chip span { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); display: inline-block; }

  .deal-tabs {
    position: sticky;
    top: calc(var(--header-h) + 42px);
    z-index: 45;
    background: rgba(247,249,252,0.94);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--line);
    box-shadow: 0 8px 24px rgba(15,17,20,0.04);
  }
  .deal-tabs-inner {
    display: flex;
    gap: 0.3rem;
    overflow-x: auto;
    padding: 0.6rem 0;
    scrollbar-width: none;
  }
  .deal-tabs-inner::-webkit-scrollbar { display: none; }
  .deal-tab {
    flex: 0 0 auto;
    padding: 0.58rem 0.95rem;
    border-radius: 999px;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--muted);
    border: 1px solid transparent;
    transition: all 0.2s var(--ease);
    white-space: nowrap;
  }
  .deal-tab:hover { color: var(--ink); background: rgba(47,111,237,0.06); }
  .deal-tab.is-active {
    color: #fff;
    background: linear-gradient(135deg, #2f6fed, #1a4fbf);
    border-color: transparent;
    box-shadow: 0 8px 18px rgba(47,111,237,0.25);
  }
  .deal-progress {
    height: 2px;
    background: rgba(47,111,237,0.12);
    width: 100%;
  }
  .deal-progress > i {
    display: block;
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #2f6fed, #7eb0ff);
    transition: width 0.15s linear;
  }

  .section-head-row {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.25rem;
  }
  .section-jump {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--gold-deep);
  }
  .section-jump:hover { text-decoration: underline; }

  .chart-card {
    overflow: hidden;
    border: 1px solid rgba(15,35,65,0.08);
    box-shadow: var(--shadow);
    transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
  }
  .chart-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-hover); }
  .chart-card .chart-shell {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid rgba(15, 35, 65, 0.06);
    padding: 1.15rem 1rem 0.65rem;
  }
  .chart-shell { position: relative; width: 100%; height: 360px; }
  .chart-shell-sm { height: 300px; }
  .chart-shell canvas { width: 100% !important; height: 100% !important; }

  .calc-embed {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 1rem;
    margin-top: 1.2rem;
  }
  .calc-panel {
    background: #0f1624;
    color: #e8eef8;
    border-radius: 18px;
    padding: 1.2rem;
    border: 1px solid rgba(212,175,106,0.18);
  }
  .calc-panel label {
    display: block;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(232,238,248,0.62);
    margin-bottom: 0.35rem;
    font-weight: 700;
  }
  .calc-panel input[type="text"],
  .calc-panel input[type="range"] {
    width: 100%;
    margin-bottom: 0.95rem;
  }
  .calc-panel input[type="text"] {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    color: #fff;
    border-radius: 12px;
    padding: 0.8rem 0.9rem;
    font-size: 1.05rem;
    font-weight: 600;
  }
  .calc-panel input[type="range"] { accent-color: #d4af6a; }
  .calc-row {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.55rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    font-size: 0.92rem;
  }
  .calc-row:last-child { border-bottom: 0; }
  .calc-row .k { color: rgba(232,238,248,0.62); }
  .calc-row .v { font-weight: 700; color: #fff; }
  .calc-row .v.big { color: #d4af6a; font-size: 1.2rem; }
  .calc-mode {
    display: flex;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }
  .calc-mode button {
    flex: 1;
    border: 1px solid rgba(255,255,255,0.12);
    background: transparent;
    color: rgba(232,238,248,0.75);
    border-radius: 999px;
    padding: 0.55rem 0.7rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
  }
  .calc-mode button.is-active {
    background: rgba(212,175,106,0.16);
    border-color: rgba(212,175,106,0.4);
    color: #d4af6a;
  }
  .calc-chart-wrap {
    background: #fff;
    border-radius: 18px;
    border: 1px solid rgba(15,35,65,0.08);
    padding: 0.9rem;
    min-height: 280px;
  }
  .calc-chart-wrap canvas { width: 100% !important; height: 260px !important; }

  .back-top {
    position: fixed;
    right: 1.1rem;
    bottom: 1.1rem;
    z-index: 50;
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 1px solid rgba(47,111,237,0.22);
    background: #fff;
    color: var(--gold-deep);
    box-shadow: var(--shadow);
    display: grid;
    place-items: center;
    font-size: 1.1rem;
    opacity: 0;
    pointer-events: none;
    transform: translateY(8px);
    transition: all 0.2s var(--ease);
  }
  .back-top.is-on {
    opacity: 1;
    pointer-events: auto;
    transform: none;
  }

  #overview, #market, #market-brief, #design, #pitch, #projections, #timeline, #next, #calculator {
    scroll-margin-top: 10rem;
  }

  @media (max-width: 900px) {
    .calc-embed { grid-template-columns: 1fr; }
    .chart-shell { height: 300px; }
    .chart-shell-sm { height: 260px; }
    .deal-tabs { top: calc(var(--header-h) + 52px); }
  }
</style>"""

html = re.sub(r"<style>.*?</style>", new_style, html, count=1, flags=re.S)

if 'class="deal-page"' not in html:
    html = html.replace("<body>", '<body class="deal-page">', 1)

old_hero = """    <section class="page-hero">
      <div class="bg-type bg-type-page" aria-hidden="true"></div>
      <div class="container reveal">
        <div class="kicker">Property Mark · TrueStorage</div>
        <h1>TrueStorage Menifee</h1>
        <p>Principal co-invest self-storage chapter — land + approximately 10,000 sq ft ground-up in the Menifee / Inland Empire corridor. Planning stage. Partner-safe overview only.</p>
        <div class="hero-actions" style="margin-top:1.25rem;">
          <a class="btn btn-gold" href="#overview">Explore the mark</a>
          <a class="btn btn-outline" href="#projections">Projected Returns</a>
          <a class="btn btn-outline" href="#pitch">Pitch summary</a>
        </div>
      </div>
    </section>"""

new_hero = """    <section class="page-hero">
      <div class="bg-type bg-type-page" aria-hidden="true"></div>
      <div class="container reveal">
        <div class="kicker">Property Mark · TrueStorage</div>
        <h1>TrueStorage Menifee</h1>
        <p>Principal co-invest self-storage chapter — land + approximately 10,000 sq ft ground-up in the Menifee / Inland Empire corridor. Planning stage. Everything for the conversation lives on this one page.</p>
        <div class="hero-chips" aria-label="Page contents">
          <span class="hero-chip"><span></span> Overview</span>
          <span class="hero-chip"><span></span> Market</span>
          <span class="hero-chip"><span></span> Pitch</span>
          <span class="hero-chip"><span></span> Returns + charts</span>
          <span class="hero-chip"><span></span> Timeline</span>
        </div>
        <div class="hero-actions" style="margin-top:1.25rem;">
          <a class="btn btn-gold" href="#overview">Start here</a>
          <a class="btn btn-outline" href="#projections">Jump to returns</a>
          <a class="btn btn-outline" href="#next">Contact</a>
        </div>
      </div>
    </section>"""

if old_hero not in html:
    raise SystemExit("hero block not found")
html = html.replace(old_hero, new_hero)

new_tabs = """    <nav class="deal-tabs" id="dealTabs" aria-label="TrueStorage page sections">
      <div class="container deal-tabs-inner">
        <a class="deal-tab is-active" href="#overview" data-tab="overview">Overview</a>
        <a class="deal-tab" href="#market" data-tab="market">Market</a>
        <a class="deal-tab" href="#design" data-tab="design">Design</a>
        <a class="deal-tab" href="#pitch" data-tab="pitch">Pitch</a>
        <a class="deal-tab" href="#projections" data-tab="projections">Returns</a>
        <a class="deal-tab" href="#calculator" data-tab="calculator">Calculator</a>
        <a class="deal-tab" href="#timeline" data-tab="timeline">Timeline</a>
        <a class="deal-tab" href="#next" data-tab="next">Next</a>
      </div>
      <div class="deal-progress" aria-hidden="true"><i id="dealProgress"></i></div>
    </nav>"""

m = re.search(r'<nav class="deal-tabs"[\s\S]*?</nav>', html)
if not m:
    raise SystemExit("tabs not found")
html = html[: m.start()] + new_tabs + html[m.end() :]

old_tool = """        <div class="grid-2 reveal" style="margin-bottom:1.2rem;">
          <article class="card">
            <div class="kicker">Base assumptions (illustrative)</div>
            <h3 style="margin-top:0.35rem;">What the model is holding constant</h3>
            <ul style="margin:0.85rem 0 0;padding-left:1.1rem;color:var(--muted);line-height:1.7;">
              <li>~10,000 NRSF self-storage facility</li>
              <li>Directional rent stack around ~$1.55 / sf / mo</li>
              <li>~55% leverage · interest-only debt service in ops years</li>
              <li>Build / open / lease-up into stabilize before full cash</li>
              <li>Longer-hold exit framing around Year 8</li>
            </ul>
          </article>
          <article class="card">
            <div class="kicker">Interactive tool</div>
            <h3 style="margin-top:0.35rem;">Run your own check size</h3>
            <p>Use the public returns calculator to scale an illustrative path to a conversation check size — simple growth mode or the TrueStorage base-path shape.</p>
            <div class="hero-actions" style="margin-top:1.1rem;">
              <a class="btn btn-gold" href="/truestorage-returns-calculator.html">Open Returns Calculator</a>
              <a class="btn btn-outline" href="/access.html">Private underwriting</a>
            </div>
            <p style="margin-top:0.9rem;font-size:0.88rem;color:var(--muted);">Detailed waterfall, preferred-return math, land basis, and structure stay for private conversation — not a public securities offer.</p>
          </article>
        </div>

        <div class="note reveal">
          <strong>Disclaimer:</strong> Charts and milestones on this page are illustrative planning materials for TrueStorage Menifee discussions. They are not a solicitation or offer to sell securities, not a guarantee of distributions, occupancy, NOI, refinance, or exit timing, and not a representation of any investor’s actual results. Actual outcomes depend on site control, construction cost, financing, operations, and market conditions. Prefer private conversation for deal-specific underwriting.
        </div>
      </div>
    </section>"""

new_tool = """        <div class="grid-2 reveal" style="margin-bottom:1.2rem;">
          <article class="card">
            <div class="kicker">Base assumptions (illustrative)</div>
            <h3 style="margin-top:0.35rem;">What the model is holding constant</h3>
            <ul style="margin:0.85rem 0 0;padding-left:1.1rem;color:var(--muted);line-height:1.7;">
              <li>~10,000 NRSF self-storage facility</li>
              <li>Directional rent stack around ~$1.55 / sf / mo</li>
              <li>~55% leverage · interest-only debt service in ops years</li>
              <li>Build / open / lease-up into stabilize before full cash</li>
              <li>Longer-hold exit framing around Year 8</li>
            </ul>
          </article>
          <article class="card">
            <div class="kicker">How to use this page</div>
            <h3 style="margin-top:0.35rem;">Stay in one conversation flow</h3>
            <p>Scroll the sticky tabs: market context → pitch summary → charted returns → interactive calculator → timeline → contact. No separate page required for the investor walkthrough.</p>
            <div class="hero-actions" style="margin-top:1.1rem;">
              <a class="btn btn-gold" href="#calculator">Open calculator below</a>
              <a class="btn btn-outline" href="#next">Contact</a>
            </div>
          </article>
        </div>

        <div class="note reveal">
          <strong>Disclaimer:</strong> Charts and milestones on this page are illustrative planning materials for TrueStorage Menifee discussions. They are not a solicitation or offer to sell securities, not a guarantee of distributions, occupancy, NOI, refinance, or exit timing, and not a representation of any investor’s actual results. Actual outcomes depend on site control, construction cost, financing, operations, and market conditions. Prefer private conversation for deal-specific underwriting.
        </div>
      </div>
    </section>

    <section class="section" id="calculator">
      <div class="container">
        <div class="section-head-row reveal">
          <div style="max-width:42rem;">
            <div class="kicker">Interactive · on this page</div>
            <h2 style="font-size:clamp(1.9rem,3.5vw,2.6rem); margin:0.35rem 0 0;">Returns calculator</h2>
            <p class="lead" style="margin-top:0.75rem;">Model an illustrative check size without leaving the mark. Switch between simple annualized growth and the TrueStorage base-path shape.</p>
          </div>
          <a class="section-jump" href="/truestorage-returns-calculator.html">Fullscreen calculator →</a>
        </div>

        <div class="calc-embed reveal">
          <div class="calc-panel">
            <div class="calc-mode" role="tablist" aria-label="Calculator mode">
              <button type="button" class="is-active" id="calcModeCagr" data-mode="cagr">Illustrative CAGR</button>
              <button type="button" id="calcModeBase" data-mode="base">TrueStorage path</button>
            </div>
            <label for="calcInvest">Investment</label>
            <input id="calcInvest" type="text" value="100,000" inputmode="numeric" autocomplete="off" />
            <div id="cagrControls">
              <label for="calcCagr">Compound annualized return · <span id="calcCagrVal">17%</span></label>
              <input id="calcCagr" type="range" min="5" max="30" step="0.5" value="17" />
              <label for="calcYears">Hold length · <span id="calcYearsVal">5 years</span></label>
              <input id="calcYears" type="range" min="3" max="10" step="1" value="5" />
            </div>
            <div id="calcSummary" aria-live="polite">
              <div class="calc-row"><div class="k">You invest</div><div class="v">$100,000</div></div>
              <div class="calc-row"><div class="k">Full-cycle length</div><div class="v">5 years</div></div>
              <div class="calc-row"><div class="k">Total investment return</div><div class="v big">—</div></div>
              <div class="calc-row"><div class="k">Net gain</div><div class="v">—</div></div>
              <div class="calc-row"><div class="k">Multiple</div><div class="v">—</div></div>
            </div>
            <p style="margin:0.9rem 0 0;font-size:0.8rem;color:rgba(232,238,248,0.55);line-height:1.5;">Illustrative only. Not an offer to sell securities. Not a prediction of actual LP cash, preferred return, or exit timing.</p>
          </div>
          <div class="calc-chart-wrap">
            <canvas id="calcPathChart" aria-label="Illustrative investment path chart" role="img"></canvas>
          </div>
        </div>
        <p class="fineprint reveal" style="margin-top:1rem;max-width:46rem;color:var(--muted);">Prefer a private model with preferred return, debt, and exit assumptions? Use Contact — full underwriting is not published as a public offer.</p>
      </div>
    </section>"""

if old_tool not in html:
    raise SystemExit("tool/disclaimer block not found")
html = html.replace(old_tool, new_tool)

old_mobile = """        <div id="mobileMenu" class="mobile-menu">
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
    </div>"""

new_mobile = """        <div id="mobileMenu" class="mobile-menu">
      <div class="container">
        <a href="/">Home</a>
        <a href="#overview">Overview</a>
        <a href="#market">Market</a>
        <a href="#pitch">Pitch</a>
        <a href="#projections">Returns</a>
        <a href="#calculator">Calculator</a>
        <a href="#timeline">Timeline</a>
        <a href="#next">Contact / Next</a>
        <a href="/track-record.html">Track Record</a>
        <a href="/access.html">Contact Us</a>
      </div>
    </div>"""

if old_mobile in html:
    html = html.replace(old_mobile, new_mobile)

if 'id="backTop"' not in html:
    html = html.replace(
        '<script src="https://cdn.jsdelivr.net/npm/chart.js',
        '<a class="back-top" id="backTop" href="#overview" aria-label="Back to top">↑</a>\n  <script src="https://cdn.jsdelivr.net/npm/chart.js',
    )

calc_js = r"""
  <script>
    (function () {
      const progress = document.getElementById("dealProgress");
      const backTop = document.getElementById("backTop");
      const onScrollUi = () => {
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - window.innerHeight);
        const pct = Math.min(100, (window.scrollY / max) * 100);
        if (progress) progress.style.width = pct + "%";
        if (backTop) backTop.classList.toggle("is-on", window.scrollY > 700);
      };
      onScrollUi();
      window.addEventListener("scroll", onScrollUi, { passive: true });

      document.querySelectorAll('.mobile-menu a[href^="#"]').forEach((a) => {
        a.addEventListener("click", () => {
          document.body.classList.remove("menu-open");
          const mm = document.getElementById("mobileMenu");
          if (mm) mm.classList.remove("open");
        });
      });
    })();

    (function () {
      if (typeof Chart === "undefined") return;
      const investEl = document.getElementById("calcInvest");
      const cagrEl = document.getElementById("calcCagr");
      const yearsEl = document.getElementById("calcYears");
      const cagrVal = document.getElementById("calcCagrVal");
      const yearsVal = document.getElementById("calcYearsVal");
      const summary = document.getElementById("calcSummary");
      const canvas = document.getElementById("calcPathChart");
      const modeCagr = document.getElementById("calcModeCagr");
      const modeBase = document.getElementById("calcModeBase");
      const cagrControls = document.getElementById("cagrControls");
      if (!investEl || !canvas || !summary) return;

      let mode = "cagr";
      let chart;

      const money = (n) => {
        const sign = n < 0 ? "-" : "";
        const v = Math.abs(n);
        return sign + "$" + Math.round(v).toLocaleString("en-US");
      };
      const parseMoney = (v) => {
        const n = Number(String(v).replace(/[^0-9.]/g, ""));
        return Number.isFinite(n) ? n : 0;
      };
      const formatInput = (n) => Math.round(n).toLocaleString("en-US");

      const baseShape = [
        { y: 0, m: 1.00 },
        { y: 1, m: 1.00 },
        { y: 2, m: 1.00 },
        { y: 3, m: 1.01 },
        { y: 4, m: 1.07 },
        { y: 5, m: 1.15 },
        { y: 6, m: 1.22 },
        { y: 7, m: 1.30 },
        { y: 8, m: 1.75 }
      ];

      function seriesCagr(invest, cagr, years) {
        const pts = [];
        for (let y = 0; y <= years; y++) {
          pts.push({ y, value: invest * Math.pow(1 + cagr, y) });
        }
        return pts;
      }
      function seriesBase(invest) {
        return baseShape.map((p) => ({ y: p.y, value: invest * p.m }));
      }

      function render() {
        const invest = Math.max(1000, parseMoney(investEl.value) || 100000);
        investEl.value = formatInput(invest);
        const cagr = (Number(cagrEl.value) || 17) / 100;
        const years = Number(yearsEl.value) || 5;
        if (cagrVal) cagrVal.textContent = (cagr * 100).toFixed(1).replace(/\.0$/, "") + "%";
        if (yearsVal) yearsVal.textContent = years + " years";

        const points = mode === "base" ? seriesBase(invest) : seriesCagr(invest, cagr, years);
        const end = points[points.length - 1];
        const holdYears = end.y;
        const total = end.value;
        const profit = total - invest;
        const multiple = total / invest;
        const implied = holdYears > 0 ? Math.pow(total / invest, 1 / holdYears) - 1 : 0;

        summary.innerHTML =
          '<div class="calc-row"><div class="k">You invest</div><div class="v">' + money(invest) + '</div></div>' +
          '<div class="calc-row"><div class="k">Full-cycle length</div><div class="v">' + holdYears + ' years</div></div>' +
          '<div class="calc-row"><div class="k">Total investment return</div><div class="v big">' + money(total) + '</div></div>' +
          '<div class="calc-row"><div class="k">Net gain</div><div class="v">' + money(profit) + '</div></div>' +
          '<div class="calc-row"><div class="k">Multiple · implied annualized</div><div class="v">' + multiple.toFixed(2) + 'x · ' + (implied * 100).toFixed(1) + '%</div></div>';

        const labels = points.map((p) => "Y" + p.y);
        const values = points.map((p) => p.value);
        if (chart) {
          chart.data.labels = labels;
          chart.data.datasets[0].data = values;
          chart.update("none");
        } else {
          chart = new Chart(canvas, {
            type: "line",
            data: {
              labels,
              datasets: [{
                label: "Illustrative value",
                data: values,
                borderColor: "#d4af6a",
                backgroundColor: "rgba(212,175,106,0.12)",
                fill: true,
                tension: 0.25,
                borderWidth: 2.5,
                pointRadius: 3,
                pointHoverRadius: 5
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => " " + money(ctx.parsed.y)
                  }
                }
              },
              scales: {
                x: { grid: { color: "rgba(15,35,65,0.05)" }, ticks: { color: "#6b7280" } },
                y: {
                  grid: { color: "rgba(15,35,65,0.06)" },
                  ticks: {
                    color: "#6b7280",
                    callback: (v) => {
                      if (Math.abs(v) >= 1000000) return "$" + (v / 1000000).toFixed(1) + "M";
                      if (Math.abs(v) >= 1000) return "$" + Math.round(v / 1000) + "k";
                      return "$" + v;
                    }
                  }
                }
              }
            }
          });
        }
      }

      function setMode(next) {
        mode = next;
        modeCagr.classList.toggle("is-active", mode === "cagr");
        modeBase.classList.toggle("is-active", mode === "base");
        if (cagrControls) cagrControls.style.display = mode === "cagr" ? "block" : "none";
        render();
      }

      modeCagr.addEventListener("click", () => setMode("cagr"));
      modeBase.addEventListener("click", () => setMode("base"));
      investEl.addEventListener("change", render);
      investEl.addEventListener("keydown", (e) => { if (e.key === "Enter") render(); });
      cagrEl.addEventListener("input", render);
      yearsEl.addEventListener("input", render);
      render();
    })();
  </script>
"""

if "Embedded returns calculator" not in html and "calcPathChart" in html:
    html = html.replace('<script src="/site.js"></script>', calc_js + '\n  <script src="/site.js"></script>')
elif "calcPathChart" in html and "calcInvest" in html and "function render()" not in html:
    html = html.replace('<script src="/site.js"></script>', calc_js + '\n  <script src="/site.js"></script>')

html = re.sub(r"styles\.css\?v=[^\"']+", "styles.css?v=deal-ux-10x", html)
path.write_text(html, encoding="utf-8")

text = path.read_text(encoding="utf-8")
for s in ["id=\"calculator\"", "calcPathChart", "dealProgress", "backTop", "hero-chips", "deal-page"]:
    if s not in text:
        raise SystemExit("missing " + s)
print("sections", text.count("<section"), text.count("</section>"))
print("ok", path.stat().st_size)
