import {
  formatCredentialSuffix,
  formatTitleLine,
  isBilingualLanguage,
  isFrenchLanguage,
  WEBSITE_EN,
  WEBSITE_FR,
} from './formatCardIdentity.js'
import { EMAIL_MAX, formatCardPhone } from './validate.js'

var IN = 72

export var CARD_LAYOUT = {
  trimWIn: 3.5,
  trimHIn: 2,
  bleedIn: 0.125,
  pageW: (3.5 + 0.125 * 2) * IN,
  pageH: (2 + 0.125 * 2) * IN,
  bleed: 0.125 * IN,
  trimW: 3.5 * IN,
  trimH: 2 * IN,

  logoX: 26.56,
  logoY: 108.8,
  logoW: 46.59,
  logoH: 26.52,
  lockupX: 26.2,
  lockupY: 108.0,
  lockupW: 87.3,
  lockupH: 27.8,
  taglineX: 78.41,
  taglineY1: 124.0,
  taglineY2: 113.2,
  taglineSize: 8,

  identityX: 113.03,
  identityWidth: 130,
  // Email is capped at 50 characters. The line may run to the right trim edge.
  emailMaxWidth: 3.5 * IN - (113.03 - 0.125 * IN),

  nameY: 75.49,
  nameSize: 10,
  nameLineHeight: 11,
  nameMaxLines: 2,

  credentialSize: 7,
  credentialY: 66.99,

  titleYNoCred: 66.99,
  teamYNoCred: 58.99,
  titleYWithCred: 58.99,
  teamYWithCred: 50.99,

  bodySize: 6.5,
  bodyLineHeight: 8,

  emailY: 42.99,
  phoneY: 34.99,
  websiteY: 26.99,

  addressX: 27,
  addressBottomY: 27,
  addressMaxWidth: 80,
  addressMaxLines: 5,

  maxDegrees: 2,
}

/** Blank-card copy from the ICT master (3.5×2). Address stays a selector, not this sample. */
export var SAMPLE_CARD = {
  EN: {
    name: 'Firstname Lastname',
    title: 'Title',
    region: 'Region',
    team: 'Specialized team',
    email: 'first.lastname@colliersprojectleaders.com',
    phone: '+1 555 555 5555',
    address: 'Address',
    website: WEBSITE_EN,
  },
  FR: {
    name: 'Prénom Nom',
    title: 'Titre',
    region: 'Région',
    team: 'Équipe spécialisée',
    email: 'prenom.nom@colliersprojectleaders.com',
    phone: '+1 555 555 5555',
    address: 'Adresse',
    website: WEBSITE_FR,
  },
}

export var CARD_BACK_LEGAL = 'Colliers International Group Inc.'

export var LAYOUT_ERROR = {
  name: 'layoutErrorName',
  credentials: 'layoutErrorCredentials',
  title: 'layoutErrorTitle',
  team: 'layoutErrorTeam',
  email: 'layoutErrorEmail',
  phone: 'layoutErrorPhone',
  website: 'layoutErrorWebsite',
  address: 'layoutErrorAddress',
  degrees: 'layoutErrorDegrees',
}

export var LAYOUT_ERROR_EN = {
  layoutErrorName: 'Full name is too long for the business card.',
  layoutErrorCredentials: 'Selected degrees and credentials are too long for the business card.',
  layoutErrorTitle: 'The selected title and region are too long.',
  layoutErrorTeam: 'The specialized team is too long.',
  layoutErrorEmail: 'The email address is too long for the card.',
  layoutErrorPhone: 'The mobile number is too long for the card.',
  layoutErrorWebsite: 'The website is too long for the card.',
  layoutErrorAddress: 'The office address is too long for the card.',
  layoutErrorDegrees: 'A maximum of 2 degrees/certifications can be selected.',
}

export function snapshotCardDetails(details) {
  var src = details || {}
  var out = {}
  Object.keys(src).forEach(function (key) {
    out[key] = src[key]
  })
  if (Array.isArray(src.degree)) out.degree = src.degree.slice()
  else if (src.degree) out.degree = [src.degree]
  else out.degree = []
  return out
}

export function degreeCount(details) {
  var list = snapshotCardDetails(details).degree || []
  var n = 0
  list.forEach(function (item) {
    if (String(item || '').trim()) n += 1
  })
  return n
}

export function resolveCardFields(details, language) {
  var card = details || {}
  var isFrench = isFrenchLanguage(language || card.language)
  var sample = isFrench ? SAMPLE_CARD.FR : SAMPLE_CARD.EN
  var rawName = String(card.name || '').trim()
  var phoneRaw = String(card.phone || '').trim()
  var website = String(card.website || '').trim()
  if (!website || website === 'colliers.com/canada') website = sample.website
  return {
    isFrench: isFrench,
    name: rawName || sample.name,
    credentialSuffix: formatCredentialSuffix(card.degree, card.additionalCredentials),
    title: formatTitleLine(card.title, card.region, sample.title, sample.region),
    team: String(card.specializedTeam || '').trim(),
    email: String(card.email || '').trim() || sample.email,
    phone: phoneRaw ? formatCardPhone(phoneRaw) : sample.phone,
    website: website,
    address: String(card.address || '').trim() || sample.address,
    tagline1: isFrench ? 'Maîtres' : 'Project',
    tagline2: isFrench ? 'de projets' : 'Leaders',
  }
}

export function fitsLine(font, text, size, maxWidth) {
  return font.widthOfTextAtSize(String(text || ''), size) <= maxWidth
}

function wrapByWords(font, text, size, maxWidth) {
  var words = String(text || '')
    .split(/\s+/)
    .filter(Boolean)
  if (!words.length) return { ok: true, lines: [''] }
  var lines = []
  var cur = ''
  for (var i = 0; i < words.length; i++) {
    var w = words[i]
    if (!fitsLine(font, w, size, maxWidth)) {
      return { ok: false, lines: [] }
    }
    var next = cur ? cur + ' ' + w : w
    if (fitsLine(font, next, size, maxWidth)) {
      cur = next
    } else {
      lines.push(cur)
      cur = w
    }
  }
  if (cur) lines.push(cur)
  return { ok: true, lines: lines }
}

function wrapAddress(font, text, size, maxWidth) {
  var paragraphs = String(text || '').split(/\n/)
  var lines = []
  for (var p = 0; p < paragraphs.length; p++) {
    var chunk = paragraphs[p].trim()
    if (!chunk) continue
    var wrapped = wrapByWords(font, chunk, size, maxWidth)
    if (!wrapped.ok) lines.push(chunk)
    else lines = lines.concat(wrapped.lines)
  }
  if (!lines.length) lines = ['']
  return { ok: true, lines: lines }
}

function requireOneLine(font, text, size, maxWidth, code, errors) {
  if (!fitsLine(font, text, size, maxWidth)) errors.push(code)
}

function fitsAfterName(fontBold, lastNameLine, credentialText, L) {
  var prefix = ', '
  var used = fontBold.widthOfTextAtSize(lastNameLine, L.nameSize)
  var credW = fontBold.widthOfTextAtSize(prefix + credentialText, L.credentialSize)
  return used + credW <= L.identityWidth
}

/**
 * Plan one language page. fields = resolveCardFields(...).
 */
export function planCardLayout(fields, fonts, opts) {
  var L = CARD_LAYOUT
  var font = fonts.font
  var fontBold = fonts.fontBold
  var errors = []
  var count = (opts && opts.degreeCount) || 0
  if (count > L.maxDegrees) errors.push(LAYOUT_ERROR.degrees)

  var nameWrap = wrapByWords(fontBold, fields.name, L.nameSize, L.identityWidth)
  if (!nameWrap.ok || nameWrap.lines.length > L.nameMaxLines) {
    errors.push(LAYOUT_ERROR.name)
  }
  var nameLines = nameWrap.ok ? nameWrap.lines : [fields.name]
  if (nameLines.length > L.nameMaxLines) nameLines = nameLines.slice(0, L.nameMaxLines)
  var lastNameLine = nameLines[nameLines.length - 1] || ''

  var credText = String(fields.credentialSuffix || '').trim()
  var credMode = 'none'
  if (credText) {
    if (fitsAfterName(fontBold, lastNameLine, credText, L)) {
      credMode = 'inline'
    } else if (fitsLine(fontBold, credText, L.credentialSize, L.identityWidth)) {
      credMode = 'own-row'
    } else {
      errors.push(LAYOUT_ERROR.credentials)
    }
  }

  requireOneLine(font, fields.website, L.bodySize, L.identityWidth, LAYOUT_ERROR.website, errors)
  if (String(fields.email || '').length > EMAIL_MAX) errors.push(LAYOUT_ERROR.email)

  var addressWrap = wrapAddress(font, fields.address, L.bodySize, L.addressMaxWidth)

  var ownCred = credMode === 'own-row'
  var titleY = ownCred ? L.titleYWithCred : L.titleYNoCred
  var teamY = ownCred ? L.teamYWithCred : L.teamYNoCred
  var nameLineYs = []
  for (var n = 0; n < nameLines.length; n++) {
    nameLineYs.push(L.nameY + (nameLines.length - 1 - n) * L.nameLineHeight)
  }

  var addressLines = addressWrap.ok ? addressWrap.lines : []

  return {
    valid: errors.length === 0,
    errors: errors,
    credMode: credMode,
    nameLines: nameLines,
    nameLineYs: nameLineYs,
    lastNameY: L.nameY,
    inlineCredential: credMode === 'inline' ? ', ' + credText : '',
    credentialLine: ownCred ? credText : '',
    credentialY: ownCred ? L.credentialY : null,
    title: fields.title,
    titleY: titleY,
    team: fields.team,
    teamY: teamY,
    email: fields.email,
    emailY: L.emailY,
    phone: 'Mobile: ' + fields.phone,
    phoneY: L.phoneY,
    website: fields.website,
    websiteY: L.websiteY,
    address: {
      lines: addressLines,
      x: L.addressX,
      bottomY: L.addressBottomY,
      lineHeight: L.bodyLineHeight,
    },
    fields: fields,
  }
}

export function planProductLayout(details, language, fonts) {
  var snapshot = snapshotCardDetails(details)
  var count = degreeCount(snapshot)
  var langs = isBilingualLanguage(language)
    ? ['English', 'French']
    : [language || 'English']
  var pages = langs.map(function (lang) {
    var pageDetails = snapshot
    if (isFrenchLanguage(lang)) {
      pageDetails = Object.assign({}, snapshot, { website: WEBSITE_FR })
    }
    var fields = resolveCardFields(pageDetails, lang)
    var layout = planCardLayout(fields, fonts, { degreeCount: count })
    return { language: lang, fields: fields, layout: layout }
  })
  var errors = []
  pages.forEach(function (page) {
    page.layout.errors.forEach(function (code) {
      if (errors.indexOf(code) === -1) errors.push(code)
    })
  })
  return {
    valid: errors.length === 0,
    errors: errors,
    pages: pages,
  }
}

export function trimBottomPct(y) {
  return ((y - CARD_LAYOUT.bleed) / CARD_LAYOUT.trimH) * 100
}

export function trimLeftPct(x) {
  return ((x - CARD_LAYOUT.bleed) / CARD_LAYOUT.trimW) * 100
}

export function layoutErrorMessage(code, t) {
  if (typeof t === 'function') return t(code)
  return LAYOUT_ERROR_EN[code] || code
}
