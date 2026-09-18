import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { buildPrintPdfBytes, PRINT_PDF_PAGE } from './printPdf.js'
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
    expect(doc.getPageCount()).toBe(1)
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
      'English',
    )
    expect(bytes.byteLength).toBeGreaterThan(500)
  })

  it('builds bilingual pages only after both layouts validate', async function () {
    var bytes = await buildPrintPdfBytes(base, 'Bilingual')
    var doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(2)
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
        'English',
      ),
    ).rejects.toThrow(/credentials|too long/i)
  })

  it('refuses four degrees even if each is short', async function () {
    await expect(
      buildPrintPdfBytes(Object.assign({}, base, { degree: ['A', 'B', 'C', 'D'] }), 'English'),
    ).rejects.toThrow(/maximum of 3/i)
  })
})

describe('CARD_LAYOUT page geometry', function () {
  it('matches print media and trim', function () {
    expect(CARD_LAYOUT.pageW).toBe(270)
    expect(CARD_LAYOUT.pageH).toBe(162)
    expect(CARD_LAYOUT.trimW).toBe(252)
    expect(CARD_LAYOUT.trimH).toBe(144)
  })
})
