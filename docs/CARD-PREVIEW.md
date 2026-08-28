# Business card preview — true-size pivot

**Status:** Product pivot (Aug 2026)  
**Audience:** product + design + engineering  
**Source in code today:** `src/components/CardPreview.vue` (responsive stand-in only)  
**Related:** [BUSINESS-RULES.md](BUSINESS-RULES.md) §4 · `USR-031` live preview · `USR-095` View order card preview

---

## The pivot

We are changing what “preview the card” means.

**Before:** A scaled CSS recreation that fills the layout column. Useful for “does my name/email show up,” weak for “will this feel like the real card.”

**Now:** A **true-size virtual preview** — the on-screen card is meant to match a real Colliers card you can **put on the screen** and compare. That physical overlay is the product insight. If the digital card and the printed one line up (or nearly line up), the preview earned its keep.

This is not AR and not a camera feature in v1. It is **print-sized on glass**: hold your existing card against the display and see the customized front at the same footprint.

---

## Why this is the goal

1. **Trust before order** — People already know what a business card feels like. Matching that size is more convincing than a large mock in a form column.
2. **Layout honesty** — Overflow, type size, and margins only make sense at ~3.5″ × 2″. A stretched preview hides problems emails and long names will hit in print.
3. **Simple “wow”** — No new hardware. Phone or laptop + any physical card (Colliers sample, old card, or a credit card for calibration) is enough to get the idea.

The responsive tile preview can stay for catalogue / cart chrome. **Customize, proof, and “view card” are where true-size matters.**

---

## What we want to build

### Core experience

| Piece | Intent |
| --- | --- |
| **True-size stage** | Card rendered at physical trim (default target: **3.5″ × 2″** / 89 × 51 mm) on a calm surface, not stretched to the column. |
| **Place-your-card affordance** | Clear “lay a real card here” silhouette or corner marks so the gesture is obvious. |
| **Live data** | Same fields as today: name, title(s), company, licence (if real), office, email, mobile, website — matching the order (`USR-031`, `USR-095`). |
| **Optional calibrate** | One-time (or per device) slider / “match this to a credit card” so CSS inches track the real screen PPI. Without this, “3.5in” in CSS is often wrong. |
| **Front first** | Front only until design locks the back. |

### Explicitly later (not this pivot)

- Camera / AR overlay on a desk
- Print-ready PDF with bleed and crop marks (may still be vendor-owned)
- Pixel-perfect brand artwork until design delivers locked art

### Modes vs current component

| Context | Preview mode |
| --- | --- |
| Catalogue tile, cart row | Keep **fluid** aspect `1.75 : 1` (current `CardPreview.vue`) |
| Customize | **True-size** primary; fluid optional if space is tight (mobile) |
| Order proof / USR-095 | **True-size** |

---

## Technical reality (so we do not over-promise)

Browsers treat `1in` as **96 CSS px**, not a measured inch on every panel. Retina, Windows scaling, and phone density all lie.

So the pivot has two layers:

1. **Nominal true-size** — `width: 3.5in; height: 2in` (or equivalent mm). Good enough for many desktop monitors; wrong on many phones without help.
2. **Calibrated true-size** — User aligns a known object (credit card ~85.6 × 54 mm, or a printed Colliers card) to on-screen guides; we store a device scale factor (localStorage). That is what makes “put it on the screen” reliable.

v1 can ship nominal + a short “this may not match every screen” note. Calibration is the upgrade that makes the gesture trustworthy.

---

## Success criteria

Someone with a printed Colliers card (or any 3.5″ × 2″ card) can:

1. Open Customize or View card preview.
2. See an on-screen card at roughly real size with a place-here cue.
3. Lay their card on the glass and see the footprints match within a small tolerance (after calibration on that device).
4. Confirm their **own** name / email / phone / office on that footprint — no demo mismatch.

If we cannot get within a usable tolerance on common laptop screens after calibration, the pivot failed and we fall back to “large faithful mock + PDF proof.”

---

## Open product questions

- [ ] Confirm **trim** is 3.5″ × 2″ (if not, true-size is wrong — same as before).
- [ ] Is true-size the **default** on Customize, or behind a “Actual size” control?
- [ ] Do we **calibrate** in v1, or ship nominal inches first?
- [ ] Calibration object: Colliers sample card, any business card, or credit card?
- [ ] Mobile: true-size often **wider than the viewport** — scroll stage, pinch-zoom, or “rotate / use desktop for actual size”?
- [ ] Does **USR-095** “View Business Card Proof” become this experience, a vendor PDF, or both?

---

## Still needed from design (unchanged problems)

True-size does not remove the layout briefing. It makes the answers more urgent: at real size, long emails and names fail visibly.

Keep answering:

1. Bleed / safe area and official colours / fonts for print.
2. Placement map for every field.
3. **Email overflow** — wrap, shrink, or raise the 40-char limit (never approve an ellipsis that print cannot print).
4. Mobile label + format; licence line real or demo; EN / FR / Bilingual — one layout or three.
5. Front vs back; who generates the print file.

### Field map (current prototype)

| Zone | Position (of card) | Content today |
| --- | --- | --- |
| Logo | Left 6.5%, top 12%, width 25.5% | Colliers wordmark on navy + cyan / yellow / orange bars |
| Identity | Left 42%, right 4%, top 14% | Name, title, company, licence placeholder |
| Address | Bottom 13%, left 6.5%, right 57% | Selected office |
| Contact | Bottom 13%, left 42%, right 4% | Email (truncated today), mobile, website |

Full colour / type / overflow checklists and the email stress set remain the designer handoff; true-size is how we **review** those mocks, not a replacement for them.

### Suggested stress set (design at real trim)

| # | Name | Email | Why |
| --- | --- | --- | --- |
| 1 | Jane Doe | `jane.doe@colliers.com` | Short |
| 2 | Christopher Montgomery | `christopher.montgomery@colliers.com` | Typical long Colliers email |
| 3 | Hubert Blaine Wolfeschlegelstein | `hubert.wolfeschlegelstein@colliers.com` | Max name + max email |
| 4 | Marie-Claire Jean-Baptiste | `marie-claire.jean-baptiste@colliers.com` | Hyphens; may exceed 40 |

Use **matching** name + email. Plus the longest real office from Manage Addresses.

---

## Proposed build order

1. **Doc + alignment** — this pivot (done). Confirm trim and Customize UX with product.
2. **True-size stage** — Customize (and proof modal): card at 3.5″ × 2″ + place-here outline; keep fluid `CardPreview` for tiles.
3. **Calibration** — credit-card or business-card aligner; persist scale per browser.
4. **Layout lock** — apply designer art, overflow rules, drop ellipsis on email.
5. **Proof path** — wire `USR-095` to the same true-size view (and/or vendor PDF when available).

---

## Decision log

| Topic | Decision | Date |
| --- | --- | --- |
| Preview product goal | **True-size / place-card-on-screen** (not only fluid CSS mock) | 2026-08-24 |
| Trim size | | |
| Nominal vs calibrated v1 | | |
| True-size default on Customize | | |
| Mobile behaviour when card &gt; viewport | | |
| USR-095 = true-size UI vs vendor PDF | | |
| Bleed / safe area | | |
| Email: wrap / shrink / limit | | |
| Email character max | 40 until changed | |
| Mobile label + format | | |
| Licence line | | |
| EN / FR / Bilingual layout | | |
| Front vs back | | |
