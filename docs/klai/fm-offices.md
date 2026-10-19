# FileMaker: company offices (`Store_OfficeAddresses`)

Company offices live in their own table, `Store_OfficeAddresses` (layout `Store_OfficeAddresses`).
Personal Address Book entries stay in `store_BFuser_addresses`.

An office is listed when `address_type = "office"` and `active` is empty or 1. Removing an office in Klai sets `active = 0`
(the record stays, so past orders keep their address). The table stores `address_country = "CA"`; Klai shows "Canada".

## Scripts

| Script | Change | Snippet |
| --- | --- | --- |
| `BF - onFormRequest - adminaddresses` | Replace. Admin only; sets `offices` | [`fm-onFormRequest-adminaddresses.xml`](fm-onFormRequest-adminaddresses.xml) |
| `BF - onUtility - adminaddresses` | Replace. `save` creates (`address_type = office`, `active = 1`, returns `payload.newId`) or edits by `id`; `delete` sets `active = 0` | [`fm-onUtility-adminaddresses.xml`](fm-onUtility-adminaddresses.xml) |
| `BF - onFormRequest - addresses` | Add the office block above "Do not edit below this line" | [`fm-offices-block.xml`](fm-offices-block.xml) |
| `BF - onFormRequest - customize` | Add the office block; remove the `Else` redirect | [`fm-offices-block.xml`](fm-offices-block.xml) |
| `BF - onFormRequest - shipping` | Replace (office block + personal addresses) | [`fm-onFormRequest-shipping.xml`](fm-onFormRequest-shipping.xml) |

Calculations use `Char ( 13 )`, not `¶`: a pasted `¶` can turn into `¬∂`, and FileMaker then comments the calculation out. `Set Field` and `Go to Layout` steps reference fields and the layout by name (id 0). After pasting, check none shows
`<Field Missing>` or `<unknown>`.

## Shape (`offices`)

```json
[{ "id": "1224", "addressName": "Burlington A", "addressStreet": "300-5515 North Service Road", "addressStreet2": "",
   "addressCity": "Burlington", "addressProvince": "ON", "addressPostalZip": "L7L 6G4", "addressCountry": "Canada" }]
```

Klai adds `line`, `listLabel` and `cardAddress` on the page.
