# Backlog

Status of the features in [FEATURES.md](FEATURES.md). Agreed rules: [BUSINESS-RULES.md](BUSINESS-RULES.md). Automated cases: [TESTING.md](TESTING.md).

| Status | Meaning |
| --- | --- |
| Done (prototype) | Works in this Vue preview as intended |
| Mock | Screen exists; behavior is fake |
| Not started | Not in this Vue repo, or not built yet |
| Out of scope | Not this product |

Do not add an Account feature. Preview login, signup, and forgot-password are preview-only — not listed here.

User stories: [USER.md](USER.md). Admin stories: [ADMIN.md](ADMIN.md).

| ID | Feature | Status | Notes |
| --- | --- | --- | --- |
| F-01 | Business Card English | Done (prototype) | USR-011. SKU `BCAD-PL-ENG`, $63/box, 250/box |
| F-02 | Business Card Bilingual | Done (prototype) | USR-012. SKU `BCAD-PL-BIL`, $63/box, 250/box |
| F-03 | Business Card French | Done (prototype) | USR-013. SKU `BCAD-PL-FR`, $63/box, 250/box |
| F-04 | Card details page | Done (prototype) | USR-020. Pricing tiers, packaging, brand notes |
| F-05 | Customize card (Vue) | Done (prototype) | USR-030. Vue still name/email max 30; guide is 50/40 (USR-032, USR-034) |
| F-06 | Cart add and combine | Done (prototype) | USR-040. Same details combine; different name or title stay separate cart items |
| F-07 | Cart badge icon | Done (prototype) | USR-043. Red number on the header cart icon = total quantity |
| F-08 | Clear cart | Done (prototype) | USR-044 |
| F-09 | Shipping splits | Done (prototype) | USR-054. Split Order; cannot remove the last split |
| F-10 | Ship-to locations | Done (prototype) | USR-050. Add/remove/select location; location qty does not change cart qty. Shipping $0 — included in the $63 box fee |
| F-11 | Order confirmed | Done (prototype) | USR-060. Clears cart; no payment |
| F-12 | Admin login | Done (prototype) | ADM-010. Vue 2: `admin` / `123`. Checklist: [ADMIN.md](ADMIN.md) |
| F-13 | Admin Dashboard | Vue 2 tiles (QA) | ADM-020. Tiles in colliers-vue2/. Live counts still Ideas (ADM-022, ADM-023). Designer 19 Aug: 22 addresses, 32 titles |
| F-14 | Admin Manage Addresses | Not started (Vue) | ADM-060. **Next take.** Vue 2 stub `#/admin/addresses`. Designer list is one-line add + hover edit; structured form still on Edit |
| F-15 | Admin Manage Titles | Not started (Vue) | ADM-070. Vue 2 stub `#/admin/titles`. Inline edit in designer |
| F-16 | Admin order history | Not started (Vue) | ADM-030. Vue 2 stub `#/admin/orders`. User Order History is F-30 |
| F-17 | Invoice history | Not started (Vue) | ADM-040. Vue 2 stub `#/admin/invoices` |
| F-18 | Reporting | Not started (Vue) | ADM-050. Vue 2 stub `#/admin/reporting` |
| F-19 | Dark theme | Out of scope | V2: not this version. Closed |
| F-20 | Remove footer language | Done (Vue 2) | Navbar EN/FR only. Vue 3 footer still has the dropdown; designer still has it |
| F-21 | Automated tests | Not started | Spec: [TESTING.md](TESTING.md) |
| F-22 | Navbar EN/FR | Done (prototype) | USR-10. Header only |
| F-23 | Light theme | Done (prototype) | Current default |
| F-24 | Multiple designations | Not started | USR-039. Guide: one or more designations |
| F-25 | Move cards between shipping groups | Done (prototype) | USR-056. SH-04 |
| F-26 | Split Order empty group | Done (prototype) | USR-057. SH-02, SH-03 |
| F-27 | Order review before confirm | Done (Vue 2) | USR-063. Section 7 / OR-01. Vue 3 still has no review route |
| F-28 | Colliers offices on shipping | Done (prototype) | USR-058. Offices API + personal Address Book; NJ seeds gone |
| F-29 | Address Book | Vue 2 localStorage | USR-080 / ADM-080. colliers-vue2/ personal rows keyed by email until DEV-106. Not admin F-14 |
| F-30 | User Order History | Vue 2 localStorage | USR-090–USR-098. colliers-vue2/. Not admin F-16 |
