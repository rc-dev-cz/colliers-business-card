# FileMaker: `Place Order` (Support Scripts - review)

New script for Review > **Place Order**. It replaces `Save or Update Order` for this flow.
`Save or Update Order` stays as it is for anything else that uses it.

Paste-ready:

- `fm-place-order.xml`: the whole `Place Order` script
- `fm-onUtility-review-submit.xml`: the new `If [ $type = "submit" ]` block for `BF - onUtility - review`
- `fm-onFormRequest-review.xml`: `BF - onFormRequest - review`, loading `offices` and `personalAddresses`
  (same steps as Shipping) so each ship-to resolves to its address-book row on Review

To paste: copy the XML to the clipboard as a FileMaker object (for example with the MBS
"Copy Script Text"/clipboard tools), open the script in Script Workspace and paste.

## Why a new script

`Save or Update Order` reads the raw `cart` and `order.splits`, so:

| Problem in Save or Update Order                                                                       | Place Order                                                                             |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Every shipping group goes into one `order_group`                                                      | One `order_group` per `groups[]` entry                                                  |
| Loops the ship-tos but keeps only the last `office_address_id`, set to the Klai ref (`loc-…`)         | One shipment per location with the address-book id (`location_id`) and `boxes_per_item` |
| `product_code` = `nameKey`, `catalogue_id` = product code, `mobile` = `displayPhone` (does not exist) | `product_code`, `catalogue_id`, `phone` from the payload                                |
| `quantity` from `split.qtys`, empty when missing                                                      | `quantity` from the payload, always set                                                 |
| Finds an "existing" order by the first item id, so a repeated cart line can update an old order       | Always creates a new order                                                              |
| No print PDFs                                                                                         | Print PDF per item, from `cards[]`                                                      |
| Nothing goes back to the page                                                                         | Sets `orderId`, or `submitError` + `submitting = 0`                                     |

`BF - onUtility - review` also has a bug: the "clear the cart" block is inside
`If [ $type = "loadCart" ]`, nested in `If [ $type = "submit" ]`, so it never runs. The new
block clears `cartJSON` after a successful Place Order.

## What it reads

`$$BF_Model.orderPayload` (Vue `src/helpers/orderPayload.js`, Klai `review-submitOrder.js`).
In Vue, Place Order shows the exact payload on the Confirmed page ("Order data for FileMaker").

```
order       order_type, cart_status, date, contact_id, full_name, email, currency,
            group_count, item_count, total_items, total_shipping, print_pdf_status
groups[]    group_ref, shipment_number, count_locations, total_items, total_shipping
  items[]   line_ref, product_code, catalogue_id, language, quantity, cards,
            unit_price, price, card { name, title, title_fr, degrees[],
            additional_credentials, region, specialized_team, email, phone,
            office_address, website }
  locations[] location_ref, location_id, location_type, boxes_per_item, cards_per_item,
            address { address_name, address_contact, company, street_1, street_2,
            city, province, postal_code, country, phone, email, one_line }
cards[]     line_ref, language, print_pdf_file_name, print_pdf_base64
```

## Where each value goes

| Payload                                                                  | Table occurrence :: field                                                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `$$BF_User.id`                                                           | `store_BFUsers_order::contact_id`                                                                                                                |
| `store_BFUsers::name` / `::email`                                        | `store_BFUsers_order::name` / `::customerEmail`                                                                                                  |
| `"Ordered"`                                                              | `store_BFUsers_order::status`                                                                                                                    |
| `order.order_type`, `total_items`, `total_shipping`                      | `store_BFUsers_order::` same names                                                                                                               |
| `Get ( CurrentDate )`                                                    | `store_BFUsers_order::date`                                                                                                                      |
| `$orderId`, `count_locations`, whole group JSON                          | `store_BFUsers_order_group::order_id`, `::count_locations`, `::asJSON`                                                                           |
| `$orderId`, `$groupId`, `line_ref`                                       | `store_BFUsers_order_group_items::order_id`, `::group_id`, `::ops_item_id`                                                                       |
| `product_code`, `catalogue_id`, `language`, `quantity`                   | items `::` same names                                                                                                                            |
| `unit_price`                                                             | items `::unit_sell_price`                                                                                                                        |
| `card.name`, `title`, `region`, `email`                                  | items `::name`, `::title`, `::region`, `::email`                                                                                                 |
| `card.degrees[]` (joined ", ")                                           | items `::degree`                                                                                                                                 |
| `card.additional_credentials`                                            | items `::additionalCredentials`                                                                                                                  |
| `card.specialized_team`                                                  | items `::team`                                                                                                                                   |
| `card.phone`                                                             | items `::mobile`                                                                                                                                 |
| `card.office_address`                                                    | items `::address`                                                                                                                                |
| whole item JSON                                                          | items `::fullJSON`                                                                                                                               |
| `cards[].print_pdf_base64` (same `line_ref`)                             | items `::PrintImage` (container, `Base64Decode`)                                                                                                 |
| `price`, `$userId`                                                       | items `::total_sell`, `::contact_id`                                                                                                             |
| `$orderId`, `$groupId`, `location_id`, `location_type`, `boxes_per_item` | `store_BFUsers_order_group_shipment::order_id`, `::group_id`, `::location_id`, `::location_type`, `::boxes_per_item`, `::asJSON` (location JSON) |

## Addresses: id + type

Ship-tos come from **two tables** with their own ids, so an id alone is not enough
(office 1224 and a personal address can both exist with the same number):

| `location_type` | Table                                                | Loaded on Shipping/Review as |
| --------------- | ---------------------------------------------------- | ---------------------------- |
| `office`        | `Store_OfficeAddresses::id`                          | `offices`                    |
| `personal`      | `db_addresses::id` (layout `store_BFuser_addresses`) | `personalAddresses`          |

Each shipment stores **`location_id` + `location_type`** and nothing else about the address.
The address is looked up, never copied. `locations[].address` stays in the payload for logs and
the Confirmed page only. Vue has no backend: the payload is only logged to the console and shown
on the Confirmed page.

**FileMaker setup** on `store_BFUsers_order_group_shipment`:

1. Field `location_type` (Text).
2. Calculation fields (Number, unstored is fine):
   - `personal_address_id` = `If ( location_type = "personal" ; location_id )`
   - `office_address_id` = `If ( location_type = "office" ; location_id )`
3. Relationships: `personal_address_id` = `db_addresses::id`, and
   `office_address_id` = `Store_OfficeAddresses::id`. Point the existing
   `…shipment_addresses` occurrence at `personal_address_id` instead of `location_id`.

Before creating anything, the script checks every ship-to has a numeric `location_id` and a
`location_type` of `office` or `personal`. Otherwise it stops with `submitError` "Ship-to address
1 of shipment 1 is not saved in your Address Book…". So Shipping "+ Add new address" must save
through the Address Book (`BF - onUtility - addresses`, which returns `payload.newId`) before it
is picked. Klai temp ids (`local-…`) fail the check.

## Check after pasting

Names marked here could not be read from the file (Genie Privacy Mode had nothing selected).
FileMaker shows `<Field Missing>` / `<unknown>` for any that do not match; re-pick those.

- **Layouts** (pasted with id 0, so re-pick if they show `<unknown>`): `store_BFUsers_order`,
  `store_BFUsers_order_group`, `store_BFUsers_order_group_items`,
  `store_BFUsers_order_group_shipment`, `BF Users Setup`.
- Print PDF goes in the existing `store_BFUsers_order_group_items::PrintImage` container;
  `boxes_per_item` (Number) was added to `store_BFUsers_order_group_shipment`.
- **`Perform Script [ "Place Order" ]`** in the onUtility block: re-pick the script if it shows `<unknown>`.

## What goes back to the page (do not echo the order)

The hook log for order 2179 showed `review / submit`: **payload 269 837, result 263 765** bytes.
The result was the request again plus `orderId`: FileMaker sends the whole `$$BF_Model` back, and
that model holds `orderPayload.cards[].print_pdf_base64` (about 210 000 characters per card).

Only three keys need to go back. In **Place Order**, every `Set Variable [ $$BF_Model ; … ]`
(4 error exits + the success step, 5 in all) starts from an empty object instead of the model:

```
# success (last step)
Set Variable [ $$BF_Model ; JSONSetElement ( "{}" ;
    [ "orderId" ; $orderId ; JSONString ] ;
    [ "submitError" ; "" ; JSONString ] ;
    [ "submitting" ; 0 ; JSONNumber ] ) ]

# each error exit
Set Variable [ $$BF_Model ; JSONSetElement ( "{}" ;
    [ "submitError" ; $error ; JSONString ] ;
    [ "submitting" ; 0 ; JSONNumber ] ) ]
```

i.e. replace `JSONSetElement ( $$BF_Model ;` with `JSONSetElement ( "{}" ;`. `fm-place-order.xml`
already has it. Nothing else in `BF - onUtility - review` writes `$$BF_Model` after Place Order.

Why this is safe: the hook state has `modelUpdateMode = merge` (both in the request and the
result), so Klai merges the returned keys into the page model. `cart`, `order` and `orderPayload`
stay on the page; they just do not travel back. The result drops to well under 1 KB.

| Returned key  | Read by                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| `orderId`     | Review `submitOrder` step 4 → `app.lastOrderId` → Confirmed "Order ID #2179" |
| `submitError` | Review: shown above the cart; non-empty = stay on Review                     |
| `submitting`  | Review: re-enables Place Order                                               |

Also worth checking: Review has `sendFullSchema: true`, so each hook also carries the page
schema (including the PDF script text). Catalogue uses `false`.

## Errors

Every commit is checked. The first error stops the loops; the page gets
`submitError = "Saving item 2 of shipping group 1 (FileMaker error 102)"` and `submitting = 0`,
and the user stays on Review. Records saved before the error stay in the file. If the file is
on FileMaker 2023 or later, wrap the body in `Open Transaction` / `Commit Transaction`
(`Revert Transaction` on error) so a failed order leaves nothing behind.

## Klai side (still to port)

The Review `submitOrder` named action must call the hook **after** the payload and PDFs are
built, with `modelFilterKeys: ["cart", "order", "orderPayload"]`, and only go to `/confirmed`
when `submitError` is empty. Today the hook runs first, before `orderPayload` exists.
