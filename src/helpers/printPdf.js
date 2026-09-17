import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { wrapCardName } from './wrapCardName.js'
import {
  formatCredentialSuffix,
  formatTitleLine,
  isBilingualLanguage,
  isFrenchLanguage,
  WEBSITE_EN,
  WEBSITE_FR,
} from './formatCardIdentity.js'
import { formatCardPhone } from './validate.js'
import lockupEnUrl from '../assets/brand-lockup-en.png?url'
import logoUrl from '../assets/colliers-logo-print.png?url'
import openSansRegularUrl from '../assets/fonts/OpenSans-Regular.ttf?url'
import openSansBoldUrl from '../assets/fonts/OpenSans-Bold.ttf?url'

var IN = 72
var TRIM_W_IN = 3.5
var TRIM_H_IN = 2
var BLEED_IN = 0.125
var PAGE_W = (TRIM_W_IN + BLEED_IN * 2) * IN
var PAGE_H = (TRIM_H_IN + BLEED_IN * 2) * IN
var BLEED = BLEED_IN * IN
var TRIM_W = TRIM_W_IN * IN
var TRIM_H = TRIM_H_IN * IN

var COLLIERS_BLUE = rgb(3 / 255, 67 / 255, 140 / 255)
var GRAY = rgb(95 / 255, 99 / 255, 106 / 255)

/** Positions from the approved EN print PDF (270×162 pt, origin bottom-left). */
var L = {
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
  identityMaxW: 130,
  nameY: 83.49,
  nameSize: 10,
  credSize: 7,
  nameLh: 11,
  bodySize: 6.5,
  bodyLh: 8,
  addressX: 27,
  addressMaxW: 80,
  bottomY: 27,
  emailY: 51,
  phoneY: 43,
}

var SAMPLE = {
  EN: {
    name: 'Full Name',
    title: 'Title | Region',
    team: 'Specialized Team',
    email: 'Email:',
    phone: 'Phone Number',
    address: 'Address',
    website: WEBSITE_EN,
  },
  FR: {
    name: 'Nom complet',
    title: 'Titre | Region',
    team: 'Equipe specialisee',
    email: 'Courriel:',
    phone: 'Numero de telephone',
    address: 'Adresse',
    website: WEBSITE_FR,
  },
}

function drawLines(page, lines, opts) {
  var font = opts.font
  var size = opts.size
  var x = opts.x
  var y = opts.y
  var lineHeight = opts.lineHeight || size * 1.25
  var color = opts.color
  var list = Array.isArray(lines) ? lines : String(lines || '').split(/\n/)
  list.forEach(function (line, idx) {
    page.drawText(String(line), {
      x: x,
      y: y - idx * lineHeight,
      size: size,
      font: font,
      color: color,
    })
  })
  return list.length * lineHeight
}

function wrapLines(font, text, size, maxWidth) {
  var lines = String(text || '').split(/\n/)
  var out = []
  lines.forEach(function (line) {
    var words = String(line).split(/\s+/)
    var cur = ''
    words.forEach(function (w) {
      if (!w) return
      var next = cur ? cur + ' ' + w : w
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        cur = next
      } else {
        if (cur) out.push(cur)
        // Hard-break a single oversized token so it cannot overflow.
        if (font.widthOfTextAtSize(w, size) > maxWidth) {
          var chunk = ''
          for (var i = 0; i < w.length; i++) {
            var trial = chunk + w.charAt(i)
            if (chunk && font.widthOfTextAtSize(trial, size) > maxWidth) {
              out.push(chunk)
              chunk = w.charAt(i)
            } else {
              chunk = trial
            }
          }
          cur = chunk
        } else {
          cur = w
        }
      }
    })
    if (cur) out.push(cur)
  })
  return out.length ? out : ['']
}

/**
 * Draw name (large) + credentials (smaller), wrapping like CardPreview.
 * Returns the y position below the last drawn line.
 */
function drawNameAndCredentials(page, fontBold, nameText, credSuffix, opts) {
  var x = opts.x
  var y = opts.y
  var maxW = opts.maxWidth
  var nameSize = opts.nameSize
  var credSize = opts.credSize
  var lineHeight = opts.lineHeight
  var color = opts.color

  var rawName = String(nameText || '').trim() || 'Full Name'
  var nameLines = wrapLines(fontBold, wrapCardName(rawName) || rawName, nameSize, maxW)

  // All name lines except the last
  for (var i = 0; i < nameLines.length - 1; i++) {
    page.drawText(nameLines[i], {
      x: x,
      y: y,
      size: nameSize,
      font: fontBold,
      color: color,
    })
    y -= lineHeight
  }

  var last = nameLines[nameLines.length - 1] || ''
  page.drawText(last, {
    x: x,
    y: y,
    size: nameSize,
    font: fontBold,
    color: color,
  })

  var cred = credSuffix ? String(credSuffix).trim() : ''
  if (!cred) {
    return y - 8.5
  }

  var prefix = ', '
  var used = fontBold.widthOfTextAtSize(last, nameSize)
  var avail = maxW - used
  var words = cred.split(/\s+/).filter(Boolean)
  var fitted = 0
  var onLast = ''

  if (avail > fontBold.widthOfTextAtSize(prefix, credSize)) {
    for (var w = 0; w < words.length; w++) {
      var trial = prefix + words.slice(0, w + 1).join(' ')
      if (fontBold.widthOfTextAtSize(trial, credSize) <= avail) {
        onLast = trial
        fitted = w + 1
      } else {
        break
      }
    }
    if (onLast) {
      page.drawText(onLast, {
        x: x + used,
        y: y,
        size: credSize,
        font: fontBold,
        color: color,
      })
    }
  }

  var remaining = words.slice(fitted).join(' ')
  if (!remaining) {
    return y - 8.5
  }
  y -= lineHeight
  var restText = onLast ? remaining : prefix + remaining
  var credLines = wrapLines(fontBold, restText, credSize, maxW)
  for (var c = 0; c < credLines.length; c++) {
    page.drawText(credLines[c], {
      x: x,
      y: y,
      size: credSize,
      font: fontBold,
      color: color,
    })
    y -= lineHeight
  }

  return y
}

function formatTitle(card, sample) {
  var sampleParts = String(sample.title || 'Title | Region').split('|')
  var sampleTitle = (sampleParts[0] || 'Title').trim()
  var sampleRegion = (sampleParts[1] || 'Region').trim()
  return formatTitleLine(card.title, card.region, sampleTitle, sampleRegion)
}

function resolveCardFields(details, language) {
  var card = details || {}
  var isFrench = isFrenchLanguage(language || card.language)
  var sample = isFrench ? SAMPLE.FR : SAMPLE.EN
  var rawName = String(card.name || '').trim()
  var credentialSuffix = formatCredentialSuffix(card.degree, card.additionalCredentials)
  var phoneRaw = String(card.phone || '').trim()
  var website = String(card.website || '').trim()
  if (!website || website === 'colliers.com/canada') website = sample.website
  return {
    isFrench: isFrench,
    name: rawName || sample.name,
    credentialSuffix: credentialSuffix,
    title: formatTitle(card, sample),
    team: String(card.specializedTeam || '').trim(),
    email: String(card.email || '').trim() || sample.email,
    phone: phoneRaw ? formatCardPhone(phoneRaw) : sample.phone,
    website: website,
    address: String(card.address || '').trim() || sample.address,
    tagline1: isFrench ? 'Maîtres' : 'Project',
    tagline2: isFrench ? 'de projets' : 'Leaders',
  }
}

async function loadBytes(url) {
  try {
    if (typeof fetch === 'function') {
      var res = await fetch(url)
      if (res.ok) return new Uint8Array(await res.arrayBuffer())
    }
  } catch (e) {}
  var fs = await import('node:fs')
  var path = await import('node:path')
  var { fileURLToPath } = await import('node:url')
  var filePath = String(url || '')
  if (filePath.indexOf('file:') === 0) filePath = fileURLToPath(filePath)
  else if (filePath.charAt(0) === '/') {
    var abs = path.join(process.cwd(), filePath.replace(/^\//, ''))
    if (fs.existsSync(abs)) filePath = abs
    else {
      var fromSrc = path.join(process.cwd(), 'src', filePath.replace(/^.*\/src\//, ''))
      if (fs.existsSync(fromSrc)) filePath = fromSrc
    }
  }
  return new Uint8Array(fs.readFileSync(filePath))
}

async function embedPrintAssets(pdfDoc) {
  var regular = await pdfDoc.embedFont(await loadBytes(openSansRegularUrl))
  var bold = await pdfDoc.embedFont(await loadBytes(openSansBoldUrl))
  var logo = await pdfDoc.embedPng(await loadBytes(logoUrl))
  var lockupEn = await pdfDoc.embedPng(await loadBytes(lockupEnUrl))
  return { font: regular, fontBold: bold, logo: logo, lockupEn: lockupEn }
}

async function drawCardPage(pdfDoc, details, language, assets) {
  var fields = resolveCardFields(details, language)
  var font = assets.font
  var fontBold = assets.fontBold
  var page = pdfDoc.addPage([PAGE_W, PAGE_H])

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: rgb(1, 1, 1),
  })

  if (fields.isFrench) {
    page.drawImage(assets.logo, {
      x: L.logoX,
      y: L.logoY,
      width: L.logoW,
      height: L.logoH,
    })
    page.drawText(fields.tagline1, {
      x: L.taglineX,
      y: L.taglineY1,
      size: L.taglineSize,
      font: font,
      color: COLLIERS_BLUE,
    })
    page.drawText(fields.tagline2, {
      x: L.taglineX,
      y: L.taglineY2,
      size: L.taglineSize,
      font: font,
      color: COLLIERS_BLUE,
    })
  } else {
    page.drawImage(assets.lockupEn, {
      x: L.lockupX,
      y: L.lockupY,
      width: L.lockupW,
      height: L.lockupH,
    })
  }

  var identityX = L.identityX
  var identityMaxW = L.identityMaxW
  var bodySize = L.bodySize
  var bodyLh = L.bodyLh

  var titleLines = wrapLines(font, fields.title, bodySize, identityMaxW)
  var teamLines = fields.team ? wrapLines(font, fields.team, bodySize, identityMaxW) : ['']
  var emailLines = wrapLines(font, fields.email, bodySize, identityMaxW)
  var phoneLines = wrapLines(font, 'Mobile: ' + fields.phone, bodySize, identityMaxW)
  var websiteLines = wrapLines(font, fields.website, bodySize, identityMaxW)
  var addressLines = String(fields.address || '')
    .split(/\n/)
    .reduce(function (acc, line) {
      return acc.concat(wrapLines(font, line, bodySize, L.addressMaxW))
    }, [])

  drawLines(page, websiteLines, {
    x: identityX,
    y: L.bottomY + (websiteLines.length - 1) * bodyLh,
    size: bodySize,
    font: font,
    color: GRAY,
    lineHeight: bodyLh,
  })
  drawLines(page, phoneLines, {
    x: identityX,
    y: L.phoneY + (phoneLines.length - 1) * bodyLh,
    size: bodySize,
    font: font,
    color: GRAY,
    lineHeight: bodyLh,
  })
  drawLines(page, emailLines, {
    x: identityX,
    y: L.emailY + (emailLines.length - 1) * bodyLh,
    size: bodySize,
    font: font,
    color: GRAY,
    lineHeight: bodyLh,
  })

  var addressY = L.bottomY + (addressLines.length - 1) * bodyLh
  drawLines(page, addressLines, {
    x: L.addressX,
    y: addressY,
    size: bodySize,
    font: font,
    color: GRAY,
    lineHeight: bodyLh,
  })

  var cursorY = drawNameAndCredentials(page, fontBold, fields.name, fields.credentialSuffix, {
    x: identityX,
    y: L.nameY,
    maxWidth: identityMaxW,
    nameSize: L.nameSize,
    credSize: L.credSize,
    lineHeight: L.nameLh,
    color: COLLIERS_BLUE,
  })
  cursorY -= drawLines(page, titleLines, {
    x: identityX,
    y: cursorY,
    size: bodySize,
    font: font,
    color: GRAY,
    lineHeight: bodyLh,
  })
  cursorY -= 0.5
  drawLines(page, teamLines, {
    x: identityX,
    y: cursorY,
    size: bodySize,
    font: font,
    color: GRAY,
    lineHeight: bodyLh,
  })
}

function snapshotCardDetails(details) {
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

/**
 * Build a print PDF (3.75×2.25 in with 0.125 in bleed, no trim box or crop marks).
 * Vector Open Sans + original lockup artwork — not a screen screenshot.
 */
export async function buildPrintPdfBytes(details, language) {
  var snapshot = snapshotCardDetails(details)
  var pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  var assets = await embedPrintAssets(pdfDoc)

  if (isBilingualLanguage(language)) {
    await drawCardPage(pdfDoc, snapshot, 'English', assets)
    var frDetails = Object.assign({}, snapshot, { website: WEBSITE_FR })
    await drawCardPage(pdfDoc, frDetails, 'French', assets)
  } else {
    await drawCardPage(pdfDoc, snapshot, language, assets)
  }

  return pdfDoc.save()
}

function printPdfFileName(details) {
  var stamp = Date.now()
  var raw = String((details && details.name) || 'card')
    .trim()
    .replace(/[^\w\-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)
  var label = raw || 'card'
  return 'Colliers-Business-Card-' + label + '-' + stamp + '.pdf'
}

var lastPrintPdfUrl = ''

/**
 * Open / download a vector print PDF for the current form details.
 */
export async function viewPrintPdf(details, language) {
  var snapshot = snapshotCardDetails(details)
  var bytes = await buildPrintPdfBytes(snapshot, language)
  var blob = new Blob([bytes], { type: 'application/pdf' })
  if (lastPrintPdfUrl) {
    try {
      URL.revokeObjectURL(lastPrintPdfUrl)
    } catch (e) {}
    lastPrintPdfUrl = ''
  }
  var url = URL.createObjectURL(blob)
  lastPrintPdfUrl = url
  var fileName = printPdfFileName(snapshot)

  var win = window.open(url, 'colliers-print-pdf-' + Date.now())
  if (!win) {
    var a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  setTimeout(function () {
    try {
      if (lastPrintPdfUrl === url) {
        URL.revokeObjectURL(url)
        lastPrintPdfUrl = ''
      }
    } catch (e) {}
  }, 120000)
}

export var PRINT_PDF_PAGE = {
  widthIn: TRIM_W_IN + BLEED_IN * 2,
  heightIn: TRIM_H_IN + BLEED_IN * 2,
  trimWIn: TRIM_W_IN,
  trimHIn: TRIM_H_IN,
  bleedIn: BLEED_IN,
}
