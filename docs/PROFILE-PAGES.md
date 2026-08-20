# Profile pages — Address Book & Order History

For account managers and clients. Mark **Want this?** Yes / No.  
Already signed in — not login or passwords.

Where User and Admin share the same page, we don’t split columns.  
Where they differ, the table says so.

---

## Address Book

Same profile page for anyone signed in. Two tabs; actions differ.

### Decisions (Aug 2026)

Confirmed with Kevin (KC): **only admins manage office addresses.**  
They do that on **Admin → Manage Addresses** (admin layout: Catalogue / Manage Addresses / Manage Titles), not on the profile Address Book.

| Decision | Detail |
|---|---|
| **+ New Address** on Office tab | **Removed / hidden** — button only on **My Address Book** |
| Who manages Colliers offices | **Admins only** |
| Where offices are managed | **Admin → Manage Addresses** (add / edit / remove) |
| Profile → Office Addresses | View + search only — not the place to create or change company offices |
| Shipping / ship-to | Out of scope here — check under Shipping |

### My Address Book & Office Addresses (profile)

Automated cases for this page only: [ADDRESS-BOOK-TESTS.md](ADDRESS-BOOK-TESTS.md) (Manage Addresses / Shipping not included).

| What we check | In plain words | Want this? |
|---|---|---|
| Open Address Book | Profile → Addresses; tabs **My Address Book** and **Office Addresses** | Yes |
| My list | My Address Book shows only **my** personal locations | Yes |
| Add personal address | On **My Address Book** only: **+ New Address** opens the modal and saves a **personal** address | Yes |
| No add on Office tab | **+ New Address** is **hidden** when Office Addresses is selected | Yes |
| Edit my address | Edit opens the modal; save updates only that row | Yes |
| Delete my address | Confirm modal (Cancel / Delete); Delete removes it | Yes |
| Office list | Office Addresses shows Colliers offices (read-only for management) | Yes |
| No office edit here | Cannot change company offices from this page (Edit locked or not offered — manage on Admin → Manage Addresses) | Yes |
| Search | Filters the **active** tab by name or address text | Yes |
| Canada-style form | Province / Postal; default Canada (personal form) | Yes |

### How admin fits in

| | Profile → Address Book | Admin → Manage Addresses |
|---|---|---|
| Personal My list | Same as user (admin’s own addresses; add / edit / delete) | — |
| Company offices | View + search only | **Only place** to add / edit / delete Colliers offices |
| Layout | Profile / portal chrome | Admin nav (ADMIN, Catalogue, Manage Addresses, Manage Titles) |

---

## Order History

User and Admin are **not** always the same screen.

- **Profile → Order History** = **my** orders only (regular user **and** admin from their profile).
- **Admin → Order History** = **everyone’s** orders (admin tools / dashboard). Different layout and columns.

### My Order History (profile)

| What we check | In plain words | Proposal / take care | Want this? |
|---|---|---|---|
| Open my Order History | Profile menu → see **my** past orders only | Same entry for user and admin profile — one personal page | Yes / No |
| Table columns | Order number, cardholder, product, **box** qty, date, status, actions | Qty = boxes (same as cart), not a second “printed cards” column | Yes / No |
| No Employee column | Personal page does **not** show which employee placed the order | Designer admin screen has Employee — **do not** copy that here | Yes / No |
| No Back to Dashboard | Personal page is not the admin dashboard | Admin “Back to Dashboard” stays on admin tools only | Yes / No |
| Search | Find by cardholder name or order number | Keep simple; clear search restores full list | Yes / No |
| Filter by status | Narrow list (e.g. All / Delivered / Shipped / Processing) | Confirm which statuses we keep as the official set | Yes / No |
| View order details | Sheet: id, date, status, item, box qty, total, ship-to | No Employee field on this sheet | Yes / No |
| View card proof | Preview matches **that** order (name, email, phone, office) | Proof must not show a wrong / placeholder person | Yes / No |
| Repeat order | Rebuilds cart + shipping so I can submit again | Lands in review/shipping flow; ship-to stays real offices or my addresses | Yes / No |
| New order shows up | After confirm, the order appears in **my** history | Same product, box qty, and addresses as confirmed | Yes / No |

### Admin Order History (admin tools) — propose & decide

This is the company-wide screen. Mark what we want in this wave.

| What we check | In plain words | Proposal / take care | Want this? |
|---|---|---|---|
| Separate from my history | Admin tools show **all employees’** orders, not only mine | Different route / menu than Profile → Order History | Yes / No |
| Admin layout | Feels like admin (dashboard chrome, “Back to Dashboard”, admin nav) | Do **not** reuse the personal Order History page layout | Yes / No |
| Employee column | Show who placed the order | Only on this admin list — never on profile “my” history | Yes / No |
| Search / filter | Search and status filter across everyone’s orders | Same status set as personal, unless we decide otherwise | Yes / No |
| View / proof | Open details and card proof for any employee’s order | Still correct card for **that** order | Yes / No |
| Repeat for someone else | Can admin “Repeat” another person’s order? | Propose **No** for v1 — Repeat stays on **my** history only | Yes / No |

---

## Out of scope here

| Topic | Why |
|---|---|
| Login / password / signup | Auth |
| Shipping select-location / ship-to picker | Shipping tests |
| Paying with a credit card | Not in this product |
