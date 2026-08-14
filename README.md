# Colliers Business Card Portal

Vue 3 + Tailwind + Shoelace prototype of the Colliers Partner Portal for business cards.

**Client preview:** GitHub Pages after you push this repo and enable Pages (Actions).

## Product docs

- [docs/BUSINESS-RULES.md](docs/BUSINESS-RULES.md) — agreed product behaviour and test IDs
- [docs/FEATURES.md](docs/FEATURES.md) — what the product is and what it can do
- [docs/BACKLOG.md](docs/BACKLOG.md) — done / mock / not started
- [docs/USER.md](docs/USER.md) — user order-flow stories
- [docs/ADMIN.md](docs/ADMIN.md) — admin port checklist and story codes
- [docs/TESTING.md](docs/TESTING.md) — use cases (cart, shipping, admin, theme)
- [docs/TICKETS.md](docs/TICKETS.md) — RC Web Dev tickets (the local ticket list)
- [docs/RC-WEB-DEV.md](docs/RC-WEB-DEV.md) — how the internal board works (not Klai)

## Stack

- Vite + Vue 3
- Tailwind CSS
- Shoelace drawers (cart + location picker)
- Vue Router (**hash mode** — works on GitHub Pages)
- `localStorage` for locale, cart, order draft, and mock session

## Local development

```bash
cd colliers-business-card-portal
npm install
npm run dev
```

Login with any email (default `demo` / `123`).

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

## GitHub Pages

1. Push this repo to GitHub (repo: `colliers-business-card`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Push to `main` — workflow `.github/workflows/deploy-pages.yml` builds and deploys.
4. Share: `https://rc-dev-cz.github.io/colliers-business-card/`

## localStorage keys

| Key | Purpose |
|-----|---------|
| `colliers.locale` | `EN` / `FR` |
| `colliers.cart` | Cart line items |
| `colliers.order` | Shipping splits / addresses |
| `colliers.session` | Mock login session |

## Later

Port this UI into **Klai Studio** using the same standalone layout markers in `src/styles/colliers-environment.css`. Do not port `src/rc-web-dev/`.
