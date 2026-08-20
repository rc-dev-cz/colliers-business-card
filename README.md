# Colliers Business Card Portal

Vue 3 + Tailwind + Shoelace prototype of the Colliers Partner Portal for business cards. A Vue 2 Options API port of the product pages lives in [`colliers-vue2/`](colliers-vue2/) for Clay / Klai (Vue 2). RC Web Dev stays in this Vue 3 app.

**Environments**

| Layer | What it is |
| --- | --- |
| **Development** | This Vue repo (`npm run dev`). Cursor + local Vite. |
| **QA / staging** | The GitHub Pages build. Same app, hosted for the team to click through. |
| **Klai** | The live FileMaker / Klai Studio app. Final destination. |

Delivery board: after login, Profile → **RC Web Dev** → **Delivery**, or `#/rc-web-dev/architecture`. Same page on QA (GitHub Pages). Checkboxes are per browser; GitHub Pages does not share them.

## Product docs

- [docs/BUSINESS-RULES.md](docs/BUSINESS-RULES.md) — agreed product behaviour and test IDs
- [docs/CARD-PREVIEW.md](docs/CARD-PREVIEW.md) — designer briefing for card size, colours, and field placement
- [docs/FEATURES.md](docs/FEATURES.md) — what the product is and what it can do
- [docs/BACKLOG.md](docs/BACKLOG.md) — done / mock / not started
- [docs/USER.md](docs/USER.md) — user order-flow stories
- [docs/ADMIN.md](docs/ADMIN.md) — admin port checklist and story codes
- [docs/TESTING.md](docs/TESTING.md) — use cases (cart, shipping, admin, theme)
- [docs/TICKETS.md](docs/TICKETS.md) — RC Web Dev tickets (the local ticket list)
- [docs/RC-WEB-DEV.md](docs/RC-WEB-DEV.md) — how the internal board works (not Klai)

## Stack

- Vite + Vue 3 (this app: prototype + RC Web Dev)
- Vite + Vue 2 Options API in [`colliers-vue2/`](colliers-vue2/) (Colliers pages for Clay)
- Tailwind CSS
- Shoelace drawers in the Vue 3 app only (Vue 2 uses a native drawer)
- Vue Router (**hash mode** — works on GitHub Pages)
- `localStorage` for locale, cart, order draft, and mock session

## Local development

```bash
cd colliers-business-card-portal
npm install
npm run dev
```

Login with any email (default `demo` / `123`).

Vue 2 Colliers app (product pages only, no RC Web Dev):

```bash
npm install --prefix colliers-vue2
npm run dev:v2
```

Vue 2 login: `demo` / `123` (user) or `admin` / `123` (admin shell). Password must be `123`.

Check Vue 2 syntax, helpers, and a production build: `npm run check:v2`. Node 18+.

RC Web Dev is isolated in `src/rc-web-dev/` (Cursor + Vue + Supabase; not Klai). After login, Profile → **RC Web Dev**. How we work: [docs/RC-WEB-DEV.md](docs/RC-WEB-DEV.md).

## Build

```bash
npm run build
npm run preview
```

GitHub Pages base path defaults to `/colliers-business-card/`. Override with:

```bash
VITE_BASE=/ npm run build
```

## QA / staging (GitHub Pages)

1. Push this repo to GitHub (repo: `colliers-business-card`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Push to `main` — workflow `.github/workflows/deploy-pages.yml` builds and deploys.
4. Share: `https://rc-dev-cz.github.io/colliers-business-card/`

### Supabase on QA (optional)

The Delivery page does not need this. The RC Web Dev **Board** does, if you want ticket sync on GitHub Pages.

Vite bakes `VITE_*` in at **build** time. Do not commit `.env.local`. Add **repository** secrets (not environment secrets on `github-pages` — that job only deploys the already-built files):

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Add these two names, same values as local `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (the publishable / anon key — never `service_role`)
3. Re-run **Actions** → **Deploy GitHub Pages** → **Run workflow**, or push an empty commit to `main`.

If the secrets are missing, QA still loads. The board uses the bundled ticket seed and will not write to Supabase.

## localStorage keys

| Key | Purpose |
|-----|---------|
| `colliers.locale` | `EN` / `FR` |
| `colliers.cart` | Cart line items |
| `colliers.order` | Shipping splits / addresses |
| `colliers.session` | Mock login session |

## Later

Port this UI into **Klai Studio** using the Vue 2 Options API app in `colliers-vue2/` and the standalone layout markers in `src/styles/colliers-environment.css`. Do not port `src/rc-web-dev/`.
