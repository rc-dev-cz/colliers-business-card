# Colliers Partner Portal (Vue 2)

Standalone Vue 2 Options API port of the Colliers business-card order flow. Clay / Klai Studio is built on Vue 2; this app is the Clay-ready source. RC Web Dev stays in the Vue 3 app at the repo root.

**Node 18+.**

```bash
cd colliers-vue2
npm install
npm run dev
```

From the repo root:

```bash
npm run dev:v2
npm run build:v2
npm run check:v2
```

- Dev server: `http://localhost:5174/`
- Login: `demo` / `123` (user) or `admin` / `123` (admin shell). Password must be `123`.
- Hash routes, no Shoelace, no `<script setup>`
- Offices come from live `GET /api/addresses`. Personal addresses, cart, shipping draft, session, locale, and Order History stay in localStorage, keyed by the signed-in email (`colliers-v2.addressBook:<email>`, `colliers-v2.orderHistory:<email>`). Empty profiles get seed rows so Address Book and Order History look like previous demo work.
- `npm run check` rejects Vue 3 APIs and known Vue 3-only packages, then `npm run check:v2` from the repo root also runs a production build

Do not port this folder’s RC-Web-Dev-free header into the Vue 3 prototype. Do not copy RC Web Dev into this app.
