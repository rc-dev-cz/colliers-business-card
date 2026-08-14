# Admin work checklist

Use this file to track **admin screens from the designer preview** and turn them into stories. User catalogue / customize / cart / shipping live in [USER.md](USER.md) and follow **this Vue app**, not AI Studio.

Verified in the designer preview on **13 Aug 2026** (`admin` / `123`).

| Layer | Role |
| --- | --- |
| [FEATURES.md](FEATURES.md) | What the product is |
| [BUSINESS-RULES.md](BUSINESS-RULES.md) | Agreed behaviour and test IDs |
| [BACKLOG.md](BACKLOG.md) | Done / mock / not started |
| [USER.md](USER.md) | User order-flow stories |
| **This file** | Admin port checklist + story codes |
| [TESTING.md](TESTING.md) | Use cases (admin cases still catch up) |

None of this is in the Vue repo yet. Designer UI is the **behavior reference**, not a pixel match.

## Status key

| Mark | Meaning |
| --- | --- |
| `[ ]` | Not started in Vue |
| `[x]` | Done in Vue |
| Designer: **Mock** | Screen exists; data / some actions are fake |
| Designer: **Exists** | Screen exists; list add/remove works in the preview |

**Stories:** one page per tens ticket (`ADM-010`, `ADM-020`, …) with children (`ADM-011`). Parent is in parentheses. **ADM-001** is the scoping ticket (stories written; not Vue).

---

## Epic ADM — Admin portal

None of the **screens** are in Vue yet. Each **page** is a tens ticket.

- [x] **ADM-001** Admin scoped from designer — stories in this file, tickets on the board
- [ ] **ADM-010** Admin login and nav — F-12
  - [ ] **ADM-011** Login `admin` / `123`
  - [ ] **ADM-012** Header: ADMIN, Catalogue, Manage Addresses, Manage Titles
  - [ ] **ADM-013** Profile: Admin Panel, Order History, Log out
- [ ] **ADM-020** Admin Dashboard — F-13
  - [ ] **ADM-021** System Options tiles
  - [ ] **ADM-022** Live address count
  - [ ] **ADM-023** Live title count
- [ ] **ADM-030** Order History — F-16
  - [ ] **ADM-031** Table
  - [ ] **ADM-032** Search by name
  - [ ] **ADM-033** Filter by status
  - [ ] **ADM-034** View card preview
  - [ ] **ADM-035** Repeat Order
  - [ ] **ADM-036** Profile menu shortcut
- [ ] **ADM-040** Invoice History — F-17
  - [ ] **ADM-041** Invoice table
  - [ ] **ADM-042** Download
- [ ] **ADM-050** Reporting — F-18
  - [ ] **ADM-051** Monthly Spend Overview
  - [ ] **ADM-052** Recent Activity
  - [ ] **ADM-053** Spend by Department
  - [ ] **ADM-054** Export Data
- [ ] **ADM-060** Manage Addresses — F-14
  - [ ] **ADM-061** List offices
  - [ ] **ADM-062** Add
  - [ ] **ADM-063** Remove
  - [ ] **ADM-064** Edit
  - [ ] **ADM-065** New / edit form fields
  - [ ] **ADM-066** Form actions (Save Draft, Add / Update, Back)
  - [ ] **ADM-067** Customize and shipping use this list
- [ ] **ADM-070** Manage Titles — F-15
  - [ ] **ADM-071** List designations
  - [ ] **ADM-072** Add
  - [ ] **ADM-073** Delete
  - [ ] **ADM-074** Inline edit
  - [ ] **ADM-075** Customize dropdown uses this list

Ticket descriptions live on the RC Web Dev board (`#/rc-web-dev`). Designer leftovers (do not copy as-is): **ADM-N1**–**ADM-N5**.

---

## Designer leftovers (not Vue tickets yet)

Fix or drop in the designer; do not copy as-is.

| Code | Issue |
| --- | --- |
| ADM-N1 | Edit address copies the whole line into Name and Street; City / Province / Postal stay empty |
| ADM-N2 | Country defaults to United States |
| ADM-N3 | Save Draft on an empty form does nothing |
| ADM-N4 | Repeat Order used NJ sample addresses, not Colliers offices |
| ADM-N5 | View preview: employee name and card email did not match |

Footer English/Français is still a duplicate — that is **F-20**, not an admin ticket.
