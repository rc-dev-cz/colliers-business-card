import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { buildPrintPdfBytes, PRINT_PDF_PAGE } from './printPdf.js'

describe('printPdf', function () {
  it('builds a 3.75 by 2.25 inch page from card details', async function () {
    var bytes = await buildPrintPdfBytes({
      name: 'Ada Lovelace',
      title: 'Associate | Canada',
      email: 'ada@example.com',
      phone: '4165550100',
      address: '1 University Ave\nToronto, ON',
      website: 'colliers.com/canada',
    }, 'English')
    var doc = await PDFDocument.load(bytes)
    var page = doc.getPages()[0]
    var size = page.getSize()
    expect(PRINT_PDF_PAGE.widthIn).toBe(3.75)
    expect(PRINT_PDF_PAGE.heightIn).toBe(2.25)
    expect(size.width).toBeCloseTo(3.75 * 72, 5)
    expect(size.height).toBeCloseTo(2.25 * 72, 5)
    expect(doc.getPageCount()).toBe(1)
  })

  it('wraps names longer than 20 characters onto two lines', async function () {
    var bytes = await buildPrintPdfBytes({
      name: 'sdasdasdasddsdsdsdsddasd',
      title: 'Director | Canada',
      email: 'asdasd@asd.asd',
      phone: '345345456456',
    }, 'English')
    expect(bytes.byteLength).toBeGreaterThan(500)
    var doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(1)
  })

  it('joins degrees and credentials on the identity line', async function () {
    var bytes = await buildPrintPdfBytes({
      name: 'Firstname Lastname',
      degree: ['Arch. Tech', 'Architect'],
      additionalCredentials: 'C.M.',
      title: 'Title | Region',
      email: 'firstname@colliersprojectleaders.com',
      phone: '4444444444',
    }, 'English')
    expect(bytes.byteLength).toBeGreaterThan(500)
  })

  it('wraps long credentials instead of clipping them', async function () {
    var bytes = await buildPrintPdfBytes({
      name: 'Firstname Lastname',
      degree: ['Arch. Tech', 'Dipl. Arch. Tech'],
      additionalCredentials: 'C.M.',
      title: 'Associate',
      region: 'Ontario',
      specializedTeam: 'Specialized team or department',
      email: 'carlos.zabaleta@raymentcollins.com',
      phone: '+1 647 917 9683',
      address: 'Bell Tower 1700-10104 103\nAvenue NW\nEdmonton, AB\nT5J 0H8 Canada',
      website: 'colliersprojectleaders.com',
    }, 'Bilingual')
    var doc = await PDFDocument.load(bytes)
    expect(doc.getPageCount()).toBe(2)
    expect(bytes.byteLength).toBeGreaterThan(800)
  })
})
