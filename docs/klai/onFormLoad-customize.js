// Internal tools (the View print PDF button) show only on /customize?...&internal=1.
model.internalTools = /[?&]internal=1(&|$)/.test(String(window.location.hash || '')) ? 1 : 0
var code = ''
var id = ''
var lineId = ''
if (action && action.options) {
  if (action.options.code) code = action.options.code
  if (action.options.id != null) id = String(action.options.id).trim()
  if (action.options.lineId != null) lineId = String(action.options.lineId).trim()
}
var hash = (window.location && window.location.hash) || ''
if (!code) {
  var codeMatch = hash.match(/[?&]code=([^&]+)/)
  if (codeMatch) code = decodeURIComponent(codeMatch[1])
}
if (!id) {
  var idMatch = hash.match(/[?&]id=([^&]+)/)
  if (idMatch) id = decodeURIComponent(idMatch[1])
}
if (!lineId) {
  var lineMatch = hash.match(/[?&]lineId=([^&]+)/)
  if (lineMatch) lineId = decodeURIComponent(lineMatch[1])
}
var fresh = typeof app !== 'undefined' && app.customizeFresh
if (fresh && typeof app !== 'undefined') {
  app.customizeFresh = 0
  app.editLineId = null
  app.editCard = null
  app.proof = null
  lineId = ''
}
if (!code) code = model.code || ''
if (!id && model.id != null) id = String(model.id).trim()
if (!id) {
  var suffix = String(code).match(/(\d+)\s*$/)
  if (suffix) id = suffix[1]
}
model.code = code
model.id = id
model.editLineId = lineId
if (typeof app !== 'undefined' && lineId) app.editLineId = lineId
function isBilin(lang) {
  return /bilingual|bilin/i.test(String(lang || ''))
}
function isFrenchOnly(lang) {
  var s = String(lang || '')
  return (
    (s === 'French' || s === 'Français' || s === 'FR' || /french|fran\w*|fr\b/i.test(s)) &&
    !isBilin(s)
  )
}
function languageFromCode(raw, fallback) {
  var c = String(raw || '').toUpperCase()
  if (c.indexOf('BIL') >= 0 || c === 'BCAD-PL-BIL') return 'Bilingual'
  if (c === 'BCAD-PL-FR' || /(?:^|-)FR(?:-|$)/.test(c)) return 'French'
  if (c === 'BCAD-PL-ENG' || /(?:^|-)ENG(?:-|$)/.test(c)) return 'English'
  return fallback || ''
}
var product = _.find(model.products || [], function (row) {
  if (!row) return false
  if (code && row.code === code) return true
  if (id && String(row.id) === String(id)) return true
  return false
})
if (
  !product &&
  model.product &&
  ((code && model.product.code === code) || (id && String(model.product.id) === String(id)))
) {
  product = model.product
}
var hookLang =
  (model.product && model.product.language) || (model.card && model.card.language) || ''
if (!product && (code || id)) {
  var inferred =
    languageFromCode(code, '') ||
    (isBilin(hookLang) ? 'Bilingual' : isFrenchOnly(hookLang) ? 'French' : hookLang) ||
    'English'
  product = {
    code: code,
    id: id,
    language: inferred,
    nameKey:
      inferred === 'Bilingual'
        ? 'label_colliers_productBilingual'
        : inferred === 'French'
          ? 'label_colliers_productFrench'
          : 'label_colliers_productEnglish',
    price: 63,
  }
}
if (!product || !product.code) {
  model.product = {}
  model.notFound = 1
  return
}
if (!product.id && id) product.id = id
var lang = product.language || languageFromCode(product.code, '') || hookLang || 'English'
if (isBilin(lang) || languageFromCode(product.code, '') === 'Bilingual') lang = 'Bilingual'
else if (isFrenchOnly(lang) || languageFromCode(product.code, '') === 'French') lang = 'French'
product.language = lang
model.notFound = 0
model.product = {
  code: product.code,
  id: product.id || id,
  language: lang,
  nameKey:
    product.nameKey ||
    (lang === 'Bilingual'
      ? 'label_colliers_productBilingual'
      : lang === 'French'
        ? 'label_colliers_productFrench'
        : 'label_colliers_productEnglish'),
  price: product.price || 63,
}
model.card = model.card || {}
var c = model.card
if (c.name == null) c.name = ''
if (c.title == null) c.title = ''
if (c.email == null) c.email = ''
if (c.emailEdited == null) c.emailEdited = false
if (c.phone == null) c.phone = ''
if (c.address == null) c.address = ''
if (!Array.isArray(c.degree)) {
  c.degree = c.degree ? [c.degree] : []
}
if (c.additionalCredentials == null) c.additionalCredentials = ''
if (c.region == null) c.region = ''
if (c.specializedTeam == null) c.specializedTeam = ''
if (c.nameWrapped == null) c.nameWrapped = ''
c.language = lang
if (!c.company || c.company === 'Colliers') c.company = 'Colliers Project Leaders'
if (!c.website || c.website === 'colliers.com/canada') {
  c.website = isFrenchOnly(lang) ? 'colliersprojectleaders.com/fr' : 'colliersprojectleaders.com'
}
if (!c.websiteFr) c.websiteFr = 'colliersprojectleaders.com/fr'
// Title and degree lists come from FileMaker (`titles` records + `degrees` strings, BF - onFormRequest - customize).
// Seeds when FileMaker sends none: Colliers Project Leaders Titles.xlsx (31 EN), Titles French.xlsx (8 FR), Designations.xlsx (32), Oct 2026.
// English + bilingual cards list English titles; French-only cards list French titles. Bilingual cards pick the French title (no mapping).
var TITLES_EN = [
  'Advisor',
  'Assistant Preconstruction Manager',
  'Assistant Project Manager',
  'Associate',
  'Business Development Manager',
  'Director',
  'Director, Preconstruction',
  'Human Resources Business Partner',
  'Independent Consultant',
  'Manager',
  'Manager, Infrastructure Advisory',
  'Managing Principal',
  'National Sector Lead',
  'Preconstruction Manager',
  'Principal',
  'Professional Practice Specialist',
  'Project Director',
  'Project Manager',
  'Proposal Writer',
  'Regional Marketing Specialist',
  'Sector Director',
  'Senior Advisor',
  'Senior Associate - Infrastructure Advisory',
  'Senior Manager, Project Controls',
  'Senior Preconstruction Manager',
  'Senior Project Manager',
  'Senior Proposal Writer',
  'Senior Vice President',
  'Talent Acquisition Business Partner',
  'Team Lead',
  'Vice President',
]
var TITLES_FR = [
  'Chef d’équipe',
  'Directrice',
  'Gestionnaire de Projet',
  'Gestionnaire de projet adjoint',
  'Gestionnaire de projets principal',
  'Gestionnaire de projets Senior',
  'Partenaire d’affaires sénior en acquisition de talent',
  'Responsable du développement commercial',
]
// FileMaker titles win; a language FileMaker has no titles for falls back to its seed.
var titleRows = Array.isArray(model.titles) ? model.titles : []
function titlesFor(language, seed) {
  var list = titleRows
    .filter(function (row) {
      return row && row.title && String(row.language || '').toUpperCase() === language
    })
    .map(function (row) {
      return String(row.title).trim()
    })
  return (list.length ? list : seed.slice()).sort(function (a, b) {
    return a.localeCompare(b)
  })
}
var titlesFr = titlesFor('FR', TITLES_FR)
model.titleOptions = isFrenchOnly(lang) ? titlesFr : titlesFor('EN', TITLES_EN)
// Bilingual cards pick their French title from these (wrapCardName).
model.titleFrChoices = titlesFr
// Credential seed, used when FileMaker sends no degrees.
var DEGREES = [
  'Arch. Tech',
  'Architect',
  'BA',
  'BSc',
  'CA',
  'CAPM',
  'CEC',
  'CEM',
  'CET',
  'CGA',
  'CMA',
  'CPA',
  'CSDP',
  'Dipl. Arch. Tech',
  'Eng. Tech',
  'EP(CEA)',
  'GSC',
  'LEED AP',
  'LEED AP BD+C',
  'LEED AP Homes',
  'LEED AP ID+C',
  'LEED AP ND',
  'LEED AP O+M',
  'LEED Green Assoc.',
  'MSc',
  'P. Eng.',
  'PgMP',
  'PMI-RMP',
  'PMI-SP',
  'PMP',
  'PQS',
  'Real Estate Broker',
]
var degreeRows = (Array.isArray(model.degrees) ? model.degrees : [])
  .map(function (d) {
    return String(d || '').trim()
  })
  .filter(Boolean)
model.degreeOptions = degreeRows.length ? degreeRows : DEGREES.slice()
if (!Array.isArray(model.regionOptions) || !model.regionOptions.length) {
  model.regionOptions = [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan',
    'Northwest Territories',
    'Nunavut',
    'Yukon',
  ]
}
var keepProof = !fresh && typeof app !== 'undefined' && app.proof && app.proof.details
if (!lineId && !keepProof) {
  model.editLineId = ''
  if (typeof app !== 'undefined') app.editLineId = null
  c.name = ''
  c.nameWrapped = ''
  c.nameLines = []
  c.inlineCredential = ''
  c.credentialLine = ''
  c.title = ''
  c.degree = []
  c.additionalCredentials = ''
  c.region = ''
  c.specializedTeam = ''
  c.email = ''
  c.emailEdited = false
  c.phone = ''
  c.address = ''
}
if (c.phone) {
  var digits = String(c.phone).replace(/\D/g, '')
  if (digits.length === 11 && digits.charAt(0) === '1') digits = digits.slice(1)
  digits = digits.slice(0, 10)
  c.phone = digits
    ? digits.length <= 3
      ? digits
      : digits.length <= 6
        ? digits.slice(0, 3) + ' ' + digits.slice(3)
        : digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6)
    : ''
}
if (model.degreeQuery == null) model.degreeQuery = ''
if (model.degreeMenuOpen == null) model.degreeMenuOpen = false
model.otherCredentialOpen = 0
BF.namedAction('loadOffices')
BF.namedAction('hydrateFromStore')
BF.namedAction('wrapCardName')
