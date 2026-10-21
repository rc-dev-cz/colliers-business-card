import { WEBSITE_FR } from './formatCardIdentity.js'

/** Placeholder used only as a geometry fixture when Title | Region must overflow. */
export var TITLE_TODO = 'Titre à compléter — équivalent français requis'

/** Only this French title shrinks to fit the identity lane (Cynthia, Oct 2026). */
export var TITLE_FR_TALENT_ACQUISITION = 'Partenaire d’affaires sénior en acquisition de talent'

/** French titles use the typographic apostrophe (’); older cards may still hold a straight one. */
export function curlyApostrophes(text) {
  return String(text || '').replace(/'/g, '’')
}

/**
 * Details clone for the bilingual French preview face. The French title is picked by the
 * user (titleFr); there is no English → French mapping, so an empty one shows "Titre".
 */
export function bilingualFrenchPreviewDetails(details) {
  var src = details || {}
  return Object.assign({}, src, {
    website: WEBSITE_FR,
    title: String(src.titleFr || '').trim(),
    // Keep the English title so the preview can check both faces (cardFaceTitles).
    titleEn: src.titleEn || src.title,
    bilingualFaces: true,
  })
}

/** English face of a bilingual card: same details, flagged so the preview checks both faces. */
export function bilingualEnglishPreviewDetails(details) {
  return Object.assign({}, details || {}, { bilingualFaces: true })
}
