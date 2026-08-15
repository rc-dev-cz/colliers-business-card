# Features

What this product is and what it can do. Agreed rules: [BUSINESS-RULES.md](BUSINESS-RULES.md). Status lives in [BACKLOG.md](BACKLOG.md). Use cases live in [TESTING.md](TESTING.md).

This is a **Vue 3 + JavaScript** prototype of the Colliers Partner Portal for **ordering branded business cards**. A **user** picks a card, customizes details, puts it in a **cart**, sets shipping, and confirms an order. An **admin** manages addresses, titles, and dashboard apps.

There is no real backend. Product data is in `src/data/products.js`. Session, cart, and order draft are in `localStorage`. Shipping is **$0.00** because it is already included in the **$63** box fee — do not add a separate shipping calculation. There is **no payment**. Intended later: port the UI into **Klai Studio**. Do not port RC Web Dev (`src/rc-web-dev/`) — that stays in this Vue app with Cursor and Supabase.

**Source of truth**

- **[BUSINESS-RULES.md](BUSINESS-RULES.md)** — agreed product behaviour and test IDs (V2, August 2026)
- **This Vue repo** — user order flow, especially customize (ahead of the designer). Do not copy customize from AI Studio.
- **Designer preview** — admin screens only, at a high level. Do not match that UI pixel for pixel.

Preview login (`demo` / any email in Vue) is for designer and us only. It is **not** a product feature. Signup and forgot-password are preview-only too. Do not list them here.

## Terms

| Term | Meaning |
| --- | --- |
| **user** | Regular person who orders cards (catalogue → confirm). Not an admin. Stories: [USER.md](USER.md) |
| **admin** | Person who manages addresses, titles, and dashboard apps. Stories: [ADMIN.md](ADMIN.md) |
| **Partner Portal** | Product name on the login screen. It is not a third role |
| **cart item** | One row in the cart drawer |
| **cart badge icon** | Red number on the shopping-cart icon in the header (total quantity of all cart items) |
| **Business Card Bilingual** | A product (`BCAD-PL-BIL`), not the website EN/FR toggle |

## Order flow (user)

**Cards** (3 products) → Details → Customize (Vue) → Cart → Shipping → Review → Confirmed.

Profile (still to discuss): Address Book (F-29) and this user's Order History (F-30). Admin also has Address Book on the profile menu (ADM-080). Not admin Manage Addresses.

## Cards

Three products. Same in Vue and the designer. $63 per box (shipping included), 250 cards per box, details page with pricing tiers.

| ID | Product | SKU |
| --- | --- | --- |
| F-01 | Business Card English | `BCAD-PL-ENG` |
| F-02 | Business Card Bilingual | `BCAD-PL-BIL` |
| F-03 | Business Card French | `BCAD-PL-FR` |

F-04 — Details page: packaging (250/BX), print on demand, pricing table, materials / brand notes.

Never say only “bilingual.” That is the **product name**, not the navbar language toggle.

## Customize (Vue)

F-05 — Customize the card in this repo (`src/pages/CustomizePage.vue`). Do not match the AI Studio customize screen.

- Full name (max 50 characters, two lines on the card)
- Designation (one or more from the list; Vue still allows one)
- Email (max 40 characters)
- Mobile phone (Canadian +1, formatted)
- Office address (dropdown)
- Company locked: **Colliers**
- Website locked: **colliers.com/canada**
- Live preview updates as fields change
- Add to Cart adds **quantity 1**

## Cart, shipping, confirmed

F-06 — Cart: add items, quantity, combine when the same product and the same details.

**Multiple titles in one cart: yes.** Each cart item has **one** title. Example: add Business Card Bilingual for Jane as Associate, then add Business Card Bilingual again for Jane as Vice President → the cart drawer shows **two cart items** (they do not combine, because the title is different). Same person + same title + same other details → they combine into **one cart item** with a higher qty.

F-07 — Cart badge icon: total quantity on the header cart icon.

F-08 — Clear cart.

F-09 — Shipping splits: Split Order, Remove Split only when there is more than one split.

F-10 — Ship-to addresses: add/remove location, select a saved location, qty on a location (does not change cart quantity).

F-11 — Order confirmed: success screen; cart and order draft cleared. Review before confirm is F-27. User Order History is F-30.

F-29 — Address Book: personal ship-to addresses plus a view of Colliers offices. Profile menu for the user and for admin. Not admin Manage Addresses (F-14). Still to discuss. Tickets: USR-080–USR-089, ADM-080–ADM-083.

F-30 — User Order History: this user's past orders. Profile menu. Not admin Order History (F-16). Still to discuss. Tickets: USR-090–USR-097.

## Admin (designer only; not in this Vue repo)

Work checklist: [ADMIN.md](ADMIN.md). User order-flow stories: [USER.md](USER.md).

F-12 — Admin login: `admin` / `123`. Nav: ADMIN, Catalogue, Manage Addresses, Manage Titles. Profile: Admin Panel, Address Book, Order History, Log out.

F-13 — Admin Dashboard: System Options (Order History, Invoice History, Reporting, Manage Addresses, Manage Titles). No Total Orders / Pending Approvals / Active Users tiles.

F-14 — Manage Addresses: list; add and edit via structured address form; remove. Edit Supplier Details is gone.

F-15 — Manage Titles: list of designations (PMP, LEED AP, and others); add; delete; inline edit.

F-16 / F-17 / F-18 — Admin Order History, Invoice History, and Reporting are real screens in the designer (mock data). User Order History is F-30.

## Language and theme

F-19 — Dark theme is **not built**. Vue is light only.

F-20 — Remove the footer English/Français dropdown. Language belongs in the **navbar only** (`EN` / `FR` on `AppHeader.vue`). The footer control in `AppFooter.vue` is a duplicate (designer has it too). Do not treat footer language as a feature.

F-22 — Navbar EN/FR: switches site chrome (for example Add to Cart → Ajouter au panier).

F-23 — Light theme (current default).
