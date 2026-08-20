# Tickets

This is the **source of truth** for RC Web Dev tickets. How the board works: [RC-WEB-DEV.md](RC-WEB-DEV.md). Product rules: [BUSINESS-RULES.md](BUSINESS-RULES.md). Product stories: [USER.md](USER.md), [ADMIN.md](ADMIN.md).

This is the one local ticket document. The board seeds from [devTracker.json](devTracker.json). If that file and this document disagree, **this file wins** — update the JSON to match. Supabase is a live overlay, not the source of truth.

## Snapshot

- **133 tickets**
- Status: In progress 0 · QA 3 · Ready for development 13 · Ideas 34 · Done 83
- Category: Technical 20 · Customer Portal 61 · Admin Portal 47 · Shared UI/UX 3 · Quality Assurance 2

## Index

| ID | Title | Status | Category | Assignee | Related |
| --- | --- | --- | --- | --- | --- |
| [DEV-010](#dev-010) | RC Web Dev tracker | Done | Technical | CZ | DEV-011, DEV-012, DEV-013, DEV-014, DEV-015, DEV-016 |
| [DEV-011](#dev-011) | QA: drag tickets between columns | Done | Technical | CZ | DEV-010 |
| [DEV-012](#dev-012) | QA: ticket sheet | Done | Technical | CZ | DEV-010 |
| [DEV-013](#dev-013) | QA: create ticket | QA | Technical | CZ | DEV-010 |
| [DEV-014](#dev-014) | QA: roadmap groups | Done | Technical | CZ | DEV-010 |
| [DEV-015](#dev-015) | Logs, pills, groups stay put | Done | Technical | CZ | DEV-010 |
| [DEV-016](#dev-016) | Ideas column: headers stay, tickets scroll | QA | Technical | CZ | DEV-010 |
| [DEV-020](#dev-020) | 1:1 with Kevin — 14 Aug 2026 | Done | Technical | CZ | — |
| [DEV-030](#dev-030) | Persist RC Web Dev tickets in Supabase | QA | Technical | CZ | — |
| [DEV-100](#dev-100) | Establish the Vue 2 application baseline | Done | Technical | CZ | DEV-101, DEV-102, DEV-103, DEV-104, DEV-105 |
| [DEV-101](#dev-101) | Define Vue 2 routes and hash-navigation fallback | Done | Technical | CZ | DEV-100 |
| [DEV-102](#dev-102) | Create Vue 2 reactive order and shipping state | Done | Technical | CZ | DEV-100 |
| [DEV-103](#dev-103) | Create adapters and named-action helpers for FileMaker | Done | Technical | CZ | DEV-100, DEV-106 |
| [DEV-104](#dev-104) | Port shared UI components to Vue 2 | Done | Technical | CZ | DEV-100 |
| [DEV-105](#dev-105) | Add Vue 2 quality and migration gates | Done | Quality Assurance | CZ | DEV-100 |
| [DEV-106](#dev-106) | FileMaker personal-addresses API | Ideas | Technical | — | DEV-103 |
| [DEV-107](#dev-107) | FileMaker products API | Ideas | Technical | — | DEV-103, USR-010 |
| [DEV-108](#dev-108) | FileMaker orders API | Ideas | Technical | — | DEV-103, USR-060, USR-090 |
| [DEV-109](#dev-109) | FileMaker titles API | Ideas | Technical | — | DEV-103, ADM-070, USR-033 |
| [DEV-110](#dev-110) | FileMaker login API | Ideas | Technical | — | DEV-103, ADM-011 |
| [USR-010](#usr-010) | Catalogue | Done | Customer Portal | CZ | USR-011, USR-012, USR-013, USR-014 |
| [USR-011](#usr-011) | Business Card English | Done | Customer Portal | CZ | USR-010 |
| [USR-012](#usr-012) | Business Card Bilingual | Done | Customer Portal | CZ | USR-010 |
| [USR-013](#usr-013) | Business Card French | Done | Customer Portal | CZ | USR-010 |
| [USR-014](#usr-014) | Catalogue price and pack size | Done | Customer Portal | CZ | USR-010 |
| [USR-020](#usr-020) | Card details | Done | Customer Portal | CZ | USR-021, USR-022, USR-023 |
| [USR-021](#usr-021) | Packaging 250/BX | Done | Customer Portal | CZ | USR-020 |
| [USR-022](#usr-022) | Pricing table | Done | Customer Portal | CZ | USR-020 |
| [USR-023](#usr-023) | Materials / brand notes | Done | Customer Portal | CZ | USR-020 |
| [USR-030](#usr-030) | Customize card | Done | Customer Portal | CZ | USR-031, USR-032, USR-033, USR-034, USR-035, USR-036, USR-037, USR-038, USR-039 |
| [USR-031](#usr-031) | Live preview | Done | Customer Portal | CZ | USR-030 |
| [USR-032](#usr-032) | Full name (max 50, two lines) | Ready for development | Customer Portal | CZ | USR-030 |
| [USR-033](#usr-033) | Designation dropdown (one per card) | Done | Customer Portal | CZ | USR-030 |
| [USR-034](#usr-034) | Email (max 40) | Ready for development | Customer Portal | CZ | USR-030 |
| [USR-035](#usr-035) | Mobile phone Canadian +1 | Done | Customer Portal | CZ | USR-030 |
| [USR-036](#usr-036) | Office address dropdown | Done | Customer Portal | CZ | USR-030 |
| [USR-037](#usr-037) | Company and website locked | Done | Customer Portal | CZ | USR-030 |
| [USR-038](#usr-038) | Add to Cart quantity 1 | Done | Customer Portal | CZ | USR-030 |
| [USR-039](#usr-039) | Allow users to select multiple designations | Ideas | Customer Portal | — | USR-030 |
| [USR-040](#usr-040) | Cart | Done | Customer Portal | CZ | USR-041, USR-042, USR-043, USR-044, USR-045, USR-046 |
| [USR-041](#usr-041) | Combine same product and details | Done | Customer Portal | CZ | USR-040 |
| [USR-042](#usr-042) | Separate cart items for different name or title | Done | Customer Portal | CZ | USR-040 |
| [USR-043](#usr-043) | Cart badge icon | Done | Customer Portal | CZ | USR-040 |
| [USR-044](#usr-044) | Clear cart | Done | Customer Portal | CZ | USR-040 |
| [USR-045](#usr-045) | Change quantity in cart / shipping | Done | Customer Portal | CZ | USR-040 |
| [USR-046](#usr-046) | Show printed-card count (qty × 250) | Ideas | Customer Portal | — | USR-040 |
| [USR-050](#usr-050) | Shipping | Done | Customer Portal | CZ | USR-051, USR-052, USR-053, USR-054, USR-055, USR-056, USR-057, USR-058 |
| [USR-051](#usr-051) | Add / remove / select ship-to location | Done | Customer Portal | CZ | USR-050 |
| [USR-052](#usr-052) | Location qty vs cart qty | Done | Customer Portal | CZ | USR-050 |
| [USR-053](#usr-053) | Shipping $0, no payment | Done | Customer Portal | CZ | USR-050 |
| [USR-054](#usr-054) | Split Order | Done | Customer Portal | CZ | USR-050 |
| [USR-055](#usr-055) | Cannot remove the last split | Done | Customer Portal | CZ | USR-050 |
| [USR-056](#usr-056) | Move cards between shipping groups | Done | Customer Portal | CZ | USR-050 |
| [USR-057](#usr-057) | Split Order creates an empty group | Done | Customer Portal | CZ | USR-050 |
| [USR-058](#usr-058) | Colliers offices on shipping, not NJ samples | Done | Customer Portal | CZ | USR-050 |
| [USR-060](#usr-060) | Order confirmed | Done | Customer Portal | CZ | USR-061, USR-062, USR-063 |
| [USR-061](#usr-061) | Success screen | Done | Customer Portal | CZ | USR-060 |
| [USR-062](#usr-062) | Clear cart and order draft | Done | Customer Portal | CZ | USR-060 |
| [USR-063](#usr-063) | Order review before confirm | Done | Customer Portal | CZ | USR-060 |
| [USR-070](#usr-070) | Header language | Done | Customer Portal | CZ | USR-071 |
| [USR-071](#usr-071) | Navbar EN/FR | Done | Customer Portal | CZ | USR-070 |
| [USR-080](#usr-080) | Address Book | Done | Customer Portal | CZ | USR-081, USR-082, USR-083, USR-084, USR-085, USR-086, USR-087, USR-088, USR-089 |
| [USR-081](#usr-081) | Address Book from profile menu | Done | Customer Portal | CZ | USR-080 |
| [USR-082](#usr-082) | My Address Book | Done | Customer Portal | CZ | USR-080 |
| [USR-083](#usr-083) | Office Addresses tab | Done | Customer Portal | CZ | USR-080 |
| [USR-084](#usr-084) | Search addresses | Done | Customer Portal | CZ | USR-080 |
| [USR-085](#usr-085) | Add a personal address | Done | Customer Portal | CZ | USR-080 |
| [USR-086](#usr-086) | Edit a personal address | Done | Customer Portal | CZ | USR-080 |
| [USR-087](#usr-087) | Delete a personal address | Done | Customer Portal | CZ | USR-080 |
| [USR-088](#usr-088) | Canada address fields on Address Book | Done | Customer Portal | CZ | USR-080 |
| [USR-089](#usr-089) | Shipping can use personal Address Book entries | Done | Customer Portal | CZ | USR-080 |
| [USR-090](#usr-090) | Order History | Done | Customer Portal | CZ | USR-091, USR-092, USR-093, USR-094, USR-095, USR-096, USR-097, USR-098 |
| [USR-091](#usr-091) | Order History from profile menu | Done | Customer Portal | CZ | USR-090 |
| [USR-092](#usr-092) | Order History table | Done | Customer Portal | CZ | USR-090 |
| [USR-093](#usr-093) | Search own orders | Done | Customer Portal | CZ | USR-090 |
| [USR-094](#usr-094) | Filter own orders by status | Done | Customer Portal | CZ | USR-090 |
| [USR-095](#usr-095) | View order card preview | Done | Customer Portal | CZ | USR-090 |
| [USR-096](#usr-096) | Repeat Order | Done | Customer Portal | CZ | USR-090 |
| [USR-097](#usr-097) | Confirmed orders appear in history | Done | Customer Portal | CZ | USR-090 |
| [USR-098](#usr-098) | Order Details sheet | Done | Customer Portal | CZ | USR-090 |
| [ADM-001](#adm-001) | Admin scoped from designer | Done | Admin Portal | CZ | — |
| [ADM-010](#adm-010) | Admin login and nav | Done | Admin Portal | CZ | ADM-011, ADM-012, ADM-013 |
| [ADM-011](#adm-011) | Admin login admin / 123 | Done | Admin Portal | CZ | ADM-010 |
| [ADM-012](#adm-012) | Admin header nav | Done | Admin Portal | CZ | ADM-010 |
| [ADM-013](#adm-013) | Admin profile menu | Done | Admin Portal | CZ | ADM-010 |
| [ADM-020](#adm-020) | Admin Dashboard | Done | Admin Portal | CZ | ADM-021, ADM-022, ADM-023 |
| [ADM-021](#adm-021) | System Options tiles | Done | Admin Portal | CZ | ADM-020 |
| [ADM-022](#adm-022) | Live address count | Ideas | Admin Portal | — | ADM-020 |
| [ADM-023](#adm-023) | Live title count | Ideas | Admin Portal | — | ADM-020 |
| [ADM-030](#adm-030) | Order History | Ideas | Admin Portal | — | ADM-031, ADM-032, ADM-033, ADM-034, ADM-035, ADM-036 |
| [ADM-031](#adm-031) | Order History table | Ideas | Admin Portal | — | ADM-030 |
| [ADM-032](#adm-032) | Search orders by name | Ideas | Admin Portal | — | ADM-030 |
| [ADM-033](#adm-033) | Filter orders by status | Ideas | Admin Portal | — | ADM-030 |
| [ADM-034](#adm-034) | View order card preview | Ideas | Admin Portal | — | ADM-030 |
| [ADM-035](#adm-035) | Repeat Order | Ideas | Admin Portal | — | ADM-030 |
| [ADM-036](#adm-036) | Order History from profile menu | Ideas | Admin Portal | — | ADM-030 |
| [ADM-040](#adm-040) | Invoice History | Ideas | Admin Portal | — | ADM-041, ADM-042 |
| [ADM-041](#adm-041) | Invoice table | Ideas | Admin Portal | — | ADM-040 |
| [ADM-042](#adm-042) | Download invoice | Ideas | Admin Portal | — | ADM-040 |
| [ADM-050](#adm-050) | Reporting | Ideas | Admin Portal | — | ADM-051, ADM-052, ADM-053, ADM-054 |
| [ADM-051](#adm-051) | Monthly Spend Overview | Ideas | Admin Portal | — | ADM-050 |
| [ADM-052](#adm-052) | Recent Activity | Ideas | Admin Portal | — | ADM-050 |
| [ADM-053](#adm-053) | Spend by Department | Ideas | Admin Portal | — | ADM-050 |
| [ADM-054](#adm-054) | Export Data | Ideas | Admin Portal | — | ADM-050 |
| [ADM-060](#adm-060) | Manage Addresses | Ready for development | Admin Portal | CZ | ADM-061, ADM-062, ADM-063, ADM-064, ADM-065, ADM-066, ADM-067 |
| [ADM-061](#adm-061) | List office addresses | Ready for development | Admin Portal | CZ | ADM-060 |
| [ADM-062](#adm-062) | Add address | Ready for development | Admin Portal | CZ | ADM-060 |
| [ADM-063](#adm-063) | Remove address | Ready for development | Admin Portal | CZ | ADM-060 |
| [ADM-064](#adm-064) | Edit address | Ready for development | Admin Portal | CZ | ADM-060 |
| [ADM-065](#adm-065) | New / edit address form | Ready for development | Admin Portal | CZ | ADM-060 |
| [ADM-066](#adm-066) | Address form actions | Ready for development | Admin Portal | CZ | ADM-060 |
| [ADM-067](#adm-067) | Customize and shipping use admin addresses | Ready for development | Admin Portal | CZ | ADM-060 |
| [ADM-070](#adm-070) | Manage Titles | Ideas | Admin Portal | — | ADM-071, ADM-072, ADM-073, ADM-074, ADM-075 |
| [ADM-071](#adm-071) | List designations | Ideas | Admin Portal | — | ADM-070 |
| [ADM-072](#adm-072) | Add title | Ideas | Admin Portal | — | ADM-070 |
| [ADM-073](#adm-073) | Delete title | Ideas | Admin Portal | — | ADM-070 |
| [ADM-074](#adm-074) | Inline edit title | Ideas | Admin Portal | — | ADM-070 |
| [ADM-075](#adm-075) | Customize titles come from Manage Titles | Ideas | Admin Portal | — | ADM-070 |
| [ADM-080](#adm-080) | Address Book (admin) | Done | Admin Portal | CZ | ADM-081, ADM-082, ADM-083 |
| [ADM-081](#adm-081) | Address Book from admin profile menu | Done | Admin Portal | CZ | ADM-080 |
| [ADM-082](#adm-082) | Admin My Address Book | Done | Admin Portal | CZ | ADM-080 |
| [ADM-083](#adm-083) | Admin Office Addresses tab | Done | Admin Portal | CZ | ADM-080 |
| [F-20](#f-20) | Remove footer language dropdown | Done | Shared UI/UX | CZ | — |
| [F-21](#f-21) | Automated tests | Ideas | Quality Assurance | — | — |
| [F-23](#f-23) | Light theme | Done | Shared UI/UX | CZ | — |
| [F-19](#f-19) | Dark theme | Done | Shared UI/UX | CZ | — |
| [IDEA-01](#idea-01) | Email character limit decided (40) | Done | Customer Portal | CZ | — |
| [IDEA-03](#idea-03) | Port UI into Klai Studio | Ideas | Technical | — | DEV-100 |
| [ADM-N1](#adm-n1) | Edit address should fill City / Province / Postal | Ready for development | Admin Portal | CZ | — |
| [ADM-N2](#adm-n2) | Default country Canada, not United States | Ready for development | Admin Portal | CZ | — |
| [ADM-N3](#adm-n3) | Save Draft on empty address form | Ready for development | Admin Portal | CZ | — |
| [ADM-N4](#adm-n4) | Repeat Order should use Colliers offices | Ideas | Admin Portal | — | — |
| [ADM-N5](#adm-n5) | Order preview name and email should match | Ideas | Admin Portal | — | — |

## Technical

<a id="dev-010"></a>
### DEV-010 — RC Web Dev tracker

**Done** · high · CZ

RC Web Dev board at #/rc-web-dev. Rainbow profile item. Rainbow user ring only while on this page. Drag columns, ticket sheet, create, priorities.

Acceptance criteria:

- The tracker is available at #/rc-web-dev.
- Tickets can be viewed, created, opened, prioritized, and moved through the workflow.

Notes: docs/RC-WEB-DEV.md

<a id="dev-011"></a>
#### DEV-011 — QA: drag tickets between columns

**Done** · high · CZ · child of [DEV-010](#dev-010)

Drag a ticket to another column. A shadow follows the cursor and a placeholder shows the drop. The card stays in the new column after refresh.

Acceptance criteria:

- Dragging a ticket shows a visible card shadow and drop placeholder.
- After a valid drop and page refresh, the ticket remains in the destination column.

Notes: docs/RC-WEB-DEV.md

<a id="dev-012"></a>
#### DEV-012 — QA: ticket sheet

**Done** · high · CZ · child of [DEV-010](#dev-010)

Click a ticket. Sheet opens with status, priority, description, and related links. Close with X, backdrop, or Escape. Related rows open that ticket.

Acceptance criteria:

- Selecting a ticket opens a sheet showing its current status, priority, description, and related tickets.
- The sheet closes with the X button, backdrop click, or Escape key, and related-ticket rows open the selected ticket.

Notes: docs/RC-WEB-DEV.md

<a id="dev-013"></a>
#### DEV-013 — QA: create ticket

**QA** · high · CZ · child of [DEV-010](#dev-010)

Use Create ticket or + on Ideas. Title, priority, assigned (CZ or KC), category, description. New tickets get an RC-xx id.

Acceptance criteria:

- Create Ticket and the Ideas-column add button open a form with title, priority, assignee, category, and description fields.
- Submitting valid data creates one ticket with the next available RC-xx ID and displays it in Ideas.

Notes: docs/RC-WEB-DEV.md

<a id="dev-014"></a>
#### DEV-014 — QA: roadmap groups

**Done** · medium · CZ · child of [DEV-010](#dev-010)

Roadmap is grouped by category and collapsed when a group is already done. Unassigned Ideas sit below, grouped by category, and do not count in the percentage.

Acceptance criteria:

- The roadmap groups tickets under the correct category and collapses categories whose tickets are all complete.
- Unassigned Ideas appear below the roadmap and are excluded from completion-percentage calculations.

Notes: docs/RC-WEB-DEV.md

<a id="dev-015"></a>
#### DEV-015 — Logs, pills, groups stay put

**Done** · high · CZ · child of [DEV-010](#dev-010)

Logs tab. New / Updated / In progress pills as the stand-in for later approval. A move keeps the ticket’s category. The destination group opens and gets a bouncing dot on the category title — no blue ring around the section.

Acceptance criteria:

- Creating, editing, and moving tickets produces accurate entries in the Logs tab and the correct review pill.
- Moving a ticket preserves its category, opens the destination group, and highlights that category with the intended indicator.

Notes: docs/RC-WEB-DEV.md

<a id="dev-016"></a>
#### DEV-016 — Ideas column: headers stay, tickets scroll

**QA** · high · CZ · child of [DEV-010](#dev-010)

In Ideas, category headers always stay in the column. An open group’s tickets scroll in the space above the headers below it. No nested column-plus-group scroll. Soft Tailwind tints per category — not solid 600 bars.

Acceptance criteria:

- Category headers remain visible while tickets in an expanded Ideas group scroll within the available space.
- The Ideas column has a single clear scrolling behavior and retains the configured soft category colours.

Notes: docs/RC-WEB-DEV.md

<a id="dev-020"></a>
### DEV-020 — 1:1 with Kevin — 14 Aug 2026

**Done** · high · CZ

Scheduled CZ/KC board walkthrough on 14 Aug 2026. Follow-ups live in the tickets (Address Book QA, Vue 2 port QA, next take is ADM-060). Close this one-off meeting ticket.

Acceptance criteria:

- The board walkthrough covers current progress, logs, priorities, and open decisions.
- Decisions and follow-up actions from the meeting are captured in the relevant tickets.

Notes: RC Web Dev. Meeting date passed; do not keep a Tomorrow ticket in In progress.

<a id="dev-030"></a>
### DEV-030 — Persist RC Web Dev tickets in Supabase

**QA** · high · CZ

Holding store until FileMaker. Tables rc_tickets and rc_ticket_logs. Create, move, and edit on the board should save there so work survives refresh. Do not run live Supabase commands without asking first (.cursor/rules/supabase-permission.mdc).

Acceptance criteria:

- Creating, editing, or moving a ticket writes the corresponding ticket and log data to Supabase.
- Reloading the application restores the latest saved ticket states without duplicating tickets or logs.

Notes: RC Web Dev


<a id="dev-100"></a>
### DEV-100 — Establish the Vue 2 application baseline

**Done** · high · CZ

Replace the Vue 3 runtime and build assumptions with a clean Vue 2-compatible baseline that runs as a standalone browser application and can later be moved into Clay Studio. The whole repo is Vue 2 Options API. RC Web Dev also runs on this Vue 2 app for Cursor + GitHub Pages (never port RC to Clay).

Acceptance criteria:

- The project installs from a clean checkout and starts with the documented development command.
- The production build completes successfully and opens without a blank screen, console error, or unhandled rejection.
- package.json and the lockfile resolve Vue 2.x and Vue 2-compatible versions of the router, state, test, and UI dependencies.
- No Vue 3-only bootstrap or component syntax remains, including createApp, script setup, Teleport, or Vue 3-only lifecycle APIs.
- The README records the supported Node version, install command, development command, test command, and production-build command.

Notes: Foundation for all Vue 2 implementation tickets. Root Vue 2 app. Personal-address FileMaker API is DEV-106.


<a id="dev-101"></a>
### DEV-101 — Define Vue 2 routes and hash-navigation fallback

**Done** · high · CZ

Create the page architecture in Vue 2 and ensure navigation can operate with Vue Router in the standalone build and a hash fallback when BF.router is unavailable.

Acceptance criteria:

- Every approved V2 page has one documented route and one owning page component; modal or drawer UI is not represented as a separate page route unless it must be directly addressable.
- Direct loading and browser refresh work for catalogue, details, customization, cart/shipping, review, confirmation-safe-state, and login.
- Navigation falls back to window.location.hash when BF.router is undefined and never throws a BF.router undefined error.
- Unknown routes lead to a safe not-found or catalogue page and do not leave a blank application shell.
- Back and forward navigation do not clear the active order draft unless the user has successfully submitted or explicitly cleared it.

Notes: Use hash routes compatible with the future Clay Studio host.


<a id="dev-102"></a>
### DEV-102 — Create Vue 2 reactive order and shipping state

**Done** · high · CZ

Create a single order-state model for cart lines, shipping groups, locations, allocations, totals, language, and submission state using Vue 2-safe reactivity.

Acceptance criteria:

- The model has one source of truth for ordered box quantity; printed-card count, price, badge count, and allocation totals are derived values.
- Adding or deleting reactive keys uses Vue.set, Vue.delete, or an equivalent Vue 2-safe replacement pattern.
- Creating, moving, allocating, removing, and clearing items cannot produce negative values, duplicate IDs, orphan allocations, or mismatched order totals.
- All new cards enter Shipping Group 1; a new split group begins empty; moving a card preserves total ordered quantity.
- State-transition helpers have automated tests independent of rendered components.

Notes: Implements the V2 cart and split-order invariants.


<a id="dev-103"></a>
### DEV-103 — Create adapters and named-action helpers for FileMaker

**Done** · high · CZ

Separate browser-test data from future FileMaker operations. Define helper files and named-action contracts for products, addresses, designations, order submission, and order lookup where approved.

Acceptance criteria:

- The standalone application uses mock adapters with the same request and response shapes as the future FileMaker adapters.
- Each external operation has one named action or adapter function with documented input, success output, validation failure, request failure, and timeout behavior.
- Page components do not call FileMaker, BF, fetch, or mock data directly; they call the adapter interface.
- Requests expose loading state, prevent duplicate submission where applicable, and surface a recoverable error without clearing valid user state.
- No credential, server URL, FileMaker file name, or production record identifier is hardcoded in a component.

Notes: Mike can implement FileMaker scripts against these contracts while Carlos builds the Vue 2 front end. Remaining FileMaker work: [DEV-106](#dev-106)–[DEV-110](#dev-110).


<a id="dev-104"></a>
### DEV-104 — Port shared UI components to Vue 2

**Done** · high · CZ

Port the reusable shell and controls before page-by-page development: header, footer, buttons, form fields, selects, multi-select, card preview, drawers, dialogs, loading, empty, and error states.

Acceptance criteria:

- Every shared component compiles in Vue 2 and uses supported props, events, slots, and v-model conventions.
- Inputs expose label, required state, help text, invalid state, and error text without relying on placeholder text as the only label.
- Dialog and drawer components close through their explicit controls and Escape, restore focus, and do not allow background interaction while open.
- Components remain usable at approved desktop and mobile widths without clipped content or nested scrolling that traps the user.
- Shared components contain no Colliers order rules that belong in state helpers or page orchestration.

Notes: Complete before porting feature pages to reduce repeated migration work.


<a id="dev-105"></a>
### DEV-105 — Add Vue 2 quality and migration gates

**Done** · high · CZ

Create automated and manual checks that prevent Vue 3 code, broken business rules, or Clay-incompatible coupling from entering the Vue 2 delivery.

Acceptance criteria:

- CI or the documented local verification command runs linting, unit tests, and a production build and returns a non-zero exit code on failure.
- A dependency check confirms Vue 2.x and rejects known Vue 3-only packages or APIs.
- The critical business-rule suite covers cart merging, quantity math, empty split groups, and cart reset.
- The standalone build can complete the approved order flow using mock adapters.
- A migration checklist confirms that components do not directly depend on browser-only storage, Vue Router, or FileMaker globals without an adapter or fallback.

Notes: Release gate for standalone Vue 2 and later Clay Studio migration. npm run check:v2


<a id="dev-106"></a>
### DEV-106 — FileMaker personal-addresses API

**Ideas** · high · unassigned

Mike / FileMaker: session-scoped personal addresses for the signed-in user. Vue 2 keeps personal rows in localStorage until this exists. Same JSON shape as `GET /api/addresses` (`success`, `count`, `data[]`). Do not call these endpoints from Vue 2 until they are live. Offices stay on `/api/addresses`.

Acceptance criteria:

- `GET /api/personal-addresses` returns only the signed-in user’s personal addresses.
- `POST /api/personal-addresses`, `PATCH /api/personal-addresses/:id`, and `DELETE /api/personal-addresses/:id` create, update, and delete that user’s rows only.
- Response records use the same fields as office addresses: addressName, addressStreet, addressStreet2, addressCity, addressProvince, addressPostalZip, addressCountry.

Notes: colliers-vue2 adapters/profileStorage.js · DEV-103. Related USR-080.

<a id="dev-107"></a>
### DEV-107 — FileMaker products API

**Ideas** · high · unassigned

Mike / FileMaker: catalogue products for English, Bilingual, and French business cards. Vue still reads src/data/products.js (and colliers-vue2). Adapter contract is GET /api/products.

Acceptance criteria:

- GET /api/products returns the three business-card products with SKU, price, pack size, and language.
- Vue adapters can replace the local products.js list without changing catalogue or details pages.

Notes: Delivery · WEB | Products | Load. colliers-vue2 adapters still mock this.

<a id="dev-108"></a>
### DEV-108 — FileMaker orders API

**Ideas** · high · unassigned

Mike / FileMaker: create an order on confirm and load this user’s order history. Vue 2 confirm is a mock submit; history is localStorage. Adapter contracts: POST /api/orders and GET /api/orders.

Acceptance criteria:

- POST /api/orders saves the reviewed cart, shipping groups, and addresses and returns an order id.
- GET /api/orders returns only the signed-in user’s orders with enough payload for Order History, Order Details, and Repeat Order.

Notes: Delivery · WEB | Orders | Create / Load. Related USR-060, USR-090, ADM-030.

<a id="dev-109"></a>
### DEV-109 — FileMaker titles API

**Ideas** · high · unassigned

Mike / FileMaker: designations used on Customize and Admin Manage Titles. Vue still uses jobTitles in products.js. Adapter contract: GET / POST / PATCH / DELETE /api/titles.

Acceptance criteria:

- GET /api/titles returns the active designation list used by Customize.
- Admin can add, update, and delete titles through /api/titles, and Customize picks up the change.

Notes: Delivery · WEB | Titles | *. Related ADM-070, USR-033.

<a id="dev-110"></a>
### DEV-110 — FileMaker login API

**Ideas** · high · unassigned

Mike / FileMaker: real Partner Portal login. Vue preview still accepts demo / any email and admin / 123 in the browser. Adapter contract: POST /api/login.

Acceptance criteria:

- POST /api/login authenticates the user and returns a session plus user vs admin access.
- Failed login does not grant a session. Preview-only demo/admin gates are removed once this is live.

Notes: Delivery · WEB | Auth | Login. Preview login is not a product feature.

<a id="idea-03"></a>
### IDEA-03 — Port UI into Klai Studio

**Ideas** · low · unassigned

Intended later. Same standalone layout markers in colliers-environment.css.

Acceptance criteria:

- Clay Studio migration remains separated from the standalone Vue delivery scope.
- The ticket records the approved migration entry criteria before implementation begins.

Notes: FEATURES.md · README.md · blocked on standalone Vue 2 in colliers-vue2/ (DEV-100)

## Customer Portal

<a id="usr-010"></a>
### USR-010 — Catalogue

**Done** · medium · CZ

Catalogue page. Three products, same price and pack size. Bilingual is the product name, not navbar language.

Acceptance criteria:

- The catalogue displays the English, Bilingual, and French business-card products.
- Selecting any catalogue product opens the correct details page.

Notes: USER.md · CatalogPage.vue · F-01 F-02 F-03

<a id="usr-011"></a>
#### USR-011 — Business Card English

**Done** · medium · CZ · child of [USR-010](#usr-010)

SKU BCAD-PL-ENG. $63 per box, 250 cards.

Acceptance criteria:

- The English business card is labelled correctly and displays a price of $63 per box.
- The product shows that one box contains 250 printed business cards.

Notes: USER.md · F-01

<a id="usr-012"></a>
#### USR-012 — Business Card Bilingual

**Done** · medium · CZ · child of [USR-010](#usr-010)

SKU BCAD-PL-BIL. Product name, not the EN/FR toggle.

Acceptance criteria:

- The Bilingual business card appears as a distinct product with the correct product name.
- Selecting it does not change the application interface language.

Notes: USER.md · F-02

<a id="usr-013"></a>
#### USR-013 — Business Card French

**Done** · medium · CZ · child of [USR-010](#usr-010)

SKU BCAD-PL-FR. $63 per box, 250 cards.

Acceptance criteria:

- The French business card is labelled correctly and displays a price of $63 per box.
- The product shows that one box contains 250 printed business cards.

Notes: USER.md · F-03

<a id="usr-014"></a>
#### USR-014 — Catalogue price and pack size

**Done** · medium · CZ · child of [USR-010](#usr-010)

$63 per box (shipping included), 250 cards per box, shown on the catalogue.

Acceptance criteria:

- Every catalogue card displays $63 per box and 250 cards per box.
- Price and pack-size wording is consistent across all three products.

Notes: USER.md. The $63 box fee includes shipping; cart Shipping & Handling stays $0.00.

<a id="usr-020"></a>
### USR-020 — Card details

**Done** · medium · CZ

Details page: packaging, print on demand, pricing table, materials / brand notes.

Acceptance criteria:

- The details page shows packaging, pricing, materials, and brand information for the selected product.
- The user can continue from product details to card customization.

Notes: USER.md · DetailsPage.vue · F-04

<a id="usr-021"></a>
#### USR-021 — Packaging 250/BX

**Done** · medium · CZ · child of [USR-020](#usr-020)

Details page shows packaging 250/BX.

Acceptance criteria:

- The details page clearly states that one box contains 250 cards.
- The pack-size value is consistent with the catalogue and cart calculations.

Notes: USER.md · F-04

<a id="usr-022"></a>
#### USR-022 — Pricing table

**Done** · medium · CZ · child of [USR-020](#usr-020)

Details page pricing tiers.

Acceptance criteria:

- The pricing table displays the configured quantity tiers and corresponding prices.
- Tier values are readable and do not conflict with the $63-per-box base price.

Notes: USER.md · F-04

<a id="usr-023"></a>
#### USR-023 — Materials / brand notes

**Done** · medium · CZ · child of [USR-020](#usr-020)

Details page materials and brand notes.

Acceptance criteria:

- The details page displays the approved material specifications.
- The Colliers brand notes are visible and associated with the selected card product.

Notes: USER.md · F-04

<a id="usr-030"></a>
### USR-030 — Customize card

**Done** · medium · CZ

Vue customize is ahead of the designer. Do not copy AI Studio customize.

Acceptance criteria:

- The customization form supports all approved personal and office fields.
- Valid customization data can be previewed and added to the cart without losing the entered values.

Notes: USER.md · CustomizePage.vue · F-05

<a id="usr-031"></a>
#### USR-031 — Live preview

**Done** · medium · CZ · child of [USR-030](#usr-030)

Preview updates as fields change.

Acceptance criteria:

- Changing a supported customization field updates the card preview immediately.
- The preview matches the values currently entered or selected in the form.

Notes: USER.md · CardPreview.vue

<a id="usr-032"></a>
#### USR-032 — Full name (max 50, two lines)

**Ready for development** · medium · CZ · child of [USR-030](#usr-030)

Name field max 50 characters, two lines on the card. Vue still caps at 30.

Acceptance criteria:

- The full-name field accepts no more than 50 characters.
- A valid long name renders on no more than two lines without overlapping other card content.

Notes: USER.md · BUSINESS-RULES.md section 4

<a id="usr-033"></a>
#### USR-033 — Designation dropdown (one per card)

**Done** · medium · CZ · child of [USR-030](#usr-030)

Vue today: one designation per card from the dropdown. Multiple designations is [USR-039](#usr-039).

Acceptance criteria:

- The user can select one available designation from the dropdown.
- The selected designation appears correctly on the live preview and saved cart item.

Notes: USER.md · BUSINESS-RULES.md section 4 · CU-02 / CU-03 are USR-039

<a id="usr-034"></a>
#### USR-034 — Email (max 40)

**Ready for development** · medium · CZ · child of [USR-030](#usr-030)

Email max 40. Vue still caps at 30. Limit decided in [IDEA-01](#idea-01).

Acceptance criteria:

- The email field accepts no more than 40 characters.
- The accepted email value appears unchanged on the preview and cart item.

Notes: USER.md · BUSINESS-RULES.md section 4

<a id="usr-035"></a>
#### USR-035 — Mobile phone Canadian +1

**Done** · medium · CZ · child of [USR-030](#usr-030)

Canadian +1, formatted as the user types.

Acceptance criteria:

- The phone field accepts a Canadian number with the +1 country code.
- Digits are formatted consistently while typing and the final value appears correctly on the preview.

Notes: USER.md

<a id="usr-036"></a>
#### USR-036 — Office address dropdown

**Done** · medium · CZ · child of [USR-030](#usr-030)

Colliers offices from products.js. Later wire to ADM-067.

Acceptance criteria:

- The office dropdown lists only configured Colliers office addresses.
- Selecting an office updates the card preview and the selection remains on the cart item.

Notes: USER.md

<a id="usr-037"></a>
#### USR-037 — Company and website locked

**Done** · medium · CZ · child of [USR-030](#usr-030)

Company Colliers. Website colliers.com/canada.

Acceptance criteria:

- Company is displayed as Colliers and cannot be edited by the user.
- Website is displayed as colliers.com/canada and cannot be edited by the user.

Notes: USER.md

<a id="usr-038"></a>
#### USR-038 — Add to Cart quantity 1

**Done** · medium · CZ · child of [USR-030](#usr-030)

Each Add to Cart click adds quantity 1.

Acceptance criteria:

- Each Add to Cart action adds exactly one box for the configured card.
- The cart badge and line quantity increase by one without losing customization details.

Notes: USER.md

<a id="usr-039"></a>
#### USR-039 — Allow users to select multiple designations

**Ideas** · medium · unassigned · child of [USR-030](#usr-030)

One or more designations from the available list. Selected values appear below the field and on the preview. A selected designation can be removed. Vue still allows one.

Acceptance criteria:

- Users can select more than one designation.
- Selected designations appear below the field, on the card preview, and the control shows how many are selected.
- Users can remove a selected designation.
- Removed designations disappear from the preview.

Notes: USER.md · F-24 · BUSINESS-RULES.md CU-02, CU-03. Current Vue is one designation ([USR-033](#usr-033)).

<a id="usr-040"></a>
### USR-040 — Cart

**Done** · medium · CZ

Cart drawer: add, quantity, combine same details, keep different name or title separate.

Acceptance criteria:

- The cart displays every added card with its customization, box quantity, and price.
- Users can update quantities or clear the cart and totals recalculate correctly.

Notes: USER.md · CartDrawer.vue · F-06

<a id="usr-041"></a>
#### USR-041 — Combine same product and details

**Done** · medium · CZ · child of [USR-040](#usr-040)

Same product + same details combine into one cart item.

Acceptance criteria:

- Cards with the same product and identical customization are combined into one cart line.
- Combining lines increases quantity without changing the saved customization data.

Notes: USER.md · F-06

<a id="usr-042"></a>
#### USR-042 — Separate cart items for different name or title

**Done** · medium · CZ · child of [USR-040](#usr-040)

Different name or title stay separate rows. TC-05 / TC-05b.

Acceptance criteria:

- Cards with different names remain separate cart lines.
- Cards with different titles or designation selections remain separate cart lines.

Notes: USER.md · F-06

<a id="usr-043"></a>
#### USR-043 — Cart badge icon

**Done** · medium · CZ · child of [USR-040](#usr-040)

Red number on the header cart icon = total quantity.

Acceptance criteria:

- The header badge equals the total number of boxes across all cart lines.
- The badge updates immediately after adding, removing, clearing, or changing quantity.

Notes: USER.md · AppHeader.vue · F-07

<a id="usr-044"></a>
#### USR-044 — Clear cart

**Done** · medium · CZ · child of [USR-040](#usr-040)

Empty the cart. Badge goes to 0.

Acceptance criteria:

- Clear Cart removes every cart line after the action is confirmed.
- The cart badge and cart totals return to zero.

Notes: USER.md · F-08

<a id="usr-045"></a>
#### USR-045 — Change quantity in cart / shipping

**Done** · medium · CZ · child of [USR-040](#usr-040)

Qty on a cart line. Shipping location qty does not change cart qty.

Acceptance criteria:

- Changing a cart-line quantity updates its subtotal and the order total.
- Changing a shipping-location allocation does not modify the cart-line quantity.

Notes: USER.md

<a id="usr-046"></a>
#### USR-046 — Show printed-card count (qty × 250)

**Ideas** · medium · unassigned · child of [USR-040](#usr-040)

Quantity 3 = 750 printed cards = $189.00. Vue shows boxes and price only.

Acceptance criteria:

- Each cart and review line displays printed-card total as box quantity multiplied by 250.
- For quantity 3, the interface shows 750 printed cards and a $189.00 line total.

Notes: USER.md · BUSINESS-RULES.md PR-01, PR-02

<a id="usr-050"></a>
### USR-050 — Shipping

**Done** · medium · CZ

Shipping page. $0.00 (included in the $63 box fee). No payment. Location qty does not change cart qty.

Acceptance criteria:

- The shipping page displays cart items, shipping groups, and selected locations accurately.
- Shipping remains $0.00 and the user can continue without entering payment information.

Notes: USER.md · ShippingPage.vue · F-10. Shipping is not calculated separately — it is built into the $63 card box fee.

<a id="usr-051"></a>
#### USR-051 — Add / remove / select ship-to location

**Done** · medium · CZ · child of [USR-050](#usr-050)

Add, remove, or pick a saved location.

Acceptance criteria:

- The user can add or select a saved ship-to location for a shipping group.
- The user can remove an assigned location without deleting or changing the cart item.

Notes: USER.md · LocationDrawer.vue

<a id="usr-052"></a>
#### USR-052 — Location qty vs cart qty

**Done** · medium · CZ · child of [USR-050](#usr-050)

Qty on a location does not change cart quantity.

Acceptance criteria:

- A location allocation can be changed independently within its shipping group.
- Changing the allocation does not change the original cart quantity or order total.

Notes: USER.md · F-10

<a id="usr-053"></a>
#### USR-053 — Shipping $0, no payment

**Done** · medium · CZ · child of [USR-050](#usr-050)

Shipping is $0.00 because it is built into the $63 card box fee. There is no payment step.

Acceptance criteria:

- Shipping cost displays as $0.00 throughout shipping and review.
- No credit-card, billing, or payment step is presented before confirmation.

Notes: USER.md. Do not add a shipping-cost calculation. The $63 box fee already includes shipping.

<a id="usr-054"></a>
#### USR-054 — Split Order

**Done** · medium · CZ · child of [USR-050](#usr-050)

Split Order adds a shipping group. Empty-group behaviour is [USR-057](#usr-057). Cannot remove the last split.

Acceptance criteria:

- Split Order creates one additional shipping group.
- Repeated use creates distinct groups without changing the total ordered quantity.

Notes: USER.md · F-09 · BUSINESS-RULES.md SH-02. Empty new group is USR-057.

<a id="usr-055"></a>
#### USR-055 — Cannot remove the last split

**Done** · medium · CZ · child of [USR-050](#usr-050)

Remove Split only when there is more than one split.

Acceptance criteria:

- Remove Split is available when more than one shipping group exists.
- The final remaining shipping group cannot be removed.

Notes: USER.md · F-09

<a id="usr-056"></a>
#### USR-056 — Move cards between shipping groups

**Done** · medium · CZ · child of [USR-050](#usr-050)

Move a card from one shipping group to another without duplicating quantity. Vue 2 shipping has a group picker when more than one split exists. Vue 3 has the same moveItem helper.

Acceptance criteria:

- A card can be moved from one shipping group to another.
- After the move, the card exists only in the destination group and total ordered quantity is unchanged.

Notes: USER.md · F-25 · BUSINESS-RULES.md SH-04. Built in colliers-vue2/ and src/.

<a id="usr-057"></a>
#### USR-057 — Split Order creates an empty group

**Done** · medium · CZ · child of [USR-050](#usr-050)

Split Order creates a new empty shipping group. Products and locations from the existing group are not duplicated. New cards stay in Shipping Group 1 until moved (USR-056).

Acceptance criteria:

- Split Order creates a new group with no cards and no selected address. Products and locations from the existing group are not duplicated.
- Existing and newly added cards remain in Shipping Group 1 until the user moves them.

Notes: USER.md · F-26 · BUSINESS-RULES.md SH-02, SH-03

<a id="usr-058"></a>
#### USR-058 — Colliers offices on shipping, not NJ samples

**Done** · medium · CZ · child of [USR-050](#usr-050)

Shipping locations are Colliers offices from GET /api/addresses plus the user’s personal Address Book. NJ sample seeds (South Plainfield / Millville) are gone. Personal rows are USR-089.

Acceptance criteria:

- Shipping locations contain approved Colliers offices and no New Jersey sample addresses.
- The shipping address records use the same fields and values as the managed Colliers office list.

Notes: USER.md · F-28. Designer 19 Aug 2026 offices are Canadian. Do not duplicate USR-089.

<a id="usr-060"></a>
### USR-060 — Order confirmed

**Done** · medium · CZ

Success screen. Clears cart and order draft. No payment. User order history is [USR-090](#usr-090) (Vue 2 localStorage in colliers-vue2/).

Acceptance criteria:

- Submitting a valid reviewed order opens the confirmation screen once.
- Successful confirmation clears the cart and shipping draft without creating a payment step. Order History is [USR-090](#usr-090).

Notes: USER.md · ConfirmedPage.vue · F-11

<a id="usr-061"></a>
#### USR-061 — Success screen

**Done** · medium · CZ · child of [USR-060](#usr-060)

Thank-you / confirmed page after Review / Checkout.

Acceptance criteria:

- The confirmation screen clearly states that the order was submitted successfully.
- Refreshing or navigating after confirmation does not resubmit the same order.

Notes: USER.md · F-11

<a id="usr-062"></a>
#### USR-062 — Clear cart and order draft

**Done** · medium · CZ · child of [USR-060](#usr-060)

Confirming clears cart and the shipping draft.

Acceptance criteria:

- After confirmation, the cart contains no items and its badge is zero.
- Returning to shipping starts with a new empty order draft.

Notes: USER.md · F-11

<a id="usr-063"></a>
#### USR-063 — Order review before confirm

**Done** · medium · CZ · child of [USR-060](#usr-060)

Review products, quantities, shipping groups, and addresses before submit. Vue 2 has ReviewPage at #/review. Vue 3 still has no review route (shipping → confirmed). Clay target is Vue 2.

Acceptance criteria:

- A review step shows every card, box quantity, printed-card total, shipping group, and selected address.
- The user can return to correct the order or confirm it without entering payment details.

Notes: USER.md · F-27 · BUSINESS-RULES.md section 7, OR-01. colliers-vue2/src/pages/ReviewPage.vue

<a id="usr-070"></a>
### USR-070 — Header language

**Done** · medium · CZ

Navbar EN/FR switches site chrome. Footer language is a duplicate (F-20).

Acceptance criteria:

- The header provides the single EN/FR language control for the application.
- Changing the language updates supported interface labels without changing the selected product.

Notes: USER.md · AppHeader.vue · F-22

<a id="usr-071"></a>
#### USR-071 — Navbar EN/FR

**Done** · medium · CZ · child of [USR-070](#usr-070)

Header EN/FR. Example: Add to Cart → Ajouter au panier.

Acceptance criteria:

- Selecting EN displays supported navigation and action labels in English.
- Selecting FR displays the corresponding French labels, including Ajouter au panier.

Notes: USER.md · F-22

<a id="usr-080"></a>
### USR-080 — Address Book

**Done** · medium · CZ

Demo user profile → Address Book. My Address Book is personal ship-to addresses this user can add, edit, and delete. Office Addresses is view-only Colliers offices. Company office create/edit/delete is admin Manage Addresses (ADM-060). Same Address Book page as ADM-080.

Acceptance criteria:

- A signed-in demo user can open Address Book from the profile menu and see My Address Book and Office Addresses.
- The user can add, edit, and delete personal addresses. Company office add, edit, and delete stay on ADM-060.

Notes: USER.md · F-29. Demo user can create personal addresses only. Offices are read-only here. Vue 2 stores personal rows in localStorage keyed by session.email until [DEV-106](#dev-106).


<a id="usr-081"></a>
#### USR-081 — Address Book from profile menu

**Done** · medium · CZ · child of [USR-080](#usr-080)

User profile menu includes Address Book (with Order History and Log out). Vue 2 profile has Address Book, Order History, and Log out.

Acceptance criteria:

- Address Book appears in the regular-user profile menu.
- Choosing Address Book opens the Address Book page.

Notes: USER.md · F-29


<a id="usr-082"></a>
#### USR-082 — My Address Book

**Done** · medium · CZ · child of [USR-080](#usr-080)

Tab lists this user’s personal locations (name + address) with New Address, Edit, and Delete. Designer samples: Home Office, Temporary Location.

Acceptance criteria:

- My Address Book lists only the current user’s personal addresses, each with a location name and address.
- The user can add, edit, and delete personal rows. Colliers offices do not appear on this tab.

Notes: USER.md · F-29


<a id="usr-083"></a>
#### USR-083 — Office Addresses tab

**Done** · medium · CZ · child of [USR-080](#usr-080)

Tab lists Colliers offices used on customize and shipping. Demo user can view them only. Office create/edit/delete is admin Manage Addresses (ADM-060). Do not copy designer Edit on the user demo.

Acceptance criteria:

- Office Addresses lists the same Colliers offices used on customize and shipping, each with a distinct location name.
- The demo user can view offices here. Adding, editing, or deleting company offices is not part of this user story.

Notes: USER.md · F-29. View only for the demo user. Designer names every office “Office Location” and offers Edit — do not copy.


<a id="usr-084"></a>
#### USR-084 — Search addresses

**Done** · medium · CZ · child of [USR-080](#usr-080)

Search Addresses filters the active Address Book tab by location name or address text.

Acceptance criteria:

- Typing in Search Addresses filters the visible list by location name or address text.
- Clearing the search restores the full list for the active tab.

Notes: USER.md · F-29


<a id="usr-085"></a>
#### USR-085 — Add a personal address

**Done** · medium · CZ · child of [USR-080](#usr-080)

Demo user (and admin on their own My Address Book) can create a personal address. + New Address opens a form. Save adds the location to My Address Book. This does not create a Colliers office. Canada labels are USR-088.

Acceptance criteria:

- New Address opens a form for a personal location.
- Save adds the address to My Address Book and closes the form.

Notes: USER.md · F-29. Personal create only. Company offices are ADM-062.


<a id="usr-086"></a>
#### USR-086 — Edit a personal address

**Done** · medium · CZ · child of [USR-080](#usr-080)

Edit fills the form with the saved personal address, including city / province / postal. Save updates that row.

Acceptance criteria:

- Edit opens the form with the selected personal address already filled, including city, province, and postal code.
- Save updates that row. Other addresses are unchanged.

Notes: USER.md · F-29


<a id="usr-087"></a>
#### USR-087 — Delete a personal address

**Done** · medium · CZ · child of [USR-080](#usr-080)

Delete removes a personal address from My Address Book. Users cannot delete Colliers offices from this page.

Acceptance criteria:

- Delete removes the personal address from My Address Book after the user confirms.
- Office addresses cannot be deleted from this page.

Notes: USER.md · F-29


<a id="usr-088"></a>
#### USR-088 — Canada address fields on Address Book

**Done** · medium · CZ · child of [USR-080](#usr-080)

Designer form uses State and Zip. Colliers Canada should use Province and Postal, with Canada as the default country. Still to discuss.

Acceptance criteria:

- The personal address form labels city, province, and postal code for Canadian addresses.
- Country defaults to Canada. United States is not the default.

Notes: USER.md · F-29. Designer issue: State / Zip. Same Canada default discussion as ADM-N2, but this ticket is the user form.


<a id="usr-089"></a>
#### USR-089 — Shipping can use personal Address Book entries

**Done** · medium · CZ · child of [USR-080](#usr-080)

Select location on shipping includes the user’s personal addresses as well as Colliers offices. Vue 3 and Vue 2 location drawers show My Address Book then Office Addresses. Offices-not-NJ is USR-058.

Acceptance criteria:

- Select location on shipping includes this user's personal Address Book entries and Colliers offices.
- A personal address saved in Address Book can be chosen as a ship-to location without retyping it.

Notes: USER.md · F-29. Related USR-058 (offices, not NJ samples). Do not duplicate USR-058.


<a id="usr-090"></a>
### USR-090 — Order History

**Done** · medium · CZ

The user can see their own past business-card orders. Vue 2 stores this user’s history in localStorage. Designer admin Order History still has Employee and Back to Dashboard — do not copy those on the user page. Not admin Order History ([ADM-030](#adm-030)).

Acceptance criteria:

- A signed-in user can open Order History and see only their own orders.
- This page is not the admin Order History for all employees (ADM-030). Do not copy Back to Dashboard as a user dashboard.

Notes: USER.md · F-30. colliers-vue2 localStorage. Designer rechecked 19 Aug 2026.

<a id="usr-091"></a>
#### USR-091 — Order History from profile menu

**Done** · medium · CZ · child of [USR-090](#usr-090)

User profile menu includes Order History. Vue 2 profile has Address Book, Order History, and Log out.

Acceptance criteria:

- Order History appears in the regular-user profile menu.
- Choosing Order History opens the same Order History page used from any other user shortcut.

Notes: USER.md · F-30

<a id="usr-092"></a>
#### USR-092 — Order History table

**Done** · medium · CZ · child of [USR-090](#usr-090)

Table of this user's orders: order id, card / cardholder, box quantity, date, status, actions. Designer shows an Employee column and other people's names — that is admin-shaped. A user sees only their orders.

Acceptance criteria:

- The table lists this user's orders with order id, card or cardholder, box quantity, date, status, and actions.
- Orders placed by other people are not shown.

Notes: USER.md · F-30. Quantity is boxes (same as cart), not a second printed-card column. Printed-card count is USR-046.

<a id="usr-093"></a>
#### USR-093 — Search own orders

**Done** · medium · CZ · child of [USR-090](#usr-090)

Search filters this user's Order History by cardholder name or order id. Designer label is Search by Name…

Acceptance criteria:

- Search filters this user's orders by cardholder name or order id.
- Clearing search restores the full list of this user's orders.

Notes: USER.md · F-30

<a id="usr-094"></a>
#### USR-094 — Filter own orders by status

**Done** · medium · CZ · child of [USR-090](#usr-090)

Filter this user's orders by status. Designer options: All Statuses, Delivered, Shipped, Processing. Status set still to discuss.

Acceptance criteria:

- The user can filter their orders by status, including an all-statuses option.
- Changing the filter updates the table to matching orders only.

Notes: USER.md · F-30. Discuss which statuses we keep.

<a id="usr-095"></a>
#### USR-095 — View order card preview

**Done** · medium · CZ · child of [USR-090](#usr-090)

View opens a preview of the business card on that order. Preview name, email, phone, and office must match the stored order. Designer issue: Alex Johnson with hubert.wolfeschlegelstein@… — do not copy.

Acceptance criteria:

- View opens a preview of the business card for that order.
- The preview name, email, phone, and office match the details stored on the order.

Notes: USER.md · F-30. Same class of issue as ADM-N5, but this ticket is the user preview.

<a id="usr-096"></a>
#### USR-096 — Repeat Order

**Done** · medium · CZ · child of [USR-090](#usr-090)

Repeat Order recreates the cart and shipping draft from that order so the user can review and submit again. Designer Repeat Order still fills NJ sample streets. Offices-not-NJ is [USR-058](#usr-058).

Acceptance criteria:

- Repeat Order recreates the cart and shipping draft from that order so the user can review and submit again.
- Ship-to locations on the repeated order are Colliers offices or this user's saved addresses, not New Jersey sample addresses.

Notes: USER.md · F-30. Related USR-058 and USR-089. Do not copy ADM-N4 as a second ticket.

<a id="usr-097"></a>
#### USR-097 — Confirmed orders appear in history

**Done** · medium · CZ · child of [USR-090](#usr-090)

After a successful confirmation, the order appears in this user's Order History. Designer list is mock; Place Order did not add a row.

Acceptance criteria:

- After a successful confirmation, the new order appears in this user's Order History.
- The history row shows the same product, box quantity, and addresses that were confirmed.

Notes: USER.md · F-30. Confirmation still clears the cart (USR-062) and does not collect payment (USR-053).

<a id="usr-098"></a>
#### USR-098 — Order Details sheet

**Done** · medium · CZ · child of [USR-090](#usr-090)

View on Order History opens an Order Details sheet: order id, date, status, item, box quantity, total, ship-to, and a View Business Card Proof link. Designer also shows Employee — do not copy that on the demo-user sheet. Card proof itself is [USR-095](#usr-095).

Acceptance criteria:

- View opens an Order Details sheet for that row with order id, date, status, item, box quantity, total, and ship-to address.
- The sheet includes View Business Card Proof, which opens the stored card preview (USR-095).
- The demo-user sheet does not show an Employee field or other people’s names.

Notes: USER.md · F-30. colliers-vue2 OrderHistoryPage.vue. Quantity is boxes.

<a id="idea-01"></a>
### IDEA-01 — Email character limit decided (40)

**Done** · medium · CZ

The Aug 2026 guide settled email at max 40. Vue still uses 30 until [USR-034](#usr-034).

Acceptance criteria:

- The team records one email character limit in the business rules.
- Related tickets and product docs use that same limit. Field validation is [USR-034](#usr-034).

Notes: BUSINESS-RULES.md section 4

## Admin Portal

<a id="adm-001"></a>
### ADM-001 — Admin scoped from designer

**Done** · medium · CZ

Walked the designer admin preview (admin / 123). Wrote ADMIN.md and the ADM-010…ADM-083 stories. Vue 2 now has login, nav, dashboard tiles, and Address Book. Do not copy designer issues ADM-N1–ADM-N5.

Acceptance criteria:

- The approved admin scope is represented by the ADM-010 through ADM-083 ticket groups.
- Known designer issues are captured separately and are not treated as approved behavior.

Notes: ADMIN.md

<a id="adm-010"></a>
### ADM-010 — Admin login and nav

**Done** · medium · CZ

Vue 2 admin shell. Login admin / 123. Header ADMIN, Catalogue, Manage Addresses, Manage Titles. Profile: Admin Panel, Address Book, Order History, Log out.

Acceptance criteria:

- Valid admin credentials open the admin application shell.
- The admin shell provides the approved navigation and profile actions on every admin page.

Notes: ADMIN.md · F-12

<a id="adm-011"></a>
#### ADM-011 — Admin login admin / 123

**Done** · medium · CZ · child of [ADM-010](#adm-010)

Login screen accepts admin / 123 and opens the admin shell.

Acceptance criteria:

- Entering admin / 123 grants access to the admin shell.
- Invalid credentials keep the user on the login screen and display a clear error without exposing admin content.

Notes: ADMIN.md · TC-21

<a id="adm-012"></a>
#### ADM-012 — Admin header nav

**Done** · medium · CZ · child of [ADM-010](#adm-010)

Header shows ADMIN, Catalogue, Manage Addresses, Manage Titles. User header is catalogue only.

Acceptance criteria:

- The admin header shows ADMIN, Catalogue, Manage Addresses, and Manage Titles.
- Each navigation item opens the correct route and indicates the active page.

Notes: ADMIN.md

<a id="adm-013"></a>
#### ADM-013 — Admin profile menu

**Done** · medium · CZ · child of [ADM-010](#adm-010)

Profile: Admin Panel, Address Book, Order History, Log out. Address Book page work is [ADM-080](#adm-080). Admin Order History is the ADM-030 stub.

Acceptance criteria:

- The profile menu shows Admin Panel, Address Book, Order History, and Log out.
- Each option performs the expected navigation or ends the admin session.

Notes: ADMIN.md · F-12. Address Book: ADM-080. Order History: ADM-036.

<a id="adm-020"></a>
### ADM-020 — Admin Dashboard

**Done** · medium · CZ

Vue 2 Admin Dashboard with System Options tiles. Designer 19 Aug 2026: Order History, Invoice History, Reporting, Manage Addresses (22 addresses configured), Manage Titles (32 titles configured). No Total Orders / Pending Approvals / Active Users tiles. Live counts are ADM-022 and ADM-023.

Acceptance criteria:

- The dashboard displays the approved System Options tiles.
- Each tile opens its corresponding admin screen and displays current supporting counts where required.

Notes: ADMIN.md · F-13. colliers-vue2/ #/admin. Rechecked designer 19 Aug 2026.

<a id="adm-021"></a>
#### ADM-021 — System Options tiles

**Done** · medium · CZ · child of [ADM-020](#adm-020)

Vue 2 tiles: Order History, Invoice History, Reporting, Manage Addresses, Manage Titles. Tiles open the matching admin routes (stubs until those tens tickets).

Acceptance criteria:

- Tiles are shown for Order History, Invoice History, Reporting, Manage Addresses, and Manage Titles.
- Each tile is labelled clearly and links to the correct destination.

Notes: ADMIN.md. colliers-vue2/

<a id="adm-022"></a>
#### ADM-022 — Live address count

**Ideas** · medium · unassigned · child of [ADM-020](#adm-020)

Dashboard address count. Designer 19 Aug 2026 still showed 22 addresses configured.

Acceptance criteria:

- The Manage Addresses tile displays the current number of active office addresses.
- The count updates after an address is added or removed.

Notes: ADMIN.md. Vue 2 tile currently shows —. Count needs ADM-060.

<a id="adm-023"></a>
#### ADM-023 — Live title count

**Ideas** · medium · unassigned · child of [ADM-020](#adm-020)

Dashboard title count. Designer 19 Aug 2026 still showed 32 titles configured.

Acceptance criteria:

- The Manage Titles tile displays the current number of available designations.
- The count updates after a designation is added or deleted.

Notes: ADMIN.md. Vue 2 tile currently shows —. Count needs ADM-070.

<a id="adm-030"></a>
### ADM-030 — Order History

**Ideas** · medium · unassigned

Own screen in the designer. Vue 2 has a stub route (`#/admin/orders`). Mock data when built.

Acceptance criteria:

- The Order History screen lists available orders in a readable table.
- Search, status filtering, viewing, and repeat-order actions work on the displayed records.

Notes: ADMIN.md · F-16. Stub only until this ticket is built.

<a id="adm-031"></a>
#### ADM-031 — Order History table

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Columns: Order ID, Employee, Item, Quantity, Date, Status.

Acceptance criteria:

- Each row shows Order ID, Employee, Item, Quantity, Date, and Status.
- Column values belong to the same order and remain readable at supported screen sizes.

Notes: ADMIN.md

<a id="adm-032"></a>
#### ADM-032 — Search orders by name

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Search the order table by employee name.

Acceptance criteria:

- Entering an employee name filters the table to matching orders.
- Clearing the search restores the full order list and no-match searches show a clear empty state.

Notes: ADMIN.md

<a id="adm-033"></a>
#### ADM-033 — Filter orders by status

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Filter: All / Delivered / Shipped / Processing.

Acceptance criteria:

- All, Delivered, Shipped, and Processing filters return only the expected orders.
- Changing or clearing the filter updates results without altering the underlying order data.

Notes: ADMIN.md

<a id="adm-034"></a>
#### ADM-034 — View order card preview

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

View opens a business card preview modal. Designer issue: name/email mismatch (ADM-N5).

Acceptance criteria:

- View opens a preview for the selected order row.
- The preview name, email, product, and customization match that exact order.

Notes: ADMIN.md

<a id="adm-035"></a>
#### ADM-035 — Repeat Order

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Repeat Order puts that item in the cart and goes to shipping. Designer issue: NJ samples (ADM-N4).

Acceptance criteria:

- Repeat Order adds the selected historical card and quantity to the current cart.
- The user is taken to shipping with Colliers office locations and no New Jersey sample data.

Notes: ADMIN.md

<a id="adm-036"></a>
#### ADM-036 — Order History from profile menu

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Admin profile Order History already opens the Vue 2 stub (`#/admin/orders`). Same screen as ADM-030 once that page is built.

Acceptance criteria:

- Order History in the profile menu opens the same Order History screen used elsewhere.
- The screen retains the same table, search, filters, and row actions regardless of entry point.

Notes: ADMIN.md. Shortcut exists; table/search/filters are ADM-030.

<a id="adm-040"></a>
### ADM-040 — Invoice History

**Ideas** · medium · unassigned

Own screen in the designer. Vue 2 has a stub route (`#/admin/invoices`). Mock data when built.

Acceptance criteria:

- The Invoice History screen displays the available invoice records.
- Users can identify invoice status and download an available invoice from its row.

Notes: ADMIN.md · F-17. Stub only until this ticket is built.

<a id="adm-041"></a>
#### ADM-041 — Invoice table

**Ideas** · medium · unassigned · child of [ADM-040](#adm-040)

Columns: Invoice ID, Date, Department, Amount, Status (Paid / Pending / Overdue).

Acceptance criteria:

- Each invoice row shows Invoice ID, Date, Department, Amount, and Status.
- Status is limited to the approved Paid, Pending, or Overdue values.

Notes: ADMIN.md

<a id="adm-042"></a>
#### ADM-042 — Download invoice

**Ideas** · medium · unassigned · child of [ADM-040](#adm-040)

Download action on an invoice row.

Acceptance criteria:

- Selecting Download retrieves the invoice associated with that row.
- The downloaded file opens successfully and contains the matching invoice identifier and amount.

Notes: ADMIN.md

<a id="adm-050"></a>
### ADM-050 — Reporting

**Ideas** · medium · unassigned

Own screen in the designer. Vue 2 has a stub route (`#/admin/reporting`). Mock data when built.

Acceptance criteria:

- The Reporting screen displays monthly spend, recent activity, and department spend sections.
- Displayed totals are consistent across sections for the same reporting period.

Notes: ADMIN.md · F-18. Stub only until this ticket is built.

<a id="adm-051"></a>
#### ADM-051 — Monthly Spend Overview

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Reporting: monthly spend overview.

Acceptance criteria:

- Monthly Spend Overview shows a labelled value for each available month.
- The values and period labels match the reporting data source.

Notes: ADMIN.md

<a id="adm-052"></a>
#### ADM-052 — Recent Activity

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Reporting: recent activity list.

Acceptance criteria:

- Recent Activity lists the latest relevant order or administrative events.
- Each entry shows enough information to identify the event and when it occurred.

Notes: ADMIN.md

<a id="adm-053"></a>
#### ADM-053 — Spend by Department

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Reporting: spend by department.

Acceptance criteria:

- Spend by Department shows each department and its corresponding total.
- Department totals reconcile with the overall spend for the selected period.

Notes: ADMIN.md

<a id="adm-054"></a>
#### ADM-054 — Export Data

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Generate Custom Report / Export Data.

Acceptance criteria:

- The user can generate a report using the available report controls.
- Export Data downloads a readable file containing the currently selected reporting data.

Notes: ADMIN.md

<a id="adm-060"></a>
### ADM-060 — Manage Addresses

**Ready for development** · medium · CZ

Admin-only screen to create, edit, and remove Colliers office addresses. Designer 19 Aug 2026: list is one-line “Enter new address…” plus hover Edit/Remove; Edit still opens the structured form. Not the profile Address Book (ADM-080 / USR-080). Do not rebuild Edit Supplier Details.

Acceptance criteria:

- Only an admin can open Manage Addresses and add, edit, or remove company offices.
- Changes are reflected wherever managed office addresses are used (customize, shipping, Address Book Office Addresses tab).

Notes: ADMIN.md · F-14. Designer rechecked 19 Aug 2026. Next take. Vue 2 stub at `#/admin/addresses`.


<a id="adm-061"></a>
#### ADM-061 — List office addresses

**Ready for development** · medium · CZ · child of [ADM-060](#adm-060)

List of office addresses on Manage Addresses.

Acceptance criteria:

- Each active office appears once with enough address information to distinguish it.
- The list reflects additions, edits, and removals without requiring stale sample data.

Notes: ADMIN.md


<a id="adm-062"></a>
#### ADM-062 — Add address

**Ready for development** · medium · CZ · child of [ADM-060](#adm-060)

Admin adds a Colliers office. Designer list has a one-line add field; Vue should open the structured New Address form (ADM-065), not store a single unparsed line. Demo users cannot add offices.

Acceptance criteria:

- Add Address opens a blank New Address form.
- Saving valid required fields adds one new office to the address list.

Notes: ADMIN.md. Company office create. Personal create is USR-085 / ADM-082.


<a id="adm-063"></a>
#### ADM-063 — Remove address

**Ready for development** · medium · CZ · child of [ADM-060](#adm-060)

Remove an office from the list.

Acceptance criteria:

- Remove targets the selected office and requires confirmation before deletion.
- After confirmation, the office disappears from the managed list and is no longer selectable for new orders.

Notes: ADMIN.md


<a id="adm-064"></a>
#### ADM-064 — Edit address

**Ready for development** · medium · CZ · child of [ADM-060](#adm-060)

Edit opens Update Existing Address (ADM-065). Designer issue: fields do not fill (ADM-N1).

Acceptance criteria:

- Edit opens the selected address with every existing field prefilled correctly.
- Saving changes updates that record without creating a duplicate address.

Notes: ADMIN.md


<a id="adm-065"></a>
#### ADM-065 — New / edit address form

**Ready for development** · medium · CZ · child of [ADM-060](#adm-060)

Required: Address Name, Street, City, Province, Postal, Country. Designer 19 Aug 2026 still uses State/ZIP labels and Save Draft. Do not copy US default (ADM-N2) or empty postal on edit (ADM-N1).

Acceptance criteria:

- The form includes Address Name, Street, City, Province, Postal Code, and Country as required fields.
- Invalid or missing required values prevent final submission and display field-level guidance.

Notes: ADMIN.md


<a id="adm-066"></a>
#### ADM-066 — Address form actions

**Ready for development** · medium · CZ · child of [ADM-060](#adm-060)

Save Draft, Add New Address / Update Address, Back to Addresses. Designer still has Save Draft on the structured form (ADM-N3).

Acceptance criteria:

- Back to Addresses returns without unintentionally saving changes.
- Add/Update saves valid data, while Save Draft preserves an incomplete record only when draft behavior is supported.

Notes: ADMIN.md


<a id="adm-067"></a>
#### ADM-067 — Customize and shipping use admin addresses

**Ready for development** · medium · CZ · child of [ADM-060](#adm-060)

Customize and shipping already load Colliers offices from GET /api/addresses; shipping also includes personal Address Book (USR-089). After Manage Addresses exists, office add/edit/remove must show up in customize, shipping, and the Office Addresses tab. NJ sample seeds are gone (USR-058).

Acceptance criteria:

- Customize and shipping load office choices from the managed address list.
- An admin address change appears in both workflows and New Jersey seed addresses never appear.

Notes: ADMIN.md · USR-036 · USR-058 · USR-089


<a id="adm-070"></a>
### ADM-070 — Manage Titles

**Ideas** · medium · unassigned

Own screen. Vue 2 has a stub route (`#/admin/titles`). List designations (PMP, LEED AP, …). Add, delete, inline edit.

Acceptance criteria:

- Manage Titles lists existing designations and provides add, edit, and delete actions.
- Saved title changes are reflected in the customization designation control.

Notes: ADMIN.md · F-15 · BUSINESS-RULES.md calls this Manage Designations. Stub only until this ticket is built.

<a id="adm-071"></a>
#### ADM-071 — List designations

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

List of titles / designations.

Acceptance criteria:

- Each active designation appears once in the list.
- The list updates immediately after a successful add, edit, or delete action.

Notes: ADMIN.md

<a id="adm-072"></a>
#### ADM-072 — Add title

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Add a designation to the list.

Acceptance criteria:

- A non-empty unique designation can be added successfully.
- Blank or duplicate values are rejected with a clear message.

Notes: ADMIN.md

<a id="adm-073"></a>
#### ADM-073 — Delete title

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Remove a designation.

Acceptance criteria:

- Deleting a designation requires confirmation and removes the selected value.
- Deleting one designation does not remove or modify any other designation.

Notes: ADMIN.md

<a id="adm-074"></a>
#### ADM-074 — Inline edit title

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Pencil → inline field → save (check) or cancel (X).

Acceptance criteria:

- The pencil action changes only the selected row into an editable field.
- Save commits the edited value and Cancel restores the original value without changes.

Notes: ADMIN.md

<a id="adm-075"></a>
#### ADM-075 — Customize titles come from Manage Titles

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Customize job-title dropdown is hardcoded in products.js. After ADM-070, use this list.

Acceptance criteria:

- The customization designation control loads active values from Manage Titles.
- Added, edited, or deleted titles are reflected without changing existing saved cart items.

Notes: ADMIN.md · USR-033

<a id="adm-080"></a>
### ADM-080 — Address Book (admin)

**Done** · medium · CZ

Admin profile → Address Book, same page as the demo user (USR-080). Admin can add, edit, and delete their own personal addresses. Office Addresses is the company list; create/edit/delete offices stays on Manage Addresses (ADM-060).

Acceptance criteria:

- A signed-in admin can open Address Book from the profile menu and see personal addresses and Colliers offices.
- Admin can create personal addresses on My Address Book. Company office add, edit, and delete stay on Manage Addresses (ADM-060).

Notes: ADMIN.md · F-29. colliers-vue2/. Same Address Book as the user. Personal create yes. Office create is ADM-060.


<a id="adm-081"></a>
#### ADM-081 — Address Book from admin profile menu

**Done** · medium · CZ · child of [ADM-080](#adm-080)

Admin profile includes Address Book (with Admin Panel, Order History, and Log out). Menu listing is ADM-013.

Acceptance criteria:

- Address Book appears in the admin profile menu.
- Choosing Address Book opens the Address Book page.

Notes: ADMIN.md · F-12 · F-29


<a id="adm-082"></a>
#### ADM-082 — Admin My Address Book

**Done** · medium · CZ · child of [ADM-080](#adm-080)

Tab lists this admin’s personal locations with New Address, Edit, and Delete. Same behaviour as USR-082. Designer samples: Home Office, Temporary Location.

Acceptance criteria:

- My Address Book lists only this admin’s personal addresses, each with a location name and address.
- The admin can add, edit, and delete personal rows. Colliers offices do not appear on this tab.

Notes: ADMIN.md · F-29. Admin can create personal addresses. Personal add / edit / delete / search / Canada fields follow USR-084–USR-088.


<a id="adm-083"></a>
#### ADM-083 — Admin Office Addresses tab

**Done** · medium · CZ · child of [ADM-080](#adm-080)

Tab lists Colliers offices for the admin Address Book. View the company list here. Do not create, edit, or delete offices from this tab — that is Manage Addresses (ADM-060). Designer Edit on offices is not a second office-edit screen.

Acceptance criteria:

- Office Addresses lists the same Colliers offices used on customize, shipping, and Manage Addresses.
- Adding, editing, or deleting company offices is not done from this tab.

Notes: ADMIN.md · F-29. View offices. Office CRUD is ADM-060. Designer names every office “Office Location”.


<a id="adm-n1"></a>
### ADM-N1 — Edit address should fill City / Province / Postal

**Ready for development** · medium · CZ

Designer issue, rechecked 19 Aug 2026: Edit now fills City and Province (Burlington / Ontario). Address Name stays empty. Postal stays empty even when the list line has a postal code. Street is the street line only, not the whole address. Do not copy as-is. Ship with ADM-065.

Acceptance criteria:

- Editing an address prefills City, Province, and Postal Code from the selected record.
- Saving an edit keeps address fields separate and does not copy the full address into Name or Street.

Notes: ADMIN.md · designer issue (do not copy). Rechecked 19 Aug 2026.


<a id="adm-n2"></a>
### ADM-N2 — Default country Canada, not United States

**Ready for development** · medium · CZ

New/edit Colliers address forms must default to Canada. Designer 19 Aug 2026 still showed United States on a Burlington ON office. Do not copy. Ship with ADM-065.

Acceptance criteria:

- The team confirms and records the default country for new addresses.
- If Canada is approved, new forms default to Canada while existing address countries remain unchanged.

Notes: ADMIN.md · designer issue (do not copy). Rechecked 19 Aug 2026.


<a id="adm-n3"></a>
### ADM-N3 — Save Draft on empty address form

**Ready for development** · low · CZ

Designer 19 Aug 2026 still has Save Draft on the structured address form. Decide the rule before porting (save incomplete, disable, or drop the control). Ship with ADM-066.

Acceptance criteria:

- The team defines whether empty or incomplete address drafts are allowed.
- The Save Draft control either saves according to the approved rule or is hidden/disabled with clear behavior.

Notes: ADMIN.md · designer issue (do not copy). Rechecked 19 Aug 2026.


<a id="adm-n4"></a>
### ADM-N4 — Repeat Order should use Colliers offices

**Ideas** · low · unassigned

Designer Repeat Order used NJ sample addresses, not Colliers offices.

Acceptance criteria:

- Repeat Order presents only approved Colliers office locations.
- No New Jersey sample address appears in the repeated-order shipping flow.

Notes: ADMIN.md · designer issue (do not copy)

<a id="adm-n5"></a>
### ADM-N5 — Order preview name and email should match

**Ideas** · low · unassigned

Designer View preview: employee name and card email did not match.

Acceptance criteria:

- The order preview name and email match the selected historical order record.
- Opening previews for different orders never carries over identity data from a previous order.

Notes: ADMIN.md · designer issue (do not copy)

## Shared UI/UX

<a id="f-20"></a>
### F-20 — Remove footer language dropdown

**Done** · medium · CZ

Language belongs in the navbar EN/FR only. Vue 2 footer has no language dropdown. Vue 3 AppFooter still has English/Français. Designer 19 Aug 2026 still has the footer control.

Acceptance criteria:

- The footer no longer displays an English/Français language control.
- The header EN/FR control continues to switch all supported interface labels.

Notes: BACKLOG.md · FEATURES.md · BUSINESS-RULES.md UI-02. colliers-vue2 footer is done; Vue 3 still has the duplicate.

<a id="f-23"></a>
### F-23 — Light theme

**Done** · medium · CZ

Current default. App opens in light theme.

Acceptance criteria:

- The application opens in the approved light theme by default.
- Core pages and controls remain readable with consistent light-theme colours and contrast.

Notes: BACKLOG.md

<a id="f-19"></a>
### F-19 — Dark theme

**Done** · low · CZ

Dark theme is out of scope for this version. Vue is light only. Do not build it.

Acceptance criteria:

- The team decision that dark mode is out of scope for this version is recorded.
- No dark-theme work is included in current release estimates or completion metrics.

Notes: BACKLOG.md · V2 says not this version. Closed 19 Aug 2026.

## Quality Assurance

<a id="f-21"></a>
### F-21 — Automated tests

**Ideas** · high · unassigned

No test runner yet. Spec is TESTING.md. Start with P0: TC-01, TC-02, TC-04, TC-05, TC-05b, TC-11, TC-13, TC-21.

Acceptance criteria:

- The project includes a repeatable automated test command with documented setup.
- The initial suite covers the listed P0 scenarios and reports clear pass or failure results.

Notes: BACKLOG.md · TESTING.md
