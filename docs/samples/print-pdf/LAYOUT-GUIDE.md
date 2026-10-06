# Print PDF approval guide

**Status: LOCKED** — latest best generated version for design approval (Sep 2026).  
Do not redesign the card or change production geometry without an explicit unlock.

These two images are for design approval. They are **not** a layout redesign. Each card face is a raster of the **generated production PDF**.

| Image | What to look at |
| --- | --- |
| **[`Colliers-Print-PDF-Approval-Standard.png`](Colliers-Print-PDF-Approval-Standard.png)** | Typical finished card using approved sample content |
| **[`Colliers-Print-PDF-Approval-Maximum.png`](Colliers-Print-PDF-Approval-Maximum.png)** | Finished card using a demanding but still valid combination of allowed content |
| **[`Colliers-Print-PDF-Credentials-Spacing.png`](Colliers-Print-PDF-Credentials-Spacing.png)** | Side-by-side: Standard inline vs Maximum own-row, with **PDF baseline Y** callouts (used lines, address max slots, approved air above email) |

Regenerate (only after an intentional, approved layout change): `npm run export:approval-guide`  
Filled samples: [`Colliers-Sample-EN.pdf`](Colliers-Sample-EN.pdf) · [`Colliers-Sample-FR.pdf`](Colliers-Sample-FR.pdf) · [`Colliers-Sample-Bilingual.pdf`](Colliers-Sample-Bilingual.pdf)

Code: [`src/helpers/cardLayout.js`](../../src/helpers/cardLayout.js) · [`src/helpers/printPdf.js`](../../src/helpers/printPdf.js) · fixtures [`src/helpers/approvalSamples.js`](../../src/helpers/approvalSamples.js)

Agent rule: [`.cursor/rules/print-pdf-layout-lock.mdc`](../../../.cursor/rules/print-pdf-layout-lock.mdc)

---

## Source of truth

Use the generated production PDF as the source of truth for page geometry and final placement.

`3_5x2_BusCrd_MASTER.pdf` is **trim-only** (252 × 144 pt). It is used as a visual/layout reference, but it is **not** the source of truth for MediaBox, BleedBox, or bleed.

The approval images should reproduce the actual generated PDF, not redraw the card from approximate measurements.

---

## Production geometry

| Spec | Value |
| --- | --- |
| MediaBox / BleedBox | 270 × 162 pt (3.75 × 2.25 in) |
| TrimBox | `[9, 9, 261, 153]` |
| Final trim | 252 × 144 pt (3.5 × 2 in) |
| Bleed | 9 pt / 1/8 in on every side |
| Address column | X = 27 pt · 80 pt wide · bottom Y = 27 pt · up to 5 lines |
| Identity column | X = 113.03 pt · 130 pt available width |

MASTER coordinates sit on the trim canvas. On the production bleed canvas they translate by approximately **+9 pt X and +9 pt Y**.

Examples:

- MASTER address X ≈ 18 → production X = 27
- MASTER identity X ≈ 104 → production X ≈ 113.03

Do not convert production coordinates back to MASTER coordinates.

---

## Standard card

The Standard image shows the normal finished card:

- One-line name with short credentials **inline** after the name (e.g. `Hannah Sharpe, B.Comm, PMP`)
- When the full credential list does not fit after the name, **shorter tokens** (by measured width) stay on the name line and the remainder uses the credential row
- Title | Region
- Team when present
- Email
- Mobile
- Website
- Street, city/province, postal Canada (office **name is not printed** on the card)

The card should visually match the generated sample PDF and Cynthia’s reference placement for credentials and title.

The last address line and the website share baseline **Y = 27**. Email and mobile stack up from there (43 / 35 / 27).

On Standard (inline / no own-row credentials), name stays at **75.49** and title at **66.99**. Contacts stay bottom-locked (email 43). The unused band between title (or team) and email is the **client-approved short-card gap**. Do not pack short cards up from email.

On Maximum / own-row credentials **with team**, lift the identity block so the last identity line matches Standard team Y (**58.99**). That leaves the same ~16 pt air above email that Cynthia requested (Oct 2026). Email / mobile / website stay at 43 / 35 / 27.

Optional rows are omitted when empty.

---

## Maximum-content card

The Maximum image is a **valid stress case**, not an overflow example.

It should demonstrate the most demanding supported content while remaining inside the approved layout.

Expected behavior:

- Name can use up to two lines
- Credentials pack by measured width: shorter tokens after the name, remainder on the credential row (up to **2 selected degrees** plus optional Additional Credentials)
- Title | Region remains below the name / credential area
- Team remains optional
- Email stays on one line
- Mobile stays on one line
- Website stays on one line
- Address can use up to five lines and remains bottom-aligned
- No field may cross the approved content width or enter the bleed area
- Own-row / split + team lifts the identity block so the last line sits at **58.99**, leaving ~16 pt above email (Cynthia, Oct 2026). Contacts stay at 43 / 35 / 27.

The exact vertical positions should come from the generated production PDF. Do **not** invent new spacing rules from the diagram.

---

## Email width rule

The email is limited by **rendered width**, not character count alone.

For the current layout:

- Font: Open Sans Regular
- Size: 6.5 pt
- Available identity width (name, title, website): 130 pt
- Available email width: **132 pt** (Open Sans Regular 6.5 pt)
- Start X: 113.03 pt
- Maximum email end X: 245.03 pt (~16 pt remaining to trim)

The email must:

1. Stay on one line
2. Render at **132 pt wide or less**
3. Stay inside the email lane
4. Never enter the bleed

A character-count limit may still exist as a form validation rule, but it is **not sufficient by itself** to guarantee that the email fits.

The Maximum approval fixture uses a name-derived Colliers-domain email that still fits the
132 pt email lane (`christopher.hw@colliersprojectleaders.com`, ≈ 131.20 pt). The address is an official
office street block (`1066 West Hastings…`). The Standard fixture uses Hannah Sharpe at Ottawa (Iris Street) with
inline `B.Comm, PMP`.

---

## How to approve

Review the two images visually.

### Standard

Confirm that the typical card matches the approved sample PDFs.

### Maximum

Confirm that the most demanding valid content still fits without:

- clipping
- overlap
- unexpected wrapping
- text entering the bleed
- address or identity content crossing their approved widths

Measurements belong **outside** the artwork.

The dashed line represents the final trim.

If both the Standard and Maximum cards look correct, the layout can be approved.
