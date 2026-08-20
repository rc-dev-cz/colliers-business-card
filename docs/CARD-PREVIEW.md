# Business card preview — designer briefing

Use this note to coordinate **print size, colours, type, and field placement** for the live card preview (and later the PDF proof). It describes what the Vue prototype does today, the real-data problems that layout must survive, and the questions we need answered before we lock the card.

**Audience:** designer + product + print vendor  
**Source in code:** `src/components/CardPreview.vue`  
**Related:** [BUSINESS-RULES.md](BUSINESS-RULES.md) §4 · [USR-031](TICKETS.md#usr-031) live preview · [USR-095](TICKETS.md#usr-095) View Business Card Proof

---

## What we need from this conversation

The on-screen preview is a **stand-in for the printed card**. It is not yet a print-ready PDF. If the preview lies about size, colour, or overflow, people will approve a card that cannot print.

Please treat this as a layout spec, not a UI polish pass. We need:

1. Physical size (trim / bleed / safe area).
2. Confirmed Colliers colours and fonts for **print**.
3. A placement map for every item, including overflow rules.
4. How **real emails** and **mobile numbers** behave when they are long.
5. Whether English / French / Bilingual cards share one layout or need three.

---

## Current prototype (what we built)

The preview is a landscape rectangle at **aspect 1.75 : 1** (same ratio as a 3.5″ × 2″ North American card). Positions are **percentages of the card**, so the layout scales on the Customize, Details, and catalogue tiles.

```
┌─────────────────────────────────────────────────────────────┐
│  [Colliers logo block]     NAME  (max 2 lines, bold, navy)  │
│   navy + 3 colour bars     Title | Canada                   │
│                            Colliers                         │
│                            CA Lic. 02328392   ← placeholder │
│                                                             │
│  Office address            email@colliers.com  ← truncated  │
│  (2–3 lines)               Mobile: +1 416 555-1234          │
│                            colliers.com/canada              │
└─────────────────────────────────────────────────────────────┘
```

| Zone | Position (of card) | Content today |
| --- | --- | --- |
| Logo | Left 6.5%, top 12%, width 25.5% | “Colliers” wordmark on navy, then cyan / yellow / orange bars |
| Identity | Left 42%, right 4%, top 14% | Name, title, company, licence line |
| Address | Bottom 13%, left 6.5%, right 57% | Selected Colliers office, multiline |
| Contact | Bottom 13%, left 42%, right 4% | Email, mobile, website |

This is a **best-effort recreation**. It is not locked brand artwork. Do not assume the logo mark, bar heights, or type sizes match print.

---

## Size

### What we assume

| | Prototype | Typical NA card (to confirm) |
| --- | --- | --- |
| Ratio | 1.75 : 1 | 3.5″ × 2″ (89 × 51 mm) |
| Screen chrome | Rounded corners + grey border | Print has neither |
| Bleed | None | Usually 0.125″ / 3 mm |
| Safe area | Roughly 6.5% inset | Usually 0.125″ inside trim |

### Please confirm

- [ ] **Trim size** in inches and mm (front). Is the back the same size?
- [ ] **Bleed** and **safe / type area**. How close may text sit to the edge?
- [ ] **Orientation** — landscape only, or is a portrait version ever used?
- [ ] **Screen vs print** — should the web preview be the exact print art (including bleed crop marks), or a simplified “what it will look like” card?
- [ ] **PDF proof** ([USR-095](TICKETS.md#usr-095)) — same art as the live preview, or a separate print PDF from the vendor?
- [ ] **Stock** — details page says premium 16pt, matte or glossy. Does finish change colour appearance enough that we should preview it?

If trim is **not** 3.5″ × 2″, the 1.75 : 1 preview is wrong and we should change it.

---

## Colours

Values used in the prototype. These are **screen hex**, not print (CMYK / Pantone).

| Role | Hex today | Where |
| --- | --- | --- |
| Card background | `#EEEEEE` | Full card |
| Name | `#25408F` | Identity |
| Body text | `#4A4A4A` | Title, address, email, phone, website |
| Logo field | `#24418A` | Wordmark background (slightly different from name navy) |
| Stripe cyan | `#00A9E0` | Logo bar |
| Stripe yellow | `#FFD100` | Logo bar |
| Stripe orange | `#E35205` | Logo bar |
| Wordmark | `#FFFFFF` | “Colliers” on the logo |

App chrome also uses `#25408F` as Colliers primary (`tailwind.config.js`).

### Please confirm

- [ ] Official **print** swatches (Pantone and/or CMYK) for navy, cyan, yellow, orange, grey, and background.
- [ ] Should name navy and logo navy be **the same** colour? Today they are `#25408F` vs `#24418A`.
- [ ] Is the card background **light grey** `#EEEEEE`, **white**, or a brand off-white?
- [ ] Any rules we must not break (minimum contrast, no tints of brand colours, no extra colours)?
- [ ] English / French / Bilingual — same colours, or does bilingual use a different treatment?

---

## Type

| Element | Prototype today |
| --- | --- |
| Name | Sans, bold, ~4.2% of card width, max 2 lines, wraps |
| Title / company / licence | Sans, ~2.6% of card width |
| Address / email / phone / website | Same body size |
| Logo wordmark | Serif, white |
| Body font on screen | Inter / Open Sans / Helvetica / Arial |

### Please confirm

- [ ] **Print fonts** (family, weight) for name, body, and the Colliers wordmark. Screen webfonts will not match print.
- [ ] **Point sizes** on the 3.5″ × 2″ card (name, body, wordmark).
- [ ] **Line height** and tracking.
- [ ] Minimum type size for print (we should not shrink email below this).

---

## Field map — what goes on the card

Locked vs editable comes from [BUSINESS-RULES.md](BUSINESS-RULES.md) §4.

| Item | Source | Limit / format today | On the card today | Open |
| --- | --- | --- | --- | --- |
| Full name | User | Guide: **50 characters**, 2 lines. Vue still caps at 30 ([USR-032](TICKETS.md#usr-032)) | Top right, navy, wraps to 2 lines | Line break: auto, or user-controlled? |
| Designation / title | Dropdown | One today; **one or more** later ([USR-039](TICKETS.md#usr-039)) | Under the name | Where do extra designations go? Same line, stacked, abbreviations? |
| Company | Locked | Always **Colliers** | Under title | Confirm it always prints |
| Licence | Hardcoded | `CA Lic. 02328392` | Under company | Real field? Per person? Hide if empty? |
| Office address | Office list | 2 lines from FileMaker (street; city + province + postal) | Bottom left | 3-line offices? Suite on its own line? |
| **Email** | User | Guide: **40 characters**, “fits on one line”. Vue still 30 ([USR-034](TICKETS.md#usr-034)) | Bottom right, **CSS truncate (ellipsis)** | See [Email](#email--this-is-the-main-risk) |
| **Mobile** | User | Canadian **+1** + 10 digits, formatted `+1 416 555-1234` | `Mobile: {number}` | See [Mobile](#mobile-number) |
| Website | Locked | Always **colliers.com/canada** | Under mobile | Confirm URL and whether `https://` prints |
| Logo | Brand | Not user-editable | Top left | Official mark / clear space |

The preview **must** show the same name, email, phone, and office as the order. Do not pair a short demo name with a long unrelated email ([USR-095](TICKETS.md#usr-095), [ADM-N5](TICKETS.md#adm-n5)).

---

## Email — this is the main risk

We should print the **real work email**, not a shortened stand-in. Colliers addresses are usually `firstname.lastname@colliers.com`. That string is often longer than a 3.5″ card line at body size.

### Why 40 characters is tight

`@colliers.com` is already **13** characters. That leaves **27** for the local part under the current 40-character rule.

| Example | Characters | Fits in 40? |
| --- | --- | --- |
| `jane.doe@colliers.com` | 21 | Yes |
| `carlos.zabaleta@colliers.com` | 27 | Yes |
| `christopher.montgomery@colliers.com` | 34 | Yes |
| `jean-francois.tremblay@colliers.com` | 34 | Yes |
| `hubert.wolfeschlegelstein@colliers.com` | 40 | Exactly — current stress name |
| `firstname.middlename.lastname@colliers.com` | often 40+ | **No** |

Today the preview **cuts with an ellipsis** (`truncate`). That is wrong for a printed card: the user would approve `christopher.montgome…` and the printer would not know the rest.

### Please decide (pick one overflow rule)

1. **Wrap to 2 lines** — keep the full address, smaller block.
2. **Shrink type** until it fits one line — down to a minimum point size you set.
3. **Raise the field limit** above 40 **and** wrap/shrink so print never ellipsizes.
4. **Ellipsis on screen only** — never on the PDF/print file (we do not recommend this unless print is a different pipeline).

Also:

- [ ] Is **40 characters** still the product max, or should we raise it for real Colliers emails?
- [ ] All-lowercase vs preserve what the user types?
- [ ] Must email stay on **one line**, or may it wrap?
- [ ] If it wraps, does mobile / website shift down, or is the contact block a fixed height?

**Ask the designer to mock these three emails on the real card size** (not a desktop mockup):

1. `jane.doe@colliers.com`
2. `christopher.montgomery@colliers.com`
3. `hubert.wolfeschlegelstein@colliers.com`

---

## Mobile number

Prototype format: **`Mobile: +1 416 555-1234`**

That prefix + number is long enough to collide with a wrapped email in the same column.

### Please confirm

- [ ] Label: always **Mobile**, **Mobile:**, **T**, **C**, or no label?
- [ ] **French card / French UI:** `Mobile`, `Cellulaire`, `Portable`, or icon only? Today the word “Mobile” is hardcoded English on every product.
- [ ] Format on print: `+1 416 555-1234` vs `416.555.1234` vs `(416) 555-1234`?
- [ ] Country code: always **+1**, or omit for Canadian cards?
- [ ] Is this the **only** phone? No office / fax / direct line?
- [ ] If email wraps to two lines, does mobile stay on the next line, or move?

---

## Name, designations, address

### Name

Guide: max **50 characters**, **two lines** on the card. Stress string in the prototype:

```
Hubert Blaine
Wolfeschlegelstein
```

- [ ] Auto-wrap at a character count, or a dedicated “line 2” in the form?
- [ ] If the name is short, does the title move up, or stay pinned?
- [ ] Preferred line break for hyphenated or multi-part names?

### Designations (later: more than one)

Examples: `PMP`, `LEED AP`, plus the job title (`Associate | Canada`).

- [ ] Is “Associate | Canada” a **job title**, a **designation**, or both? The form label is Title; the guide says Designation.
- [ ] Two or three designations: same line with commas / pipes, or stacked under the name?
- [ ] Maximum designations that still fit?

### Licence

- [ ] Is `CA Lic. 02328392` real brand content, a California licence, or leftover demo text?
- [ ] Per employee, per office, or omitted for Canada cards?
- [ ] If omitted, does the block collapse?

### Office address

Printed as two lines from FileMaker, for example:

```
181 Bay Street, Suite 1400
Toronto, ON M5J 2T3
```

- [ ] Confirm line split (suite on line 1 vs its own line).
- [ ] Longest office we must support (please send 2–3 real long offices).
- [ ] Country line (`Canada`) — print it or not?

---

## Three products, one layout?

Catalogue has **English**, **French**, and **Bilingual** cards. The prototype uses **one layout** for all three.

- [ ] Same front for all three products?
- [ ] Bilingual: both languages on the **front**, or EN front / FR back?
- [ ] French card: French labels (`Mobile` → ?) and French title list?
- [ ] Website: always `colliers.com/canada`, or a French URL on the French card?

---

## Front / back / proof

- [ ] What is on the **back**? Logo only, empty, or more contact info?
- [ ] Does the user preview **front only**, or both sides?
- [ ] For “View Business Card Proof”, do we show this preview, or a vendor PDF?
- [ ] Who generates print files — us from this layout, or the print partner from our field dump?

---

## Suggested test set (please design against these)

Use **matching** name + email (do not mix a short name with someone else’s long email).

| # | Name | Email | Phone | Why |
| --- | --- | --- | --- | --- |
| 1 | Jane Doe | `jane.doe@colliers.com` | `+1 416 555-1234` | Short / happy path |
| 2 | Christopher Montgomery | `christopher.montgomery@colliers.com` | `+1 514 555-0199` | Typical long Colliers email, one line |
| 3 | Hubert Blaine Wolfeschlegelstein | `hubert.wolfeschlegelstein@colliers.com` | `+1 604 555-0100` | Max name (2 lines) + max email (40) |
| 4 | Marie-Claire Jean-Baptiste | `marie-claire.jean-baptiste@colliers.com` | `+1 418 555-0142` | Hyphens; email may exceed 40 |
| 5 | Two designations | same as #1 + `PMP` + `LEED AP` | same | Future [USR-039](TICKETS.md#usr-039) |

Plus the **longest real office address** from Manage Addresses.

---

## What to send us back

A short written answer is enough. Ideal attachments:

1. **Artboard** at real trim size (3.5″ × 2″ or whatever you confirm), with bleed and safe area.
2. **Placement map** (named layers or a labelled PNG): name, title, designations, licence, address, email, mobile, website, logo.
3. **Overflow rules** in one sentence each for name, email, mobile, address, extra designations.
4. **Colour** (Pantone/CMYK) and **type** (family, weight, pt size).
5. **Three email mocks** from the test set above.
6. Note on **EN / FR / Bilingual** — one layout or three.

---

## Decision log

Fill this in after the review. Dev will follow this table, not the prototype, once it is signed.

| Topic | Decision | Date |
| --- | --- | --- |
| Trim size | | |
| Bleed / safe area | | |
| Background colour | | |
| Navy (name vs logo) | | |
| Print fonts + pt sizes | | |
| Email: wrap / shrink / limit | | |
| Email character max | 40 until changed | |
| Mobile label + format | | |
| Licence line | | |
| Extra designations | | |
| EN / FR / Bilingual layout | | |
| Front vs back | | |
| Screen preview vs print PDF | | |
