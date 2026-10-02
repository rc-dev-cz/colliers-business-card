/**
 * Client sample print PDFs for Mark / Cynthia review.
 * Run: npm run export:print-pdfs
 */
import { describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { APPROVAL_STANDARD } from './approvalSamples.js'
import { buildPrintPdfBytes } from './printPdf.js'

var here = dirname(fileURLToPath(import.meta.url))
var outDir = join(here, '../../docs/samples/print-pdf')

var SAMPLE_DETAILS = APPROVAL_STANDARD

var SAMPLES = [
  { language: 'English', file: 'Colliers-Sample-EN.pdf', pages: 2 },
  { language: 'French', file: 'Colliers-Sample-FR.pdf', pages: 2 },
  { language: 'Bilingual', file: 'Colliers-Sample-Bilingual.pdf', pages: 2 },
]

describe('print PDF client samples', function () {
  it('writes EN, FR, and bilingual sample PDFs', async function () {
    mkdirSync(outDir, { recursive: true })
    for (var i = 0; i < SAMPLES.length; i++) {
      var sample = SAMPLES[i]
      var bytes = await buildPrintPdfBytes(SAMPLE_DETAILS, sample.language)
      var doc = await PDFDocument.load(bytes)
      expect(doc.getPageCount()).toBe(sample.pages)
      writeFileSync(join(outDir, sample.file), Buffer.from(bytes))
    }
  })
})
