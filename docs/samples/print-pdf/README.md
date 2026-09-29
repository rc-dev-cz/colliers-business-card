# Print PDF samples (client handoff)

**Generated:** `npm run export:print-pdfs`  
**Files:** EN / FR / bilingual with mock Kevin Collins data (Toronto office).

| File | Pages |
| --- | --- |
| `Colliers-Sample-EN.pdf` | Front + blue legal back |
| `Colliers-Sample-FR.pdf` | Front (FR wordmark) + back |
| `Colliers-Sample-Bilingual.pdf` | EN front/back + FR front/back (4) |
| `Colliers-Print-PDF-Approval-Standard.png` | Typical finished card (approval) |
| `Colliers-Print-PDF-Approval-Maximum.png` | Demanding but still valid finished card (approval) |
| `LAYOUT-GUIDE.md` | Written guide for the team |

## Specs for Mark / Cynthia

- Trim **3.5″ × 2″**, bleed **⅛″** each side → media **3.75″ × 2.25″**
- TrimBox / ArtBox set on every page (no crop marks in file)
- **RGB proof** from `pdf-lib` (Colliers blue `#03438C`). Not DeviceCMYK — expect Mark’s press RIP to convert; physical print test answers CMYK match vs sample cards
- Open Sans vector text + approved lockup PNGs (mark + EN/FR wordmarks)

Vue app: Customize → **View print PDF**. Klai mirror sync is a separate follow-up.
