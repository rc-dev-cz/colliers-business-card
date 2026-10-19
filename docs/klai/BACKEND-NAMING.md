# Klai backend naming and data model

Shared reference for frontend and FileMaker: **page name → route → `hookSetName` → FileMaker script(s)**, plus model keys hooks should fill or consume.

**Source of truth for hook names:** live Klai Studio when the page exists there; otherwise the **Planned** rows below (from this Cursor/Vue app). FileMaker script names are **convention-derived** from BetterForms (`assistantGuide_fileMaker`), not verified against live FM scripts in this workspace.

Last MCP refresh: 2026-10-07 (Shipping Vue parity: two-line modelDev, billed itemCount, empty Split Order, addToCart assigns itemIds).

**Status:** Live = in Klai today · Planned = in Cursor/Vue, not in Klai yet.

Cart is a drawer, not a page.

---

## Naming rules

| Layer                             | Pattern                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| Page load (`requestHook: true`)   | `BF - onFormRequest - <HookSetName>`                        |
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

| Page (`formName`) | Route             | `hookSetName`   | `requestHook`                       | Expected FM onFormRequest            | Utility / notes                                                                                                                     | Status  |
| ----------------- | ----------------- | --------------- | ----------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Catalogue         | `/` (`default`)   | `catalogue`     | true                                | `BF - onFormRequest - catalogue`     | Named actions: `goDetails`, `goCustomize`                                                                                           | Live    |
| Product Detail    | `/product-detail` | `catalogueitem` | true                                | `BF - onFormRequest - catalogueitem` | Query `?code=` and `?id=` (`store_catalogue::id`). Page keeps a product when either matches                                         | Live    |
| Customize         | `/customize`      | `customize`     | true                                | `BF - onFormRequest - customize`     | Query `?code=` and `?id=`. Form submit is `previewProof` (not add-to-cart). Layout lock + `viewPrintPdf`. Shared draft: `app.proof` | Live UI |
| Proof             | `/proof`          | `proof`         | false                               | —                                    | Client-only. Reads `app.proof`. Checkbox then site globals `addProofToCart` / `applyProofToCart`. No FileMaker hook                 | Live UI |
| Shipping          | `/shipping`       | `shipping`      | true (planned; false in Klai today) | `BF - onFormRequest - shipping`      | Load personal + office addresses. Split/qty client until submit. Shared draft: `app.cart` + `app.order`                             | Live UI |
| Review            | `/review`         | `review`        | false                               | —                                    | `submit` → create order → `BF - onUtility - review`                                                                                 | Live UI |
| Confirmed         | `/confirmed`      | `confirmed`     | false                               | —                                    | Display-only; clears `app.cart` / `app.order`                                                                                       | Live UI |

### Profile

| Page (`formName`) | Route            | `hookSetName` | `requestHook`                       | Expected FM onFormRequest        | Utility / notes                                                                            | Status  |
| ----------------- | ---------------- | ------------- | ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------ | ------- |
| Address Book      | `/address-book`  | `addresses`   | true                                | `BF - onFormRequest - addresses` | Planned: `create`, `update`, `delete` (personal). Save/edit/delete still client-side today | Live    |
| Order History     | `/order-history` | `orders`      | true (planned; false in Klai today) | `BF - onFormRequest - orders`    | `repeat` → `BF - onUtility - orders` (utility already wired in Klai)                       | Live UI |

### Auth

| Page (`formName`)           | Route                  | `hookSetName` | `requestHook` | Expected FM onFormRequest | Utility / notes                   | Status |
| --------------------------- | ---------------------- | ------------- | ------------- | ------------------------- | --------------------------------- | ------ |
| Auth - Login                | `/login`               | `login`       | false         | —                         | Planned: login utility when wired | Live   |
| Auth - Forgot               | `/login/forgot`        | `forgot`      | false         | —                         | —                                 | Live   |
| Recovery Email Sent         | `/login/forgot/sent`   | `login`       | false         | —                         | —                                 | Live   |
| Auth - Reset                | `/login/reset`         | `login`       | false         | —                         | —                                 | Live   |
| Create new password Success | `/login/reset/success` | `login`       | false         | —                         | —                                 | Live   |
| Auth - Signup / Register    | `/login/signup`        | `signup`      | false         | —                         | —                                 | Live   |
| Auth - Verify               | `/login/verify`        | `login`       | false         | —                         | —                                 | Live   |

### Admin

| Page (`formName`)   | Route              | `hookSetName`    | `requestHook`        | Expected FM onFormRequest             | Utility / notes                                               | Status  |
| ------------------- | ------------------ | ---------------- | -------------------- | ------------------------------------- | ------------------------------------------------------------- | ------- |
| Admin Home          | `/admin`           | `admin`          | false (planned true) | `BF - onFormRequest - admin`          | Dashboard / tool links; `model.counts` in modelDev            | Live UI |
| Manage Addresses    | `/admin/addresses` | `adminaddresses` | false (planned true) | `BF - onFormRequest - adminaddresses` | `create`, `update`, `delete` (offices) — client stub until FM | Live UI |
| Manage Titles       | `/admin/titles`    | `admintitles`    | true                 | `BF - onFormRequest - admintitles`    | `save`, `delete`                                              | Live UI |
| Manage Degrees      | `/admin/degrees`   | `admindegrees`   | true                 | `BF - onFormRequest - admindegrees`   | `save`, `delete`                                              | Live UI |
| Admin Order History | `/admin/orders`    | `adminorders`    | false (planned true) | `BF - onFormRequest - adminorders`    | Admin-scoped order list (employee); no `repeat` in v1         | Live UI |
| Invoice History     | `/admin/invoices`  | `admininvoices`  | false (planned true) | `BF - onFormRequest - admininvoices`  | Invoice table + download (mock)                               | Live UI |
| Reporting           | `/admin/reporting` | `adminreporting` | false (planned true) | `BF - onFormRequest - adminreporting` | Charts / activity / export CTA (mock)                         | Live UI |

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

**CardPreview usage:** Catalogue, Product Detail, CartDrawer, and Shipping embed `<bfcomp name="CardPreview" :model="…">`. Customize and Proof **inline** the same face (live `model.card` / `model.proof.details`) because `bfcomp` scopes/clones `model` and does not track form edits. Do **not** add Catalogue or Admin Home page namedActions for preview layout — that lives on the component (`onUpdated` / `onMount`). HTML also falls back to CU-07 samples when `name` is empty.

**Card** — customize form. `degree` is always an array with no fixed count cap; selected degrees and Additional Credentials are limited by the measured name-line + credential-row space. `websiteFr` is the French face URL.

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
  "addressName": "Toronto Office",
  "addressStreet": "1400-181 Bay Street",
  "addressStreet2": "",
  "addressCity": "Toronto",
  "addressProvince": "ON",
  "addressPostalZip": "M5J 2V1",
  "addressCountry": "Canada",
  "line": "1400-181 Bay Street, Toronto, ON M5J 2V1"
}
```

`line` is optional (comma-separated for lists). Customize builds `card.address` from the Address fields (name, street, street 2, city/province, postal and country). Do not use `line` as the card face.

**Proof** (`app.proof`) — same card `details` as Customize, plus product `code` / `language` / `quantity`. Proof is client-only (`hookSetName: proof`, `requestHook: false`).

```json
{
  "code": "BCAD-PL-ENG",
  "language": "English",
  "quantity": 1,
  "details": {}
}
```

**CartDrawer** — not a page. Component `CartDrawer` on the site header. Line qty is boxes; UI shows `qty * 250` cards plus person name. Preview navigates to `/proof`; edit sets `app.editLineId` and opens Customize. Cart mutations live on site `content.namedActions`: `addToCart`, `applyProofToCart`, `addProofToCart`, `ensureProofInCart`, `syncCartHeader`, `openCart`, `clearCart` (frontend `app.cart` only; `loadCart` / `saveCart` unchanged).

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
    {
      "code": "BCAD-PL-ENG",
      "nameKey": "label_colliers_productEnglish",
      "price": 63,
      "previewKey": "previews.eng"
    }
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
  "product": {/* full Product */},
  "products": [/* full Product rows, lookup for ?code= */],
  "card": { "language": "English" }
}
```

`card` here is only the empty preview seed (`language`). Do not copy the customize form onto this page. FileMaker must return the same product `code` values as Catalogue, on `products` or on `product`. The page matches `?code=` and shows nothing when that code is missing.

**Customize** (`customize`) — request load for title and degree lists ([`fm-onFormRequest-customize.xml`](fm-onFormRequest-customize.xml); turn on `requestHook` once that script is in)

```json
{
  "code": "BCAD-PL-ENG",
  "notFound": 0,
  "product": {
    "code": "BCAD-PL-ENG",
    "language": "English",
    "nameKey": "label_colliers_productEnglish"
  },
  "card": {/* Card */},
  "cart": [],
  "titles": [{ "id": 87, "title": "Principal", "language": "EN" }],
  "degrees": ["Arch. Tech", "Architect"],
  "titleOptions": [],
  "titleFrChoices": [],
  "degreeOptions": [],
  "offices": [],
  "officeOptions": [],
  "officesLoading": 0
}
```

FileMaker should return the same Product rows as Catalogue (`products`, or the one match on `product`). `code` must match `?code=`. `cart` is the lines this page appends. FileMaker sends `titles` (records from `store_titles`, same as Manage Titles) and `degrees` (strings from `store_degrees`, same as Manage Degrees). `onFormLoad` builds `titleOptions` (English for English + bilingual cards, French for French-only), `titleFrChoices` (French titles for the bilingual French dropdown in `wrapCardName`), and `degreeOptions`; each falls back to its seed list when FileMaker sends none. FileMaker fills `offices` with Address records (`id`, `addressName`, `addressStreet`, `addressStreet2`, `listLabel`). `loadOffices` keeps those rows, builds `cardAddress` for the preview/print block, and only seeds stubs when the list is empty. The office select binds `office.cardAddress` into `model.card.address`.

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
      "details": {
        "name": "",
        "title": "",
        "degree": [],
        "additionalCredentials": "",
        "region": "",
        "specializedTeam": "",
        "email": "",
        "phone": "",
        "company": "",
        "address": "",
        "website": "",
        "language": "English"
      }
    }
  ],
  "order": {
    "splits": [
      {
        "id": 1,
        "itemIds": ["line-1"],
        "locations": []
      }
    ]
  }
}
```

`itemIds` point at `cart[].id` so a card can move between shipping groups without copying the line. Location `qty` is boxes **per address** (editable; defaults to Selected Items sum). Selected Items Qty is a readout (`quantity × 250`). Billed boxes = sum of location qty (×1 Selected Items if none). Adding or removing a ship-to address must **not** delete cart lines.

**Shipping** (`shipping`) — planned request load (`personalAddresses`, `offices`, `products`). Client keeps cart/splits.

```json
{
  "cart": [],
  "order": { "splits": [] },
  "products": [
    {
      "code": "BCAD-PL-ENG",
      "language": "English",
      "nameKey": "label_colliers_productEnglish",
      "image": "",
      "price": 63
    }
  ],
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
  "addresses": [/* Address */],
  "offices": [/* Address */]
}
```

**Order History** (`orders`) — planned request load; utility `repeat` uses `id` / `idToRepeat`

```json
{
  "orders": [/* Order */]
}
```

### Admin — Live UI / Planned

Hook set names below are the agreed Mike / FileMaker contract. Build FM scripts to match; do not invent alternate names without updating this doc.

**Manage Titles** (`admintitles`) — Live UI in Klai (`formName` Manage Titles; route `/admin/titles`). English / French tabs over FileMaker `store_titles` (`id`, `title`, `language`). FileMaker scripts: [`fm-admintitles.md`](fm-admintitles.md).

Request — one record per title, sorted by title:

```json
{
  "titles": [
    { "id": 87, "title": "Principal", "language": "EN" },
    { "id": 91, "title": "Chef d'équipe", "language": "FR" }
  ]
}
```

Utility — Klai sends only `payload` (`modelFilterKeys: ["payload"]`), one save at a time (`model.saving` locks add / edit / delete until FileMaker answers). FileMaker script: [`fm-onUtility-admintitles.xml`](fm-onUtility-admintitles.xml).

| Named action | `options.type` | `payload` | FileMaker returns |
| --- | --- | --- | --- |
| `addTitle` → `persistTitle` | `save` | `{ id: "", tempId, title, language }` | `payload.newId` (Klai swaps `tempId` for it) |
| `saveEdit` → `persistTitle` | `save` | `{ id, title, language }` | — |
| `deleteTitle` → `removeTitle` | `delete` | `{ id, title, language }` | — |

`onFormLoad` ([`admintitles-onFormLoad.js`](admintitles-onFormLoad.js)) turns plain-string responses into English records. When FileMaker returns nothing it seeds the 31 English titles (`Colliers Project Leaders Titles.xlsx`, Oct 2026) and the 8 French titles from `Titles French.xlsx`. Customize `titleOptions` uses the same 31 English titles for English + bilingual cards ([`onFormLoad-customize.js`](onFormLoad-customize.js)); French-only cards keep `TITLES_FR`. Admin Home falls back to `counts.titles = 39`.

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

**Manage Addresses** (`adminaddresses`) — Live UI in Klai (route `/admin/addresses`). Company offices only (same **Address** shape): FileMaker `Store_OfficeAddresses` rows with `address_type = "office"` and `active` not 0 ([`fm-offices.md`](fm-offices.md)). Address Book (Office Addresses tab), Customize and Shipping load the same `offices` list from their own request hooks. `saveOffice` calls utility `type: "save"` and swaps `model.payload.id` (`office-<timestamp>` on create) for `model.payload.newId` after FileMaker returns. `deleteOffice` calls utility `type: "delete"` with that Address id.

```json
{
  "offices": [/* Address */],
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

**Manage Degrees** (`admindegrees`) — Live UI in Klai, shown as **Manage Credentials** (route `/admin/degrees`). Degree strings from FileMaker `store_degrees`. Customize labels the same list "Credentials (Optional)"; free text is "Other credential" behind a "Not on the list? Add another" link. An empty card shows no sample credential (the old "C.M." placeholder is gone from preview, print and Vue).

Until FileMaker returns `degrees`, `onFormLoad` seeds the 32 client-approved designations (`Designations.xlsx`, Oct 2026; [`admindegrees-onFormLoad.js`](admindegrees-onFormLoad.js)). Customize `degreeOptions` uses the same list ([`onFormLoad-customize.js`](onFormLoad-customize.js)), and Admin Home falls back to `counts.degrees = 32` ([`admin-onFormLoad.js`](admin-onFormLoad.js)). Any non-empty FileMaker list wins. Keep the three seeds in sync until FM serves the list.

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
      "cart": [/* same as Order.cart */]
    }
  ]
}
```

**Reporting** (`adminreporting`) — Live UI in Klai (route `/admin/reporting`). Mock chart / activity / spend bars until FM hook is on. UI may derive bar `%` from `amount`.

```json
{
  "monthlySpend": [{ "month": "Aug", "amount": 441 }],
  "recentActivity": [
    {
      "name": "Sarah Jenkins",
      "action": "Ordered Standard Cards",
      "department": "Marketing",
      "when": "2 hours ago"
    }
  ],
  "spendByDepartment": [{ "department": "Marketing", "amount": 1260 }]
}
```

**Invoice History** (`admininvoices`) — Live UI in Klai (route `/admin/invoices`). Mock table + download alert until FM hook is on.

```json
{
  "invoices": [/* Invoice */]
}
```

---

## Gaps / To Review

- **Order History** — turn on `requestHook` + `BF - onFormRequest - orders` when live load is ready (`repeat` utility already exists).
- **Address Book** — wire `create` / `update` / `delete` utilities; load already uses request hook.
- **Customize / Product Detail** — Catalogue opens both with `?code=` and `?id=` (`store_catalogue::id`, such as `13616` for `CPL-13616`). If `product.id` is missing, the click uses the trailing number on `code`. Each page shows the form from that query even when the dev product list does not contain the code. FileMaker should still set `model.product` with the same `code`.
- **FM (you): `BF - onFormRequest - customize`** — do **not** hardcode `"language" ; "English"`. After the catalogue find, set `$$BF_Model.product` `{ id, code, language, price, nameKey }` from `store_catalogue`, and `$$BF_Model.card.language` to match. Bilingual SKUs (e.g. `/#/customize?code=CPL-13616&id=13616`) need `language: "Bilingual"` or Klai shows one face. Leave `BF - onUtility - customize` `type: "addToCart"` alone; cart stays frontend until Review `submit`.
- **Print PDF** — Customize button → `viewPrintPdf` (anchor download; Klai synced to Vue layout 2026-10-06). FM base64 → Mark’s Press later ([PRINT-PDF.md](../PRINT-PDF.md)).
- **Proof** — Live UI at `/proof`. No request hook. Cart is still a drawer (`CartDrawer`); preview/edit on a line opens Proof or Customize.
- **Review** — Live UI uses person name + card qty (`qty * 250`), `printOrder`, Place Order. Turn on Shipping `requestHook` when FM fills addresses; Review `submit` is still a stub until FM creates the order.
- **Admin pages** — Admin Home (`admin`), Admin Order History (`adminorders`), Invoice History (`admininvoices`), Reporting (`adminreporting`), Manage Addresses (`adminaddresses`), Manage Titles (`admintitles`), and Manage Degrees (`admindegrees`) are Live UI. Confirm live FM script names when Mike builds them.
- **Catalogue** — confirm live products payload matches `modelDev` shape.
- **Script names** — confirm live FM scripts match `BF - onFormRequest - <hookSetName>` / `BF - onUtility - <hookSetName>`; update this doc if they differ.

---

## How to refresh (read-only)

1. MCP `list_records_overview` → `collection: pages` (formName, hookSetName, requestHook).
2. MCP `get_entity_detail` → site `content.layouts` (route → page).
3. Per page: `form.hookSetName`, `form.namedActions` (look for `runUtilityHook`), `model` / `modelDev` keys.
4. Sync Planned rows from [`src/router.js`](../../src/router.js) when new product pages appear.
5. Update this file. Do **not** write to Klai unless explicitly asked.
