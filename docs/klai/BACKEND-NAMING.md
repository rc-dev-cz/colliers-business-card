# Klai backend naming and data model

Shared reference for frontend and FileMaker: **page name → route → `hookSetName` → FileMaker script(s)**, plus model keys hooks should fill or consume.

**Source of truth for hook names:** live Klai Studio when the page exists there; otherwise the **Planned** rows below (from this Cursor/Vue app). FileMaker script names are **convention-derived** from BetterForms (`assistantGuide_fileMaker`), not verified against live FM scripts in this workspace.

Last MCP refresh: 2026-09-23 (Shipping + Review + Confirmed Live UI in Klai).

**Status:** Live = in Klai today · Planned = in Cursor/Vue, not in Klai yet.

Cart is a drawer, not a page.

---

## Naming rules

| Layer | Pattern |
| --- | --- |
| Page load (`requestHook: true`) | `BF - onFormRequest - <HookSetName>` |
| Utility action (`runUtilityHook`) | `BF - onUtility - <HookSetName>` (branch on `options.type`) |

Local style:

- **`hookSetName`** — lowercase, no spaces (`catalogue`, `catalogueitem`, `shipping`, `adminaddresses`)
- **Routes** — kebab-case path segments (`product-detail`, `address-book`, `order-history`). Catalogue is layout `default` → `/`
- **Page `formName`** — Title Case display name in Studio
- **Utility `type`** — lowercase, no spaces (`repeat`, `create`, `update`, `delete`, `submit`)

Bus variables (FileMaker side): `$$BF_Payload`, `$$BF_Model`, `$$BF_Actions`, `$$BF_User`.

---

## Page registry

### Order flow

| Page (`formName`) | Route | `hookSetName` | `requestHook` | Expected FM onFormRequest | Utility / notes | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Catalogue | `/` (`default`) | `catalogue` | true | `BF - onFormRequest - catalogue` | Named actions: `goDetails`, `goCustomize` | Live |
| Product Detail | `/product-detail` | `catalogueitem` | true | `BF - onFormRequest - catalogueitem` | Query `?code=` | Live |
| Customize | `/customize` | `customize` | true (planned; false in Klai today) | `BF - onFormRequest - customize` | Query `?code=`. Client stubs (`loadOffices`, `addToCart`). Print PDF: button → `viewPrintPdf` (anchor download; see [PRINT-PDF.md](../PRINT-PDF.md)) | Live UI |
| Shipping | `/shipping` | `shipping` | true (planned; false in Klai today) | `BF - onFormRequest - shipping` | Load personal + office addresses. Split/qty client until submit. Shared draft: `app.cart` + `app.order` | Live UI |
| Review | `/review` | `review` | false | — | `submit` → create order → `BF - onUtility - review` | Live UI |
| Confirmed | `/confirmed` | `confirmed` | false | — | Display-only; clears `app.cart` / `app.order` | Live UI |

### Profile

| Page (`formName`) | Route | `hookSetName` | `requestHook` | Expected FM onFormRequest | Utility / notes | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Address Book | `/address-book` | `addresses` | true | `BF - onFormRequest - addresses` | Planned: `create`, `update`, `delete` (personal). Save/edit/delete still client-side today | Live |
| Order History | `/order-history` | `orders` | true (planned; false in Klai today) | `BF - onFormRequest - orders` | `repeat` → `BF - onUtility - orders` (utility already wired in Klai) | Live UI |

### Auth

| Page (`formName`) | Route | `hookSetName` | `requestHook` | Expected FM onFormRequest | Utility / notes | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Auth - Login | `/login` | `login` | false | — | Planned: login utility when wired | Live |
| Auth - Forgot | `/login/forgot` | `forgot` | false | — | — | Live |
| Recovery Email Sent | `/login/forgot/sent` | `login` | false | — | — | Live |
| Auth - Reset | `/login/reset` | `login` | false | — | — | Live |
| Create new password Success | `/login/reset/success` | `login` | false | — | — | Live |
| Auth - Signup / Register | `/login/signup` | `signup` | false | — | — | Live |
| Auth - Verify | `/login/verify` | `login` | false | — | — | Live |

### Admin

| Page (`formName`) | Route | `hookSetName` | `requestHook` | Expected FM onFormRequest | Utility / notes | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Admin Home | `/admin` | `admin` | false (planned true) | `BF - onFormRequest - admin` | Dashboard / tool links; `model.counts` in modelDev | Live UI |
| Manage Addresses | `/admin/addresses` | `adminaddresses` | false (planned true) | `BF - onFormRequest - adminaddresses` | `create`, `update`, `delete` (offices) — client stub until FM | Live UI |
| Manage Titles (formName: Manage Designations) | `/admin/titles` | `admintitles` | false (planned true) | `BF - onFormRequest - admintitles` | `create`, `update`, `delete` | Live UI |
| Manage Degrees | `/admin/degrees` | `admindegrees` | false (planned true) | `BF - onFormRequest - admindegrees` | `create`, `update`, `delete` | Live UI |
| Admin Order History | `/admin/orders` | `adminorders` | false (planned true) | `BF - onFormRequest - adminorders` | Admin-scoped order list (employee); no `repeat` in v1 | Live UI |
| Invoice History | `/admin/invoices` | `admininvoices` | false (planned true) | `BF - onFormRequest - admininvoices` | Invoice table + download (mock) | Live UI |
| Reporting | `/admin/reporting` | `adminreporting` | false (planned true) | `BF - onFormRequest - adminreporting` | Charts / activity / export CTA (mock) | Live UI |

---

## Data models

Shapes the request/utility hooks should put on `$$BF_Model` (Klai `model`). Includes **Live** product pages and **Planned** admin pages (models agreed for Mike / FileMaker; UI not in Klai yet). UI-only keys (`header`, `filtered`, `search`, …) omitted unless the hook must set them.

### Shared shapes

**Product** — full row (Product Detail). Catalogue only needs `code`, `nameKey`, `price`, `previewKey`. Shipping only needs `code`, `language`.

```json
{
  "code": "BCAD-PL-ENG",
  "nameKey": "label_colliers_productEnglish",
  "language": "English",
  "languageKey": "english",
  "price": 63,
  "packaging": "250/BX",
  "minQty": 1,
  "previewKey": "previews.eng",
  "priceTiers": [],
  "status": "Active",
  "dateAdded": "7/22/2022"
}
```

`previewKey` is a path into `previews` for `CardPreview` (`previews.eng` | `previews.fr` | `previews.bil`).

**Card** — customize form. `degree` is always an array (max 2). `websiteFr` is the French face URL.

```json
{
  "language": "English",
  "name": "",
  "nameWrapped": "",
  "degree": [],
  "additionalCredentials": "",
  "title": "",
  "region": "",
  "specializedTeam": "",
  "email": "",
  "emailEdited": false,
  "phone": "",
  "address": "",
  "website": "colliersprojectleaders.com",
  "websiteFr": "colliersprojectleaders.com/fr",
  "company": "Colliers Project Leaders"
}
```

**Address**

```json
{
  "id": "1",
  "addressName": "Toronto — Bay Street",
  "addressStreet": "181 Bay Street",
  "addressCity": "Toronto",
  "addressProvince": "ON",
  "addressPostalZip": "M5J 2T3",
  "addressCountry": "Canada",
  "line": "181 Bay Street, Toronto, ON M5J 2T3"
}
```

`line` is optional (computed or provided).

**Order**

```json
{
  "id": "ORD-1001",
  "date": 20260812,
  "status": "Delivered",
  "cart": [
    {
      "code": "BCAD-PL-ENG",
      "language": "English",
      "quantity": 2,
      "details": {}
    }
  ]
}
```

`status`: `"Delivered"` | `"Shipped"` | `"Processing"`.

Personal Order History uses this shape. Admin Order History adds `employeeName` and `ownerEmail` (see below).

**Invoice**

```json
{
  "id": "INV-2026-0842",
  "date": "2026-08-10",
  "department": "Marketing",
  "amount": 1240.0,
  "status": "Paid"
}
```

`status`: `"Paid"` | `"Pending"` | `"Overdue"`. UI may also show `dateFormatted` / `amountFormatted` (dev helpers).

### Per page — what the hook fills

**Catalogue** (`catalogue`)

```json
{
  "products": [
    { "code": "BCAD-PL-ENG", "nameKey": "label_colliers_productEnglish", "price": 63, "previewKey": "previews.eng" }
  ],
  "previews": {
    "eng": { "language": "English" },
    "fr": { "language": "French" },
    "bil": { "language": "Bilingual" }
  }
}
```

Preview objects may include empty card fields the `CardPreview` component reads. They are not the customize form.

**Product Detail** (`catalogueitem`) — resolve by `?code=`

```json
{
  "code": "BCAD-PL-ENG",
  "notFound": 0,
  "product": { /* full Product */ },
  "products": [ /* full Product rows, lookup for ?code= */ ],
  "card": { "language": "English" }
}
```

`card` here is only the empty preview seed (`language`). Do not copy the customize form onto this page.

**Customize** (`customize`) — planned request load

```json
{
  "code": "BCAD-PL-ENG",
  "notFound": 0,
  "product": { "code": "BCAD-PL-ENG", "language": "English", "nameKey": "label_colliers_productEnglish" },
  "card": { /* Card */ },
  "cart": [],
  "titleOptions": [],
  "degreeOptions": [],
  "officeOptions": [],
  "officesLoading": 0
}
```

No `products` list on Customize. `cart` is the lines this page appends. `titleOptions` / `degreeOptions` come from the FileMaker titles and degrees tables (plain strings, no `| Canada` suffix).

**Order draft (shared)** — `app.cart` + `app.order`. Shipping, Review, and Confirmed read/write this so the cart drawer and pages stay in sync. Page `model.cart` / `model.order` are the same objects for the current screen. `model.view` is computed in `refreshView` and is **not** sent to FileMaker.

```json
{
  "cart": [
    {
      "id": "line-1",
      "code": "BCAD-PL-ENG",
      "language": "English",
      "quantity": 2,
      "price": 63,
      "details": {}
    }
  ],
  "order": {
    "splits": [
      {
        "id": 1,
        "itemIds": ["line-1"],
        "locations": [{ "id": "loc-1", "address": "181 Bay Street, Toronto, ON M5J 2T3", "qty": 2 }]
      }
    ]
  }
}
```

`itemIds` point at `cart[].id` so a card can move between shipping groups without copying the line. Location `qty` is boxes to that address and does **not** change cart quantity.

**Shipping** (`shipping`) — planned request load (`personalAddresses`, `offices`, `products`). Client keeps cart/splits.

```json
{
  "cart": [],
  "order": { "splits": [] },
  "products": [{ "code": "BCAD-PL-ENG", "language": "English", "nameKey": "label_colliers_productEnglish", "image": "", "price": 63 }],
  "personalAddresses": [],
  "offices": [],
  "header": { "cartCount": 0 },
  "view": {
    "itemCount": 0,
    "addressOptions": { "personal": [], "offices": [] },
    "knownAddresses": []
  }
}
```

Hook fills `personalAddresses`, `offices`, and slim `products`. Do not persist `view` or `split.lines` (those are UI).

**Review** (`review`) — no request hook. Same `cart` + `order` + slim `products`. Utility `type: submit` sends `cart` and `order`.

```json
{
  "cart": [],
  "order": { "splits": [] },
  "products": [],
  "header": { "cartCount": 0 },
  "submitting": 0,
  "submitError": "",
  "view": {
    "lines": [],
    "splits": [],
    "totals": { "subtotal": "0.00", "shipping": "0.00" }
  }
}
```

Shipping & handling is always `$0.00` (included in the box price). No payment.

**Confirmed** (`confirmed`) — no request hook. Clears the shared draft on load.

```json
{
  "header": { "cartCount": 0 }
}
```

**Address Book** (`addresses`)

```json
{
  "addresses": [ /* Address */ ],
  "offices": [ /* Address */ ]
}
```

**Order History** (`orders`) — planned request load; utility `repeat` uses `id` / `idToRepeat`

```json
{
  "orders": [ /* Order */ ]
}
```

### Admin — Live UI / Planned

Hook set names below are the agreed Mike / FileMaker contract. Build FM scripts to match; do not invent alternate names without updating this doc.

**Manage Designations** (`admintitles`) — Live UI in Klai (`formName` Manage Designations; route `/admin/titles`). Designation strings. Client stubs for `create` / `update` / `delete` until FM utilities exist (`update` sends old + new string).

```json
{
  "titles": ["Managing Director", "Associate"]
}
```

**Admin Home** (`admin`) — Live UI in Klai (route `/admin`). Dashboard tiles; counts from `model.counts` until FM request hook is on.

```json
{
  "counts": {
    "addresses": 0,
    "titles": 0,
    "degrees": 0
  }
}
```

Tiles are UI-only. Counts may come from this object or from loading the three lists on related pages.

**Manage Addresses** (`adminaddresses`) — Live UI in Klai (route `/admin/addresses`). Company offices only (same **Address** shape). Client stubs until FM utilities `create` / `update` / `delete`.

```json
{
  "offices": [ /* Address */ ],
  "form": {
    "id": "",
    "addressName": "",
    "addressStreet": "",
    "addressCity": "",
    "addressProvince": "",
    "addressPostalZip": "",
    "addressCountry": ""
  }
}
```

**Manage Degrees** (`admindegrees`) — Live UI in Klai (route `/admin/degrees`). Same pattern as titles / designations. Client stubs until FM utilities exist.

```json
{
  "degrees": ["Arch. Tech", "P. Eng."]
}
```

**Admin Order History** (`adminorders`) — Live UI in Klai (route `/admin/orders`). Company-wide list. **Order** plus employee fields. No `repeat` utility in v1 (ADM-035 open).

```json
{
  "orders": [
    {
      "id": "ORD-8472",
      "date": 20260828,
      "status": "Delivered",
      "employeeName": "Alex Johnson",
      "ownerEmail": "alex.johnson@colliers.com",
      "cart": [ /* same as Order.cart */ ]
    }
  ]
}
```

**Reporting** (`adminreporting`) — Live UI in Klai (route `/admin/reporting`). Mock chart / activity / spend bars until FM hook is on. UI may derive bar `%` from `amount`.

```json
{
  "monthlySpend": [{ "month": "Aug", "amount": 441 }],
  "recentActivity": [{ "name": "Sarah Jenkins", "action": "Ordered Standard Cards", "department": "Marketing", "when": "2 hours ago" }],
  "spendByDepartment": [{ "department": "Marketing", "amount": 1260 }]
}
```

**Invoice History** (`admininvoices`) — Live UI in Klai (route `/admin/invoices`). Mock table + download alert until FM hook is on.

```json
{
  "invoices": [ /* Invoice */ ]
}
```

---

## Gaps / To Review

- **Order History** — turn on `requestHook` + `BF - onFormRequest - orders` when live load is ready (`repeat` utility already exists).
- **Address Book** — wire `create` / `update` / `delete` utilities; load already uses request hook.
- **Customize** — turn on `requestHook`; seed product, titles, offices from FM.
- **Print PDF** — Customize button → `viewPrintPdf` (anchor download). FM base64 → Mark’s Press later ([PRINT-PDF.md](../PRINT-PDF.md)).
- **Shipping / Review / Confirmed** — Live UI. Turn on Shipping `requestHook` when FM fills addresses; Review `submit` utility still a stub until FM creates the order.
- **Admin pages** — Admin Home (`admin`), Admin Order History (`adminorders`), Invoice History (`admininvoices`), Reporting (`adminreporting`), Manage Addresses (`adminaddresses`), Manage Designations (`admintitles`), and Manage Degrees (`admindegrees`) are Live UI. Confirm live FM script names when Mike builds them.
- **Catalogue** — confirm live products payload matches `modelDev` shape.
- **Script names** — confirm live FM scripts match `BF - onFormRequest - <hookSetName>` / `BF - onUtility - <hookSetName>`; update this doc if they differ.

---

## How to refresh (read-only)

1. MCP `list_records_overview` → `collection: pages` (formName, hookSetName, requestHook).
2. MCP `get_entity_detail` → site `content.layouts` (route → page).
3. Per page: `form.hookSetName`, `form.namedActions` (look for `runUtilityHook`), `model` / `modelDev` keys.
4. Sync Planned rows from [`src/router.js`](../../src/router.js) when new product pages appear.
5. Update this file. Do **not** write to Klai unless explicitly asked.
