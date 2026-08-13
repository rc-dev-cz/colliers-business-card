# Testing

Use cases to implement against. There is no test runner in this repo yet.

Partner customize, cart, and shipping follow **this Vue app**. Do not write customize cases against the AI Studio customize screen.

Do **not** add tests for `demo` / `123`, signup, or forgot password. Those are preview gates for us, not product. Admin tests stay.

Price today: **$63.00** per box (`BCAD-PL-ENG`, `BCAD-PL-BIL`, `BCAD-PL-FR`). Cart key: `colliers.cart`.

## Terms

| Term | Meaning |
| --- | --- |
| **cart item** | One row in the cart drawer |
| **cart badge icon** | Red number on the header shopping-cart icon (total quantity). Never write only “badge.” |
| **Business Card Bilingual** | Product `BCAD-PL-BIL`, not the navbar EN/FR toggle |

## How quantity works

- Customize **Add to Cart** adds **quantity 1** each click.
- Same card + same name/title/email/phone/office → those clicks **combine into one cart item**. Cart badge icon = total quantity.
- **Qty 10** means **one cart item** with quantity 10 — not 10 different products. Cart badge icon **10**, subtotal **$630.00** (10 × $63).
- Say the SKU, quantity, how many cart items, cart badge icon, and total. Do not say “cart has 10 boxes” as a vague setup.

**Priority:** P0 — TC-01, TC-02, TC-04, TC-05, TC-05b, TC-11, TC-13, TC-21. Everything else is P1.

---

## Cart

### TC-01 — Add Business Card English quantity 10 (P0)

- Preconditions: Logged in to the Vue preview. Cart empty.
- Steps:
  1. Open Business Card English (`BCAD-PL-ENG`) customize.
  2. Fill the same name, title, email, phone, and office.
  3. Add to Cart until quantity is 10 (ten clicks with the same details, or set qty to 10 on shipping).
- Expected:
  - cart items: 1 (`BCAD-PL-ENG`)
  - qty: 10
  - cart badge icon: 10
  - subtotal: $630.00

### TC-02 — Clear that cart (P0)

- Preconditions: TC-01 result (one cart item, qty 10).
- Steps:
  1. Open the cart.
  2. Clear cart (or remove the cart item).
- Expected:
  - cart items: 0
  - qty: —
  - cart badge icon: 0
  - subtotal: $0.00

### TC-03 — Add 10, clear, add 10 again

- Preconditions: Cart empty.
- Steps:
  1. Repeat TC-01.
  2. Repeat TC-02.
  3. Repeat TC-01.
- Expected:
  - After the second add: cart items 1, qty 10, cart badge icon 10, subtotal $630.00

### TC-04 — Combine: add Business Card Bilingual twice, same everything (P0)

- Preconditions: Cart empty.
- Steps:
  1. Customize Business Card Bilingual (`BCAD-PL-BIL`) with a name, title, email, phone, office.
  2. Add to Cart.
  3. Add to Cart again with the **same** details.
- Expected:
  - cart items: 1
  - qty: 2
  - cart badge icon: 2
  - subtotal: $126.00

### TC-05 — Same card, two different names (P0)

- Preconditions: Cart empty.
- Steps:
  1. Add Business Card Bilingual for person A (one name).
  2. Add Business Card Bilingual again with a **different** full name; other fields may match.
- Expected:
  - cart items: 2 in the cart drawer
  - qty: 1 each
  - cart badge icon: 2
  - subtotal: $126.00

### TC-05b — Same person, two different titles (P0)

- Preconditions: Cart empty.
- Steps:
  1. Add Business Card Bilingual for a name with title **Associate | Canada**.
  2. Add Business Card Bilingual again for the **same** name, email, phone, and office, but title **Vice President | Canada**.
- Expected:
  - cart items: 2 (one Associate row, one Vice President row)
  - qty: 1 each
  - cart badge icon: 2
  - subtotal: $126.00
  - They stay separate because the job title is different.

TC-04 vs TC-05 / TC-05b: cart badge icon is 2 and $126 either way. TC-04 is **one cart item** with qty 2. TC-05 and TC-05b are **two cart items**.

### TC-06 — Business Card English qty 5 + Business Card French qty 5, same person

- Preconditions: Cart empty.
- Steps:
  1. Add Business Card English five times with the same details (or qty 5).
  2. Add Business Card French five times with the same person details.
- Expected:
  - cart items: 2 (one English product, one French product)
  - cart badge icon: 10
  - subtotal: $630.00

### TC-07 — On shipping, change qty 1 → 10

- Preconditions: One cart item, qty 1.
- Steps:
  1. Open shipping.
  2. Change that cart item quantity from 1 to 10.
- Expected:
  - cart items: 1
  - qty: 10
  - cart badge icon: 10
  - shipping heading total: 10 items

### TC-08 — On shipping, remove the item

- Preconditions: At least one cart item on shipping.
- Steps:
  1. Remove the cart item on the shipping page.
- Expected:
  - cart items: 0
  - cart badge icon: 0

---

## Order

### TC-09 — Order through confirmed

- Preconditions: Cart empty.
- Steps:
  1. Add Business Card English, quantity 1.
  2. Continue to shipping.
  3. Review / Checkout.
- Expected:
  - Confirmed screen
  - cart items: 0
  - cart badge icon: 0

### TC-10 — Shipping shows quantity 10

- Preconditions: Cart has **Business Card English**, quantity **10**, one cart item.
- Steps:
  1. Open shipping.
- Expected:
  - Heading total is **10** items.

---

## Splits

Shipping page today: Split Order, Remove Split only if more than one split, add/remove location, select location.

### TC-11 — Create second split (P0)

- Preconditions: At least 1 cart item. One split visible.
- Steps:
  1. Click Split Order.
- Expected:
  - 2 split panels visible
  - Remove Split is visible

### TC-12 — Cannot remove the last split

- Preconditions: Only 1 split.
- Steps:
  1. Look for Remove Split.
- Expected:
  - No Remove Split button
  - Still 1 split

### TC-13 — Remove extra split (P0)

- Preconditions: 2 splits (after TC-11).
- Steps:
  1. Click Remove Split on one split.
- Expected:
  - 1 split left
  - Remove Split hidden again

### TC-14 — Add location on a split

- Preconditions: Shipping page open, at least one split.
- Steps:
  1. Click Add Location.
- Expected:
  - That split has one more address row (blank address, qty 1)

### TC-15 — Remove a location

- Preconditions: A split with 2 or more locations.
- Steps:
  1. Delete one location row.
- Expected:
  - That address is gone
  - Other locations remain

### TC-16 — Select saved location

- Preconditions: Shipping page open.
- Steps:
  1. Click Select Location.
  2. Pick a saved address.
- Expected:
  - That split lists that address, qty 1

### TC-17 — Location qty

- Preconditions: A ship-to row exists. Cart quantity is known.
- Steps:
  1. Set that location qty to 5.
- Expected:
  - That row shows 5
  - Cart quantity is unchanged

---

## Cards / customize (Vue)

### TC-18 — Live preview

- Preconditions: Customize page open (Vue).
- Steps:
  1. Change full name.
- Expected:
  - Preview shows that name

### TC-19 — Locked fields

- Preconditions: Customize page open (Vue).
- Steps:
  1. Look at Company and Website.
- Expected:
  - Company is “Colliers” and disabled
  - Website is `colliers.com/canada` and disabled

### TC-20 — Three cards

- Preconditions: Cards list open.
- Steps:
  1. View the product list.
- Expected:
  - Business Card Bilingual, Business Card English, Business Card French

---

## Admin

Designer preview. Not in this Vue repo yet. Keep these tests.

### TC-21 — Admin login `admin` / `123` (P0)

- Preconditions: Login screen (designer).
- Steps:
  1. Email `admin`, password `123`.
  2. Login.
- Expected:
  - Nav shows ADMIN, Manage Addresses, Manage Titles
  - Profile includes Admin Panel and Log out

### TC-22 — Open Manage Addresses

- Preconditions: Logged in as admin.
- Steps:
  1. Open Manage Addresses.
- Expected:
  - List of office addresses
  - Add field visible

### TC-23 — Add then remove an address

- Preconditions: Manage Addresses open.
- Steps:
  1. Enter a new address and add it.
  2. Remove that address.
- Expected:
  - After add: new row appears
  - After remove: that row is gone

### TC-24 — Open Manage Titles

- Preconditions: Logged in as admin.
- Steps:
  1. Open Manage Titles.
- Expected:
  - List of designations (for example PMP, LEED AP)

### TC-25 — Add then remove a title

- Preconditions: Manage Titles open.
- Steps:
  1. Enter a new title and add it.
  2. Remove that title.
- Expected:
  - After add: new title appears
  - After remove: it is gone

### TC-26 — Admin Panel

- Preconditions: Logged in as admin.
- Steps:
  1. Open Admin Panel from the profile menu.
- Expected:
  - Dashboard shows Total Orders, Pending Approvals, Active Users
  - Shortcuts to addresses and titles

### TC-27 — Admin logout

- Preconditions: Logged in as admin.
- Steps:
  1. Log out.
- Expected:
  - Login screen

---

## Language

### TC-29 — French from navbar EN/FR

- Preconditions: Site language EN. Cards or customize visible.
- Steps:
  1. Click **FR** in the **header** (not the footer).
- Expected:
  - Add to Cart becomes Ajouter au panier (and matching chrome)
  - Footer is not used for this

Do not add a test that uses the footer language dropdown. That control should go away (F-20).

---

## Theme

Not built yet (F-19). Still specify the cases.

### TC-30 — Default light

- Preconditions: Fresh load.
- Steps:
  1. Open the app.
- Expected:
  - App opens in light theme

### TC-31 — Switch to dark

- Preconditions: Light theme. Dark toggle exists (when built).
- Steps:
  1. Switch to dark.
  2. Refresh if persistence is in scope.
- Expected:
  - Chrome and pages use dark surfaces
  - Stays after refresh if we persist it

### TC-32 — Switch back to light

- Preconditions: Dark theme.
- Steps:
  1. Switch to light.
- Expected:
  - Back to light
