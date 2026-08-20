# Personal pages — client review

**Audience:** Account manager + client  
**Pages:** Address Book · Order History  
**Purpose:** Confirm what we are building, what we are not, and who owns each rule.

How to use: start with the **feature map** below. Walk each item in order. Check **Confirmed** when everyone agrees. Capture changes in **Notes**. Do not invent new scope mid-meeting without writing it here.

| | |
|---|---|
| Meeting date | |
| Attendees | |
| Signed off by (client) | |
| Signed off by (AM) | |

---

## Feature map (walk this list)

This is the agenda. Details for each item are in the sections below.

### Address Book — Profile → Address Book

| # | Feature | One-line rule | Confirmed |
|---|---|---|---|
| 1.1 | Access | Opens from profile; two tabs: My Address Book + Office Addresses | [ ] |
| 1.2 | My Address Book | User’s personal locations only — add / edit / delete | [ ] |
| 1.3 | Address form | Nickname, street, city, province, postal; country defaults to Canada | [ ] |
| 1.4 | Office Addresses | Colliers offices — view only (no edit / delete here) | [ ] |
| 1.5 | Search | Filters the active tab by name or address text | [ ] |
| 1.6 | Used at Shipping | Personal addresses + offices available as ship-to | [ ] |

### Order History — Profile → Order History

| # | Feature | One-line rule | Confirmed |
|---|---|---|---|
| 2.1 | Access & visibility | Own orders only; no Employee column; not admin all-employees | [ ] |
| 2.2 | Table | Order ID, cardholder, item, box qty, date, status, Repeat / View | [ ] |
| 2.3 | Search & filter | Search by name or order ID; filter by status | [ ] |
| 2.4 | Order details | View sheet: id, date, status, item, qty, total, ship-to, card proof | [ ] |
| 2.5 | Card proof | Preview matches the card stored on that order | [ ] |
| 2.6 | Repeat Order | Rebuilds cart + shipping so user can submit again | [ ] |
| 2.7 | After confirm | New confirmed order appears in this user’s history | [ ] |

### Settle before leaving

| # | Topic | Confirmed |
|---|---|---|
| 3 | Open decisions (statuses, who can use these pages, Canada default, required fields) | [ ] |
| 4 | Explicit non-goals (not building these here) | [ ] |

---

## Scope (read before details)

These are **personal / profile** pages for whoever is signed in (“my addresses”, “my orders”).  
They are **not** the Admin Portal tools that manage the whole company.

| In scope (this meeting) | Out of scope (separate admin work) |  
|---|---|
| **My** personal ship-to addresses (add / edit / delete) | Creating / editing **Colliers company offices** (Admin → Manage Addresses) |
| **My** past orders only | **Admin Order History** — company-wide list of everyone’s orders (Admin dashboard) |
| Using my personal addresses at Shipping | Payment, invoices, reporting |

### Two different “Order History” screens

| Screen | Who opens it | What they see |
|---|---|---|
| **Profile → Order History** (this doc) | Any signed-in person (demo user **or** an admin looking at their own profile) | Only **their own** orders |
| **Admin → Order History** (not this doc) | Admin portal / dashboard | **All employees’** orders |

So: an admin is a different **role** for company tools. If that same person opens Order History from the **profile menu**, they still only see **their** orders — same personal page as a regular user. Company-wide order history is a separate admin feature.

---

## 1. Address Book (details)

**Entry:** Profile menu → Address Book

### 1.1 Access

| Rule | Confirmed |
|---|---|
| Address Book is available from the signed-in user’s profile menu | [ ] |
| Page has two tabs: **My Address Book** and **Office Addresses** | [ ] |

Notes:

### 1.2 My Address Book (personal)

| Rule | Confirmed |
|---|---|
| Lists only this user’s personal locations (name + address) | [ ] |
| User can **add** a personal address (+ New Address) | [ ] |
| User can **edit** a personal address | [ ] |
| User can **delete** a personal address (with confirm) | [ ] |
| Adding a personal address does **not** create a Colliers office | [ ] |

Notes:

### 1.3 Address form

**Fields we ship:** Location nickname · Address line · City · Province · Postal · Country

| Rule | Confirmed |
|---|---|
| Labels use **Province** / **Postal** (Canada), not State / Zip | [ ] |
| Country defaults to **Canada** | [ ] |

Notes:

### 1.4 Office Addresses (company)

| Rule | Confirmed |
|---|---|
| Shows Colliers offices (same list used on Customize / Shipping) | [ ] |
| User can **view only** — no edit / delete on this tab | [ ] |
| Company office create / edit / delete stays with Admin | [ ] |

Notes:

### 1.5 Search

| Rule | Confirmed |
|---|---|
| Search filters the **active tab** by location name or address text | [ ] |
| Clearing search restores the full list for that tab | [ ] |

Notes:

### 1.6 Used at Shipping

| Rule | Confirmed |
|---|---|
| Shipping “select location” includes personal addresses **and** Colliers offices | [ ] |
| A saved personal address can be chosen as ship-to without retyping | [ ] |

Notes:

---

## 2. Order History (details)

**Entry:** Profile menu → Order History  
**This is the user’s own history only** — not the admin all-employees screen.

### 2.1 Access & visibility

| Rule | Confirmed |
|---|---|
| Order History is available from the signed-in user’s profile menu | [ ] |
| User sees **only their own** orders | [ ] |
| No Employee column / other people’s names on this page | [ ] |
| No “Back to Dashboard” (that is admin) | [ ] |

Notes:

### 2.2 Table

| Column | Confirmed |
|---|---|
| Order ID | [ ] |
| Cardholder | [ ] |
| Item | [ ] |
| Qty = **boxes** (same as cart), not a separate printed-card count | [ ] |
| Date | [ ] |
| Status | [ ] |
| Actions: **Repeat Order** · **View** | [ ] |

Notes:

### 2.3 Search & filter

| Rule | Confirmed |
|---|---|
| Search filters by cardholder name or order ID | [ ] |
| Status filter includes All + the agreed statuses (see open decisions) | [ ] |

Notes:

### 2.4 Order details (View)

| Shown on the sheet | Confirmed |
|---|---|
| Order ID, date, status | [ ] |
| Item, box quantity, total | [ ] |
| Ship-to address(es) | [ ] |
| Link: **View Business Card Proof** | [ ] |
| No Employee field | [ ] |

Notes:

### 2.5 Card proof

| Rule | Confirmed |
|---|---|
| Proof shows the card stored on **that** order | [ ] |
| Name, email, phone, and office match the order (not placeholder / wrong person) | [ ] |

Notes:

### 2.6 Repeat Order

| Rule | Confirmed |
|---|---|
| Rebuilds cart + shipping from that order so the user can review and submit again | [ ] |
| Ship-to uses Colliers offices or this user’s saved addresses (no sample / fake streets) | [ ] |

Notes:

### 2.7 After confirm

| Rule | Confirmed |
|---|---|
| A successfully confirmed order appears in this user’s Order History | [ ] |
| History row matches product, box quantity, and addresses that were confirmed | [ ] |
| Confirm still clears the cart and does **not** collect payment | [ ] |

Notes:

---

## 3. Open decisions (settle in this meeting)

| # | Topic | Options / proposal | Decision |
|---|---|---|---|
| D1 | Order statuses on the user filter | Proposal: **Processing** · **Shipped** · **Delivered** (+ All) | |
| D2 | Who can use Address Book / Order History | Proposal: any signed-in portal user (demo + admin profile) | |
| D3 | Personal address country | Proposal: default **Canada**; allow other countries if typed | |
| D4 | Required personal-address fields | Proposal: nickname, street, city required; province / postal / country optional but defaulted | |

---

## 4. Explicit non-goals (confirm we are not building these here)

| Item | Confirmed out |
|---|---|
| User edits Colliers office directory from Address Book | [ ] |
| User sees other employees’ orders | [ ] |
| Payment / invoice download on Order History | [ ] |
| Admin Manage Addresses / Admin Order History (separate work) | [ ] |

---

## Change log (meeting outcomes)

| Date | Change | Owner |
|---|---|---|
| | | |
