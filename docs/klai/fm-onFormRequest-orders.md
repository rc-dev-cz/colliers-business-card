# FileMaker: `BF - onFormRequest - orders`

Order History lists each order from `store_BFUsers_order::asJSONsmall` (id, date, status). That
object has no lines, so Cardholder, Item and Qty stayed empty and View had nothing to show.

Place Order already saves every shipping group whole in `store_BFUsers_order_group::asJSON`
(items with their card, locations with `boxes_per_item`; see [fm-place-order.md](fm-place-order.md)).
Send those groups with each order; Klai rebuilds the lines from them
([`orderHistory-filterOrders.js`](orderHistory-filterOrders.js), Vue `orderFromFileMaker`).

## Add inside the loop, after `Set Variable [ $order ; store_BFUsers_order::asJSONsmall ]`

Paste-ready: [`fm-onFormRequest-orders-groups.xml`](fm-onFormRequest-orders-groups.xml) (5 steps). Put it on the
clipboard as FileMaker script steps, then in Script Workspace click the `$order` line and paste:

```bash
osascript -e 'set the clipboard to (read (POSIX file "docs/klai/fm-onFormRequest-orders-groups.xml") as «class XMSS»)'
```

What it does (built-in functions only; field names stay field references, so a wrong name shows
`<Field Missing>` after pasting):

```
# Shipping groups as Place Order saved them …
Set Variable [ $groups ; ExecuteSQL ( SELECT asJSON FROM store_BFUsers_order_group
    WHERE STRVAL ( order_id ) = GetAsText ( store_BFUsers_order::id ) AND asJSON IS NOT NULL ) ]
    → "[" & rows & "]", or empty on an SQL error ("?") or invalid JSON
If [ not IsEmpty ( $groups ) ]
    Set Variable [ $order ; JSONSetElement ( $order ; "groups" ; $groups ; JSONArray ) ]
End If
```

`STRVAL` makes the match work whether `order_id` is a Text or Number field.

Each order then looks like:

```json
{
  "id": "ORD-2185",
  "date": "2026-10-28",
  "status": "Ordered",
  "groups": [
    {
      "group_ref": "group-1",
      "shipment_number": 1,
      "items": [{ "line_ref": "line-…", "product_code": "BCAD-PL-BIL", "language": "Bilingual",
                  "quantity": 3, "unit_price": 63, "card": { "name": "…", "title": "…" } }],
      "locations": [{ "location_ref": "loc-…", "boxes_per_item": 2,
                      "address": { "one_line": "300-5515 North Service Road, Burlington, ON L7L 6G4" } }]
    }
  ]
}
```

## Check after adding

- `store_BFUsers_order::id` must be the value Place Order wrote to `store_BFUsers_order_group::order_id` (`$orderId`).
- On an SQL error, or a group `asJSON` that is not valid JSON, `groups` is left out and the row still shows
  its id, date and status; the orders list never breaks.
- Orders saved before Place Order (2172–2183 on Oct 19–27) may have no group `asJSON`; they keep empty
  Cardholder / Item / Qty.
- Order: Klai sorts newest first and shows FileMaker's `Ordered` as Processing, so no Sort step is needed.
- `BF - onFormRequest - adminorders` (Admin Order History) takes the same step, plus `employeeName`.
