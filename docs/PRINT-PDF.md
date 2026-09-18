# Print PDF (bleed)

**Status:** view + download (Sep 2026)  
**Primary runtime:** **Vue web app** (`CustomizePage` → View print PDF)  
**Klai:** Customize button → `viewPrintPdf` named action (anchor download; Studio-safe)  
**Code:** [src/helpers/printPdf.js](../src/helpers/printPdf.js) · Klai mirror [docs/klai/viewPrintPdf.js](klai/viewPrintPdf.js)  
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
| Klai | pdf-lib CDN via `BF.libraryLoadOnce` |
| Fonts | Open Sans Regular / Bold (same family as the approved EN print PDF) |

## Layout parity (preview ↔ PDF)

The download is a **print file**, not a screenshot of the web preview. Screen captures look fine on a monitor and go soft when printed.

- Page is still 3.75″ × 2.25″ (trim + bleed). Bleed is empty white — **no crop marks**; TrimBox/ArtBox mark the 3.5″ × 2″ finish
- Logo + “Project Leaders” use the approved EN artwork at the original coordinates
- Body type is Open Sans 10 / 7 / 6.5 pt (`#03438C` / `#5F636A`) like the original
- Layout is planned before draw: credentials are all-or-nothing (inline on the name, one dedicated row, or invalid). Right-column fields do not wrap.
- Bilingual: two pages; both pages must validate before the file is created; French tagline is Open Sans “Maîtres de projets” at the same lockup position
- Unique filename each click so the browser never reopens a stale Downloads file

## Klai notes

- Live fields bind to `model.card`. Customize inlines the preview (`model.card.name` etc.) — `bfcomp` CardPreview scopes/clones `model` and does not track form edits. Catalogue still uses `<bfcomp name="CardPreview" :model="product.previewKey">`.
- Console: `[viewPrintPdf] card snapshot` for field debug.
- Errors: `[viewPrintPdf]` + BF error alert.

## Later

- FileMaker base64 → Mark’s Press handoff (no end-user download in production path).
