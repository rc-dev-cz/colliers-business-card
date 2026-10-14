import { isBilingualLanguage, isFrenchLanguage, WEBSITE_FR } from './formatCardIdentity.js'

/**
 * Placeholder on the bilingual French preview face when no EN→FR pair exists.
 * Long on purpose so Title | Region overflows and the preview stacks region under title
 * (pipe removed on the split). Replace via TITLE_EN_TO_FR when Colliers supplies pairs.
 */
export var TITLE_TODO = 'Titre à compléter — équivalent français requis'

/**
 * Confirmed English → French title pairs only.
 * Leave empty until Colliers / FileMaker supplies the official table — do not invent pairs.
 */
export var TITLE_EN_TO_FR = {}

function frenchMapValues() {
  return Object.keys(TITLE_EN_TO_FR).map(function (key) {
    return TITLE_EN_TO_FR[key]
  })
}

/**
 * Resolve the title for a bilingual French card face.
 * Mapped EN → FR; already-French map values kept; otherwise TITLE_TODO.
 * Empty title stays empty so Customize placeholders can show Titre.
 */
export function resolveBilingualFrenchTitle(title) {
  var trimmed = String(title || '').trim()
  if (!trimmed) return trimmed
  if (TITLE_EN_TO_FR[trimmed]) return TITLE_EN_TO_FR[trimmed]
  if (frenchMapValues().indexOf(trimmed) !== -1) return trimmed
  return TITLE_TODO
}

/**
 * Face-language resolver. English (and bilingual product lang) returns the input.
 * French → mapped value or TITLE_TODO. Pure French Customize should not call this —
 * use bilingualFrenchPreviewDetails only when building the bilingual FR preview slot.
 */
export function resolveTitleForLanguage(title, language) {
  var trimmed = String(title || '').trim()
  if (!trimmed) return trimmed
  if (!isFrenchLanguage(language) || isBilingualLanguage(language)) return trimmed
  return resolveBilingualFrenchTitle(trimmed)
}

/** Details clone for the bilingual French preview face (website + resolved title). */
export function bilingualFrenchPreviewDetails(details) {
  var src = details || {}
  return Object.assign({}, src, {
    website: WEBSITE_FR,
    title: resolveBilingualFrenchTitle(src.title),
  })
}
