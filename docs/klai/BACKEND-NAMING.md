# Klai backend naming and data model

Shared reference for frontend and FileMaker: **page name → route → `hookSetName` → FileMaker script(s)**, plus model keys hooks should fill or consume.

**Source of truth for hook names:** live Klai Studio when the page exists there; otherwise the **Planned** rows below (from this Cursor/Vue app). FileMaker script names are **convention-derived** from BetterForms (`assistantGuide_fileMaker`), not verified against live FM scripts in this workspace.

Last MCP refresh: 2026-09-11 (read-only).

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
| Customize | `/customize` | `customize` | true (planned; false in Klai today) | `BF - onFormRequest - customize` | Query `?code=`. Load product/titles/offices on request. Client stubs today (`loadOffices`, `addToCart`) | Live UI |
| Shipping | `/shipping` | `shipping` | true | `BF - onFormRequest - shipping` | Load personal + office addresses. Split/qty mostly client until submit | Planned |
| Review | `/review` | `review` | false | — | `submit` → create order → `BF - onUtility - review` | Planned |
| Confirmed | `/confirmed` | `confirmed` | false | — | Display-only after successful `submit` | Planned |

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
| Admin Home | `/admin` | `admin` | true | `BF - onFormRequest - admin` | Dashboard / tool links | Planned |
| Manage Addresses | `/admin/addresses` | `adminaddresses` | true | `BF - onFormRequest - adminaddresses` | `create`, `update`, `delete` (offices) | Planned |
| Manage Titles | `/admin/titles` | `admintitles` | true | `BF - onFormRequest - admintitles` | `create`, `update`, `delete` | Planned |
| Manage Degrees | `/admin/degrees` | `admindegrees` | true | `BF - onFormRequest - admindegrees` | `create`, `update`, `delete` | Planned |
| Admin Order History | `/admin/orders` | `adminorders` | true | `BF - onFormRequest - adminorders` | Admin-scoped order list | Planned |
| Invoice History | `/admin/invoices` | `invoices` | true | `BF - onFormRequest - invoices` | — | Planned |
| Reporting | `/admin/reporting` | `reporting` | true | `BF - onFormRequest - reporting` | — | Planned |

---

## Data models

Shapes the request/utility hooks should put on `$$BF_Model` (Klai `model`). Live pages only below. UI-only keys (`header`, `filtered`, `search`, …) omitted unless the hook must set them.

### Shared shapes

**Product**

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
  "dateAdded": "7/22/2022",
  "longDescription": ""
}
```

`previewKey` is a path into `previews` for `CardPreview` (`previews.eng` | `previews.fr` | `previews.bil`).

**Card**

```json
{
  "language": "English",
  "name": "",
  "degree": "",
  "additionalCredentials": "",
  "title": "",
  "region": "",
  "specializedTeam": "",
  "email": "",
  "phone": "",
  "address": "",
  "website": "colliers.com/canada",
  "company": "Colliers"
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

### Per page — what the hook fills

**Catalogue** (`catalogue`)

```json
{
  "products": [ /* Product */ ],
  "previews": {
    "eng": { /* Card, language English */ },
    "fr": { /* Card, language French */ },
    "bil": { /* Card, language Bilingual */ }
  }
}
```

**Product Detail** (`catalogueitem`) — resolve by `?code=`

```json
{
  "code": "BCAD-PL-ENG",
  "product": { /* Product */ },
  "products": [ /* Product */ ],
  "card": { /* Card */ }
}
```

**Customize** (`customize`) — planned request load

```json
{
  "code": "BCAD-PL-ENG",
  "product": { /* Product */ },
  "products": [ /* Product */ ],
  "card": { /* Card */ },
  "titleOptions": [],
  "officeOptions": []
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

---

## Gaps / To Review

- **Order History** — turn on `requestHook` + `BF - onFormRequest - orders` when live load is ready (`repeat` utility already exists).
- **Address Book** — wire `create` / `update` / `delete` utilities; load already uses request hook.
- **Customize** — turn on `requestHook`; seed product, titles, offices from FM.
- **Shipping / Review / Confirmed** — Planned pages; order create on Review utility type `submit`.
- **Admin pages** — Planned hook sets above; confirm names before building scripts.
- **Catalogue** — confirm live products payload matches `modelDev` shape.
- **Script names** — confirm live FM scripts match `BF - onFormRequest - <hookSetName>` / `BF - onUtility - <hookSetName>`; update this doc if they differ.

---

## How to refresh (read-only)

1. MCP `list_records_overview` → `collection: pages` (formName, hookSetName, requestHook).
2. MCP `get_entity_detail` → site `content.layouts` (route → page).
3. Per page: `form.hookSetName`, `form.namedActions` (look for `runUtilityHook`), `model` / `modelDev` keys.
4. Sync Planned rows from [`src/router.js`](../../src/router.js) when new product pages appear.
5. Update this file. Do **not** write to Klai unless explicitly asked.
