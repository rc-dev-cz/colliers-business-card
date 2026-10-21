# Staged for Klai Studio (not pushed yet)

Everything else in `docs/klai/` matches the live Studio records. These files are **built and tested but not saved to Studio**: push them once the Vue branch has been checked.

## Review page: card thumbnail + preview popup (same as Vue)

Page `Review` (`FR_5659051D-291C-FA49-8633-0B947F410E9A`):

| File                    | Goes to                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `review.html`           | page HTML (`pages[0].schema.fields[0].fields[1].html`)                                     |
| `review-refreshView.js` | named action `refreshView`: adds `previewModel: 'cart.<index>.details'` to every line      |
| `review-previewLine.js` | **new** named action `previewLine`: copy of Shipping's, opens the EN/FR popup sized to fit |

What it does: each item row shows the card thumbnail (same `CardPreview` component and `previewModel` path Shipping uses) plus the language line; clicking the thumbnail opens the popup with one card, or two for bilingual. Rows are vertically centred like Vue.

Tested offline: `refreshView` gives the right `previewModel` for every line (also inside each shipping group), and `previewLine` opens a popup with the right number of cards for English and bilingual lines. The existing labels `previewCard` and `language` are already in the site dictionary.

Save with a normal `update_page` (read the record first and resend the full `form.namedActions` plus `styleClassesPage` / `styleClassesBody`; `submitOrder` must stay as it is: function, function, runUtilityHook, function).

## Not built for Klai

- Contact Us page (`/contact-us`) and the footer link: needs a new Studio page and route.
