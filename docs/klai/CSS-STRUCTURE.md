# Klai CSS structure — Colliers profile pages

Three-layer system for Address Book, Order History, and future profile list pages.

## Layers

| Layer | Where | Contents |
|-------|--------|----------|
| **1 — Tokens** | [`environment.css`](environment.css) → Klai **Styling** tab | `:root` variables + BF bridge (`--primary-color`, etc.) |
| **2 — Global classes** | Same file | Shell, buttons, fields, cards, tables, modals |
| **3 — Page HTML** | Klai page `html` field | Structure + Vue bindings; use Layer 2 class names |

Copy [`environment.css`](environment.css) to the **top** of Klai site CSS. Keep existing BF sidebar / `.table` rules below.

## Klai page tree (every profile page)

```
Page                     → colliers-page h-screen flex flex-col
└── Page Body            → colliers-page-body colliers-page-body--stack flex flex-col flex-1 min-h-0 overflow-hidden
    ├── group            → colliers-page-stack w-full flex flex-col flex-1 min-h-0   (gray, grows)
    │   ├── User Header  → w-full (component owns colliers-site-header — white)
    │   └── [Page] html  → colliers-page-stack__content w-full flex flex-col flex-1 min-h-0 … colliers-page-root inside
    └── Site Footer      → colliers-page-footer-slot w-full (component owns colliers-site-footer — white)
```

Put **Site Footer on Page Body**, not inside the group. The bfcomponent wrapper needs `colliers-page-footer-slot` so `margin-top: auto` applies to the Klai field wrapper (not only the inner `<footer>`).

### Heights and backgrounds

| Zone | Background | Role |
|------|------------|------|
| **Page** / **Page Body** (`--stack`) | `--colliers-bg-app` (gray) | Fill viewport; gray shows in any gap above footer |
| **group** (`colliers-page-stack`) | `--colliers-bg-app` (gray) | Grows between header and footer slot |
| **User Header** | white | Fixed-height top bar |
| **Content card** | white | Data lives here — not the whole stack |
| **Footer** | white | Pinned via `colliers-page-footer-slot` on the bfcomponent wrapper |

Do **not** set `--colliers-bg-surface` (white) on `colliers-page-stack`. That paints the whole column white and fights the card-on-gray look.

Do **not** set `z-index` on `.colliers-site-header` — it stacks over Klai editor chrome. The avatar dropdown already uses `z-30` inline.

**Klai runtime note:** Page Style Classes use `h-screen`, but `.colliers-page { min-height: 0 }` overrides Tailwind unless you also have `.colliers-page.h-screen { min-height: 100vh }` in site CSS (included in `environment.css`). Without full viewport height, `margin-top: auto` on the footer slot has no space to absorb.

### User Header component (once)

Edit **Components → UserHeader** root `<header>`:

```html
<header id="colliersUserHeader" class="colliers-site-header w-full">
```

Do **not** add `colliers-site-header` on each page's bfcomponent instance.

Edit **Components → SiteFooter** root `<footer>`:

```html
<footer id="colliersSiteFooter" class="colliers-site-footer w-full border-t border-gray-200 bg-white">
```

Do **not** add `colliers-site-footer` on each page's bfcomponent instance — the component owns it.

## Profile list page HTML pattern

```
#page-root.colliers-page-root
├── .colliers-page-header OR .colliers-page-intro
├── .colliers-content-card
│   ├── [.colliers-tab-nav]          Address Book only
│   ├── .colliers-card-toolbar       search (+ filter on Order History)
│   └── .colliers-data-table-wrap > .colliers-data-table
└── .colliers-modal-overlay          sibling of card (not inside)
```

Reference HTML sources:

- [`address-book.html`](address-book.html)
- [`order-history.html`](order-history.html)

## Class catalog

### Shell

| Class | Use |
|-------|-----|
| `colliers-page` | Page root |
| `colliers-page-body` | Scrollable body (Vue catalog pages) |
| `colliers-page-body--stack` | Klai profile pages — locks body height; scroll in `__content` |
| `colliers-page-stack` | group — gray canvas, fills page body |
| `colliers-page-stack__content` | html field wrapper — scrollable middle (`flex-1`) |
| `colliers-page-footer-slot` | SiteFooter bfcomponent on Page Body — also beats BF `.form-element { margin-bottom: 1rem }` |
| `colliers-site-footer` | SiteFooter component `<footer>` element only |
| `colliers-site-header` | UserHeader component only |
| `colliers-page-root` | Centered page content column |

### Page chrome

| Class | Use |
|-------|-----|
| `colliers-page-title` | H1 |
| `colliers-page-header` | Title + primary action |
| `colliers-page-intro` | Title only (Order History) |

### Card / table

| Class | Use |
|-------|-----|
| `colliers-content-card` | White card wrapper |
| `colliers-card-toolbar` | Search/filter row |
| `colliers-tab-nav` / `colliers-tab` / `colliers-tab--active` | Address Book tabs |
| `colliers-search-field` (+ `__icon`, `__input`) | Search with magnifier |
| `colliers-data-table-wrap` / `colliers-data-table` | Table |
| `colliers-empty-row` | Empty state cell |
| `colliers-link-action` | Text actions in table |
| `colliers-status-badge--delivered/shipped/processing` | Order status pills |

### Forms / modals

| Class | Use |
|-------|-----|
| `btn-primary` / `btn-outline` / `btn-primary-sm` | Buttons |
| `field-label` / `field-input` | Form controls |
| `colliers-modal-overlay` / `colliers-modal-panel` / `colliers-modal-header` | Modals |
| `modal-footer` / `modal-footer-actions` | Modal actions |

## Per-page checklist

### Address Book (`FR_7192BDB6-…`)

- [x] Shell classes on Page / Body / group (include `--stack`, `flex-1 min-h-0` on group + html)
- [x] UserHeader component: `colliers-site-header`
- [x] SiteFooter component: `colliers-site-footer`
- [x] HTML: tabs, search inside card, shared classes, modal
- [x] Model: `activeTab`, `offices`; named action `setTab`
- [ ] Paste `environment.css` into Klai Styling tab
- [ ] Add i18n keys in Klai app (see `site-settings.json` labels)

### Order History (`FR_C47CC739-…`)

- [x] Shell classes on Page / Body / group
- [x] HTML: shared classes + details modal
- [ ] Paste `environment.css` into Klai Styling tab

## Vue sync

Vue source of truth:

- [`src/styles/colliers-environment.css`](../../src/styles/colliers-environment.css)
- [`src/styles/main.css`](../../src/styles/main.css)
- [`src/pages/AddressBookPage.vue`](../../src/pages/AddressBookPage.vue)
- [`src/pages/OrderHistoryPage.vue`](../../src/pages/OrderHistoryPage.vue)

Shell renames (aliases kept in Vue CSS):

| Old | New |
|-----|-----|
| `colliers-right-column` | `colliers-page-inner` |
| `colliers-right-body` | `colliers-page-body` |

## Rules

1. Never hardcode `#25408f` in HTML — use `btn-primary`, `colliers-link-action`, or CSS variables.
2. Modals are siblings of `.colliers-content-card`, not nested inside.
3. Style User Header in the **component**, not on each page.
4. When Vue and Klai diverge, update Vue first, then port HTML to Klai.
