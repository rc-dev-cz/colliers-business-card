# Vue 2 / Clay migration checklist

Run `npm run check:v2` from the repo root before treating a colliers-vue2 change as done.

- [ ] `colliers-vue2/package.json` resolves Vue 2.x and vue-router 3.x
- [ ] No `<script setup>`, `createApp`, `Teleport`, or Composition API imports from `vue`
- [ ] No Shoelace
- [ ] Pages call `src/store.js` and `src/adapters/*` — not `fetch`, FileMaker, or `localStorage` directly
- [ ] Personal addresses and Order History are profile-scoped localStorage (`addressBook:<email>`, `orderHistory:<email>`); only Colliers offices use `GET /api/addresses`
- [ ] Navigation goes through `src/adapters/nav.js` (Vue Router in standalone, hash / `BF.router` later)
- [ ] Cart and order mutations use Vue 2-safe helpers (`Vue.set` where keys are added)
- [ ] Production build (`npm run build` in `colliers-vue2/`) succeeds
- [ ] Order flow still works: Login → Catalogue → Details → Customize → Cart → Shipping → Review → Confirmation

RC Web Dev stays in the Vue 3 app. Do not port `src/rc-web-dev/`.
