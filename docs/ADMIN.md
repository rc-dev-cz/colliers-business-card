# Admin work checklist

Use this file to track **admin screens from the designer preview** and turn them into stories. User catalogue / customize / cart / shipping live in [USER.md](USER.md) and follow **this Vue app**, not AI Studio.

Verified in the designer preview on **13 Aug 2026** (`admin` / `123`). Address Book on the admin profile rechecked **14 Aug 2026**. Manage Addresses / Dashboard / Order History rechecked **19 Aug 2026**.

**Designer vs Vue sync 28 Aug 2026:** No new pages. Designer `#/address-book` is personal addresses only (single list, “Add New Address”). Vue `#/addresses` keeps **My Address Book + Office Addresses** tabs — behavior reference only; do not drop the Office tab. Manage Addresses is still the next **page build** in Vue (`ADM-060`); designer already has the full screen. Order flow / customize: follow Vue, not designer.

| Layer | Role |
| --- | --- |
| [FEATURES.md](FEATURES.md) | What the product is |
| [BUSINESS-RULES.md](BUSINESS-RULES.md) | Agreed behaviour and test IDs |
| [BACKLOG.md](BACKLOG.md) | F-code feature index → board tickets |
| [USER.md](USER.md) | User order-flow stories |
| **This file** | Admin port checklist + story codes |
| [TESTING.md](TESTING.md) | Use cases (admin cases still catch up) |

Admin login, nav, dashboard tiles, and Address Book are in this Vue 2 app. Address Book on the admin profile is the same page as the user (Done). **Manage Addresses, Manage Titles, Order History, Invoice History, and Reporting** are implemented in Vue 2 (28 Aug 2026). Designer UI is the **behavior reference**, not a pixel match.

## Status key

| Mark | Meaning |
| --- | --- |
| `[ ]` | Not started in Vue |
| `[x]` | Done in Vue |
| Designer: **Mock** | Screen exists; data / some actions are fake |
| Designer: **Exists** | Screen exists; list add/remove works in the preview |

**Stories:** one page per tens ticket (`ADM-010`, `ADM-020`, …) with related tickets (`ADM-011`). Related ids are in the ticket index. **ADM-001** is the scoping ticket (stories written; not Vue).

---

## Epic ADM — Admin portal

Admin login, nav, dashboard tiles, and Address Book are in Vue 2. Remaining **screens** are stubs until their tens tickets. Each **page** is a tens ticket.

- [x] **ADM-001** Admin scoped from designer — stories in this file, tickets on the board
- [x] **ADM-010** Admin login and nav — F-12
  - [x] **ADM-011** Login `admin` / `123`
  - [x] **ADM-012** Header: ADMIN, Catalogue, Manage Addresses, Manage Titles
  - [x] **ADM-013** Profile: Admin Panel, Address Book, Order History, Log out
- [x] **ADM-020** Admin Dashboard — F-13. Tiles in Vue 2; live counts on dashboard (28 Aug 2026).
  - [x] **ADM-021** System Options tiles
  - [x] **ADM-022** Live address count
  - [x] **ADM-023** Live title count
- [x] **ADM-030** Order History — F-16. `#/admin/orders`
  - [x] **ADM-031** Table
  - [x] **ADM-032** Search by name
  - [x] **ADM-033** Filter by status
  - [x] **ADM-034** View card preview
  - [ ] **ADM-035** Repeat Order
  - [x] **ADM-036** Profile menu shortcut
- [x] **ADM-040** Invoice History — F-17. `#/admin/invoices`
  - [x] **ADM-041** Invoice table
  - [x] **ADM-042** Download
- [x] **ADM-050** Reporting — F-18. `#/admin/reporting`
  - [x] **ADM-051** Monthly Spend Overview
  - [x] **ADM-052** Recent Activity
  - [x] **ADM-053** Spend by Department
  - [x] **ADM-054** Export Data
- [x] **ADM-060** Manage Addresses — F-14. `#/admin/addresses`
  - [x] **ADM-061** List offices
  - [x] **ADM-062** Add office
  - [x] **ADM-063** Remove office
  - [x] **ADM-064** Edit office
  - [x] **ADM-065** New / edit form fields
  - [x] **ADM-066** Form actions (Save, Update, Back — no Save Draft)
  - [x] **ADM-067** Customize and shipping use this list
- [x] **ADM-070** Manage Titles — F-15. `#/admin/titles`
  - [x] **ADM-071** List designations
  - [x] **ADM-072** Add
  - [x] **ADM-073** Delete
  - [x] **ADM-074** Inline edit
  - [x] **ADM-075** Customize dropdown uses this list
- [x] **ADM-080** Address Book (admin) — F-29. Done. Same page as the demo user.
  - [x] **ADM-081** Address Book from profile menu
  - [x] **ADM-082** My Address Book (personal; admin can add / edit / delete)
  - [x] **ADM-083** Office Addresses tab (view company offices; CRUD is ADM-060)

Designer 19 Aug 2026: Manage Addresses list is one-line add plus hover Edit/Remove; Edit still opens the structured form. Keep that structured form in Vue. Do not copy the US country default, empty postal, or empty Address Name.

---

## Designer issues (do not copy)

Fix or drop in the designer; do not ship these as-is.

| Code | Issue |
| --- | --- |
| ADM-N1 | Edit now fills City and Province; Address Name and Postal stay empty. Country still United States (19 Aug 2026) |
| ADM-N2 | Country still defaults to United States on a Canadian office (19 Aug 2026) |
| ADM-N3 | Save Draft is still on the structured form (19 Aug 2026) |
| ADM-N4 | Repeat Order used NJ sample addresses, not Colliers offices |
| ADM-N5 | View preview: employee name and card email did not match |

Footer English/Français is still in the designer — Vue 2 already dropped it (**F-20**). Do not copy the footer control.
