import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { loadBytes, loadLayoutFonts, loadOpenSansBytes } from './cardFonts.js'
import {
  CARD_LAYOUT,
  layoutErrorMessage,
  planProductLayout,
  snapshotCardDetails,
} from './cardLayout.js'
import lockupEnUrl from '../assets/brand-lockup-en.png?url'
import logoUrl from '../assets/colliers-logo-print.png?url'

var L = CARD_LAYOUT
var PAGE_W = L.pageW
var PAGE_H = L.pageH
var BLEED = L.bleed
var TRIM_W = L.trimW
var TRIM_H = L.trimH

var COLLIERS_BLUE = rgb(3 / 255, 67 / 255, 140 / 255)
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

function throwLayoutError(productPlan) {
  var code = productPlan.errors[0]
  var err = new Error(layoutErrorMessage(code))
  err.code = code
  throw err
}

export async function buildPrintPdfBytes(details, language) {
  var snapshot = snapshotCardDetails(details)
  var measureFonts = await loadLayoutFonts()
  var productPlan = planProductLayout(snapshot, language, measureFonts)
  if (!productPlan.valid) throwLayoutError(productPlan)

  var pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  var assets = await embedPrintAssets(pdfDoc)

  productPlan.pages.forEach(function (pagePlan) {
    drawCardPage(pdfDoc, pagePlan, assets)
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
