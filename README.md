# PropertyTrue

Private real estate capital brand site for [propertytrue.com](https://propertytrue.com).

## Recommended stack (locked for v1)

| Piece | Choice | Why |
|---|---|---|
| Host | **GitHub Pages** from this repo | Free, simple, already on GitHub |
| Domain | `propertytrue.com` via `CNAME` | Apex/www → GitHub Pages |
| Form | **FormSubmit** → `justin@brandastic.com` | Zero backend; first submit sends confirm email |
| CRM later | Google Sheet / HubSpot / Affinity | After real volume |
| Not in v1 | Deal board, EquityMD clone, login portal | Architecture: principal brand only |

## Architecture

- Principal / relationship brand — **not** marketplace #2
- EquityMD stays separate (quiet SEC surface)
- Track record = partner language only (Backbay + Sutera)
- CTA = private conversation request

## Files

- `index.html` — full brand page
- `privacy.html` — privacy policy
- `CNAME` — `propertytrue.com`
- `.github/workflows/pages.yml` — auto-deploy on push to `main`

## Enable GitHub Pages (one-time)

1. Repo → **Settings → Pages**
2. Source: **GitHub Actions** (workflow already in repo)
3. Custom domain: `propertytrue.com`
4. DNS at registrar (GitHub will show exact records after domain save):
   - Apex `A` records for GitHub Pages **or** `ALIAS`/`ANAME` if supported
   - Optional `www` `CNAME` → `jnase007.github.io`
5. Wait for HTTPS certificate (can take minutes–hours)

## Local preview

```bash
cd propertytrue
python3 -m http.server 5173
# http://localhost:5173
```

## Form

Access form posts via FormSubmit AJAX to **justin@brandastic.com**.

- First production submit: FormSubmit emails a **confirmation link** — click it once.
- Change recipient: edit the form `action` URL in `index.html`.


## Future: client logins (planned, not in v1)

Public brand site stays static. Authenticated product is a **separate app surface**, not bolted into `index.html`.

Recommended path when ready:
1. Keep `propertytrue.com` as marketing/principal brand (this repo / Pages)
2. Add `app.propertytrue.com` (or `/app`) for investor/operator logins
3. Stack candidates: **Clerk or Supabase Auth** + Next.js/Vercel (or similar) for portal
4. Portal features later: private materials, deal rooms, CRM-linked profiles — invitation only
5. No public marketplace board; login != open deal shopping

v1 does **not** include auth, accounts, or document vaults. Form remains the only intake.

## Compliance

Informational brand presence only. Not an offer or solicitation of securities. Counsel before broad capital marketing.
