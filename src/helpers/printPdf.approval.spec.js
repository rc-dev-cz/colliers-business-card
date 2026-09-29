/**
 * One-shot: write approval-guide PDFs and layout dumps for the image compositor.
 * Run: npx vitest run src/helpers/printPdf.approval.spec.js
 */
import { describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PDFDocument } from 'pdf-lib'
import { APPROVAL_MAXIMUM, APPROVAL_STANDARD } from './approvalSamples.js'
import { loadLayoutFonts } from './cardFonts.js'
import { CARD_LAYOUT, planProductLayout } from './cardLayout.js'
import { buildPrintPdfBytes } from './printPdf.js'

var outDir = join(tmpdir(), 'colliers-approval-guide')

function dumpLayout(label, details, language, fonts) {
  var plan = planProductLayout(details, language, fonts)
  var page = plan.pages[0].layout
  return {
    label: label,
    valid: plan.valid,
    errors: plan.errors,
    credMode: page.credMode,
    nameLines: page.nameLines,
    nameLineYs: page.nameLineYs,
    inlineCredential: page.inlineCredential,
    credentialLine: page.credentialLine,
    credentialY: page.credentialY,
    title: page.title,
    titleY: page.titleY,
    team: page.team,
    teamY: page.teamY,
    email: page.email,
    emailY: page.emailY,
    phone: page.phone,
    phoneY: page.phoneY,
    website: page.website,
    websiteY: page.websiteY,
    addressLines: page.address.lines,
    addressX: page.address.x,
    addressBottomY: page.address.bottomY,
    geometry: {
      pageW: CARD_LAYOUT.pageW,
      pageH: CARD_LAYOUT.pageH,
      bleed: CARD_LAYOUT.bleed,
      trimW: CARD_LAYOUT.trimW,
      trimH: CARD_LAYOUT.trimH,
      identityX: CARD_LAYOUT.identityX,
      identityWidth: CARD_LAYOUT.identityWidth,
      addressMaxWidth: CARD_LAYOUT.addressMaxWidth,
    },
  }
}

describe('approval guide PDFs', function () {
  it('writes standard and maximum generated print PDFs', async function () {
    mkdirSync(outDir, { recursive: true })
    var fonts = await loadLayoutFonts()
    var cases = [
      { key: 'standard', details: APPROVAL_STANDARD },
      { key: 'maximum', details: APPROVAL_MAXIMUM },
    ]
    for (var i = 0; i < cases.length; i++) {
      var row = cases[i]
      var dump = dumpLayout(row.key, row.details, 'English', fonts)
      expect(dump.valid, row.key + ' ' + dump.errors.join(',')).toBe(true)
      if (row.key === 'standard') {
        expect(dump.credMode).toBe('inline')
        expect(dump.nameLines.length).toBe(1)
        expect(dump.addressLines.length).toBe(4)
      } else {
        expect(dump.credMode).toBe('own-row')
        expect(dump.nameLines.length).toBe(2)
        expect(dump.addressLines.length).toBe(5)
        var emailW = fonts.font.widthOfTextAtSize(row.details.email, CARD_LAYOUT.bodySize)
        expect(emailW).toBeGreaterThan(129)
        expect(emailW).toBeLessThanOrEqual(CARD_LAYOUT.emailMaxWidth)
        expect(
          fonts.font.widthOfTextAtSize(row.details.email + 'x', CARD_LAYOUT.bodySize),
        ).toBeGreaterThan(CARD_LAYOUT.emailMaxWidth)
      }
      writeFileSync(join(outDir, row.key + '.json'), JSON.stringify(dump, null, 2))
      var bytes = await buildPrintPdfBytes(row.details, 'English')
      var doc = await PDFDocument.load(bytes)
      expect(doc.getPageCount()).toBe(2)
      var page = doc.getPages()[0]
      var media = page.getMediaBox()
      var bleed = page.getBleedBox()
      var trim = page.getTrimBox()
      expect(media.width).toBe(270)
      expect(media.height).toBe(162)
      expect(bleed.width).toBe(270)
      expect(trim.x).toBe(9)
      expect(trim.y).toBe(9)
      expect(trim.width).toBe(252)
      expect(trim.height).toBe(144)
      writeFileSync(join(outDir, row.key + '.pdf'), Buffer.from(bytes))
    }
  })
})
