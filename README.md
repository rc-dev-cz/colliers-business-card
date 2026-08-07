# Colliers Business Card Portal

Vue 3 + Tailwind + Shoelace prototype of the Colliers Partner Portal for business cards.

**Client preview:** GitHub Pages after you push this repo and enable Pages (Actions).

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

## Build

```bash
npm run build
npm run preview
```

GitHub Pages base path defaults to `/colliers-business-card-portal/`. Override with:

```bash
VITE_BASE=/ npm run build
```

## GitHub Pages

1. Push this repo to GitHub (name ideally `colliers-business-card-portal`).
2. Settings → Pages → Source: **GitHub Actions**.
3. Push to `main` — workflow `.github/workflows/deploy-pages.yml` builds and deploys.
4. Share: `https://<user>.github.io/colliers-business-card-portal/`

## localStorage keys

| Key | Purpose |
|-----|---------|
| `colliers.locale` | `EN` / `FR` |
| `colliers.cart` | Cart line items |
| `colliers.order` | Shipping splits / addresses |
| `colliers.session` | Mock login session |

## Later

Port this UI into **Klai Studio** using the same standalone layout markers in `src/styles/colliers-environment.css`.
