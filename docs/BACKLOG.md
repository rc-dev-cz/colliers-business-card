# Backlog

F-code feature index for [FEATURES.md](FEATURES.md). Agreed rules: [BUSINESS-RULES.md](BUSINESS-RULES.md). Automated cases: [TESTING.md](TESTING.md).

This is **not** the workflow backlog. Editable ticket status lives in [devTracker.json](devTracker.json) (RC Web Dev board). The **Ticket** column is the board id.

Do not add an Account feature. Preview login, signup, and forgot-password are preview-only — not listed here.

User stories: [USER.md](USER.md). Admin stories: [ADMIN.md](ADMIN.md).

| ID | Feature | Ticket | Notes |
| --- | --- | --- | --- |
| F-01 | Business Card English | `USR-011` | SKU `BCAD-PL-ENG`, $63/box, 250/box |
| F-02 | Business Card Bilingual | `USR-012` | SKU `BCAD-PL-BIL`, $63/box, 250/box |
| F-03 | Business Card French | `USR-013` | SKU `BCAD-PL-FR`, $63/box, 250/box |
| F-04 | Card details page | `USR-020` | Pricing tiers, packaging, brand notes |
| F-05 | Customize card (Vue) | `USR-030` | Name/email max still 30 in Vue; guide is 50/40 (`USR-032`, `USR-034`) |
| F-06 | Cart add and combine | `USR-040` | Same details combine; different name or title stay separate |
| F-07 | Cart badge icon | `USR-043` | Red number on the header cart icon = total quantity |
| F-08 | Clear cart | `USR-044` | |
| F-09 | Shipping splits | `USR-054` | Split Order; cannot remove the last split |
| F-10 | Ship-to locations | `USR-050` | Location qty does not change cart qty. Shipping $0 in the $63 box fee |
| F-11 | Order confirmed | `USR-060` | Clears cart; no payment |
| F-12 | Admin login | `ADM-010` | Vue 2: `admin` / `123`. Checklist: [ADMIN.md](ADMIN.md) |
| F-13 | Admin Dashboard | `ADM-020` | Tiles Done. Live counts still Ideas (`ADM-022`, `ADM-023`) |
| F-14 | Admin Manage Addresses | `ADM-060` | `#/admin/addresses` |
| F-15 | Admin Manage Titles | `ADM-070` | `#/admin/titles` |
| F-16 | Admin order history | `ADM-030` | `#/admin/orders`. User history is F-30 |
| F-17 | Invoice history | `ADM-040` | `#/admin/invoices` |
| F-18 | Reporting | `ADM-050` | `#/admin/reporting` |
| F-19 | Dark theme | — | Out of scope (V2). Closed |
| F-20 | Remove footer language | `F-20` | Navbar EN/FR only |
| F-21 | Automated tests | `F-21` | Spec: [TESTING.md](TESTING.md) |
| F-22 | Navbar EN/FR | `USR-071` | Header only |
| F-23 | Light theme | — | Current default |
| F-24 | Multiple designations | `USR-039` | Guide: one or more designations |
| F-25 | Move cards between shipping groups | `USR-056` | SH-04 |
| F-26 | Split Order empty group | `USR-057` | SH-02, SH-03 |
| F-27 | Order review before confirm | `USR-063` | Section 7 / OR-01. `#/review` |
| F-28 | Colliers offices on shipping | `USR-058` | Offices API + personal Address Book; NJ seeds gone |
| F-29 | Address Book | `USR-080` | Also `ADM-080`. Personal rows until `DEV-106`. Not admin F-14 |
| F-30 | User Order History | `USR-090` | `USR-090`–`USR-098`. Not admin F-16 |
