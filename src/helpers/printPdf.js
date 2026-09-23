import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { loadBytes, loadLayoutFonts, loadOpenSansBytes } from './cardFonts.js'
import {
  CARD_BACK_LEGAL,
  CARD_LAYOUT,
  layoutErrorMessage,
  planProductLayout,
  snapshotCardDetails,
} from './cardLayout.js'
import {
  formatCredentialSuffix,
  previewAddressText,
  previewCredentialText,
} from './formatCardIdentity.js'
import lockupEnUrl from '../assets/brand-lockup-en.png?url'
import logoUrl from '../assets/colliers-logo-print.png?url'

var L = CARD_LAYOUT
var PAGE_W = L.pageW
var PAGE_H = L.pageH
var BLEED = L.bleed
var TRIM_W = L.trimW
var TRIM_H = L.trimH

var COLLIERS_BLUE = rgb(3 / 255, 67 / 255, 140 / 255)
var WHITE = rgb(1, 1, 1)
var GRAY = rgb(95 / 255, 99 / 255, 106 / 255)

function applyPrintPageBoxes(page) {
  page.setMediaBox(0, 0, PAGE_W, PAGE_H)
  page.setCropBox(0, 0, PAGE_W, PAGE_H)
  page.setBleedBox(0, 0, PAGE_W, PAGE_H)
  page.setTrimBox(BLEED, BLEED, TRIM_W, TRIM_H)
  page.setArtBox(BLEED, BLEED, TRIM_W, TRIM_H)
}

function drawText(page, text, opts) {
  if (!text) return
  page.drawText(String(text), {
    x: opts.x,
    y: opts.y,
    size: opts.size,
    font: opts.font,
    color: opts.color,
  })
}

function drawLinesUpFromBottom(page, lines, opts) {
  var list = Array.isArray(lines) ? lines : []
  var y = opts.bottomY + (list.length - 1) * opts.lineHeight
  list.forEach(function (line, idx) {
    drawText(page, line, {
      x: opts.x,
      y: y - idx * opts.lineHeight,
      size: opts.size,
      font: opts.font,
      color: opts.color,
    })
  })
}

async function embedPrintAssets(pdfDoc) {
  var sans = await loadOpenSansBytes()
  var regular = await pdfDoc.embedFont(sans.regular)
  var bold = await pdfDoc.embedFont(sans.bold)
  var logo = await pdfDoc.embedPng(await loadBytes(logoUrl))
  var lockupEn = await pdfDoc.embedPng(await loadBytes(lockupEnUrl))
  return { font: regular, fontBold: bold, logo: logo, lockupEn: lockupEn }
}

function drawCardPage(pdfDoc, pagePlan, assets) {
  var fields = pagePlan.fields
  var layout = pagePlan.layout
  var font = assets.font
  var fontBold = assets.fontBold
  var page = pdfDoc.addPage([PAGE_W, PAGE_H])
  applyPrintPageBoxes(page)

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
    drawText(page, fields.tagline1, {
      x: L.taglineX,
      y: L.taglineY1,
      size: L.taglineSize,
      font: font,
      color: COLLIERS_BLUE,
    })
    drawText(page, fields.tagline2, {
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

  layout.nameLines.forEach(function (line, idx) {
    drawText(page, line, {
      x: identityX,
      y: layout.nameLineYs[idx],
      size: L.nameSize,
      font: fontBold,
      color: COLLIERS_BLUE,
    })
  })

  if (layout.inlineCredential) {
    var last = layout.nameLines[layout.nameLines.length - 1] || ''
    var used = fontBold.widthOfTextAtSize(last, L.nameSize)
    drawText(page, layout.inlineCredential, {
      x: identityX + used,
      y: layout.lastNameY,
      size: L.credentialSize,
      font: fontBold,
      color: COLLIERS_BLUE,
    })
  }

  if (layout.credentialLine) {
    drawText(page, layout.credentialLine, {
      x: identityX,
      y: layout.credentialY,
      size: L.credentialSize,
      font: fontBold,
      color: COLLIERS_BLUE,
    })
  }

  drawText(page, layout.title, {
    x: identityX,
    y: layout.titleY,
    size: L.bodySize,
    font: font,
    color: GRAY,
  })
  if (layout.team) {
    drawText(page, layout.team, {
      x: identityX,
      y: layout.teamY,
      size: L.bodySize,
      font: font,
      color: GRAY,
    })
  }

  drawText(page, layout.email, {
    x: identityX,
    y: layout.emailY,
    size: L.bodySize,
    font: font,
    color: GRAY,
  })
  drawText(page, layout.phone, {
    x: identityX,
    y: layout.phoneY,
    size: L.bodySize,
    font: font,
    color: GRAY,
  })
  drawText(page, layout.website, {
    x: identityX,
    y: layout.websiteY,
    size: L.bodySize,
    font: font,
    color: GRAY,
  })

  drawLinesUpFromBottom(page, layout.address.lines, {
    x: layout.address.x,
    bottomY: layout.address.bottomY,
    lineHeight: layout.address.lineHeight,
    size: L.bodySize,
    font: font,
    color: GRAY,
  })
}

/** Back face from the ICT master: blue field, white L, legal name. Same for EN and FR. */
function drawCardBack(pdfDoc, assets) {
  var page = pdfDoc.addPage([PAGE_W, PAGE_H])
  applyPrintPageBoxes(page)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_W,
    height: PAGE_H,
    color: COLLIERS_BLUE,
  })
  var inset = 18
  var x = BLEED + inset
  var y = BLEED + inset
  var top = BLEED + TRIM_H
  var right = BLEED + TRIM_W
  page.drawLine({
    start: { x: x, y: top },
    end: { x: x, y: y },
    thickness: 0.5,
    color: WHITE,
  })
  page.drawLine({
    start: { x: x, y: y },
    end: { x: right, y: y },
    thickness: 0.5,
    color: WHITE,
  })
  var size = 6.5
  var textWidth = assets.font.widthOfTextAtSize(CARD_BACK_LEGAL, size)
  drawText(page, CARD_BACK_LEGAL, {
    x: right - inset - textWidth,
    y: top - 23.36,
    size: size,
    font: assets.font,
    color: WHITE,
  })
}

function throwLayoutError(productPlan) {
  var code = productPlan.errors[0]
  var err = new Error(layoutErrorMessage(code))
  err.code = code
  throw err
}

/** Lines drawn when no office is selected. Null keeps the planned address. */
export function printAddressLines(address, language) {
  var text = address != null ? String(address).trim() : ''
  if (text) return null
  return previewAddressText('', language).split('\n')
}

/** ", C.M." drawn when no degree or credential is entered. Null keeps the planned suffix. */
export function printInlineCredential(details, language) {
  var degree = details && details.degree
  var extra = details && details.additionalCredentials
  if (formatCredentialSuffix(degree, extra)) return null
  var cred = previewCredentialText(degree, extra, language)
  if (!cred) return null
  return ', ' + cred
}

function applyPrintCredentialPlaceholder(productPlan, details) {
  productPlan.pages.forEach(function (page) {
    var inline = printInlineCredential(details, page.language)
    if (!inline || !page.layout) return
    if (page.layout.credentialLine) {
      page.layout.credentialLine = inline.replace(/^, /, '')
      return
    }
    page.layout.inlineCredential = inline
    page.layout.credentialLine = ''
    page.layout.credMode = 'inline'
    if (page.fields) page.fields.credentialSuffix = inline.replace(/^, /, '')
  })
}

function applyPrintAddressPlaceholder(productPlan, details) {
  var address = details && details.address
  productPlan.pages.forEach(function (page) {
    var lines = printAddressLines(address, page.language)
    if (!lines || !page.layout || !page.layout.address) return
    page.layout.address.lines = lines
    if (page.fields) page.fields.address = lines.join('\n')
  })
}

export async function buildPrintPdfBytes(details, language) {
  var snapshot = snapshotCardDetails(details)
  var measureFonts = await loadLayoutFonts()
  var productPlan = planProductLayout(snapshot, language, measureFonts)
  applyPrintCredentialPlaceholder(productPlan, snapshot)
  applyPrintAddressPlaceholder(productPlan, snapshot)
  if (!productPlan.valid) throwLayoutError(productPlan)

  var pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  var assets = await embedPrintAssets(pdfDoc)

  productPlan.pages.forEach(function (pagePlan) {
    drawCardPage(pdfDoc, pagePlan, assets)
    drawCardBack(pdfDoc, assets)
  })

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
  widthIn: L.trimWIn + L.bleedIn * 2,
  heightIn: L.trimHIn + L.bleedIn * 2,
  trimWIn: L.trimWIn,
  trimHIn: L.trimHIn,
  bleedIn: L.bleedIn,
}
