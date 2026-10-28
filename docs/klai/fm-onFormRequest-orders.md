# FileMaker: `BF - onFormRequest - orders`

Order History lists each order from `store_BFUsers_order::asJSONsmall` (id, date, status). That
object has no lines, so Cardholder, Item and Qty stayed empty and View had nothing to show.

Place Order already saves every shipping group whole in `store_BFUsers_order_group::asJSON`
(items with their card, locations with `boxes_per_item`; see [fm-place-order.md](fm-place-order.md)).
Send those groups with each order; Klai rebuilds the lines from them
([`orderHistory-filterOrders.js`](orderHistory-filterOrders.js), Vue `orderFromFileMaker`).

## Add inside the loop, after `Set Variable [ $order ; store_BFUsers_order::asJSONsmall ]`

```
# Shipping groups as Place Order saved them, for the lines and shipments
Set Variable [ $groups ; Value: ExecuteSQL (
    "SELECT \"asJSON\" FROM \"store_BFUsers_order_group\" WHERE \"order_id\" = ?" ;
    "" ; "," ;
    store_BFUsers_order::id ) ]
If [ not IsEmpty ( $groups ) and $groups ≠ "?" ]
    Set Variable [ $order ; Value: JSONSetElement ( $order ; "groups" ; "[" & $groups & "]" ; JSONArray ) ]
End If
```

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

- `store_BFUsers_order::id` must be the value Place Order wrote to `store_BFUsers_order_group::order_id`
  (`$orderId`). If one field is Text and the other Number, pass `GetAsText` / `GetAsNumber` so they match.
- `ExecuteSQL` returns `?` on an error (a wrong table or field name). Then `groups` is left out and the
  row still shows its id, date and status.
- Orders saved before Place Order (2172–2183 on Oct 19–27) may have no group `asJSON`; they keep empty
  Cardholder / Item / Qty.
- Order: Klai sorts newest first and shows FileMaker's `Ordered` as Processing, so no Sort step is needed.
- `BF - onFormRequest - adminorders` (Admin Order History) takes the same step, plus `employeeName`.
