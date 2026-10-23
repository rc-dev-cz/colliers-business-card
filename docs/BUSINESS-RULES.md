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

| Rule                   | Expected behaviour                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| One order              | All selected business cards and shipping groups remain part of the same order.                                    |
| Default shipping group | Every order starts with Shipping Group 1. A newly added business card is assigned to Shipping Group 1 by default. |
| Order completion       | After a successful submission, the confirmation screen is shown and the cart is cleared.                          |

---

## 2. Important Terms

| Rule                  | Expected behaviour                                                                                                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business card product | One of the available card types: English, Bilingual, or French.                                                                                                                                                                                                              |
| Title                 | Job title on the card (FileMaker **titles**). Previously called designation — do not use that name.                                                                                                                                                                          |
| Credential            | Degree, certification or designation on the name line (FileMaker **degrees**; UI label “Credentials”).                                                                                                                                                                                                            |
| Quantity              | Boxes of a design. One box is 250 cards at $63. On Shipping, the address row is the only editor. Each Selected Items line in that group copies the address total.                                                                                                            |
| Cart item             | A cart item is one business card shown in the cart. If the same business card is ordered more than once, the quantity can increase without creating another cart item.                                                                                                       |
| Cart count            | The number on the navbar cart icon. It is the number of cart items. Address boxes and item quantities do not change it.                                                                                                                                                      |
| Shipping group        | A part of the order that groups business cards going to one or more shipping addresses.                                                                                                                                                                                      |
| Split Order           | Creates an additional shipping group within the same order so business cards can be organized and shipped separately.                                                                                                                                                        |
| Shipping location     | The delivery address selected for a shipping group.                                                                                                                                                                                                                          |
| Location quantity     | Boxes of each selected design at that address. The Selected Items readout is the sum of those boxes. Two designs in one group each copy that sum. Different box counts per design use Split Order. Box and card counts stay hidden until the group has at least one ship-to. |
| Cart vs addresses     | Adding or removing a ship-to address, Address Book row, or office address never deletes cart items. Changing an address quantity updates every Selected Items line in that group to the new address total.                                                                   |

---

## 3. Products, Packaging & Pricing

| Rule               | Expected behaviour                                                                                                                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Available products | Business Card English, Business Card Bilingual, and Business Card French.                                                                                                                                    |
| Packaging          | 1 box = 250 printed business cards.                                                                                                                                                                          |
| Price              | Each box costs $63.00. The same price applies to all three products.                                                                                                                                         |
| Price calculation  | Total price = billed boxes × $63.00. One design billed boxes are that group’s address total. Two designs in the same group each copy that total, so the bill is designs × address total. No volume discount. |
| Billing            | Orders are billed to the Colliers account. The portal does not collect credit-card or payment information.                                                                                                   |

### Examples

- One card, no address, quantity 1 = 1 box = $63.00. Packaging is 250 printed cards per box.
- One card, addresses totalling 4 boxes = 4 boxes / 1000 cards = $252.00.
- Two designs in one group, addresses totalling 4 boxes = each design shows 4 boxes. Billed boxes are 8. Total $504.00. The navbar stays at 2.

### Tests

| ID    | Test                                    | Expected result                                                                   |
| ----- | --------------------------------------- | --------------------------------------------------------------------------------- |
| PR-01 | One card, addresses totalling 3 boxes.  | Selected Items shows 3 boxes / 750 cards. Total $189.00. The navbar stays at 1.   |
| PR-02 | One card, addresses totalling 10 boxes. | Selected Items shows 10 boxes / 2500 cards. Total $630.00. The navbar stays at 1. |
| PR-03 | Complete an order.                      | No payment or credit-card step is shown.                                          |

---

## 4. Business Card Customization

The customization page controls the information shown on the business card preview.

**Required** (red asterisk; Preview Proof needs all of these): Full Name, Title, Email, Mobile, Office Location.

**Optional** (label ends with “(Optional)”): Credentials, Region, Specialized Team. “Other credential” is hidden behind “Not on the list? Add another” until opened or filled.

**Locked** (no asterisk): Company Name, Website.

| Rule                   | Expected behaviour                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Full Name              | Required. Entered manually. Maximum 50 characters. Long names can use two lines on the card.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Title                  | Required. Selected from the available list (FileMaker titles). English and bilingual Customize show the **English** title list; French-only Customize shows the French list. Bilingual: EN face shows the selected English title; FR face shows the mapped French equivalent, or the long placeholder **Titre à compléter — équivalent français requis** until Colliers supplies pairs. Title plus region share one line at **141.52 pt** when they fit (lock: “Gestionnaire de projets principal \| Nova Scotia”). When the joined line overflows but each part still fits alone, preview and print stack region under the title (no pipe) and shift the identity block up one body line — that is valid, not an error. Only combinations where title or region alone cannot fit show “This title and region are too long for the card.” Bilingual cards also pick the **French title** from the French list (prefilled from the English choice). |
| Credentials            | Optional. No fixed count cap. Selected values share the available credential space: after the name plus one line underneath. Options that no longer fit are locked; selected values can still be removed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Other credential       | Optional, opened from “Not on the list? Add another”. Free text shares the same measured space as selected degrees. Input stops with a “no more space” message when the name line plus credential row are full.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Region                 | Optional. “Team \| Region” when a specialized team is filled. Otherwise (or when “Team \| Region” overflows) “Title \| Region” on one line when it fits on every face (bilingual: English and French together), else its own line under the title. Preview and print match, in Vue and Klai (Klai since Oct 22, 2026).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Specialized Team       | Optional. Shown under the title line when present. One line only: input stops with a “no more space” message when the team no longer fits.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Email                  | Required. When the full name has a first and last name, the email fills in as firstname.lastname@colliersprojectleaders.com. The field stays editable. After the user changes it, further name edits do not replace it. Up to 50 characters is allowed. Print/preview also require the address to fit one line at **141.52 pt** (Open Sans 6.5 pt), the same right edge as title The format (name@domain.tld) is checked when the user leaves the field; Preview Proof stays disabled until it is valid.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Mobile Phone           | Required. Shown on the card as the Canadian 10-digit local number only (no “Mobile:” label and no +1).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Company Name           | Locked as Colliers Project Leaders and cannot be edited.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Address                | Required. Selected from the saved Colliers office address list; it is not entered manually on this screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Website                | Locked as colliersprojectleaders.com (French card uses /fr) and cannot be edited.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Live preview           | Changes to editable card information are reflected on the card preview.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Optional empty fields  | Until a credential is chosen, the name line shows the name only (no sample credential, no trailing comma). Empty title shows “Title” (FR: “Titre”). Region is omitted until filled; then it appears as “Title \| Region” when it fits, else on its own line, or as “Team \| Region”. Empty specialized team is omitted on preview and print. Until an office is selected, every card preview and the print PDF show the four-line sample “Address name / Unit, Street / City, Province / Postal Code, Country” (FR: Nom de l’adresse / …).                                                                                                                                                                                                                                                                                                                                                                                                                        |

### Tests

| ID    | Test                                                     | Expected result                                                                                                                                                                                                                                                                                                 |
| ----- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CU-01 | Change the full name.                                    | The preview shows the new name.                                                                                                                                                                                                                                                                                 |
| CU-02 | Select degrees or certifications until the card is full. | Every value that fits appears in the preview. Options that would overflow are locked and a no-space message is shown.                                                                                                                                                                                           |
| CU-03 | Remove one selected degree.                              | It is removed from the selection and from the preview.                                                                                                                                                                                                                                                          |
| CU-04 | Open Address and choose a saved office.                  | The selected office appears on the card preview.                                                                                                                                                                                                                                                                |
| CU-05 | Try to edit Company Name and Website.                    | Both fields remain locked with the approved values.                                                                                                                                                                                                                                                             |
| CU-06 | Change email or mobile phone.                            | The preview updates with the entered information.                                                                                                                                                                                                                                                               |
| CU-07 | Open Customize before filling optional fields.           | The name line reads “Firstname Lastname” with no credential. Title shows “Title” (no region). Empty specialized team is omitted. Address shows “Address name”, “Unit, Street”, “City, Province”, and “Postal Code, Country”. The customize preview does not show the card back. The print PDF includes the blue legal panel. |
| CU-08 | Add another credential.                                  | “Other credential” opens; the typed text prints after the name like a listed credential.                                                                                                                                                                                                                    |

---

## 5. Cart & Quantity Rules

| Rule                     | Expected behaviour                                                                                                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default quantity         | A newly added business card starts with quantity 1.                                                                                               |
| Same card + same details | Adding the same product with the same full name, title, email, phone, and office combines into one cart item and increases its quantity.          |
| Different details        | If the product or any card detail is different, the cards remain separate cart items.                                                             |
| One row, many boxes      | One cart item can hold a quantity greater than 1.                                                                                                 |
| Cart count               | The navbar cart count is the number of cart items. It does not follow address boxes or item quantity.                                             |
| Change quantity          | Address boxes are the quantity editor. Selected Items shows boxes and cards and follows the address total. It does not change the navbar count.   |
| Remove from shipment     | The Shipping Selected Items trash control removes that card from the cart, every shipping group, and the cart drawer. The navbar count drops.     |
| Remove from cart         | The cart drawer trash control removes the card from the cart and from every shipping group. The navbar count drops. Shipping trash does the same. |
| Empty cart               | When no items remain, the cart count is 0 and the total is $0.00.                                                                                 |

### Examples

- Same Bilingual card, same details, added twice with no address → 1 cart item, quantity stays 1, cart count 1, total $63.00.
- Same product, two different names → 2 cart items, quantity 1 each, cart count 2, total $126.00.
- Same person, different title → separate cart items.
- English and French in one group, address total 5 → each line shows 5 boxes, cart count 2, billed 10 boxes, total $630.00.

### Tests

| ID    | Test                                                            | Expected result                                                                   |
| ----- | --------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| CA-01 | Add the same card with the same details twice, with no address. | One cart item; quantity stays 1; cart count 1; total $63.00.                      |
| CA-02 | Add the same product for two different names.                   | Two separate cart items; cart count 2; total $126.00.                             |
| CA-03 | Add the same person with different titles.                      | The cards remain separate cart items.                                             |
| CA-04 | English and French in one group, address total 5 boxes.         | Two cart items; each shows 5 boxes; cart count 2; billed 10 boxes; total $630.00. |
| CA-05 | One card, address total raised to 10 boxes.                     | Selected Items shows 10 boxes; cart count stays 1; total $630.00.                 |
| CA-06 | Remove all cart items.                                          | Cart count 0 and total $0.00.                                                     |

---

## 6. Shipping Groups & Split Order

| Rule                  | Expected behaviour                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shipping Group 1      | Every order starts with Shipping Group 1.                                                                                                                                                                                                                                                                                                                     |
| Adding business cards | Business cards are added to the shipping group where they are being ordered. Before the order is split, this is Shipping Group 1.                                                                                                                                                                                                                             |
| Split Order           | Selecting Split Order creates a new, empty shipping group within the same order for a separate set of business cards and shipping locations.                                                                                                                                                                                                                  |
| New shipping group    | Products and locations from the existing shipping group are not duplicated into the new group.                                                                                                                                                                                                                                                                |
| Different addresses   | Each shipping group can have its own shipping location(s).                                                                                                                                                                                                                                                                                                    |
| Move a product        | A business card can be moved from one shipping group to another without creating an additional copy of the product.                                                                                                                                                                                                                                           |
| Remove Split          | An additional shipping group can be removed. At least one shipping group must remain.                                                                                                                                                                                                                                                                         |
| Saved location        | Shipping locations are selected from the saved address list.                                                                                                                                                                                                                                                                                                  |
| Add / remove location | Shipping locations can be added to or removed from a shipping group **only when that group has at least one selected card**. That does not remove or empty the cart. Each address stores boxes of each selected design. Selected Items copies the address total. Two designs in one group both show that total. Billed boxes are designs × the address total. |
| Empty Selected Items  | Split Order, Add location, and deleting a ship-to are disabled until the group has a card. Removing the last card from a group also clears its ship-to rows.                                                                                                                                                                                                  |
| Empty shipping group  | Review / Checkout stays disabled while any group has no cards, with the message “A shipment has no items. Add an item or remove the split to continue.” Reopening Shipping or Review removes empty groups (one group always remains). Every group also needs at least one ship-to before checkout.                                                             |

### Example

Shipping Group 1 contains the current business cards and shipping location. Selecting Split Order creates Shipping Group 2 as a new, empty group where a different set of business cards and shipping location(s) can be added.

### Tests

| ID    | Test                                                                           | Expected result                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| SH-01 | Add the first business card to a new order.                                    | Shipping Group 1 is the default group for the card.                                                                                                   |
| SH-02 | Select Split Order.                                                            | A second shipping group is created.                                                                                                                   |
| SH-03 | With two shipping groups open, add another business card.                      | The new card is assigned to Shipping Group 1.                                                                                                         |
| SH-04 | Move a product from Shipping Group 1 to Shipping Group 2.                      | The product appears in Group 2 and the total ordered quantity does not change.                                                                        |
| SH-05 | Select a different saved address for each shipping group.                      | Each group keeps its selected shipping address.                                                                                                       |
| SH-06 | Remove an extra shipping group.                                                | One group remains; the last group cannot be removed.                                                                                                  |
| SH-07 | One design, addresses of 1 + 1 + 1 box.                                        | Selected Items shows 3 boxes / 750 cards. Billed total is 3 boxes / 750 cards / $189.00.                                                              |
| SH-08 | Change address boxes from 4 and 6, then add a second design to the same group. | Both Selected Items lines show 10 boxes / 2500 cards. Billed total is 20 boxes. Cart count stays 2. Removing a ship-to does not delete the cart line. |
| SH-09 | Use the Shipping Selected Items trash control.                                 | The card leaves that group, the cart drawer, and the navbar count.                                                                                    |
| SH-10 | Use the cart drawer trash control.                                             | The card leaves the cart and every shipping group. Navbar count drops.                                                                                |
| SH-11 | Group with no selected cards.                                                  | Split Order, Add location, and location delete are disabled.                                                                                          |
| SH-12 | Remove the last card from a group that had ship-tos.                           | Ship-to rows on that group are cleared.                                                                                                               |
| SH-13 | Select Split Order and leave the new group empty.                              | Review / Checkout is disabled and the empty-shipment message shows. Reopening Shipping removes the empty group.                                       |

---

## 7. Review, Submission & Confirmation

| Rule         | Expected behaviour                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| Review       | The final review reflects the business cards, quantities, shipping groups, and selected addresses in the order. |
| Submit       | The order can be submitted without entering payment information.                                                |
| Confirmation | A confirmation screen is shown after successful submission.                                                     |
| Cart reset   | After successful submission, the cart is empty and the cart count returns to 0.                                 |

### Tests

| ID    | Test                                             | Expected result                                                                         |
| ----- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| OR-01 | Complete the ordering flow and review the order. | Products, quantities, shipping groups, and addresses match the selections made earlier. |
| OR-02 | Submit the order.                                | The confirmation screen appears without a payment step.                                 |
| OR-03 | Check the cart after confirmation.               | The cart is empty and the cart count is 0.                                              |

---

## 8. Language & Interface Rules

| Rule             | Expected behaviour                                                              |
| ---------------- | ------------------------------------------------------------------------------- |
| Language         | The portal supports English and French.                                         |
| Language control | EN / FR is selected from the header.                                            |
| Footer           | A second language selector is not used in the footer.                           |
| Theme            | The current portal uses the light theme. Dark mode is not part of this version. |

### Tests

| ID    | Test                                   | Expected result                              |
| ----- | -------------------------------------- | -------------------------------------------- |
| UI-01 | Switch from EN to FR using the header. | The application interface changes to French. |
| UI-02 | Review the footer.                     | No separate language selector is shown.      |
| UI-03 | Open the portal.                       | The application opens in the light theme.    |

---

## 9. Admin Rules

Admin functions maintain the lists used by the business card ordering experience.

| Rule             | Expected behaviour                                                                      |
| ---------------- | --------------------------------------------------------------------------------------- |
| Manage Addresses | Admin can view, add, and remove office addresses used by the Address dropdown.          |
| Manage Titles    | Admin can view, add, and remove titles on English and French tabs. English titles feed English and bilingual cards; French titles feed French cards and the bilingual French title.                      |
| Admin Dashboard  | The Admin area provides the available administrative shortcuts and summary information. |

### Tests

| ID    | Test                               | Expected result                                                                      |
| ----- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| AD-01 | Add an office address in Admin.    | The address appears in the managed address list and is available for card selection. |
| AD-02 | Remove an office address in Admin. | The address is removed from the managed list.                                        |
| AD-03 | Add a title in Admin.              | The title appears in the managed title list and is available for card selection.     |
| AD-04 | Remove a title in Admin.           | The title is removed from the managed list.                                          |

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

| Guide                                         | Current ticket / feature   | Status                                                                                                                                                               |
| --------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three products, $63 / 250                     | F-01–F-04, USR-010–USR-023 | Done                                                                                                                                                                 |
| Locked company / website                      | USR-037                    | Done                                                                                                                                                                 |
| Office from saved list                        | USR-036                    | Done                                                                                                                                                                 |
| Canadian local phone on card                  | USR-035                    | Done                                                                                                                                                                 |
| Live preview                                  | USR-031                    | Done                                                                                                                                                                 |
| Cart combine / separate / qty / badge         | USR-040–USR-045            | Done                                                                                                                                                                 |
| Shipping $0, no payment                       | USR-053                    | Done                                                                                                                                                                 |
| Cannot remove last split                      | USR-055                    | Done                                                                                                                                                                 |
| Header EN/FR                                  | USR-070, USR-071           | Done                                                                                                                                                                 |
| Light theme                                   | F-23                       | Done                                                                                                                                                                 |
| Manage Addresses                              | ADM-060                    | Ready (Vue `#/admin/addresses`)                                                                                                                                      |
| Manage Titles                                 | ADM-070                    | Done (Vue `#/admin/titles`)                                                                                                                                          |
| Admin Dashboard                               | ADM-020                    | Done (Vue tiles; live counts ADM-022/023 still Ideas)                                                                                                                |
| Printed-card count (qty × 250)                | USR-046                    | Done                                                                                                                                                                 |
| Move a card between shipping groups           | USR-056                    | Done (SH-04)                                                                                                                                                         |
| Split Order creates an empty group            | USR-057                    | Done (SH-02, SH-03)                                                                                                                                                  |
| Add/remove ship-to does not delete cart cards | USR-051                    | Done (SH-08). Selected Items copies the address total; billed boxes are designs × that total (SH-07). Shipping or drawer trash removes the cart line (SH-09, SH-10). |

### Already ticketed as Ideas — reuse these, do not duplicate

| Guide                        | Ticket    | Notes                                                                                   |
| ---------------------------- | --------- | --------------------------------------------------------------------------------------- |
| One or more titles           | `USR-039` | Vue still allows one title                                                              |
| Colliers offices on shipping | `USR-058` | Not in the PDF; keep                                                                    |
| Order review before confirm  | `USR-063` | Section 7 / OR-01                                                                       |
| Remove footer language       | `F-20`    | UI-02                                                                                   |
| User Address Book            | `USR-080` | Demo user and admin can create personal addresses. Only admin creates offices (ADM-060) |
| User Order History           | `USR-090` | Vue 2 localStorage in colliers-vue2/. Details sheet is USR-098. Not ADM-030             |

### Limits and wording (updated)

| Ticket  | Change                                                                        |
| ------- | ----------------------------------------------------------------------------- |
| USR-032 | QA. Full name max **50**. Vue `NAME_MAX=50`.                                  |
| USR-033 | Still Done (one title today). Multiple is USR-039.                            |
| USR-034 | QA. Guide max **40**; Vue email max **50** for `@colliersprojectleaders.com`. |
| IDEA-01 | Closed (Done). Guide is **40**, not 20 or 30.                                 |

### Out of this guide — keep the tickets, do not treat as V2 rules

Order History, Invoice History, Reporting, Dark theme, user Address Book, and user Order History stay on the board. The PDF lists order history / reporting as **not covered**, not as cancelled. Vue 2 Address Book and Order History live in `colliers-vue2/` localStorage until FileMaker APIs exist.

### Backlog F-codes

[BACKLOG.md](BACKLOG.md) maps F-24–F-30 to board tickets. Do not invent new F-codes for the same work. Track status on the board / in [devTracker.json](devTracker.json).
