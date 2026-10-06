# Print PDF samples (client handoff)

**Generated:** `npm run export:print-pdfs` (EN / FR / bilingual) · `npm run export:print-pdf-json` (placeholder, short, long) · `npm run export:approval-guide` (PNGs)

**JSON cases:** [`short-long-examples.json`](short-long-examples.json). Standard approval / EN / FR / bilingual are Hannah **without** team. Short JSON is Hannah **with** team.

| File | What to look at |
| --- | --- |
| `Colliers-Sample-Placeholder-EN.pdf` | Empty card: Firstname Lastname, Title, Specialized team, C.M. |
| `Colliers-Sample-Placeholder-FR.pdf` | Empty French card: Prénom Nom, Titre, Équipe spécialisée, C.M. |
| `Colliers-Sample-EN.pdf` | Typical English finished card (Hannah, inline degrees, **no** team) + blue back |
| `Colliers-Sample-FR.pdf` | Same person, French wordmark + back |
| `Colliers-Sample-Bilingual.pdf` | EN face + FR face (2 pages, no blue backs) |
| `Colliers-Sample-Short.pdf` | Standard / short **with** specialized team |
| `Colliers-Sample-Long.pdf` | Maximum / long: 2-line name, own-row credentials, team, extra air above email |
| `Colliers-Sample-Long-FR.pdf` | Same Maximum stack, French wordmark |
| `Colliers-Print-PDF-Approval-Standard.png` | Typical finished card (approval) |
| `Colliers-Print-PDF-Approval-Maximum.png` | Demanding but still valid finished card (approval) |
| `Colliers-Print-PDF-Credentials-Spacing.png` | Side-by-side inline vs own-row credentials (current rules) |
| `LAYOUT-GUIDE.md` | Written guide for the team |

## Specs for Mark / Cynthia

- Trim **3.5″ × 2″**, bleed **⅛″** each side → media **3.75″ × 2.25″**
- TrimBox / ArtBox set on every page (no crop marks in file)
- **RGB proof** from `pdf-lib` (Colliers blue `#03438C`). Not DeviceCMYK — expect Mark’s press RIP to convert; physical print test answers CMYK match vs sample cards
- Open Sans vector text + approved lockup PNGs (mark + EN/FR wordmarks)

**Offices on the card:** street, city/province, postal Canada. Office name stays in the picker/admin only. Example: `1400-181 Bay Street` / `Toronto, ON`.
