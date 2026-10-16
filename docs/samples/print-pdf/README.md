# Print PDF samples (client handoff)

**Generated:** `npm run export:print-pdfs` (EN / FR / bilingual) · `npm run export:print-pdf-json` (placeholder, short, long) · `npm run export:approval-guide` (PNGs)

**JSON cases:** [`short-long-examples.json`](short-long-examples.json) — layout **verification** PDFs (not order samples). Short/long bilingual use Customize title pickers (`title` + `titleFr`) and long emails (≤ 50 chars).

| File                                           | What to look at                                                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Colliers-Sample-Placeholder-EN.pdf`           | Empty card: Firstname Lastname, Title, Specialized team, C.M.                                              |
| `Colliers-Sample-Placeholder-FR.pdf`           | Empty French card: Prénom Nom, Titre, Équipe spécialisée, C.M.                                             |
| `Colliers-Sample-EN.pdf`                       | Typical English finished card (Hannah, inline degrees, **no** team) + blue back                            |
| `Colliers-Sample-FR.pdf`                       | Same person, French wordmark + back                                                                        |
| `Colliers-Sample-Bilingual.pdf`                | EN face + FR face (2 pages, no blue backs) — approval Standard fixture                                     |
| `Colliers-Sample-Short.pdf`                    | Short EN: Project Manager \| Ontario, team, inline credentials                                             |
| `Colliers-Sample-Short-Bilingual.pdf`          | Short bilingual: Project Manager / Gestionnaire de Projet, long email                                      |
| `Colliers-Sample-Long.pdf`                     | Long EN: Business Development Manager, own-row credentials, long email                                     |
| `Colliers-Sample-Long-FR.pdf`                  | Long FR: Responsable du développement commercial, long email                                               |
| `Colliers-Sample-Long-Bilingual.pdf`           | Long bilingual: EN+FR selected titles, long email, FR may split region                                     |
| `Colliers-Print-PDF-Approval-Split-NoTeam.pdf` | Locked bilingual print file: split credentials, title \| Nova Scotia, **no** team row (empty team omitted) |
| `Colliers-Print-PDF-Approval-Standard.png`     | Typical finished card (approval)                                                                           |
| `Colliers-Print-PDF-Approval-Maximum.png`      | Demanding but still valid finished card (approval)                                                         |
| `Colliers-Print-PDF-Credentials-Spacing.png`   | Side-by-side inline vs own-row credentials (current rules)                                                 |
| `LAYOUT-GUIDE.md`                              | Written guide for the team                                                                                 |

## Specs for Mark / Cynthia

- Trim **3.5″ × 2″**, bleed **⅛″** each side → media **3.75″ × 2.25″**
- TrimBox / ArtBox set on every page (no crop marks in file)
- **RGB proof** from `pdf-lib` (Colliers blue `#03438C`). Not DeviceCMYK — expect Mark’s press RIP to convert; physical print test answers CMYK match vs sample cards
- Open Sans vector text + approved lockup PNGs (mark + EN/FR wordmarks)

**Offices on the card:** street, city/province, postal Canada. Office name stays in the picker/admin only. Example: `1400-181 Bay Street` / `Toronto, ON`.
