# Address Book tests (profile)

Automated tests for **Profile → Addresses** only: **My Address Book** and **Office Addresses**.

Rules source: [PROFILE-PAGES.md](PROFILE-PAGES.md).

**In scope:** this page’s two tabs.  
**Out of scope here:** Admin → Manage Addresses, Shipping ship-to picker, Order History, login.

---

## Development

How we will implement these tests in the Vue 2 app.

### Recommendation (keep it simple)

**Vitest + jsdom + `@vue/test-utils` v1** is the right stack for this list.

These cases are mostly **behavior** (click, list changes, hide a button) — not pixel-perfect screenshots. Cypress / Playwright would open a real browser, need the app running, and usually need a fake login. That is slower and more fragile for Address Book CRUD. Skip it for this wave.

Optional later (not now): 2–3 Playwright smokes if we want a real-browser screenshot of My vs Office. Do not add Cypress just to “see” the page.

### Tools & libraries

| Piece | Choice | Why |
|---|---|---|
| Test runner | **Vitest** | Same toolchain as Vite already in the repo; `npm test`; watch mode |
| DOM in Node | **jsdom** | Page tests without a browser |
| Vue 2 mounts | **@vue/test-utils@1** | Vue 2 only — do **not** use Vue 3 test-utils |
| Assertions | Vitest `expect` | Built in |
| Language | **JavaScript** (ESM) | Matches the app |

Not using this wave: Cypress, Playwright, Jest, Vue 3 test-utils, visual-regression services.

### Approach (three layers)

```text
AB-H* / AB-S*     helpers + store     fastest, no UI
AB-01 … AB-22     AddressBookPage     tabs, buttons, modal
```

1. **Helpers** (`addressBook.js`) — search, empty form, create record.
2. **Store** (`addPersonal` / `updatePersonal` / `deletePersonal`) — reset `localStorage` + store lists between tests.
3. **Page** (`AddressBookPage.vue`) — `mount` with test-utils. **Stub** `ColliersPageShell` so we do not pull header / cart / login.

Write specs next to code:

- `src/helpers/addressBook.spec.js` → AB-H*
- `src/store.personalAddresses.spec.js` → AB-S*
- `src/pages/AddressBookPage.spec.js` → AB-01 … AB-22

### How each case translates

| Cases | Kind | Tool | What we actually assert |
|---|---|---|---|
| AB-H01–H06 | Unit | Vitest only | Function return values |
| AB-S01–S03 | Unit | Vitest + store | Array length / fields after add, edit, delete |
| AB-01–03, AB-13–17 | Page | test-utils | Tabs, **+ New Address** visible/hidden, office table has no Edit/Delete |
| AB-04–09 | Page | test-utils | Open modal, fill fields, Save, list updates |
| AB-10–12 | Page | test-utils + stub `window.confirm` | Today delete is the **browser confirm** (`Delete this personal address?`), not a custom modal. Stub true/false. |
| AB-18–22 | Page | test-utils | Type in search; rows hide/show. Search is **one box for both tabs** — the query filters whichever tab is active. |

### What we mock

| Dependency | In these tests |
|---|---|
| Session / login | Assume signed in |
| `loadOffices` / `GET /api/addresses` | Put a small office list on `store.offices`; do not hit FileMaker |
| `localStorage` | Cleared / isolated per test |
| `ColliersPageShell` | Stub the layout wrapper |
| `window.confirm` | Stub for delete cases |

### Product change required for AB-14

Today **+ New Address** always shows in the header. Hide it when the Office tab is selected (`v-if="activeTab === 'personal'"`). Ship that with or just before the page specs.

### Commands (once wired)

| Script | Does |
|---|---|
| `npm test` | Run all specs once |
| `npm run test:watch` | Re-run on file change |

---

## Page under test

| | |
|---|---|
| Route | Profile → Addresses (`/addresses`) |
| Code | `src/pages/AddressBookPage.vue`, `src/helpers/addressBook.js`, store personal CRUD |
| Signed in | Assumed; no auth cases |

---

## My Address Book

| ID | Test | Expected |
|---|---|---|
| AB-01 | Page opens with two tabs | **My Address Book** and **Office Addresses** visible |
| AB-02 | My tab lists only personal rows | No Colliers office rows mixed into My list |
| AB-03 | On My tab, **+ New Address** is visible | Button present |
| AB-04 | **+ New Address** opens the form modal | Modal / form shown |
| AB-05 | Save creates a personal address | New row on My list with nickname + address; form closes |
| AB-06 | Saved row is personal, not an office | Appears under My Address Book only |
| AB-07 | Form uses Canada labels / default | Province, Postal; country defaults to Canada |
| AB-08 | Edit opens modal with that row filled | Nickname, street, city (and other saved fields) prefilled |
| AB-09 | Save on edit updates only that row | Target changed; other personal rows unchanged |
| AB-10 | Delete shows confirm | Browser confirm: “Delete this personal address?” (Cancel / OK) |
| AB-11 | Cancel on confirm keeps the row | `window.confirm` → false; list unchanged |
| AB-12 | Confirm delete removes the row | `window.confirm` → true; row gone from My list |

---

## Office Addresses

| ID | Test | Expected |
|---|---|---|
| AB-13 | Office tab shows Colliers offices | Location name + address for company offices |
| AB-14 | On Office tab, **+ New Address** is hidden | Button not shown (only on My tab) |
| AB-15 | Cannot edit an office here | No working Edit (locked or not offered) |
| AB-16 | Cannot delete an office here | No Delete action on office rows |
| AB-17 | Office tab does not create company offices | No path on this page to add a Colliers office |

---

## Search (active tab)

| ID | Test | Expected |
|---|---|---|
| AB-18 | Search on My tab filters personal list | Matching nickname / address text shown; others hidden |
| AB-19 | Clear search on My tab | Full personal list restored |
| AB-20 | Search on Office tab filters offices | Matching offices shown; others hidden |
| AB-21 | Clear search on Office tab | Full office list restored |
| AB-22 | Same search box on both tabs | Query filters the **active** tab only; switching tabs applies that query to the other list |

---

## Helpers / store (support the page)

Pure logic — same rules, no UI.

| ID | Test | Expected |
|---|---|---|
| AB-H01 | `emptyPersonal` defaults country to Canada | `addressCountry === 'Canada'` |
| AB-H02 | `createPersonalRecord` assigns an id | Non-empty id |
| AB-H03 | `matchesSearch` by location name | e.g. “Home Office” |
| AB-H04 | `matchesSearch` by address text | Street / city / postal substring |
| AB-H05 | Empty query matches all | `true` |
| AB-H06 | Unrelated query matches none | `false` |
| AB-S01 | `addPersonal` grows the list | +1; fields saved |
| AB-S02 | `updatePersonal` changes only that id | Others unchanged |
| AB-S03 | `deletePersonal` removes that id | Others remain |

---

## Explicitly not in this file

| Topic | Where it belongs |
|---|---|
| Admin add / edit / delete company offices | Manage Addresses tests |
| Admin nav / Manage Addresses layout | Admin tests |
| Pick personal address as ship-to | Shipping tests |
| Order History | Separate Order History tests |
