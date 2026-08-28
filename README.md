# Colliers Business Card Portal

Vue 2 Options API + Tailwind app for the Colliers Partner Portal (business cards). Product pages and **RC Web Dev** (internal ticket board) share this single Vue 2 build. GitHub Pages deploys this app.

**Environments**

| Layer | What it is |
| --- | --- |
| **Development** | This Vue 2 repo (`npm run dev`). Cursor + local Vite. |
| **QA / staging** | The GitHub Pages build. Product + RC Web Dev. |
| **Klai / Clay** | Final FileMaker / Klai Studio app. Port **product pages only** — never `src/rc-web-dev/`. |

Delivery board: after login, Profile → **RC Web Dev** → **Delivery**, or `#/rc-web-dev/architecture`.

## Product docs

- [docs/BUSINESS-RULES.md](docs/BUSINESS-RULES.md) — agreed product behaviour and test IDs
- [docs/CARD-PREVIEW.md](docs/CARD-PREVIEW.md) — designer briefing for card size, colours, and field placement
- [docs/FEATURES.md](docs/FEATURES.md) — what the product is and what it can do
- [docs/BACKLOG.md](docs/BACKLOG.md) — F-code feature index (points at board tickets)
- [docs/USER.md](docs/USER.md) — user order-flow stories
- [docs/ADMIN.md](docs/ADMIN.md) — admin port checklist and story codes
- [docs/TESTING.md](docs/TESTING.md) — use cases (cart, shipping, admin, theme)
- [docs/devTracker.json](docs/devTracker.json) — **only** editable RC Web Dev ticket backlog (board source of truth)
- [docs/RC-WEB-DEV.md](docs/RC-WEB-DEV.md) — how the internal board works (not Klai)

## Stack

- Vite + **Vue 2.7** Options API + vue-router 3
- Tailwind CSS
- Native drawers (no Shoelace)
- Vue Router (**hash mode** — works on GitHub Pages)
- `@supabase/supabase-js` for RC Web Dev ticket sync only
- `localStorage` for locale, cart, order draft, address book, order history, and mock session (`colliers-v2.*`)

## Local development

```bash
cd colliers-business-card-portal
npm install
npm run dev
```

Login: `demo` / `123` (user) or `admin` / `123` (admin). Password must be `123`.

Gate + production build: `npm run check` or `npm run check:v2`. Node 18+.

RC Web Dev is isolated in `src/rc-web-dev/` (Cursor + Vue 2 + Supabase; **not** for Clay). After login, Profile → **RC Web Dev**. How we work: [docs/RC-WEB-DEV.md](docs/RC-WEB-DEV.md).

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

Vite bakes `VITE_*` in at **build** time. Do not commit `.env.local`. Add **repository** secrets:

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable / anon key — never `service_role`)
3. Re-run **Deploy GitHub Pages**, or push to `main`.

If the secrets are missing, QA still loads. The board uses the bundled ticket seed and will not write to Supabase.

## localStorage keys

| Key | Purpose |
|-----|---------|
| `colliers-v2.locale` | `EN` / `FR` |
| `colliers-v2.cart` | Cart line items |
| `colliers-v2.order` | Shipping splits / addresses |
| `colliers-v2.session` | Mock login session |
| `colliers-v2.addressBook:<email>` | Personal Address Book |
| `colliers-v2.orderHistory:<email>` | User Order History |

## Later (Clay / Klai)

Port **product** UI from this Vue 2 Options API app using the standalone layout markers in `src/styles/colliers-environment.css`.

**Do not port** `src/rc-web-dev/`, RC routes, Supabase env, or RC docs into Klai. RC Web Dev lives only in this repo / GitHub Pages build.
