# User work checklist

Stories for the **regular user** — the person who orders business cards. Admin stories live in [ADMIN.md](ADMIN.md).

**User** is not a third role. The login screen says Colliers Partner Portal; that is the **product name**. The person using catalogue / customize / cart / shipping is the user. The person managing addresses and titles is the **admin**.

| Layer | Role |
| --- | --- |
| [FEATURES.md](FEATURES.md) | What the product is |
| [BUSINESS-RULES.md](BUSINESS-RULES.md) | Agreed behaviour and test IDs |
| [BACKLOG.md](BACKLOG.md) | Done / mock / not started |
| **This file** | User order-flow stories |
| [ADMIN.md](ADMIN.md) | Admin port stories |
| [TESTING.md](TESTING.md) | Use cases |

This flow is already in **this Vue app**. Do not copy customize from AI Studio.

## Status key

| Mark | Meaning |
| --- | --- |
| `[ ]` | Not started in Vue |
| `[x]` | Done in Vue |

**Stories:** epic **USR**, then one story per page (`USR-010`, `USR-020`, …) with children (`USR-011`). Parent is in parentheses.

---

## Epic USR — User portal

Each **page** is a tens ticket. Children are the pieces of that page.

- [x] **USR-010** Catalogue `(CatalogPage.vue)` — F-01, F-02, F-03
  - [x] **USR-011** Business Card English
  - [x] **USR-012** Business Card Bilingual
  - [x] **USR-013** Business Card French
  - [x] **USR-014** Price and pack size ($63 / 250)
- [x] **USR-020** Card details `(DetailsPage.vue)` — F-04
  - [x] **USR-021** Packaging 250/BX
  - [x] **USR-022** Pricing table
  - [x] **USR-023** Materials / brand notes
- [x] **USR-030** Customize card `(CustomizePage.vue)` — F-05
  - [x] **USR-031** Live preview
  - [ ] **USR-032** Full name (max 50, two lines) — Vue still max 30
  - [x] **USR-033** Designation dropdown (one per card)
  - [ ] **USR-034** Email (max 40) — Vue still max 30
  - [x] **USR-035** Mobile phone Canadian +1
  - [x] **USR-036** Office address dropdown
  - [x] **USR-037** Company and website locked
  - [x] **USR-038** Add to Cart quantity 1
  - [ ] **USR-039** Multiple designations on one card — F-24
- [x] **USR-040** Cart `(CartDrawer.vue)` — F-06
  - [x] **USR-041** Combine same product and details
  - [x] **USR-042** Separate items for different name or title
  - [x] **USR-043** Cart badge icon — F-07
  - [x] **USR-044** Clear cart — F-08
  - [x] **USR-045** Change quantity
  - [ ] **USR-046** Printed-card count (qty × 250)
- [x] **USR-050** Shipping `(ShippingPage.vue)` — F-10
  - [x] **USR-051** Add / remove / select location
  - [x] **USR-052** Location qty vs cart qty
  - [x] **USR-053** Shipping $0, no payment (included in the $63 box fee)
  - [x] **USR-054** Split Order — F-09
  - [x] **USR-055** Cannot remove the last split
  - [ ] **USR-056** Move cards between shipping groups — F-25
  - [ ] **USR-057** Split Order creates an empty group — F-26
  - [ ] **USR-058** Colliers offices, not NJ samples — F-28
- [x] **USR-060** Order confirmed `(ConfirmedPage.vue)` — F-11
  - [x] **USR-061** Success screen
  - [x] **USR-062** Clear cart and order draft
  - [ ] **USR-063** Order review before confirm — F-27
- [x] **USR-070** Header language `(AppHeader.vue)` — F-22
  - [x] **USR-071** Navbar EN/FR

Ticket descriptions live on the RC Web Dev board (`#/rc-web-dev`). This file is the checklist.

---

## Still an idea (not a Vue story yet)

Email max is **40** ([IDEA-01](TICKETS.md#idea-01) closed). Vue still uses 30 until [USR-034](TICKETS.md#usr-034).

Footer English/Français is **F-20**. Dark theme is **F-19**. Automated tests are **F-21**. Agreed rules: [BUSINESS-RULES.md](BUSINESS-RULES.md).
