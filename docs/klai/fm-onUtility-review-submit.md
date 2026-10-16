# FileMaker: `BF - onUtility - review` (type `submit`) — draft

Place Order on Review runs named action `submitOrder`:

1. `review-submitOrder.js` builds `model.orderPayload` (same shape as Vue `src/helpers/orderPayload.js`)
2. `review-buildPrintPdfs.js` builds one print-ready PDF per ordered card and keeps its base64 in
   localStorage `colliers-print-pdfs` (Vue: `colliers-v2.printPdfs`, `src/helpers/orderPdfs.js`), last 3 orders,
   keyed by `order.date`. It is **not** part of the order request (sending ~210 000 characters per card in the
   same request broke Place Order). A PDF problem never blocks the order.
3. `runUtilityHook` `{ type: "submit", modelFilterKeys: ["cart", "order", "orderPayload"] }`
4. JS: if `submitError` is empty → console "Order confirmed" → `/confirmed`

This draft is for the FileMaker side of step 2. Table names follow the relationship graph
(`store_BFUsers_order` → `_order_group` → `_order_group_items` / `_order_group_shipment`).
Shipment addresses go to `sync_BR_order_group_shipment_addresses` (see Order Group Sync Dashboard).

## Payload (what `$$BF_Model.orderPayload` contains)

```json
{
  "order": {
    "order_type": "business_cards", "cart_status": "submitted", "date": "2026-10-15T21:00:50.678Z",
    "contact_id": null, "full_name": null, "email": "demo", "currency": "CAD",
    "group_count": 1, "item_count": 2, "total_items": 252, "total_shipping": null
  },
  "groups": [{
    "group_ref": "group-1", "shipment_number": 1, "count_locations": 2,
    "items": [{
      "line_ref": "line-1", "product_code": "BCAD-PL-ENG", "catalogue_id": null, "language": "English",
      "qty": 2, "cards": 500, "unit_price": 63, "price": 126,
      "card": { "name": "Firstname Lastname", "title": "Associate", "title_fr": null, "degrees": [],
                "additional_credentials": null, "region": null, "specialized_team": null,
                "email": "first.lastname@colliersprojectleaders.com", "phone": "555 555 5555",
                "office_address": "…", "website": "colliersprojectleaders.com" }
    }],
    "locations": [{
      "location_ref": "loc-…", "location_id": 1, "location_type": "office",
      "boxes_per_item": 1, "cards_per_item": 250,
      "address": { "address_name": "Burlington Office", "address_contact": null, "company": null,
                   "street_1": "300-5515 North Service Road", "street_2": null, "city": "Burlington",
                   "province": "ON", "postal_code": "L7L 6G4", "country": "Canada",
                   "phone": null, "email": null, "one_line": "300-5515 North Service Road, Burlington, ON L7L 6G4" }
    }],
    "total_items": 126, "total_shipping": null
  }]
}
```

Notes:

- `*_ref` values only link rows inside one payload. FileMaker creates the real ids.
- `location_id` is `null` when the address is not found in `offices` / `personalAddresses` on the model.
  Add both lists to `BF - onFormRequest - review` (same as Shipping) so ids resolve. The full
  `address` object is always sent, so the shipment address can be created either way.
- `boxes_per_item`: boxes of **each** item in that group sent to that address (Shipping box picker).
- Blank text is `null`, money is a number rounded to cents.
- Print PDFs (base64, about 210 000 characters per card, 3.75 x 2.25 in with bleed; bilingual cards have EN + FR
  faces and the blue back) are saved in the browser by line id: `{ "<order.date>": { "<line_ref>": { "file_name", "base64" } } }`.
  To get them into FileMaker without enlarging the order request, send them in a second request per card after the
  order exists (Base64Decode into the container field).

## Script draft

```
# BF - onUtility - review
Set Variable [ $type ; JSONGetElement ( $$BF_Payload ; "options.type" ) ]
If [ $type ≠ "submit" ] Exit Script [ 1 ]

Set Variable [ $p ; JSONGetElement ( $$BF_Model ; "orderPayload" ) ]
If [ IsEmpty ( $p ) or JSONGetElement ( $p ; "groups[0]" ) = "" ]
  Set Variable [ $$BF_Model ; JSONSetElement ( $$BF_Model ; "submitError" ; "Nothing to order." ; JSONString ) ]
  Exit Script [ 1 ]
End If

# 1) Order header → store_BFUsers_order
Go to Layout [ "store_BFUsers_order" ] ; New Record/Request
Set Field [ store_BFUsers_order::contact_id ; <current user contact id> ]
Set Field [ store_BFUsers_order::asJSONcart ; JSONGetElement ( $$BF_Model ; "cart" ) ]   # keep raw cart for Order History "View"
Set Field [ … email / date / totals from JSONGetElement ( $p ; "order.*" ) … ]
Commit Records ; Set Variable [ $orderId ; store_BFUsers_order::id ]

# 2) Groups → items / shipments / shipment addresses
Set Variable [ $g ; 0 ]
Loop
  Exit Loop If [ $g ≥ ValueCount ( JSONListKeys ( $p ; "groups" ) ) ]
  Set Variable [ $group ; JSONGetElement ( $p ; "groups[" & $g & "]" ) ]

  Go to Layout [ "store_BFUsers_order_group" ] ; New Record/Request
  Set Field [ store_BFUsers_order_group::order_id ; $orderId ]
  Set Field [ store_BFUsers_order_group::count_locations ; JSONGetElement ( $group ; "count_locations" ) ]
  Commit Records ; Set Variable [ $groupId ; store_BFUsers_order_group::id ]

  # items[] → store_BFUsers_order_group_items (product_code, catalogue_id, group_id, qty, unit_price, price, card JSON)
  #   Print PDF (separate request, see notes): Set Field [ store_BFUsers_order_group_items::print_pdf ;
  #               Base64Decode ( $base64 ; $fileName ) ]
  # locations[] → store_BFUsers_order_group_shipment (group_id, location_id, boxes_per_item)
  #             → shipment_addresses (address_name, address_contact, street_1, street_2, city, province, postal_code, country)
  #   If location_id is null: create/match the address record first, then use its id.

  Set Variable [ $g ; $g + 1 ]
End Loop

# 3) Tell the page it worked
Set Variable [ $$BF_Model ; JSONSetElement ( $$BF_Model ;
    [ "orderId" ; $orderId ; JSONString ] ;
    [ "submitError" ; "" ; JSONString ] ;
    [ "submitting" ; 0 ; JSONNumber ] ) ]
Exit Script [ 1 ]
```

On any failure set `submitError` to a readable message and `submitting` to `0`. The page stays on Review and shows the error.
