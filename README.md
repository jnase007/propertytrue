# PropertyTrue

Private real estate capital brand site for [propertytrue.com](https://propertytrue.com).

## Architecture (locked)

- **Principal / relationship brand** — not a public multi-deal marketplace
- **EquityMD** remains the separate SEC marketplace surface (quiet)
- No live deal board, no syndicators’ public deal posts
- Track record uses **partner / capital partner** language only
- CTA = private conversation / access request

## Stack

- Static single-page site (`index.html`)
- Tailwind CDN + system fonts (Cormorant Garamond + Inter)
- Form is front-end only until wired to an endpoint (Formspree / Google / CRM)

## Local preview

Open `index.html` in a browser, or:

```bash
python3 -m http.server 5173
# http://localhost:5173
```

## Deploy

### GitHub Pages

1. Repo: `jnase007/propertytrue`
2. Settings → Pages → Deploy from branch `main` / root (or `/docs` if moved)
3. Custom domain: `propertytrue.com` (CNAME file included)
4. DNS at registrar:
   - `A` / `AAAA` for GitHub Pages apex, **or**
   - `CNAME` `www` → `jnase007.github.io`
5. Enforce HTTPS after DNS propagates

### Alternative

Any static host (Vercel / Netlify / Cloudflare Pages) pointing at this repo works the same.

## Form wiring (next)

Replace the `accessForm` submit handler in `index.html` with a real endpoint when ready. Until then, submissions only log in the browser and show the success message.

## Compliance note

This site is informational brand presence only. It is **not** an offer or solicitation of securities. Any actual offering would be private, document-based, and counsel-reviewed.
