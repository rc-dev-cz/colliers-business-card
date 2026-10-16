import {
  formatCredentialSuffix,
  formatTitleLine,
  isBilingualLanguage,
  isFrenchLanguage,
  previewCredentialText,
  SAMPLE_ADDRESS,
  SAMPLE_CREDENTIAL,
  WEBSITE_EN,
  WEBSITE_FR,
} from './formatCardIdentity.js'
import { EMAIL_MAX, formatCardPhone } from './validate.js'
import { suggestFrenchTitle, TITLE_FR_TALENT_ACQUISITION } from './titleLocale.js'

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
  // Word boxes: same height as the approved card lockup; width follows the
  // designer PNG aspect (EN 1377×736, FR 1780×850). y is the PDF bottom.
  wordmarkEn: { x: 79.35, y: 112.86, w: 35.25, h: 18.84 },
  wordmarkFr: { x: 79.24, y: 110.3, w: 45.48, h: 21.72 },

  identityX: 113.03,
  // Right-column fill cap: 141.52 pt from 113.03 ends at x ≈ 254.5,
  // ~6.5 pt inside trim (261). Bleed 261–270 is not fill space.
  identityWidth: 141.52,
  emailMaxWidth: 141.52,
  titleMaxWidth: 141.52,

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

  // Last contact line shares the address bottom baseline. Email / mobile stack up.
  emailY: 43,
  phoneY: 35,
  websiteY: 27,
  // Cynthia (Oct 2026): long / Maximum stack keeps at least this much air above email
  // (Standard team→email gap). Own-row + team lifts the identity block to match.
  emailGapMin: 15.99,

  addressX: 27,
  addressBottomY: 27,
  addressMaxWidth: 80,
  addressMaxLines: 5,
}

/** Blank-card copy from the ICT master (3.5×2). Address uses the four-line sample. */
export var SAMPLE_CARD = {
  EN: {
    name: 'Firstname Lastname',
    title: 'Title',
    region: 'Region',
    team: 'Specialized team',
    email: 'first.lastname@colliersprojectleaders.com',
    phone: '555 555 5555',
    address: SAMPLE_ADDRESS.EN,
    website: WEBSITE_EN,
  },
  FR: {
    name: 'Prénom Nom',
    title: 'Titre',
    region: 'Région',
    team: 'Équipe spécialisée',
    email: 'prenom.nom@colliersprojectleaders.com',
    phone: '555 555 5555',
    address: SAMPLE_ADDRESS.FR,
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
}

export var LAYOUT_ERROR_EN = {
  layoutErrorName: 'This name is too long to fit on two lines of the card.',
  layoutErrorCredentials: 'These degrees and credentials are too long for the card.',
  layoutErrorTitle: 'This title and region are too long for the card.',
  layoutErrorTeam: 'This specialized team is too long for the card.',
  layoutErrorEmail: 'This email is too long to fit on one line of the card.',
  layoutErrorPhone: 'This mobile number is too long for the card.',
  layoutErrorWebsite: 'This website is too long for the card.',
  layoutErrorAddress: 'This office address is too long for the card.',
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
    title: formatTitleLine(card.title, card.region, sample.title),
    team: String(card.specializedTeam || '').trim(),
    email: String(card.email || '').trim() || sample.email,
    phone: phoneRaw ? formatCardPhone(phoneRaw) : sample.phone,
    website: website,
    address: String(card.address || '').trim() || sample.address,
    tagline1: isFrench ? 'Maîtres' : 'Project',
    tagline2: isFrench ? 'de projets' : 'Leaders',
  }
}

/**
 * `Title | Region` for every printed face. Bilingual cards have an English and a
 * French face, and the region fallback must pick the same break on both.
 */
export function cardFaceTitles(details, language) {
  var src = details || {}
  if (!isBilingualLanguage(language) && !src.bilingualFaces) {
    return [resolveCardFields(src, language).title]
  }
  var englishTitle = src.titleEn || src.title
  var frenchTitle = String(src.titleFr || '').trim() || suggestFrenchTitle(englishTitle)
  return [
    resolveCardFields(Object.assign({}, src, { title: englishTitle }), 'English').title,
    resolveCardFields(Object.assign({}, src, { title: frenchTitle }), 'French').title,
  ]
}

export function fitsLine(font, text, size, maxWidth) {
  return font.widthOfTextAtSize(String(text || ''), size) <= maxWidth
}

/** Specialized team prints on one line (same text on the EN and FR faces). */
export function teamFitsOnCard(details, fonts) {
  var team = String((details && details.specializedTeam) || '').trim()
  if (!team || !fonts) return true
  return fitsLine(fonts.font, team, CARD_LAYOUT.bodySize, CARD_LAYOUT.identityWidth)
}

function titlePartOf(joined) {
  var text = String(joined || '')
  var sep = ' | '
  var idx = text.indexOf(sep)
  return (idx === -1 ? text : text.slice(0, idx)).trim()
}

/**
 * Body size for the title line. Only the Talent Acquisition French title
 * scales down so the title itself fits titleMaxWidth.
 */
export function titleSizeFor(font, joined, layout) {
  var L = layout || CARD_LAYOUT
  var titlePart = titlePartOf(joined)
  if (titlePart !== TITLE_FR_TALENT_ACQUISITION) return L.bodySize
  if (!font || typeof font.widthOfTextAtSize !== 'function') return L.bodySize
  if (fitsLine(font, titlePart, L.bodySize, L.titleMaxWidth)) return L.bodySize
  var width = font.widthOfTextAtSize(titlePart, L.bodySize)
  if (!width) return L.bodySize
  var size = Number(((L.bodySize * L.titleMaxWidth) / width).toFixed(2))
  while (size > 1 && !fitsLine(font, titlePart, size, L.titleMaxWidth)) {
    size = Number((size - 0.01).toFixed(2))
  }
  return size
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

/**
 * Joined `Title | Region` may overflow when each part still fits alone — preview/print
 * stack region under title in that case, so do not treat it as a layout error.
 */
function titleRegionFitsOrSplits(font, joined, titleSize, maxWidth, regionSize) {
  var text = String(joined || '')
  if (fitsLine(font, text, titleSize, maxWidth)) return true
  var sep = ' | '
  var idx = text.indexOf(sep)
  if (idx === -1) return false
  var titlePart = text.slice(0, idx).trim()
  var regionPart = text.slice(idx + sep.length).trim()
  if (!titlePart || !regionPart) return false
  var regionPt = regionSize == null ? titleSize : regionSize
  return (
    fitsLine(font, titlePart, titleSize, maxWidth) && fitsLine(font, regionPart, regionPt, maxWidth)
  )
}

function fitsAfterName(fontBold, lastNameLine, credentialText, L) {
  var prefix = ', '
  var used = fontBold.widthOfTextAtSize(lastNameLine, L.nameSize)
  var credW = fontBold.widthOfTextAtSize(prefix + credentialText, L.credentialSize)
  return used + credW <= L.identityWidth
}

export function splitCredentialParts(text) {
  return String(text || '')
    .split(/,\s*/)
    .map(function (part) {
      return part.trim()
    })
    .filter(Boolean)
}

/**
 * Shorter credentials fill the name line first (by measured width). Leftovers
 * stay on the own-row in listed order. Geometry is unchanged.
 */
export function packCredentials(fontBold, lastNameLine, credText, L) {
  var layout = L || CARD_LAYOUT
  var parts = splitCredentialParts(credText)
  if (!parts.length) {
    return { mode: 'none', inline: '', row: '' }
  }

  var joined = parts.join(', ')
  if (fitsAfterName(fontBold, lastNameLine, joined, layout)) {
    return { mode: 'inline', inline: joined, row: '' }
  }

  var order = parts.map(function (text, index) {
    return { text: text, index: index, w: fontBold.widthOfTextAtSize(text, layout.credentialSize) }
  })
  order.sort(function (a, b) {
    if (a.w !== b.w) return a.w - b.w
    return a.index - b.index
  })

  var inlineItems = []
  var taken = {}
  order.forEach(function (item) {
    var trial = inlineItems
      .map(function (row) {
        return row.text
      })
      .concat([item.text])
      .join(', ')
    if (fitsAfterName(fontBold, lastNameLine, trial, layout)) {
      inlineItems.push(item)
      taken[item.index] = true
    }
  })

  var inline = inlineItems
    .map(function (item) {
      return item.text
    })
    .join(', ')
  var rest = parts.filter(function (_text, index) {
    return !taken[index]
  })
  var row = rest.join(', ')

  if (!row) return { mode: 'inline', inline: inline, row: '' }
  if (!inline) {
    if (fitsLine(fontBold, joined, layout.credentialSize, layout.identityWidth)) {
      return { mode: 'own-row', inline: '', row: joined }
    }
    return { mode: 'error', inline: '', row: '' }
  }
  if (!fitsLine(fontBold, row, layout.credentialSize, layout.identityWidth)) {
    return { mode: 'error', inline: '', row: '' }
  }
  return { mode: 'split', inline: inline, row: row }
}

/**
 * Name wraps by whole words onto at most two lines and still leaves room for the
 * credentials: the chosen ones (inline or on their own row), or the sample ", C.M."
 * that the preview and print PDF draw on the name line when none are chosen.
 */
export function nameFitsOnCard(details, fonts) {
  var src = details || {}
  var text = String(src.name || '').trim()
  if (!text || !fonts || !fonts.fontBold) return true
  var L = CARD_LAYOUT
  var wrap = wrapByWords(fonts.fontBold, text, L.nameSize, L.identityWidth)
  if (!wrap.ok || wrap.lines.length > L.nameMaxLines) return false
  var lastLine = wrap.lines[wrap.lines.length - 1] || ''
  // The sample packs like a real token: after the name when it fits, else its own row.
  var cred = formatCredentialSuffix(src.degree, src.additionalCredentials) || SAMPLE_CREDENTIAL
  return packCredentials(fonts.fontBold, lastLine, cred, L).mode !== 'error'
}

/**
 * Details with the sample "C.M." as the credential when none is chosen, so the
 * planner places it like a real token (inline, or its own row when the name is full).
 */
export function withSampleCredential(details, language) {
  var src = details || {}
  if (formatCredentialSuffix(src.degree, src.additionalCredentials)) return src
  return Object.assign({}, src, {
    additionalCredentials: previewCredentialText('', '', language),
  })
}

/** Email prints on one line of the email lane. */
export function emailFitsOnCard(email, fonts) {
  var text = String(email || '').trim()
  if (!text || !fonts || !fonts.font) return true
  return fitsLine(fonts.font, text, CARD_LAYOUT.bodySize, CARD_LAYOUT.emailMaxWidth)
}

/** Whether all selected degrees + additional credentials fit the two credential lanes. */
export function credentialsFitOnCard(details, fonts, language) {
  if (!fonts || !fonts.fontBold) return true
  var fields = resolveCardFields(
    details || {},
    language || (details && details.language) || 'English'
  )
  var nameWrap = wrapByWords(
    fonts.fontBold,
    fields.name,
    CARD_LAYOUT.nameSize,
    CARD_LAYOUT.identityWidth
  )
  if (!nameWrap.ok || nameWrap.lines.length > CARD_LAYOUT.nameMaxLines) return false
  var lastNameLine = nameWrap.lines[nameWrap.lines.length - 1] || ''
  return (
    packCredentials(fonts.fontBold, lastNameLine, fields.credentialSuffix, CARD_LAYOUT).mode !==
    'error'
  )
}

/**
 * Plan one language page. fields = resolveCardFields(...).
 */
export function planCardLayout(fields, fonts) {
  var L = CARD_LAYOUT
  var font = fonts.font
  var fontBold = fonts.fontBold
  var errors = []
  var nameWrap = wrapByWords(fontBold, fields.name, L.nameSize, L.identityWidth)
  if (!nameWrap.ok || nameWrap.lines.length > L.nameMaxLines) {
    errors.push(LAYOUT_ERROR.name)
  }
  var nameLines = nameWrap.ok ? nameWrap.lines : [fields.name]
  if (nameLines.length > L.nameMaxLines) nameLines = nameLines.slice(0, L.nameMaxLines)
  var lastNameLine = nameLines[nameLines.length - 1] || ''

  var credText = String(fields.credentialSuffix || '').trim()
  var packed = packCredentials(fontBold, lastNameLine, credText, L)
  var credMode = packed.mode === 'error' ? 'none' : packed.mode
  if (packed.mode === 'error') errors.push(LAYOUT_ERROR.credentials)

  requireOneLine(font, fields.website, L.bodySize, L.identityWidth, LAYOUT_ERROR.website, errors)
  var titleSize = titleSizeFor(font, fields.title, L)
  if (!titleRegionFitsOrSplits(font, fields.title, titleSize, L.titleMaxWidth, L.bodySize)) {
    errors.push(LAYOUT_ERROR.title)
  }
  if (String(fields.team || '').trim()) {
    requireOneLine(font, fields.team, L.bodySize, L.identityWidth, LAYOUT_ERROR.team, errors)
  }
  requireOneLine(font, fields.email, L.bodySize, L.emailMaxWidth, LAYOUT_ERROR.email, errors)
  if (String(fields.email || '').length > EMAIL_MAX) errors.push(LAYOUT_ERROR.email)

  var addressWrap = wrapAddress(font, fields.address, L.bodySize, L.addressMaxWidth)

  var ownCred = credMode === 'own-row' || credMode === 'split'
  var titleY = ownCred ? L.titleYWithCred : L.titleYNoCred
  var teamY = ownCred ? L.teamYWithCred : L.teamYNoCred
  var lastNameY = L.nameY
  var nameLineYs = []
  for (var n = 0; n < nameLines.length; n++) {
    nameLineYs.push(lastNameY + (nameLines.length - 1 - n) * L.nameLineHeight)
  }

  var lastIdentityY = fields.team ? teamY : titleY
  var minLastY = L.emailY + L.emailGapMin
  var lift = lastIdentityY < minLastY ? Number((minLastY - lastIdentityY).toFixed(2)) : 0
  if (lift) {
    titleY += lift
    teamY += lift
    lastNameY += lift
    for (n = 0; n < nameLineYs.length; n++) {
      nameLineYs[n] += lift
    }
  }
  var credentialY = ownCred ? L.credentialY + lift : null

  var addressLines = addressWrap.ok ? addressWrap.lines : []

  return {
    valid: errors.length === 0,
    errors: errors,
    credMode: credMode,
    nameLines: nameLines,
    nameLineYs: nameLineYs,
    lastNameY: lastNameY,
    inlineCredential: packed.inline ? ', ' + packed.inline : '',
    credentialLine: ownCred ? packed.row : '',
    credentialY: credentialY,
    title: fields.title,
    titleSize: titleSize,
    titleY: titleY,
    team: fields.team,
    teamY: teamY,
    email: fields.email,
    emailY: L.emailY,
    phone: fields.phone,
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
  var langs = isBilingualLanguage(language) ? ['English', 'French'] : [language || 'English']
  var pages = langs.map(function (lang) {
    var pageDetails = snapshot
    if (isFrenchLanguage(lang)) {
      pageDetails = Object.assign({}, snapshot, { website: WEBSITE_FR })
      if (isBilingualLanguage(language)) {
        var frenchTitle = String(snapshot.titleFr || '').trim()
        if (!frenchTitle) frenchTitle = suggestFrenchTitle(snapshot.title)
        pageDetails.title = frenchTitle
      }
    }
    var fields = resolveCardFields(pageDetails, lang)
    var layout = planCardLayout(fields, fonts)
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

function roundPt(n) {
  return Number(Number(n).toFixed(2))
}

/**
 * On-screen preview only, when specialized team is empty.
 * One blank body line under the title, then email / phone / website.
 * A single body step would sit email on the next line and collide.
 * Print PDF keeps email 43 / phone 35 / website 27 (planCardLayout).
 * Klai wrapCardName.js mirrors this branch.
 */
export function previewContactYs(titleY) {
  var step = CARD_LAYOUT.bodyLineHeight
  var emailY = roundPt(Number(titleY) - step * 2)
  return {
    emailY: emailY,
    phoneY: roundPt(emailY - step),
    websiteY: roundPt(emailY - step * 2),
  }
}

/**
 * Preview-only when specialized team is empty:
 * close the unused team row so there is one gap under the title, then
 * email / phone / website stay bottom-locked with the address (43 / 35 / 27).
 * Extra name / credential lines stay above the title (grow toward the logo).
 */
export function applyEmptyTeamIdentityLayout(view) {
  if (!view || String(view.team || '').trim()) return view
  var L = CARD_LAYOUT
  var next = Object.assign({}, view)
  var targetTitleY = L.teamYNoCred
  var shiftDown = roundPt(Number(view.titleY || L.titleYNoCred) - targetTitleY)
  if (shiftDown > 0) {
    next.titleY = roundPt(Number(view.titleY) - shiftDown)
    if (view.credentialY != null) next.credentialY = roundPt(Number(view.credentialY) - shiftDown)
    if (view.teamY != null) next.teamY = roundPt(Number(view.teamY) - shiftDown)
    next.lastNameY = roundPt(Number(view.lastNameY || L.nameY) - shiftDown)
    next.nameLineYs = (view.nameLineYs || []).map(function (y) {
      return roundPt(Number(y) - shiftDown)
    })
  }
  next.emailY = L.emailY
  next.phoneY = L.phoneY
  next.websiteY = L.websiteY
  return next
}

/**
 * Region leaves the title line so EN and FR faces mirror (Cynthia, Oct 2026).
 * Specialized team filled: region joins it as `team | region`. Team empty: region
 * gets its own line under the title, and name / credentials / title lift by one
 * body line. If `team | region` is too wide, keep `Title | Region` when it fits,
 * else stack region under the title. Used by CardPreview and print PDF.
 * No-op when already split or when title alone cannot fit. Before the measuring
 * fonts load (preview first paint) the split still applies, unmeasured.
 */
export function applyPreviewTitleRegionSplit(view, fonts, opts) {
  if (!view) return view
  if (view.regionLine) return view
  var L = CARD_LAYOUT
  var font = fonts && fonts.font
  var joined = String(view.title || '')
  var sep = ' | '
  var idx = joined.indexOf(sep)
  if (idx === -1) return view
  var titlePart = joined.slice(0, idx).trim()
  var regionPart = joined.slice(idx + sep.length).trim()
  if (!titlePart || !regionPart) return view
  var titleSize = view.titleSize || L.bodySize
  if (font && !fitsLine(font, titlePart, titleSize, L.titleMaxWidth)) return view
  if (font && !fitsLine(font, regionPart, L.bodySize, L.titleMaxWidth)) return view

  var team = String(view.team || '').trim()
  if (team) {
    var merged = team + sep + regionPart
    if (!font || fitsLine(font, merged, L.bodySize, L.identityWidth)) {
      var withTeam = Object.assign({}, view)
      withTeam.title = titlePart
      withTeam.team = merged
      withTeam.regionLine = ''
      return withTeam
    }
    // `team | region` too wide: keep the approved `Title | Region` line when it fits
    // on every face (bilingual EN and FR must break the same way).
    // A third identity line would push a 2-line name into the wordmark (Maximum).
    var faces = (opts && opts.faceTitles) || [joined]
    var everyFaceFits = faces.every(function (face) {
      return fitsLine(font, face, titleSizeFor(font, face, L), L.titleMaxWidth)
    })
    if (everyFaceFits) return view
  }

  var lift = L.bodyLineHeight
  var titleY = Number(view.titleY)
  var next = Object.assign({}, view)
  next.title = titlePart
  next.regionLine = regionPart
  next.regionY = roundPt(titleY)
  next.titleY = roundPt(titleY + lift)
  next.lastNameY = roundPt(Number(view.lastNameY != null ? view.lastNameY : L.nameY) + lift)
  next.nameLineYs = (view.nameLineYs || []).map(function (y) {
    return roundPt(Number(y) + lift)
  })
  if (view.credentialY != null) next.credentialY = roundPt(Number(view.credentialY) + lift)
  return next
}

export function trimLeftPct(x) {
  return ((x - CARD_LAYOUT.bleed) / CARD_LAYOUT.trimW) * 100
}

export function layoutErrorMessage(code, t) {
  if (typeof t === 'function') return t(code)
  return LAYOUT_ERROR_EN[code] || code
}
