import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import {
  buildPrintPdfBytes,
  printAddressLines,
  printInlineCredential,
  PRINT_PDF_PAGE,
} from './printPdf.js'
import { CARD_LAYOUT } from './cardLayout.js'

var base = {
  name: 'Ada Lovelace',
  title: 'Associate',
  region: 'Ontario',
  email: 'ada@example.com',
  phone: '4165550100',
  address: '1 University Ave\nToronto, ON',
}

describe('printPdf', function () {
  it('builds a 3.75 by 2.25 inch page from card details', async function () {
    var bytes = await buildPrintPdfBytes(base, 'English')
    var doc = await PDFDocument.load(bytes)
    var page = doc.getPages()[0]
    var size = page.getSize()
    expect(PRINT_PDF_PAGE.widthIn).toBe(3.75)
    expect(PRINT_PDF_PAGE.heightIn).toBe(2.25)
    expect(size.width).toBeCloseTo(3.75 * 72, 5)
    expect(size.height).toBeCloseTo(2.25 * 72, 5)
    expect(doc.getPageCount()).toBe(2)
  })

  it('closes the empty team row while keeping PDF contacts bottom-locked', async function () {
    var captured
    await buildPrintPdfBytes(base, 'English', {
      adjustPlan: function (plan) {
        captured = plan.pages[0].layout
      },
    })
    expect(captured.team).toBe('')
    // Region takes the closed team row; title sits one body line above it.
    expect(captured.title).toBe('Associate')
    expect(captured.regionLine).toBe('Ontario')
    expect(captured.regionY).toBe(CARD_LAYOUT.teamYNoCred)
    expect(captured.titleY).toBe(CARD_LAYOUT.titleYNoCred)
    expect(captured.emailY).toBe(43)
    expect(captured.phoneY).toBe(35)
    expect(captured.websiteY).toBe(27)
    expect(captured.address.bottomY).toBe(27)
  })

  it('sets trim/bleed/art boxes like the approved EN card', async function () {
    var bytes = await buildPrintPdfBytes(base, 'English')
    var doc = await PDFDocument.load(bytes)
    var page = doc.getPages()[0]
    expect(page.getMediaBox()).toEqual({ x: 0, y: 0, width: 270, height: 162 })
    expect(page.getBleedBox()).toEqual({ x: 0, y: 0, width: 270, height: 162 })
    expect(page.getTrimBox()).toEqual({ x: 9, y: 9, width: 252, height: 144 })
    expect(page.getArtBox()).toEqual({ x: 9, y: 9, width: 252, height: 144 })
  })

  it('joins short degrees inline on the identity line', async function () {
    var bytes = await buildPrintPdfBytes(
      Object.assign({}, base, { degree: ['CPA'], additionalCredentials: 'C.M.' }),
      'English'
    )
    expect(bytes.byteLength).toBeGreaterThan(500)
  })

  it('omits the C.M. sample when placeholders are off', async function () {
    var captured
    await buildPrintPdfBytes(base, 'English', {
      placeholders: false,
      adjustPlan: function (plan) {
        captured = plan.pages[0].layout
      },
    })
    expect(captured.inlineCredential).toBe('')
    expect(captured.credentialLine).toBe('')
  })

  it('viewPrintPdf does not inject C.M. for a real order with no degrees', async function () {
    var captured
    await buildPrintPdfBytes(
      {
        name: 'Ada Lovelace',
        title: 'Project Manager',
        degree: [],
        additionalCredentials: '',
        email: 'ada.lovelace@colliersprojectleaders.com',
        phone: '4165550100',
        address: 'Suite 100\n100 Main Street\nToronto, ON\nA1A 1A1 Canada',
      },
      'English',
      {
        placeholders: false,
        adjustPlan: function (plan) {
          captured = plan.pages[0].layout
        },
      }
    )
    expect(captured.inlineCredential).toBe('')
    expect(captured.credentialLine).toBe('')
    expect(String(captured.nameLines && captured.nameLines.join(' '))).not.toMatch(/C\.M\./)
  })

  it('keeps the C.M. sample and comma when no credential is entered', function () {
    expect(printInlineCredential({ degree: [], additionalCredentials: '' }, 'English')).toBe(
      ', C.M.'
    )
    expect(printInlineCredential({ degree: [], additionalCredentials: '' }, 'French')).toBe(
      ', C.M.'
    )
    expect(printInlineCredential({ degree: ['CPA'], additionalCredentials: '' }, 'English')).toBe(
      null
    )
    expect(printInlineCredential({ degree: [], additionalCredentials: 'P.Eng' }, 'English')).toBe(
      null
    )
  })

  it('uses the address placeholder when no office is selected', function () {
    expect(printAddressLines('', 'English')).toEqual([
      'Address name',
      'Unit, Street',
      'City, Province',
      'Postal Code, Country',
    ])
    expect(printAddressLines('', 'French')).toEqual([
      "Nom de l'adresse",
      'Unité, Rue',
      'Ville, Province',
      'Code postal, Pays',
    ])
    expect(printAddressLines('181 Bay Street\nToronto, ON', 'English')).toBe(null)
  })

  it('still builds a PDF when the address is left empty', async function () {
    var bytes = await buildPrintPdfBytes(Object.assign({}, base, { address: '' }), 'Bilingual')
    var doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(2)
  })

  it('builds bilingual pages only after both layouts validate', async function () {
    var bytes = await buildPrintPdfBytes(base, 'Bilingual')
    var doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(2)
  })

  it('builds a PDF for a long two-line name within the 50-character field limit', async function () {
    var longName = 'Carlos Moises Zabaleta Copa Project Lead'
    expect(longName.length).toBeLessThanOrEqual(50)
    expect(longName.length).toBeGreaterThan(30)
    var bytes = await buildPrintPdfBytes(Object.assign({}, base, { name: longName }), 'English')
    var doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(2)
    expect(bytes.byteLength).toBeGreaterThan(500)
  })

  it('refuses to build a PDF when credentials cannot fit on one line', async function () {
    await expect(
      buildPrintPdfBytes(
        Object.assign({}, base, {
          degree: [
            'Certified Construction Professional Extra',
            'Dipl Architectural Technology Extra Long',
          ],
        }),
        'English'
      )
    ).rejects.toThrow(/credentials|too long/i)
  })

  it('builds a PDF with more than two short degrees when they fit', async function () {
    var bytes = await buildPrintPdfBytes(
      Object.assign({}, base, { degree: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }),
      'English'
    )
    var doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(2)
  })
})

describe('CARD_LAYOUT page geometry', function () {
  it('matches print media and trim', function () {
    expect(CARD_LAYOUT.pageW).toBe(270)
    expect(CARD_LAYOUT.pageH).toBe(162)
    expect(CARD_LAYOUT.trimW).toBe(252)
    expect(CARD_LAYOUT.trimH).toBe(144)
  })

  it('sizes the lockup boxes to the designer PNG aspects', function () {
    expect(CARD_LAYOUT.logoW / CARD_LAYOUT.logoH).toBeCloseTo(1883 / 1072, 3)
    expect(CARD_LAYOUT.wordmarkEn.w / CARD_LAYOUT.wordmarkEn.h).toBeCloseTo(1377 / 736, 3)
    expect(CARD_LAYOUT.wordmarkFr.w / CARD_LAYOUT.wordmarkFr.h).toBeCloseTo(1780 / 850, 3)
  })
})
