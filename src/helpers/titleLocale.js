import { isBilingualLanguage, isFrenchLanguage, WEBSITE_FR } from './formatCardIdentity.js'

/**
 * Placeholder used only as a geometry fixture when Title | Region must overflow.
 * Live bilingual Customize uses titleFr / suggestFrenchTitle instead.
 */
export var TITLE_TODO = 'Titre à compléter — équivalent français requis'

/**
 * Confirmed English → French title pairs (Cynthia / Colliers, Oct 2026).
 * Unknown English titles fall back to the English string so the field stays editable.
 */
export var TITLE_EN_TO_FR = {
  'Business Development Manager': 'Responsable du développement commercial',
  Director: 'Directrice',
  'Senior Project Manager': 'Gestionnaire de projets Senior',
  'Team Lead': "Chef d'équipe",
  'Project Manager': 'Gestionnaire de Projet',
  'Project Director': 'Gestionnaire de projets principal',
  'Assistant Project Manager': 'Gestionnaire de projet adjoint',
  'Talent Acquisition Business Partner': "Partenaire d'affaires sénior en acquisition de talent",
}

function frenchMapValues() {
  return Object.keys(TITLE_EN_TO_FR).map(function (key) {
    return TITLE_EN_TO_FR[key]
  })
}

/** Direct map, else identity so the bilingual field stays editable. */
export function suggestFrenchTitle(title) {
  var trimmed = String(title || '').trim()
  if (!trimmed) return ''
  if (TITLE_EN_TO_FR[trimmed]) return TITLE_EN_TO_FR[trimmed]
  if (frenchMapValues().indexOf(trimmed) !== -1) return trimmed
  return trimmed
}

export function resolveBilingualFrenchTitle(title) {
  return suggestFrenchTitle(title)
}

/**
 * Face-language resolver. English (and bilingual product lang) returns the input.
 * French → mapped value or identity fallback.
 */
export function resolveTitleForLanguage(title, language) {
  var trimmed = String(title || '').trim()
  if (!trimmed) return trimmed
  if (!isFrenchLanguage(language) || isBilingualLanguage(language)) return trimmed
  return suggestFrenchTitle(trimmed)
}

/** Details clone for the bilingual French preview face (website + titleFr or mapped title). */
export function bilingualFrenchPreviewDetails(details) {
  var src = details || {}
  var frenchTitle = String(src.titleFr || '').trim()
  if (!frenchTitle) frenchTitle = suggestFrenchTitle(src.title)
  return Object.assign({}, src, {
    website: WEBSITE_FR,
    title: frenchTitle,
  })
}
