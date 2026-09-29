/**
 * Short / long Customize examples for marketing review.
 * Run: npx vitest run src/helpers/printPdf.shortLong.spec.js
 */
import { describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { APPROVAL_MAXIMUM, APPROVAL_STANDARD } from './approvalSamples.js'
import { buildPrintPdfBytes } from './printPdf.js'

var here = dirname(fileURLToPath(import.meta.url))
var outDir = join(here, '../../docs/samples/print-pdf')

var SAMPLES = [
  { label: 'short', details: APPROVAL_STANDARD, file: 'Colliers-Sample-Short.pdf' },
  { label: 'long', details: APPROVAL_MAXIMUM, file: 'Colliers-Sample-Long.pdf' },
]

describe('print PDF short / long marketing samples', function () {
  it('writes short and long English sample PDFs', async function () {
    mkdirSync(outDir, { recursive: true })
    for (var i = 0; i < SAMPLES.length; i++) {
      var sample = SAMPLES[i]
      var bytes = await buildPrintPdfBytes(sample.details, 'English')
      var doc = await PDFDocument.load(bytes)
      expect(doc.getPageCount()).toBe(2)
      writeFileSync(join(outDir, sample.file), Buffer.from(bytes))
    }
  })
})
