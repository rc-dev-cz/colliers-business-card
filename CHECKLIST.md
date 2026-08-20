# Vue 2 / Clay migration checklist

Run `npm run check` (or `npm run check:v2`) from the repo root before treating a change as done.

- [ ] `package.json` resolves Vue 2.x and vue-router 3.x
- [ ] No `<script setup>`, `createApp`, `Teleport`, or Composition API imports from `vue`
- [ ] No Shoelace
- [ ] Pages call `src/store.js` and `src/adapters/*` — not `fetch`, FileMaker, or `localStorage` directly (RC Web Dev may use Supabase via `src/rc-web-dev/lib/`)
- [ ] Personal addresses and Order History are profile-scoped localStorage (`addressBook:<email>`, `orderHistory:<email>`); only Colliers offices use `GET /api/addresses`
- [ ] Navigation goes through `src/adapters/nav.js` (Vue Router in standalone, hash / `BF.router` later)
- [ ] Cart and order mutations use Vue 2-safe helpers (`Vue.set` where keys are added)
- [ ] Production build (`npm run build`) succeeds
- [ ] Order flow still works: Login → Catalogue → Details → Customize → Cart → Shipping → Review → Confirmation
- [ ] RC Web Dev still works: Profile → RC Web Dev → Board / Roadmap / Logs / Delivery

## Clay / Klai

When copying into Clay/Klai, take **product pages only**.

**Exclude:** `src/rc-web-dev/`, RC routes (`/rc-web-dev/*`), Supabase env keys, Profile → RC Web Dev menu item, and RC-only docs. RC Web Dev stays in this Vue 2 GitHub Pages host and is never moved to Klai.
