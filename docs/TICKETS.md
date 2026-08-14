# Tickets

This is the **source of truth** for RC Web Dev tickets. How the board works: [RC-WEB-DEV.md](RC-WEB-DEV.md). Product rules: [BUSINESS-RULES.md](BUSINESS-RULES.md). Product stories: [USER.md](USER.md), [ADMIN.md](ADMIN.md).

The live board still loads seed data from `src/rc-web-dev/data/devTracker.js`. If that file and this document disagree, **this file wins** — update the seed to match.

## Snapshot

- **99 tickets**
- Status: In progress 2 · QA 2 · Ready for development 0 · Ideas 54 · Done 41
- Category: Technical 10 · Customer Portal 42 · Admin Portal 43 · Shared UI/UX 3 · Quality Assurance 1

## Index

| ID | Title | Status | Category | Assignee | Parent |
| --- | --- | --- | --- | --- | --- |
| [DEV-010](#dev-010) | RC Web Dev tracker | Done | Technical | CZ | — |
| [DEV-011](#dev-011) | QA: drag tickets between columns | Done | Technical | CZ | DEV-010 |
| [DEV-012](#dev-012) | QA: ticket sheet | Done | Technical | CZ | DEV-010 |
| [DEV-013](#dev-013) | QA: create ticket | QA | Technical | CZ | DEV-010 |
| [DEV-014](#dev-014) | QA: roadmap groups | Done | Technical | CZ | DEV-010 |
| [DEV-015](#dev-015) | Logs, pills, groups stay put | Done | Technical | CZ | DEV-010 |
| [DEV-016](#dev-016) | Ideas column: headers stay, tickets scroll | QA | Technical | CZ | DEV-010 |
| [DEV-020](#dev-020) | 1:1 with Kevin — tomorrow | In progress | Technical | CZ | — |
| [DEV-030](#dev-030) | Persist RC Web Dev tickets in Supabase | In progress | Technical | CZ | — |
| [USR-010](#usr-010) | Catalogue | Done | Customer Portal | CZ | — |
| [USR-011](#usr-011) | Business Card English | Done | Customer Portal | CZ | USR-010 |
| [USR-012](#usr-012) | Business Card Bilingual | Done | Customer Portal | CZ | USR-010 |
| [USR-013](#usr-013) | Business Card French | Done | Customer Portal | CZ | USR-010 |
| [USR-014](#usr-014) | Catalogue price and pack size | Done | Customer Portal | CZ | USR-010 |
| [USR-020](#usr-020) | Card details | Done | Customer Portal | CZ | — |
| [USR-021](#usr-021) | Packaging 250/BX | Done | Customer Portal | CZ | USR-020 |
| [USR-022](#usr-022) | Pricing table | Done | Customer Portal | CZ | USR-020 |
| [USR-023](#usr-023) | Materials / brand notes | Done | Customer Portal | CZ | USR-020 |
| [USR-030](#usr-030) | Customize card | Done | Customer Portal | CZ | — |
| [USR-031](#usr-031) | Live preview | Done | Customer Portal | CZ | USR-030 |
| [USR-032](#usr-032) | Full name (max 50, two lines) | Ideas | Customer Portal | — | USR-030 |
| [USR-033](#usr-033) | Designation dropdown (one per card) | Done | Customer Portal | CZ | USR-030 |
| [USR-034](#usr-034) | Email (max 40) | Ideas | Customer Portal | — | USR-030 |
| [USR-035](#usr-035) | Mobile phone Canadian +1 | Done | Customer Portal | CZ | USR-030 |
| [USR-036](#usr-036) | Office address dropdown | Done | Customer Portal | CZ | USR-030 |
| [USR-037](#usr-037) | Company and website locked | Done | Customer Portal | CZ | USR-030 |
| [USR-038](#usr-038) | Add to Cart quantity 1 | Done | Customer Portal | CZ | USR-030 |
| [USR-039](#usr-039) | Allow users to select multiple designations | Ideas | Customer Portal | — | USR-030 |
| [USR-040](#usr-040) | Cart | Done | Customer Portal | CZ | — |
| [USR-041](#usr-041) | Combine same product and details | Done | Customer Portal | CZ | USR-040 |
| [USR-042](#usr-042) | Separate cart items for different name or title | Done | Customer Portal | CZ | USR-040 |
| [USR-043](#usr-043) | Cart badge icon | Done | Customer Portal | CZ | USR-040 |
| [USR-044](#usr-044) | Clear cart | Done | Customer Portal | CZ | USR-040 |
| [USR-045](#usr-045) | Change quantity in cart / shipping | Done | Customer Portal | CZ | USR-040 |
| [USR-046](#usr-046) | Show printed-card count (qty × 250) | Ideas | Customer Portal | — | USR-040 |
| [USR-050](#usr-050) | Shipping | Done | Customer Portal | CZ | — |
| [USR-051](#usr-051) | Add / remove / select ship-to location | Done | Customer Portal | CZ | USR-050 |
| [USR-052](#usr-052) | Location qty vs cart qty | Done | Customer Portal | CZ | USR-050 |
| [USR-053](#usr-053) | Shipping $0, no payment | Done | Customer Portal | CZ | USR-050 |
| [USR-054](#usr-054) | Split Order | Done | Customer Portal | CZ | USR-050 |
| [USR-055](#usr-055) | Cannot remove the last split | Done | Customer Portal | CZ | USR-050 |
| [USR-056](#usr-056) | Move cards between shipping groups | Ideas | Customer Portal | — | USR-050 |
| [USR-057](#usr-057) | Split Order creates an empty group | Ideas | Customer Portal | — | USR-050 |
| [USR-058](#usr-058) | Colliers offices on shipping, not NJ samples | Ideas | Customer Portal | — | USR-050 |
| [USR-060](#usr-060) | Order confirmed | Done | Customer Portal | CZ | — |
| [USR-061](#usr-061) | Success screen | Done | Customer Portal | CZ | USR-060 |
| [USR-062](#usr-062) | Clear cart and order draft | Done | Customer Portal | CZ | USR-060 |
| [USR-063](#usr-063) | Order review before confirm | Ideas | Customer Portal | — | USR-060 |
| [USR-070](#usr-070) | Header language | Done | Customer Portal | CZ | — |
| [USR-071](#usr-071) | Navbar EN/FR | Done | Customer Portal | CZ | USR-070 |
| [ADM-001](#adm-001) | Admin scoped from designer | Done | Admin Portal | CZ | — |
| [ADM-010](#adm-010) | Admin login and nav | Ideas | Admin Portal | — | — |
| [ADM-011](#adm-011) | Admin login admin / 123 | Ideas | Admin Portal | — | ADM-010 |
| [ADM-012](#adm-012) | Admin header nav | Ideas | Admin Portal | — | ADM-010 |
| [ADM-013](#adm-013) | Admin profile menu | Ideas | Admin Portal | — | ADM-010 |
| [ADM-020](#adm-020) | Admin Dashboard | Ideas | Admin Portal | — | — |
| [ADM-021](#adm-021) | System Options tiles | Ideas | Admin Portal | — | ADM-020 |
| [ADM-022](#adm-022) | Live address count | Ideas | Admin Portal | — | ADM-020 |
| [ADM-023](#adm-023) | Live title count | Ideas | Admin Portal | — | ADM-020 |
| [ADM-030](#adm-030) | Order History | Ideas | Admin Portal | — | — |
| [ADM-031](#adm-031) | Order History table | Ideas | Admin Portal | — | ADM-030 |
| [ADM-032](#adm-032) | Search orders by name | Ideas | Admin Portal | — | ADM-030 |
| [ADM-033](#adm-033) | Filter orders by status | Ideas | Admin Portal | — | ADM-030 |
| [ADM-034](#adm-034) | View order card preview | Ideas | Admin Portal | — | ADM-030 |
| [ADM-035](#adm-035) | Repeat Order | Ideas | Admin Portal | — | ADM-030 |
| [ADM-036](#adm-036) | Order History from profile menu | Ideas | Admin Portal | — | ADM-030 |
| [ADM-040](#adm-040) | Invoice History | Ideas | Admin Portal | — | — |
| [ADM-041](#adm-041) | Invoice table | Ideas | Admin Portal | — | ADM-040 |
| [ADM-042](#adm-042) | Download invoice | Ideas | Admin Portal | — | ADM-040 |
| [ADM-050](#adm-050) | Reporting | Ideas | Admin Portal | — | — |
| [ADM-051](#adm-051) | Monthly Spend Overview | Ideas | Admin Portal | — | ADM-050 |
| [ADM-052](#adm-052) | Recent Activity | Ideas | Admin Portal | — | ADM-050 |
| [ADM-053](#adm-053) | Spend by Department | Ideas | Admin Portal | — | ADM-050 |
| [ADM-054](#adm-054) | Export Data | Ideas | Admin Portal | — | ADM-050 |
| [ADM-060](#adm-060) | Manage Addresses | Ideas | Admin Portal | — | — |
| [ADM-061](#adm-061) | List office addresses | Ideas | Admin Portal | — | ADM-060 |
| [ADM-062](#adm-062) | Add address | Ideas | Admin Portal | — | ADM-060 |
| [ADM-063](#adm-063) | Remove address | Ideas | Admin Portal | — | ADM-060 |
| [ADM-064](#adm-064) | Edit address | Ideas | Admin Portal | — | ADM-060 |
| [ADM-065](#adm-065) | New / edit address form | Ideas | Admin Portal | — | ADM-060 |
| [ADM-066](#adm-066) | Address form actions | Ideas | Admin Portal | — | ADM-060 |
| [ADM-067](#adm-067) | Customize and shipping use admin addresses | Ideas | Admin Portal | — | ADM-060 |
| [ADM-070](#adm-070) | Manage Titles | Ideas | Admin Portal | — | — |
| [ADM-071](#adm-071) | List designations | Ideas | Admin Portal | — | ADM-070 |
| [ADM-072](#adm-072) | Add title | Ideas | Admin Portal | — | ADM-070 |
| [ADM-073](#adm-073) | Delete title | Ideas | Admin Portal | — | ADM-070 |
| [ADM-074](#adm-074) | Inline edit title | Ideas | Admin Portal | — | ADM-070 |
| [ADM-075](#adm-075) | Customize titles come from Manage Titles | Ideas | Admin Portal | — | ADM-070 |
| [F-20](#f-20) | Remove footer language dropdown | Ideas | Shared UI/UX | — | — |
| [F-21](#f-21) | Automated tests | Ideas | Quality Assurance | — | — |
| [F-23](#f-23) | Light theme | Done | Shared UI/UX | CZ | — |
| [F-19](#f-19) | Dark theme | Ideas | Shared UI/UX | — | — |
| [IDEA-01](#idea-01) | Email character limit decided (40) | Done | Customer Portal | CZ | — |
| [IDEA-03](#idea-03) | Port UI into Klai Studio | Ideas | Technical | — | — |
| [ADM-N1](#adm-n1) | Edit address should fill City / Province / Postal | Ideas | Admin Portal | — | — |
| [ADM-N2](#adm-n2) | Default country Canada, not United States | Ideas | Admin Portal | — | — |
| [ADM-N3](#adm-n3) | Save Draft on empty address form | Ideas | Admin Portal | — | — |
| [ADM-N4](#adm-n4) | Repeat Order should use Colliers offices | Ideas | Admin Portal | — | — |
| [ADM-N5](#adm-n5) | Order preview name and email should match | Ideas | Admin Portal | — | — |

## Technical

<a id="dev-010"></a>
### DEV-010 — RC Web Dev tracker

**Done** · high · CZ

RC Web Dev board at #/rc-web-dev. Rainbow profile item. Rainbow user ring only while on this page. Drag columns, ticket sheet, create, priorities.

Acceptance criteria:

- The tracker is available at #/rc-web-dev.
- Tickets can be viewed, created, opened, prioritized, and moved through the workflow.

Notes: docs/RC-WEB-DEV.md

<a id="dev-011"></a>
#### DEV-011 — QA: drag tickets between columns

**Done** · high · CZ · child of [DEV-010](#dev-010)

Drag a ticket to another column. A shadow follows the cursor and a placeholder shows the drop. The card stays in the new column after refresh.

Acceptance criteria:

- Dragging a ticket shows a visible card shadow and drop placeholder.
- After a valid drop and page refresh, the ticket remains in the destination column.

Notes: docs/RC-WEB-DEV.md

<a id="dev-012"></a>
#### DEV-012 — QA: ticket sheet

**Done** · high · CZ · child of [DEV-010](#dev-010)

Click a ticket. Sheet opens with status, priority, description, and related links. Close with X, backdrop, or Escape. Related rows open that ticket.

Acceptance criteria:

- Selecting a ticket opens a sheet showing its current status, priority, description, and related tickets.
- The sheet closes with the X button, backdrop click, or Escape key, and related-ticket rows open the selected ticket.

Notes: docs/RC-WEB-DEV.md

<a id="dev-013"></a>
#### DEV-013 — QA: create ticket

**QA** · high · CZ · child of [DEV-010](#dev-010)

Use Create ticket or + on Ideas. Title, priority, assigned (CZ or KC), category, description. New tickets get an RC-xx id.

Acceptance criteria:

- Create Ticket and the Ideas-column add button open a form with title, priority, assignee, category, and description fields.
- Submitting valid data creates one ticket with the next available RC-xx ID and displays it in Ideas.

Notes: docs/RC-WEB-DEV.md

<a id="dev-014"></a>
#### DEV-014 — QA: roadmap groups

**Done** · medium · CZ · child of [DEV-010](#dev-010)

Roadmap is grouped by category and collapsed when a group is already done. Unassigned Ideas sit below, grouped by category, and do not count in the percentage.

Acceptance criteria:

- The roadmap groups tickets under the correct category and collapses categories whose tickets are all complete.
- Unassigned Ideas appear below the roadmap and are excluded from completion-percentage calculations.

Notes: docs/RC-WEB-DEV.md

<a id="dev-015"></a>
#### DEV-015 — Logs, pills, groups stay put

**Done** · high · CZ · child of [DEV-010](#dev-010)

Logs tab. New / Updated / In progress pills as the stand-in for later approval. A move keeps the ticket’s category. The destination group opens and gets a bouncing dot on the category title — no blue ring around the section.

Acceptance criteria:

- Creating, editing, and moving tickets produces accurate entries in the Logs tab and the correct review pill.
- Moving a ticket preserves its category, opens the destination group, and highlights that category with the intended indicator.

Notes: docs/RC-WEB-DEV.md

<a id="dev-016"></a>
#### DEV-016 — Ideas column: headers stay, tickets scroll

**QA** · high · CZ · child of [DEV-010](#dev-010)

In Ideas, category headers always stay in the column. An open group’s tickets scroll in the space above the headers below it. No nested column-plus-group scroll. Soft Tailwind tints per category — not solid 600 bars.

Acceptance criteria:

- Category headers remain visible while tickets in an expanded Ideas group scroll within the available space.
- The Ideas column has a single clear scrolling behavior and retains the configured soft category colours.

Notes: docs/RC-WEB-DEV.md

<a id="dev-020"></a>
### DEV-020 — 1:1 with Kevin — tomorrow

**In progress** · high · CZ

Carlos (CZ) one-on-one with Kevin Collins (KC). Friday 14 Aug 2026. Walk through the board, logs, and what is in progress.

Acceptance criteria:

- The board walkthrough covers current progress, logs, priorities, and open decisions.
- Decisions and follow-up actions from the meeting are captured in the relevant tickets.

Notes: RC Web Dev

<a id="dev-030"></a>
### DEV-030 — Persist RC Web Dev tickets in Supabase

**In progress** · high · CZ

Holding store until FileMaker. Tables rc_tickets and rc_ticket_logs. Create, move, and edit on the board should save there so work survives refresh. Do not run live Supabase commands without asking first (.cursor/rules/supabase-permission.mdc).

Acceptance criteria:

- Creating, editing, or moving a ticket writes the corresponding ticket and log data to Supabase.
- Reloading the application restores the latest saved ticket states without duplicating tickets or logs.

Notes: RC Web Dev

<a id="idea-03"></a>
### IDEA-03 — Port UI into Klai Studio

**Ideas** · low · unassigned

Intended later. Same standalone layout markers in colliers-environment.css.

Acceptance criteria:

- Clay Studio migration remains separated from the standalone Vue delivery scope.
- The ticket records the approved migration entry criteria before implementation begins.

Notes: FEATURES.md · README.md

## Customer Portal

<a id="usr-010"></a>
### USR-010 — Catalogue

**Done** · medium · CZ

Catalogue page. Three products, same price and pack size. Bilingual is the product name, not navbar language.

Acceptance criteria:

- The catalogue displays the English, Bilingual, and French business-card products.
- Selecting any catalogue product opens the correct details page.

Notes: USER.md · CatalogPage.vue · F-01 F-02 F-03

<a id="usr-011"></a>
#### USR-011 — Business Card English

**Done** · medium · CZ · child of [USR-010](#usr-010)

SKU BCAD-PL-ENG. $63 per box, 250 cards.

Acceptance criteria:

- The English business card is labelled correctly and displays a price of $63 per box.
- The product shows that one box contains 250 printed business cards.

Notes: USER.md · F-01

<a id="usr-012"></a>
#### USR-012 — Business Card Bilingual

**Done** · medium · CZ · child of [USR-010](#usr-010)

SKU BCAD-PL-BIL. Product name, not the EN/FR toggle.

Acceptance criteria:

- The Bilingual business card appears as a distinct product with the correct product name.
- Selecting it does not change the application interface language.

Notes: USER.md · F-02

<a id="usr-013"></a>
#### USR-013 — Business Card French

**Done** · medium · CZ · child of [USR-010](#usr-010)

SKU BCAD-PL-FR. $63 per box, 250 cards.

Acceptance criteria:

- The French business card is labelled correctly and displays a price of $63 per box.
- The product shows that one box contains 250 printed business cards.

Notes: USER.md · F-03

<a id="usr-014"></a>
#### USR-014 — Catalogue price and pack size

**Done** · medium · CZ · child of [USR-010](#usr-010)

$63 per box (shipping included), 250 cards per box, shown on the catalogue.

Acceptance criteria:

- Every catalogue card displays $63 per box and 250 cards per box.
- Price and pack-size wording is consistent across all three products.

Notes: USER.md. The $63 box fee includes shipping; cart Shipping & Handling stays $0.00.

<a id="usr-020"></a>
### USR-020 — Card details

**Done** · medium · CZ

Details page: packaging, print on demand, pricing table, materials / brand notes.

Acceptance criteria:

- The details page shows packaging, pricing, materials, and brand information for the selected product.
- The user can continue from product details to card customization.

Notes: USER.md · DetailsPage.vue · F-04

<a id="usr-021"></a>
#### USR-021 — Packaging 250/BX

**Done** · medium · CZ · child of [USR-020](#usr-020)

Details page shows packaging 250/BX.

Acceptance criteria:

- The details page clearly states that one box contains 250 cards.
- The pack-size value is consistent with the catalogue and cart calculations.

Notes: USER.md · F-04

<a id="usr-022"></a>
#### USR-022 — Pricing table

**Done** · medium · CZ · child of [USR-020](#usr-020)

Details page pricing tiers.

Acceptance criteria:

- The pricing table displays the configured quantity tiers and corresponding prices.
- Tier values are readable and do not conflict with the $63-per-box base price.

Notes: USER.md · F-04

<a id="usr-023"></a>
#### USR-023 — Materials / brand notes

**Done** · medium · CZ · child of [USR-020](#usr-020)

Details page materials and brand notes.

Acceptance criteria:

- The details page displays the approved material specifications.
- The Colliers brand notes are visible and associated with the selected card product.

Notes: USER.md · F-04

<a id="usr-030"></a>
### USR-030 — Customize card

**Done** · medium · CZ

Vue customize is ahead of the designer. Do not copy AI Studio customize.

Acceptance criteria:

- The customization form supports all approved personal and office fields.
- Valid customization data can be previewed and added to the cart without losing the entered values.

Notes: USER.md · CustomizePage.vue · F-05

<a id="usr-031"></a>
#### USR-031 — Live preview

**Done** · medium · CZ · child of [USR-030](#usr-030)

Preview updates as fields change.

Acceptance criteria:

- Changing a supported customization field updates the card preview immediately.
- The preview matches the values currently entered or selected in the form.

Notes: USER.md · CardPreview.vue

<a id="usr-032"></a>
#### USR-032 — Full name (max 50, two lines)

**Ideas** · medium · unassigned · child of [USR-030](#usr-030)

Name field max 50 characters, two lines on the card. Vue still caps at 30.

Acceptance criteria:

- The full-name field accepts no more than 50 characters.
- A valid long name renders on no more than two lines without overlapping other card content.

Notes: USER.md · BUSINESS-RULES.md section 4

<a id="usr-033"></a>
#### USR-033 — Designation dropdown (one per card)

**Done** · medium · CZ · child of [USR-030](#usr-030)

Vue today: one designation per card from the dropdown. Multiple designations is [USR-039](#usr-039).

Acceptance criteria:

- The user can select one available designation from the dropdown.
- The selected designation appears correctly on the live preview and saved cart item.

Notes: USER.md · BUSINESS-RULES.md section 4 · CU-02 / CU-03 are USR-039

<a id="usr-034"></a>
#### USR-034 — Email (max 40)

**Ideas** · medium · unassigned · child of [USR-030](#usr-030)

Email max 40. Vue still caps at 30. Limit decided in [IDEA-01](#idea-01).

Acceptance criteria:

- The email field accepts no more than 40 characters.
- The accepted email value appears unchanged on the preview and cart item.

Notes: USER.md · BUSINESS-RULES.md section 4

<a id="usr-035"></a>
#### USR-035 — Mobile phone Canadian +1

**Done** · medium · CZ · child of [USR-030](#usr-030)

Canadian +1, formatted as the user types.

Acceptance criteria:

- The phone field accepts a Canadian number with the +1 country code.
- Digits are formatted consistently while typing and the final value appears correctly on the preview.

Notes: USER.md

<a id="usr-036"></a>
#### USR-036 — Office address dropdown

**Done** · medium · CZ · child of [USR-030](#usr-030)

Colliers offices from products.js. Later wire to ADM-067.

Acceptance criteria:

- The office dropdown lists only configured Colliers office addresses.
- Selecting an office updates the card preview and the selection remains on the cart item.

Notes: USER.md

<a id="usr-037"></a>
#### USR-037 — Company and website locked

**Done** · medium · CZ · child of [USR-030](#usr-030)

Company Colliers. Website colliers.com/canada.

Acceptance criteria:

- Company is displayed as Colliers and cannot be edited by the user.
- Website is displayed as colliers.com/canada and cannot be edited by the user.

Notes: USER.md

<a id="usr-038"></a>
#### USR-038 — Add to Cart quantity 1

**Done** · medium · CZ · child of [USR-030](#usr-030)

Each Add to Cart click adds quantity 1.

Acceptance criteria:

- Each Add to Cart action adds exactly one box for the configured card.
- The cart badge and line quantity increase by one without losing customization details.

Notes: USER.md

<a id="usr-039"></a>
#### USR-039 — Allow users to select multiple designations

**Ideas** · medium · unassigned · child of [USR-030](#usr-030)

One or more designations from the available list. Selected values appear below the field and on the preview. A selected designation can be removed. Vue still allows one.

Acceptance criteria:

- Users can select more than one designation.
- Selected designations appear below the field, on the card preview, and the control shows how many are selected.
- Users can remove a selected designation.
- Removed designations disappear from the preview.

Notes: USER.md · F-24 · BUSINESS-RULES.md CU-02, CU-03. Current Vue is one designation ([USR-033](#usr-033)).

<a id="usr-040"></a>
### USR-040 — Cart

**Done** · medium · CZ

Cart drawer: add, quantity, combine same details, keep different name or title separate.

Acceptance criteria:

- The cart displays every added card with its customization, box quantity, and price.
- Users can update quantities or clear the cart and totals recalculate correctly.

Notes: USER.md · CartDrawer.vue · F-06

<a id="usr-041"></a>
#### USR-041 — Combine same product and details

**Done** · medium · CZ · child of [USR-040](#usr-040)

Same product + same details combine into one cart item.

Acceptance criteria:

- Cards with the same product and identical customization are combined into one cart line.
- Combining lines increases quantity without changing the saved customization data.

Notes: USER.md · F-06

<a id="usr-042"></a>
#### USR-042 — Separate cart items for different name or title

**Done** · medium · CZ · child of [USR-040](#usr-040)

Different name or title stay separate rows. TC-05 / TC-05b.

Acceptance criteria:

- Cards with different names remain separate cart lines.
- Cards with different titles or designation selections remain separate cart lines.

Notes: USER.md · F-06

<a id="usr-043"></a>
#### USR-043 — Cart badge icon

**Done** · medium · CZ · child of [USR-040](#usr-040)

Red number on the header cart icon = total quantity.

Acceptance criteria:

- The header badge equals the total number of boxes across all cart lines.
- The badge updates immediately after adding, removing, clearing, or changing quantity.

Notes: USER.md · AppHeader.vue · F-07

<a id="usr-044"></a>
#### USR-044 — Clear cart

**Done** · medium · CZ · child of [USR-040](#usr-040)

Empty the cart. Badge goes to 0.

Acceptance criteria:

- Clear Cart removes every cart line after the action is confirmed.
- The cart badge and cart totals return to zero.

Notes: USER.md · F-08

<a id="usr-045"></a>
#### USR-045 — Change quantity in cart / shipping

**Done** · medium · CZ · child of [USR-040](#usr-040)

Qty on a cart line. Shipping location qty does not change cart qty.

Acceptance criteria:

- Changing a cart-line quantity updates its subtotal and the order total.
- Changing a shipping-location allocation does not modify the cart-line quantity.

Notes: USER.md

<a id="usr-046"></a>
#### USR-046 — Show printed-card count (qty × 250)

**Ideas** · medium · unassigned · child of [USR-040](#usr-040)

Quantity 3 = 750 printed cards = $189.00. Vue shows boxes and price only.

Acceptance criteria:

- Each cart and review line displays printed-card total as box quantity multiplied by 250.
- For quantity 3, the interface shows 750 printed cards and a $189.00 line total.

Notes: USER.md · BUSINESS-RULES.md PR-01, PR-02

<a id="usr-050"></a>
### USR-050 — Shipping

**Done** · medium · CZ

Shipping page. $0.00 (included in the $63 box fee). No payment. Location qty does not change cart qty.

Acceptance criteria:

- The shipping page displays cart items, shipping groups, and selected locations accurately.
- Shipping remains $0.00 and the user can continue without entering payment information.

Notes: USER.md · ShippingPage.vue · F-10. Shipping is not calculated separately — it is built into the $63 card box fee.

<a id="usr-051"></a>
#### USR-051 — Add / remove / select ship-to location

**Done** · medium · CZ · child of [USR-050](#usr-050)

Add, remove, or pick a saved location.

Acceptance criteria:

- The user can add or select a saved ship-to location for a shipping group.
- The user can remove an assigned location without deleting or changing the cart item.

Notes: USER.md · LocationDrawer.vue

<a id="usr-052"></a>
#### USR-052 — Location qty vs cart qty

**Done** · medium · CZ · child of [USR-050](#usr-050)

Qty on a location does not change cart quantity.

Acceptance criteria:

- A location allocation can be changed independently within its shipping group.
- Changing the allocation does not change the original cart quantity or order total.

Notes: USER.md · F-10

<a id="usr-053"></a>
#### USR-053 — Shipping $0, no payment

**Done** · medium · CZ · child of [USR-050](#usr-050)

Shipping is $0.00 because it is built into the $63 card box fee. There is no payment step.

Acceptance criteria:

- Shipping cost displays as $0.00 throughout shipping and review.
- No credit-card, billing, or payment step is presented before confirmation.

Notes: USER.md. Do not add a shipping-cost calculation. The $63 box fee already includes shipping.

<a id="usr-054"></a>
#### USR-054 — Split Order

**Done** · medium · CZ · child of [USR-050](#usr-050)

Split Order adds a shipping group. Empty-group behaviour is [USR-057](#usr-057). Cannot remove the last split.

Acceptance criteria:

- Split Order creates one additional shipping group.
- Repeated use creates distinct groups without changing the total ordered quantity.

Notes: USER.md · F-09 · BUSINESS-RULES.md SH-02. Empty new group is USR-057.

<a id="usr-055"></a>
#### USR-055 — Cannot remove the last split

**Done** · medium · CZ · child of [USR-050](#usr-050)

Remove Split only when there is more than one split.

Acceptance criteria:

- Remove Split is available when more than one shipping group exists.
- The final remaining shipping group cannot be removed.

Notes: USER.md · F-09

<a id="usr-056"></a>
#### USR-056 — Move cards between shipping groups

**Ideas** · medium · unassigned · child of [USR-050](#usr-050)

Move a card from group 1 to group 2 without duplicating quantity. Vue still shares one cart across splits.

Acceptance criteria:

- A card can be moved from one shipping group to another.
- After the move, the card exists only in the destination group and total ordered quantity is unchanged.

Notes: USER.md · F-25 · BUSINESS-RULES.md SH-04

<a id="usr-057"></a>
#### USR-057 — Split Order creates an empty group

**Ideas** · medium · unassigned · child of [USR-050](#usr-050)

Split Order creates a new empty shipping group. New cards stay in Shipping Group 1. Vue duplicates the cart view.

Acceptance criteria:

- Split Order creates a new group with no cards and no selected address. Products and locations from the existing group are not duplicated.
- Existing and newly added cards remain in Shipping Group 1 until the user moves them.

Notes: USER.md · F-26 · BUSINESS-RULES.md SH-02, SH-03

<a id="usr-058"></a>
#### USR-058 — Colliers offices on shipping, not NJ samples

**Ideas** · medium · unassigned · child of [USR-050](#usr-050)

savedAddresses still seeds South Plainfield / Millville NJ. Customize already uses Colliers offices. See ADM-067.

Acceptance criteria:

- Shipping locations contain approved Colliers offices and no New Jersey sample addresses.
- The shipping address records use the same fields and values as the managed Colliers office list.

Notes: USER.md · F-28

<a id="usr-060"></a>
### USR-060 — Order confirmed

**Done** · medium · CZ

Success screen. Clears cart and order draft. No payment. No user order history.

Acceptance criteria:

- Submitting a valid reviewed order opens the confirmation screen once.
- Successful confirmation clears the cart and shipping draft without creating a payment or order-history step.

Notes: USER.md · ConfirmedPage.vue · F-11

<a id="usr-061"></a>
#### USR-061 — Success screen

**Done** · medium · CZ · child of [USR-060](#usr-060)

Thank-you / confirmed page after Review / Checkout.

Acceptance criteria:

- The confirmation screen clearly states that the order was submitted successfully.
- Refreshing or navigating after confirmation does not resubmit the same order.

Notes: USER.md · F-11

<a id="usr-062"></a>
#### USR-062 — Clear cart and order draft

**Done** · medium · CZ · child of [USR-060](#usr-060)

Confirming clears cart and the shipping draft.

Acceptance criteria:

- After confirmation, the cart contains no items and its badge is zero.
- Returning to shipping starts with a new empty order draft.

Notes: USER.md · F-11

<a id="usr-063"></a>
#### USR-063 — Order review before confirm

**Ideas** · medium · unassigned · child of [USR-060](#usr-060)

Review products, quantities, shipping groups, and addresses before submit. Vue Review / Checkout goes straight to confirmed. No review route.

Acceptance criteria:

- A review step shows every card, box quantity, printed-card total, shipping group, and selected address.
- The user can return to correct the order or confirm it without entering payment details.

Notes: USER.md · F-27 · BUSINESS-RULES.md section 7, OR-01

<a id="usr-070"></a>
### USR-070 — Header language

**Done** · medium · CZ

Navbar EN/FR switches site chrome. Footer language is a duplicate (F-20).

Acceptance criteria:

- The header provides the single EN/FR language control for the application.
- Changing the language updates supported interface labels without changing the selected product.

Notes: USER.md · AppHeader.vue · F-22

<a id="usr-071"></a>
#### USR-071 — Navbar EN/FR

**Done** · medium · CZ · child of [USR-070](#usr-070)

Header EN/FR. Example: Add to Cart → Ajouter au panier.

Acceptance criteria:

- Selecting EN displays supported navigation and action labels in English.
- Selecting FR displays the corresponding French labels, including Ajouter au panier.

Notes: USER.md · F-22

<a id="idea-01"></a>
### IDEA-01 — Email character limit decided (40)

**Done** · medium · CZ

The Aug 2026 guide settled email at max 40. Vue still uses 30 until [USR-034](#usr-034).

Acceptance criteria:

- The team records one email character limit in the business rules.
- Related tickets and product docs use that same limit. Field validation is [USR-034](#usr-034).

Notes: BUSINESS-RULES.md section 4

## Admin Portal

<a id="adm-001"></a>
### ADM-001 — Admin scoped from designer

**Done** · medium · CZ

Walked the designer admin preview (admin / 123). Wrote ADMIN.md and the ADM-010…ADM-075 stories. No admin screens in Vue yet. Do not copy leftovers ADM-N1–ADM-N5.

Acceptance criteria:

- The approved admin scope is represented by the ADM-010 through ADM-075 ticket groups.
- Known designer leftovers are captured separately and are not treated as approved behavior.

Notes: ADMIN.md

<a id="adm-010"></a>
### ADM-010 — Admin login and nav

**Ideas** · medium · unassigned

Not in Vue. Designer: login admin / 123. Header ADMIN, Catalogue, Manage Addresses, Manage Titles. Profile: Admin Panel, Order History, Log out.

Acceptance criteria:

- Valid admin credentials open the admin application shell.
- The admin shell provides the approved navigation and profile actions on every admin page.

Notes: ADMIN.md · F-12

<a id="adm-011"></a>
#### ADM-011 — Admin login admin / 123

**Ideas** · medium · unassigned · child of [ADM-010](#adm-010)

Login screen accepts admin / 123 and opens the admin shell.

Acceptance criteria:

- Entering admin / 123 grants access to the admin shell.
- Invalid credentials keep the user on the login screen and display a clear error without exposing admin content.

Notes: ADMIN.md · TC-21

<a id="adm-012"></a>
#### ADM-012 — Admin header nav

**Ideas** · medium · unassigned · child of [ADM-010](#adm-010)

Header shows ADMIN, Catalogue, Manage Addresses, Manage Titles. Not in Vue; user header is catalogue only.

Acceptance criteria:

- The admin header shows ADMIN, Catalogue, Manage Addresses, and Manage Titles.
- Each navigation item opens the correct route and indicates the active page.

Notes: ADMIN.md

<a id="adm-013"></a>
#### ADM-013 — Admin profile menu

**Ideas** · medium · unassigned · child of [ADM-010](#adm-010)

Profile: Admin Panel, Order History, Log out. Vue profile has RC Web Dev and Log out only.

Acceptance criteria:

- The profile menu shows Admin Panel, Order History, and Log out.
- Each option performs the expected navigation or ends the admin session.

Notes: ADMIN.md

<a id="adm-020"></a>
### ADM-020 — Admin Dashboard

**Ideas** · medium · unassigned

Not in Vue. System Options only. No Total Orders / Pending Approvals / Active Users tiles (TC-26 is outdated).

Acceptance criteria:

- The dashboard displays the approved System Options tiles.
- Each tile opens its corresponding admin screen and displays current supporting counts where required.

Notes: ADMIN.md · F-13

<a id="adm-021"></a>
#### ADM-021 — System Options tiles

**Ideas** · medium · unassigned · child of [ADM-020](#adm-020)

Order History, Invoice History, Reporting, Manage Addresses, Manage Titles.

Acceptance criteria:

- Tiles are shown for Order History, Invoice History, Reporting, Manage Addresses, and Manage Titles.
- Each tile is labelled clearly and links to the correct destination.

Notes: ADMIN.md

<a id="adm-022"></a>
#### ADM-022 — Live address count

**Ideas** · medium · unassigned · child of [ADM-020](#adm-020)

Dashboard address count. Designer preview showed 22.

Acceptance criteria:

- The Manage Addresses tile displays the current number of active office addresses.
- The count updates after an address is added or removed.

Notes: ADMIN.md

<a id="adm-023"></a>
#### ADM-023 — Live title count

**Ideas** · medium · unassigned · child of [ADM-020](#adm-020)

Dashboard title count. Designer preview showed 32.

Acceptance criteria:

- The Manage Titles tile displays the current number of available designations.
- The count updates after a designation is added or deleted.

Notes: ADMIN.md

<a id="adm-030"></a>
### ADM-030 — Order History

**Ideas** · medium · unassigned

Own screen in the designer. Not in Vue. Mock data.

Acceptance criteria:

- The Order History screen lists available orders in a readable table.
- Search, status filtering, viewing, and repeat-order actions work on the displayed records.

Notes: ADMIN.md · F-16

<a id="adm-031"></a>
#### ADM-031 — Order History table

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Columns: Order ID, Employee, Item, Quantity, Date, Status.

Acceptance criteria:

- Each row shows Order ID, Employee, Item, Quantity, Date, and Status.
- Column values belong to the same order and remain readable at supported screen sizes.

Notes: ADMIN.md

<a id="adm-032"></a>
#### ADM-032 — Search orders by name

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Search the order table by employee name.

Acceptance criteria:

- Entering an employee name filters the table to matching orders.
- Clearing the search restores the full order list and no-match searches show a clear empty state.

Notes: ADMIN.md

<a id="adm-033"></a>
#### ADM-033 — Filter orders by status

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Filter: All / Delivered / Shipped / Processing.

Acceptance criteria:

- All, Delivered, Shipped, and Processing filters return only the expected orders.
- Changing or clearing the filter updates results without altering the underlying order data.

Notes: ADMIN.md

<a id="adm-034"></a>
#### ADM-034 — View order card preview

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

View opens a business card preview modal. Designer leftover: name/email mismatch (ADM-N5).

Acceptance criteria:

- View opens a preview for the selected order row.
- The preview name, email, product, and customization match that exact order.

Notes: ADMIN.md

<a id="adm-035"></a>
#### ADM-035 — Repeat Order

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Repeat Order puts that item in the cart and goes to shipping. Designer leftover: NJ samples (ADM-N4).

Acceptance criteria:

- Repeat Order adds the selected historical card and quantity to the current cart.
- The user is taken to shipping with Colliers office locations and no New Jersey sample data.

Notes: ADMIN.md

<a id="adm-036"></a>
#### ADM-036 — Order History from profile menu

**Ideas** · medium · unassigned · child of [ADM-030](#adm-030)

Same Order History screen from the profile shortcut.

Acceptance criteria:

- Order History in the profile menu opens the same Order History screen used elsewhere.
- The screen retains the same table, search, filters, and row actions regardless of entry point.

Notes: ADMIN.md

<a id="adm-040"></a>
### ADM-040 — Invoice History

**Ideas** · medium · unassigned

Own screen in the designer. Not in Vue. Mock data.

Acceptance criteria:

- The Invoice History screen displays the available invoice records.
- Users can identify invoice status and download an available invoice from its row.

Notes: ADMIN.md · F-17

<a id="adm-041"></a>
#### ADM-041 — Invoice table

**Ideas** · medium · unassigned · child of [ADM-040](#adm-040)

Columns: Invoice ID, Date, Department, Amount, Status (Paid / Pending / Overdue).

Acceptance criteria:

- Each invoice row shows Invoice ID, Date, Department, Amount, and Status.
- Status is limited to the approved Paid, Pending, or Overdue values.

Notes: ADMIN.md

<a id="adm-042"></a>
#### ADM-042 — Download invoice

**Ideas** · medium · unassigned · child of [ADM-040](#adm-040)

Download action on an invoice row.

Acceptance criteria:

- Selecting Download retrieves the invoice associated with that row.
- The downloaded file opens successfully and contains the matching invoice identifier and amount.

Notes: ADMIN.md

<a id="adm-050"></a>
### ADM-050 — Reporting

**Ideas** · medium · unassigned

Own screen in the designer. Not in Vue. Mock data.

Acceptance criteria:

- The Reporting screen displays monthly spend, recent activity, and department spend sections.
- Displayed totals are consistent across sections for the same reporting period.

Notes: ADMIN.md · F-18

<a id="adm-051"></a>
#### ADM-051 — Monthly Spend Overview

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Reporting: monthly spend overview.

Acceptance criteria:

- Monthly Spend Overview shows a labelled value for each available month.
- The values and period labels match the reporting data source.

Notes: ADMIN.md

<a id="adm-052"></a>
#### ADM-052 — Recent Activity

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Reporting: recent activity list.

Acceptance criteria:

- Recent Activity lists the latest relevant order or administrative events.
- Each entry shows enough information to identify the event and when it occurred.

Notes: ADMIN.md

<a id="adm-053"></a>
#### ADM-053 — Spend by Department

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Reporting: spend by department.

Acceptance criteria:

- Spend by Department shows each department and its corresponding total.
- Department totals reconcile with the overall spend for the selected period.

Notes: ADMIN.md

<a id="adm-054"></a>
#### ADM-054 — Export Data

**Ideas** · medium · unassigned · child of [ADM-050](#adm-050)

Generate Custom Report / Export Data.

Acceptance criteria:

- The user can generate a report using the available report controls.
- Export Data downloads a readable file containing the currently selected reporting data.

Notes: ADMIN.md

<a id="adm-060"></a>
### ADM-060 — Manage Addresses

**Ideas** · medium · unassigned

Own screen. Not in Vue. List, add, edit, remove. Do not rebuild Edit Supplier Details.

Acceptance criteria:

- Manage Addresses lists existing offices and provides add, edit, and remove actions.
- Changes made through the screen are reflected wherever managed office addresses are used.

Notes: ADMIN.md · F-14

<a id="adm-061"></a>
#### ADM-061 — List office addresses

**Ideas** · medium · unassigned · child of [ADM-060](#adm-060)

List of office addresses on Manage Addresses.

Acceptance criteria:

- Each active office appears once with enough address information to distinguish it.
- The list reflects additions, edits, and removals without requiring stale sample data.

Notes: ADMIN.md

<a id="adm-062"></a>
#### ADM-062 — Add address

**Ideas** · medium · unassigned · child of [ADM-060](#adm-060)

Add opens the New Address form (ADM-065).

Acceptance criteria:

- Add Address opens a blank New Address form.
- Saving valid required fields adds one new office to the address list.

Notes: ADMIN.md

<a id="adm-063"></a>
#### ADM-063 — Remove address

**Ideas** · medium · unassigned · child of [ADM-060](#adm-060)

Remove an office from the list.

Acceptance criteria:

- Remove targets the selected office and requires confirmation before deletion.
- After confirmation, the office disappears from the managed list and is no longer selectable for new orders.

Notes: ADMIN.md

<a id="adm-064"></a>
#### ADM-064 — Edit address

**Ideas** · medium · unassigned · child of [ADM-060](#adm-060)

Edit opens Update Existing Address (ADM-065). Designer leftover: fields do not fill (ADM-N1).

Acceptance criteria:

- Edit opens the selected address with every existing field prefilled correctly.
- Saving changes updates that record without creating a duplicate address.

Notes: ADMIN.md

<a id="adm-065"></a>
#### ADM-065 — New / edit address form

**Ideas** · medium · unassigned · child of [ADM-060](#adm-060)

Required: Address Name, Street, City, State/Province, ZIP/Postal, Country. Designer leftovers: default US (ADM-N2), empty Save Draft (ADM-N3).

Acceptance criteria:

- The form includes Address Name, Street, City, Province, Postal Code, and Country as required fields.
- Invalid or missing required values prevent final submission and display field-level guidance.

Notes: ADMIN.md

<a id="adm-066"></a>
#### ADM-066 — Address form actions

**Ideas** · medium · unassigned · child of [ADM-060](#adm-060)

Save Draft, Add New Address / Update Address, Back to Addresses.

Acceptance criteria:

- Back to Addresses returns without unintentionally saving changes.
- Add/Update saves valid data, while Save Draft preserves an incomplete record only when draft behavior is supported.

Notes: ADMIN.md

<a id="adm-067"></a>
#### ADM-067 — Customize and shipping use admin addresses

**Ideas** · medium · unassigned · child of [ADM-060](#adm-060)

After this list exists, customize offices and shipping savedAddresses should use it. Vue customize is already Colliers; shipping still has NJ samples.

Acceptance criteria:

- Customize and shipping load office choices from the managed address list.
- An admin address change appears in both workflows and New Jersey seed addresses never appear.

Notes: ADMIN.md · USR-036 · USR-058

<a id="adm-070"></a>
### ADM-070 — Manage Titles

**Ideas** · medium · unassigned

Own screen. Not in Vue. List designations (PMP, LEED AP, …). Add, delete, inline edit.

Acceptance criteria:

- Manage Titles lists existing designations and provides add, edit, and delete actions.
- Saved title changes are reflected in the customization designation control.

Notes: ADMIN.md · F-15 · BUSINESS-RULES.md calls this Manage Designations

<a id="adm-071"></a>
#### ADM-071 — List designations

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

List of titles / designations.

Acceptance criteria:

- Each active designation appears once in the list.
- The list updates immediately after a successful add, edit, or delete action.

Notes: ADMIN.md

<a id="adm-072"></a>
#### ADM-072 — Add title

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Add a designation to the list.

Acceptance criteria:

- A non-empty unique designation can be added successfully.
- Blank or duplicate values are rejected with a clear message.

Notes: ADMIN.md

<a id="adm-073"></a>
#### ADM-073 — Delete title

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Remove a designation.

Acceptance criteria:

- Deleting a designation requires confirmation and removes the selected value.
- Deleting one designation does not remove or modify any other designation.

Notes: ADMIN.md

<a id="adm-074"></a>
#### ADM-074 — Inline edit title

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Pencil → inline field → save (check) or cancel (X).

Acceptance criteria:

- The pencil action changes only the selected row into an editable field.
- Save commits the edited value and Cancel restores the original value without changes.

Notes: ADMIN.md

<a id="adm-075"></a>
#### ADM-075 — Customize titles come from Manage Titles

**Ideas** · medium · unassigned · child of [ADM-070](#adm-070)

Customize job-title dropdown is hardcoded in products.js. After ADM-070, use this list.

Acceptance criteria:

- The customization designation control loads active values from Manage Titles.
- Added, edited, or deleted titles are reflected without changing existing saved cart items.

Notes: ADMIN.md · USR-033

<a id="adm-n1"></a>
### ADM-N1 — Edit address should fill City / Province / Postal

**Ideas** · medium · unassigned

Designer issue: edit copies the whole line into Name and Street. Do not copy as-is.

Acceptance criteria:

- Editing an address prefills City, Province, and Postal Code from the selected record.
- Saving an edit keeps address fields separate and does not copy the full address into Name or Street.

Notes: ADMIN.md leftovers

<a id="adm-n2"></a>
### ADM-N2 — Default country Canada, not United States

**Ideas** · medium · unassigned

Product question before building ADM-07. Designer defaults to United States.

Acceptance criteria:

- The team confirms and records the default country for new addresses.
- If Canada is approved, new forms default to Canada while existing address countries remain unchanged.

Notes: ADMIN.md leftovers

<a id="adm-n3"></a>
### ADM-N3 — Save Draft on empty address form

**Ideas** · low · unassigned

Designer: Save Draft on an empty form does nothing. Decide the rule before porting.

Acceptance criteria:

- The team defines whether empty or incomplete address drafts are allowed.
- The Save Draft control either saves according to the approved rule or is hidden/disabled with clear behavior.

Notes: ADMIN.md leftovers

<a id="adm-n4"></a>
### ADM-N4 — Repeat Order should use Colliers offices

**Ideas** · low · unassigned

Designer Repeat Order used NJ sample addresses, not Colliers offices.

Acceptance criteria:

- Repeat Order presents only approved Colliers office locations.
- No New Jersey sample address appears in the repeated-order shipping flow.

Notes: ADMIN.md leftovers

<a id="adm-n5"></a>
### ADM-N5 — Order preview name and email should match

**Ideas** · low · unassigned

Designer View preview: employee name and card email did not match.

Acceptance criteria:

- The order preview name and email match the selected historical order record.
- Opening previews for different orders never carries over identity data from a previous order.

Notes: ADMIN.md leftovers

## Shared UI/UX

<a id="f-20"></a>
### F-20 — Remove footer language dropdown

**Ideas** · medium · unassigned

Language belongs in the navbar EN/FR only. The footer English/Français control is a duplicate and should be removed.

Acceptance criteria:

- The footer no longer displays an English/Français language control.
- The header EN/FR control continues to switch all supported interface labels.

Notes: BACKLOG.md · FEATURES.md · BUSINESS-RULES.md UI-02

<a id="f-23"></a>
### F-23 — Light theme

**Done** · medium · CZ

Current default. App opens in light theme.

Acceptance criteria:

- The application opens in the approved light theme by default.
- Core pages and controls remain readable with consistent light-theme colours and contrast.

Notes: BACKLOG.md

<a id="f-19"></a>
### F-19 — Dark theme

**Ideas** · low · unassigned

Listed in BACKLOG as not started. V2 rules say dark mode is out of scope for this version.

Acceptance criteria:

- The team decision that dark mode is out of scope for this version is recorded.
- No dark-theme work is included in current release estimates or completion metrics.

Notes: BACKLOG.md · V2 says not this version

## Quality Assurance

<a id="f-21"></a>
### F-21 — Automated tests

**Ideas** · high · unassigned

No test runner yet. Spec is TESTING.md. Start with P0: TC-01, TC-02, TC-04, TC-05, TC-05b, TC-11, TC-13, TC-21.

Acceptance criteria:

- The project includes a repeatable automated test command with documented setup.
- The initial suite covers the listed P0 scenarios and reports clear pass or failure results.

Notes: BACKLOG.md · TESTING.md
