# Print PDF (bleed)

**Status:** view + download (Sep 2026); **print layout LOCKED** for approval — see [LAYOUT-GUIDE.md](samples/print-pdf/LAYOUT-GUIDE.md)  
**Primary runtime:** **Vue web app** (`CustomizePage` → View print PDF)  
**Klai:** Customize button → `viewPrintPdf` named action (anchor download; Studio-safe) — **sync pending (separate job)**  
**Code:** [src/helpers/printPdf.js](../src/helpers/printPdf.js) · Klai mirror [docs/klai/viewPrintPdf.js](klai/viewPrintPdf.js)  
**Samples:** [docs/samples/print-pdf/](samples/print-pdf/) (`npm run export:print-pdfs`)  
**Approval images (locked):** [LAYOUT-GUIDE.md](samples/print-pdf/LAYOUT-GUIDE.md) (`npm run export:approval-guide`)  
**Agent lock:** [.cursor/rules/print-pdf-layout-lock.mdc](../.cursor/rules/print-pdf-layout-lock.mdc)  
**Related (separate):** [CARD-PREVIEW.md](CARD-PREVIEW.md) is on-screen preview sizing — **not** this print file.

## How to try it

### Vue web

1. `npm run dev`
2. Product → **Customize**
3. Fill fields → **View print PDF**

### Klai Customize

1. Open Customize (preview or Studio).
2. Click **View print PDF** under the card preview.
3. Browser downloads `Colliers-Business-Card.pdf` (3.75″ × 2.25″ with bleed/marks).
4. On failure, a BF alert shows the error (CDN / library / draw).

**Studio note:** `window.open(blob)` is unreliable in Klai iframes. Klai uses `<a download>` with a **unique filename** each click (`Colliers-Business-Card-{name}-{timestamp}.pdf`) so the browser never reopens a stale Downloads entry.

## Geometry

| Spec | Value |
| --- | --- |
| Trim | 3.5″ × 2″ |
| Bleed | 0.125″ (⅛″) each side |
| Media box | **3.75″ × 2.25″** (270 × 162 pt at 72 pt/in) |
| Page boxes | Media/Crop/Bleed = full media; **TrimBox/ArtBox** = 9,9 → 261,153 (matches approved EN InDesign) |
| Safe inset | ~0.125″ inside trim |
| Marks | None (no crop marks) |

## Stack

| Layer | Choice |
| --- | --- |
| Vue | `pdf-lib` + **Open Sans** (vector text) + original Colliers lockup artwork |
| Klai | `pdf-lib` + `@pdf-lib/fontkit` + Open Sans TTFs (CDN). **Not** html2canvas. |
| Fonts | Open Sans Regular / Bold for the card. Wordmarks are the print PNGs from the official lockup |
| Klai artwork | Same **mark + wordmark PNGs** as Vue (`colliers-logo-mark.png`, `lockup-words-en.png`, `lockup-words-fr.png`) from Klai file assets. pdf-lib embeds PNG. |

## Layout parity (preview ↔ PDF)

The download is a **print file**, not a screenshot of the web preview. Screen captures look fine on a monitor and go soft when printed.

- Page is still 3.75″ × 2.25″ (trim + bleed). Bleed is empty white — **no crop marks**; TrimBox/ArtBox mark the 3.5″ × 2″ finish
- Logo mark + “Project Leaders” / “Maîtres de projets” use the approved artwork at the original coordinates
- Body type is Open Sans 10 / 7 / 6.5 pt (`#03438C` / `#5F636A`) like the original
- Layout is planned before draw: credentials that all fit after the name stay inline; if they do not, shorter tokens fill the name line first (by measured width) and the remainder uses the dedicated credential row when it still fits. Right-column fields do not wrap. Email may use **132 pt** on one line (character count alone is not enough).
- Bilingual: two pages; both pages must validate before the file is created; French uses `lockup-words-fr.png`
- Unique filename each click so the browser never reopens a stale Downloads file

## Klai notes

- Live fields bind to `model.card`. Customize inlines the preview (`model.card.name` etc.) — `bfcomp` CardPreview scopes/clones `model` and does not track form edits. Catalogue still uses `<bfcomp name="CardPreview" :model="product.previewKey">`.
- PDF is built with the same geometry as Vue (`270×162` media, trim `9,9,252,144` on **front and back**). The previous Helvetica/text-logo file was ~2 KB; Vue is ~215 KB because it embeds Open Sans + artwork.
- Console: `[viewPrintPdf]` on failure + BF error alert.

## Client print-test handoff (Sep 2026)

Sample PDFs for Kevin → Cynthia → Mark live in [docs/samples/print-pdf/](samples/print-pdf/) (`npm run export:print-pdfs`).

- Files are **RGB proofs** (not DeviceCMYK). Mark’s press RIP converts color; physical cards answer CMYK match vs Colliers samples.
- Geometry: trim 3.5″ × 2″, ⅛″ bleed, TrimBox/ArtBox set; no crop marks.
- Vue is the source of truth for this milestone. **Klai `viewPrintPdf` sync is a separate follow-up.**

## Later

- FileMaker base64 → Mark’s Press handoff (no end-user download in production path).
- DeviceCMYK / ICC in the generator if press feedback requires it.
