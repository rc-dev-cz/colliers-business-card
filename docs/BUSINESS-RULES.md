# Colliers Business Card Portal — Business Rules & Testing Guide

Version 2 · August 2026

This is the markdown of the agreed **Business Rules & Testing Guide** (PDF, 14 Aug 2026). It is the product-rules reference for review, development, and testing.

Product stories stay in [USER.md](USER.md) and [ADMIN.md](ADMIN.md). Workflow status lives on the RC Web Dev board — editable backlog [devTracker.json](devTracker.json). [BACKLOG.md](BACKLOG.md) is an F-code feature index that points at those tickets, not a second status board.

---

## Purpose

This document defines the agreed business rules and expected behaviour of the Colliers Business Card Portal.

It provides a shared reference for the team to review, develop, and test the application against the same requirements.

Prepared for team review.

---

## 1. Application Flow

The Colliers Business Card Portal is used to create and order business cards.

The order process follows these main steps:

1. **Select a business card** — Choose the English, Bilingual, or French card.
2. **Customize the card** — Enter the cardholder information and review the card preview.
3. **Set up shipping** — Review the shipping group, select the delivery address, and split the order if needed.
4. **Review the order** — Confirm the business cards, quantities, and shipping information.
5. **Submit the order** — Submit the order and receive the confirmation.

| Rule | Expected behaviour |
| --- | --- |
| One order | All selected business cards and shipping groups remain part of the same order. |
| Default shipping group | Every order starts with Shipping Group 1. A newly added business card is assigned to Shipping Group 1 by default. |
| Order completion | After a successful submission, the confirmation screen is shown and the cart is cleared. |

---

## 2. Important Terms

| Rule | Expected behaviour |
| --- | --- |
| Business card product | One of the available card types: English, Bilingual, or French. |
| Box | One package of 250 printed business cards. |
| Quantity | The number of boxes ordered for a cart item. Quantity 3 means 3 boxes, or 750 printed cards. |
| Cart item | A cart item is one business card shown in the cart. If the same business card is ordered more than once, the quantity can increase without creating another cart item. |
| Cart count | The number shown on the navbar cart icon. It is the sum of all cart item quantities, not the number of cart rows. |
| Shipping group | A part of the order that groups business cards going to one or more shipping addresses. |
| Split Order | Creates an additional shipping group within the same order so business cards can be organized and shipped separately. |
| Shipping location | The delivery address selected for a shipping group. |
| Location quantity | The number of boxes assigned to a shipping location. Changing this value does not change the quantity ordered in the cart. |

---

## 3. Products, Packaging & Pricing

| Rule | Expected behaviour |
| --- | --- |
| Available products | Business Card English, Business Card Bilingual, and Business Card French. |
| Packaging | 1 box = 250 printed business cards. |
| Price | Each box costs $63.00. The same price applies to all three products. |
| Price calculation | Total price = quantity × $63.00. |
| Billing | Orders are billed to the Colliers account. The portal does not collect credit-card or payment information. |

### Examples

- Quantity 1 = 250 cards = $63.00
- Quantity 2 = 500 cards = $126.00
- Quantity 3 = 750 cards = $189.00
- Quantity 10 = 2,500 cards = $630.00

### Tests

| ID | Test | Expected result |
| --- | --- | --- |
| PR-01 | Set one cart item to quantity 3. | 750 printed cards and a total of $189.00. |
| PR-02 | Set one cart item to quantity 10. | 2,500 printed cards and a total of $630.00. |
| PR-03 | Complete an order. | No payment or credit-card step is shown. |

---

## 4. Business Card Customization

The customization page controls the information shown on the business card preview.

| Rule | Expected behaviour |
| --- | --- |
| Full Name | Entered manually. Maximum 50 characters. Long names can use two lines on the card. |
| Designation | One or more designations can be selected from the available list. Selected designations appear below the field and are displayed on the business card preview. A selected designation can be removed before continuing. |
| Email | Entered manually. Maximum 40 characters. The preview reflects the entered value. |
| Mobile Phone | Uses the Canadian +1 format and appears on the preview. |
| Company Name | Locked as Colliers and cannot be edited. |
| Address | Selected from the saved Colliers office address list; it is not entered manually on this screen. |
| Website | Locked as colliers.com/canada and cannot be edited. |
| Live preview | Changes to editable card information are reflected on the card preview. |

### Tests

| ID | Test | Expected result |
| --- | --- | --- |
| CU-01 | Change the full name. | The preview shows the new name. |
| CU-02 | Select two designations. | Both designations appear on the preview and the control shows 2 selected. |
| CU-03 | Remove one selected designation. | It is removed from the selection and from the preview. |
| CU-04 | Open Address and choose a saved office. | The selected office appears on the card preview. |
| CU-05 | Try to edit Company Name and Website. | Both fields remain locked with the approved values. |
| CU-06 | Change email or mobile phone. | The preview updates with the entered information. |

---

## 5. Cart & Quantity Rules

| Rule | Expected behaviour |
| --- | --- |
| Default quantity | A newly added business card starts with quantity 1. |
| Same card + same details | Adding the same product with the same full name, selected designation(s), email, phone, and office combines into one cart item and increases its quantity. |
| Different details | If the product or any card detail is different, the cards remain separate cart items. |
| One row, many boxes | One cart item can hold a quantity greater than 1. |
| Cart count | The cart count is the sum of all cart item quantities. |
| Change quantity | Changing a cart item quantity updates the cart count and price. |
| Remove item | Removing a cart item recalculates the cart count and total. |
| Empty cart | When no items remain, the cart count is 0 and the total is $0.00. |

### Examples

- Same Bilingual card, same details, added twice → 1 cart item, quantity 2, cart count 2, total $126.00.
- Same product, two different names → 2 cart items, quantity 1 each, cart count 2, total $126.00.
- Same person, different designation selection → separate cart items.
- English quantity 5 + French quantity 5 → 2 cart items, cart count 10, total $630.00.

### Tests

| ID | Test | Expected result |
| --- | --- | --- |
| CA-01 | Add the same card with the same details twice. | One cart item with quantity 2; cart count 2; total $126.00. |
| CA-02 | Add the same product for two different names. | Two separate cart items; cart count 2; total $126.00. |
| CA-03 | Add the same person with different designation selections. | The cards remain separate cart items. |
| CA-04 | Add English quantity 5 and French quantity 5. | Two cart items; cart count 10; total $630.00. |
| CA-05 | Change one cart item from quantity 1 to 10. | Quantity 10; cart count and total update to 10 and $630.00. |
| CA-06 | Remove all cart items. | Cart count 0 and total $0.00. |

---

## 6. Shipping Groups & Split Order

| Rule | Expected behaviour |
| --- | --- |
| Shipping Group 1 | Every order starts with Shipping Group 1. |
| Adding business cards | Business cards are added to the shipping group where they are being ordered. Before the order is split, this is Shipping Group 1. |
| Split Order | Selecting Split Order creates a new, empty shipping group within the same order for a separate set of business cards and shipping locations. |
| New shipping group | Products and locations from the existing shipping group are not duplicated into the new group. |
| Different addresses | Each shipping group can have its own shipping location(s). |
| Move a product | A business card can be moved from one shipping group to another without creating an additional copy of the product. |
| Remove Split | An additional shipping group can be removed. At least one shipping group must remain. |
| Saved location | Shipping locations are selected from the saved address list. |
| Add / remove location | Shipping locations can be added to or removed from a shipping group. |

### Example

Shipping Group 1 contains the current business cards and shipping location. Selecting Split Order creates Shipping Group 2 as a new, empty group where a different set of business cards and shipping location(s) can be added.

### Tests

| ID | Test | Expected result |
| --- | --- | --- |
| SH-01 | Add the first business card to a new order. | Shipping Group 1 is the default group for the card. |
| SH-02 | Select Split Order. | A second shipping group is created. |
| SH-03 | With two shipping groups open, add another business card. | The new card is assigned to Shipping Group 1. |
| SH-04 | Move a product from Shipping Group 1 to Shipping Group 2. | The product appears in Group 2 and the total ordered quantity does not change. |
| SH-05 | Select a different saved address for each shipping group. | Each group keeps its selected shipping address. |
| SH-06 | Remove an extra shipping group. | One group remains; the last group cannot be removed. |
| SH-07 | Change the location quantity. | The location value changes; the cart quantity remains unchanged. |

---

## 7. Review, Submission & Confirmation

| Rule | Expected behaviour |
| --- | --- |
| Review | The final review reflects the business cards, quantities, shipping groups, and selected addresses in the order. |
| Submit | The order can be submitted without entering payment information. |
| Confirmation | A confirmation screen is shown after successful submission. |
| Cart reset | After successful submission, the cart is empty and the cart count returns to 0. |

### Tests

| ID | Test | Expected result |
| --- | --- | --- |
| OR-01 | Complete the ordering flow and review the order. | Products, quantities, shipping groups, and addresses match the selections made earlier. |
| OR-02 | Submit the order. | The confirmation screen appears without a payment step. |
| OR-03 | Check the cart after confirmation. | The cart is empty and the cart count is 0. |

---

## 8. Language & Interface Rules

| Rule | Expected behaviour |
| --- | --- |
| Language | The portal supports English and French. |
| Language control | EN / FR is selected from the header. |
| Footer | A second language selector is not used in the footer. |
| Theme | The current portal uses the light theme. Dark mode is not part of this version. |

### Tests

| ID | Test | Expected result |
| --- | --- | --- |
| UI-01 | Switch from EN to FR using the header. | The application interface changes to French. |
| UI-02 | Review the footer. | No separate language selector is shown. |
| UI-03 | Open the portal. | The application opens in the light theme. |

---

## 9. Admin Rules

Admin functions maintain the lists used by the business card ordering experience.

| Rule | Expected behaviour |
| --- | --- |
| Manage Addresses | Admin can view, add, and remove office addresses used by the Address dropdown. |
| Manage Designations | Admin can view, add, and remove designations used by the Designation selector. |
| Admin Dashboard | The Admin area provides the available administrative shortcuts and summary information. |

### Tests

| ID | Test | Expected result |
| --- | --- | --- |
| AD-01 | Add an office address in Admin. | The address appears in the managed address list and is available for card selection. |
| AD-02 | Remove an office address in Admin. | The address is removed from the managed list. |
| AD-03 | Add a designation in Admin. | The designation appears in the managed designation list and is available for card selection. |
| AD-04 | Remove a designation in Admin. | The designation is removed from the managed list. |

---

## 10. Scope

This guide focuses on the business rules and expected behaviour of the Colliers Business Card Portal.

The following are **not covered** in this guide:

- Internal identifiers such as SKU
- Technical implementation details
- Credit card or payment processing
- Shipping cost calculations
- Order history, invoice history, or reporting
- Dark mode
- A footer language selector

If the application behaves differently from a rule defined in this guide, the behaviour should be reviewed by the team.

---

## Alignment with current work

Use this section when adding tickets. Do **not** create a second ticket for a rule we already have.

### Already matches (leave as-is)

| Guide | Current ticket / feature | Status |
| --- | --- | --- |
| Three products, $63 / 250 | F-01–F-04, USR-010–USR-023 | Done |
| Locked company / website | USR-037 | Done |
| Office from saved list | USR-036 | Done |
| Canadian +1 phone | USR-035 | Done |
| Live preview | USR-031 | Done |
| Cart combine / separate / qty / badge | USR-040–USR-045 | Done |
| Shipping $0, no payment | USR-053 | Done |
| Cannot remove last split | USR-055 | Done |
| Header EN/FR | USR-070, USR-071 | Done |
| Light theme | F-23 | Done |
| Manage Addresses | ADM-060 | Ready (Vue stub `#/admin/addresses`) |
| Manage Designations / Titles | ADM-070 | Ideas (Vue stub `#/admin/titles`) |
| Admin Dashboard | ADM-020 | Done (Vue tiles; live counts ADM-022/023 still Ideas) |

### Already ticketed as Ideas — reuse these, do not duplicate

| Guide | Ticket | Notes |
| --- | --- | --- |
| One or more designations | `USR-039` | Vue still allows one title |
| Printed-card count (qty × 250) | `USR-046` | Needed for PR-01 / PR-02 |
| Move a card between shipping groups | `USR-056` | SH-04 |
| Split Order creates an empty group | `USR-057` | SH-02, SH-03 |
| Colliers offices on shipping | `USR-058` | Not in the PDF; keep |
| Order review before confirm | `USR-063` | Section 7 / OR-01 |
| Remove footer language | `F-20` | UI-02 |
| User Address Book | `USR-080` | Demo user and admin can create personal addresses. Only admin creates offices (ADM-060) |
| User Order History | `USR-090` | Vue 2 localStorage in colliers-vue2/. Details sheet is USR-098. Not ADM-030 |

### Limits and wording (updated)

| Ticket | Change |
| --- | --- |
| USR-032 | Ready for development. Full name max **50**. Vue still 30. |
| USR-033 | Still Done (one designation today). Multiple is USR-039. |
| USR-034 | Ready for development. Email max **40**. Vue still 30. |
| IDEA-01 | Closed (Done). Guide is **40**, not 20 or 30. |

### Out of this guide — keep the tickets, do not treat as V2 rules

Order History, Invoice History, Reporting, Dark theme, user Address Book, and user Order History stay on the board. The PDF lists order history / reporting as **not covered**, not as cancelled. Vue 2 Address Book and Order History live in `colliers-vue2/` localStorage until FileMaker APIs exist.

### Backlog F-codes

[BACKLOG.md](BACKLOG.md) maps F-24–F-30 to board tickets. Do not invent new F-codes for the same work. Track status on the board / in [devTracker.json](devTracker.json).
