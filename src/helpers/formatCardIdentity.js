/** Join degree list (string or array) and optional free-text credentials with commas. */
export function formatCredentialSuffix(degree, extra) {
  var parts = []
  if (Array.isArray(degree)) {
    degree.forEach(function (item) {
      var text = String(item || '').trim()
      if (text) parts.push(text)
    })
  } else if (degree != null && degree !== '') {
    var single = String(degree).trim()
    if (single) parts.push(single)
  }
  var credentials = extra != null ? String(extra).trim() : ''
  if (credentials) parts.push(credentials)
  return parts.join(', ')
}

/**
 * Build the card identity line: "Name, Deg1, Deg2, C.M."
 * Returns '' when both name and credentials are empty.
 */
export function formatNameLine(name, degree, extra) {
  var n = String(name || '').trim()
  var suffix = formatCredentialSuffix(degree, extra)
  if (n && suffix) return n + ', ' + suffix
  return n || suffix || ''
}

/**
 * Title | Region line. Region always comes from the region field — never from a
 * "| …" suffix baked into a title option (legacy "Broker | Canada" values).
 */
export function formatTitleLine(title, region, sampleTitle, sampleRegion) {
  var titlePart = ''
  if (Array.isArray(title) && title.length) {
    titlePart = title
      .map(function (item) {
        return String(item || '').trim()
      })
      .filter(Boolean)
      .join(' | ')
  } else if (typeof title === 'string' && title.trim()) {
    titlePart = title.trim()
  }
  // Drop legacy region suffix embedded in title options
  if (titlePart.indexOf('|') !== -1) {
    titlePart = titlePart.split('|')[0].trim()
  }
  var regionPart = region != null ? String(region).trim() : ''
  if (titlePart && regionPart) return titlePart + ' | ' + regionPart
  if (titlePart) return titlePart
  if (regionPart) return (sampleTitle || 'Title') + ' | ' + regionPart
  return (sampleTitle || 'Title') + ' | ' + (sampleRegion || 'Region')
}

export var WEBSITE_EN = 'colliersprojectleaders.com'
export var WEBSITE_FR = 'colliersprojectleaders.com/fr'

export function isFrenchLanguage(language) {
  var lang = String(language || '')
  return lang === 'French' || lang === 'Français' || lang === 'FR' || /french|fran\w*|fr\b/i.test(lang)
}

export function isBilingualLanguage(language) {
  return /bilingual|bilin/i.test(String(language || ''))
}

/** Locked website for the customize form (bilingual keeps EN URL). */
export function websiteForProduct(language) {
  if (isFrenchLanguage(language) && !isBilingualLanguage(language)) return WEBSITE_FR
  return WEBSITE_EN
}
