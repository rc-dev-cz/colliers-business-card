# Backlog

Status of the features in [FEATURES.md](FEATURES.md). Automated cases: [TESTING.md](TESTING.md).

| Status | Meaning |
| --- | --- |
| Done (prototype) | Works in this Vue preview as intended |
| Mock | Screen exists; behavior is fake |
| Not started | Not in this Vue repo, or not built yet |
| Out of scope | Not this product |

Do not add an Account feature. Partner login, signup, and forgot-password are preview-only — not listed here.

| ID | Feature | Status | Notes |
| --- | --- | --- | --- |
| F-01 | Business Card English | Done (prototype) | SKU `BCAD-PL-ENG`, $63/box, 250/box |
| F-02 | Business Card Bilingual | Done (prototype) | SKU `BCAD-PL-BIL`, $63/box, 250/box |
| F-03 | Business Card French | Done (prototype) | SKU `BCAD-PL-FR`, $63/box, 250/box |
| F-04 | Card details page | Done (prototype) | Pricing tiers, packaging, brand notes |
| F-05 | Customize card (Vue) | Done (prototype) | Vue is ahead of the designer; do not copy AI Studio customize |
| F-06 | Cart add and combine | Done (prototype) | Same details combine; different name or title stay separate cart items |
| F-07 | Cart badge icon | Done (prototype) | Red number on the header cart icon = total quantity |
| F-08 | Clear cart | Done (prototype) | |
| F-09 | Shipping splits | Done (prototype) | Split Order; cannot remove the last split |
| F-10 | Ship-to locations | Done (prototype) | Add/remove/select location; location qty does not change cart qty |
| F-11 | Order confirmed | Done (prototype) | Clears cart; no payment |
| F-12 | Admin login | Not started (Vue) | Designer: `admin` / `123`. Keep tests in TESTING.md |
| F-13 | Admin Dashboard | Not started (Vue) | Exists in designer |
| F-14 | Admin Manage Addresses | Not started (Vue) | Exists in designer; not in this repo |
| F-15 | Admin Manage Titles | Not started (Vue) | Exists in designer |
| F-16 | Order history | Not started | Dashboard tile in designer |
| F-17 | Invoice history | Not started | Dashboard tile in designer |
| F-18 | Reporting | Not started | Dashboard tile in designer |
| F-19 | Dark theme | Not started | Vue is light only |
| F-20 | Remove footer language | Not started | Keep navbar EN/FR only; footer dropdown is a duplicate |
| F-21 | Automated tests | Not started | Spec: [TESTING.md](TESTING.md) |
| F-22 | Navbar EN/FR | Done (prototype) | Header only |
| F-23 | Light theme | Done (prototype) | Current default |
