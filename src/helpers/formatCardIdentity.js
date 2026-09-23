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

/** ICT sample shown after the name comma until a degree or credential is entered. */
export var SAMPLE_CREDENTIAL = 'C.M.'

/** Card-face samples for empty optional lines. Not "(Optional)" labels. */
/** Shown on the customize preview until an office address is selected. */
export var SAMPLE_ADDRESS = {
  EN: 'Address name\nUnit, Street\nCity, Province\nPostal Code, Country',
  FR: "Nom de l'adresse\nUnité, Rue\nVille, Province\nCode postal, Pays",
}

export var OPTIONAL_PREVIEW = {
  EN: {
    credential: SAMPLE_CREDENTIAL,
    region: 'Region',
    team: 'Specialized team',
    address: SAMPLE_ADDRESS.EN,
  },
  FR: {
    credential: SAMPLE_CREDENTIAL,
    region: 'Région',
    team: 'Équipe spécialisée',
    address: SAMPLE_ADDRESS.FR,
  },
}

function optionalPreview(language) {
  return isFrenchLanguage(language) ? OPTIONAL_PREVIEW.FR : OPTIONAL_PREVIEW.EN
}

/**
 * Credential text for the customize preview and the print PDF. Empty degree and
 * credentials show the ICT sample "C.M." after the name comma.
 */
export function previewCredentialText(degree, extra, language) {
  var real = formatCredentialSuffix(degree, extra)
  if (real) return real
  return optionalPreview(language).credential
}

/** Title line for the customize preview. Empty region keeps its label. */
export function previewTitleText(title, region, language) {
  var french = isFrenchLanguage(language)
  var labels = optionalPreview(language)
  var sampleTitle = french ? 'Titre' : 'Title'
  var regionPart = region != null ? String(region).trim() : ''
  return formatTitleLine(title, regionPart || labels.region, sampleTitle, labels.region)
}

/** Team line for the customize preview. Empty team keeps its label. */
export function previewTeamText(team, language) {
  var text = team != null ? String(team).trim() : ''
  if (text) return text
  return optionalPreview(language).team
}

/** Address block for the customize preview. Empty address keeps the four-line sample. */
export function previewAddressText(address, language) {
  var text = address != null ? String(address).trim() : ''
  if (text) return text
  return optionalPreview(language).address
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
