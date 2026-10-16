# FileMaker: `BF - onFormRequest - addresses` — minimal fix

Two edits to the existing script. Nothing else changes.

## 1. `Show All Records` (dev only)

Kept for now: there are no Klai users yet, so every address loads. It throws the find away, so **remove it before real users log in**, or every user sees every user's addresses.

## 2. Add the address fields to the existing `grouped` step

Fields from `db_addresses` (layout `store_BFuser_addresses`). Klai's Address Book City column, Edit form and the order payload read these keys.

```
JSONSetElement( $address
;	[ "grouped" ; Count( store_BFuser_address_group_link_addresses::active ) ; JSONBoolean ]
;	[ "addressStreet2" ; store_BFuser_addresses::address_street2 ; JSONString ]
;	[ "addressCity" ; store_BFuser_addresses::address_city ; JSONString ]
;	[ "addressProvince" ; store_BFuser_addresses::address_province ; JSONString ]
;	[ "addressPostalZip" ; store_BFuser_addresses::address_postal_zip ; JSONString ]
;	[ "addressCountry" ; store_BFuser_addresses::address_country ; JSONString ]
)
```

Paste-ready script: `fm-onFormRequest-addresses.xml`.
