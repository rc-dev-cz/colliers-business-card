/**
 * Client sample print PDFs for Mark / Cynthia review.
 * Run: npm run export:print-pdfs
 */
import { describe, expect, it } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { buildPrintPdfBytes } from './printPdf.js'

var here = dirname(fileURLToPath(import.meta.url))
var outDir = join(here, '../../docs/samples/print-pdf')

/** Realistic mock for print-test handoff (not empty ICT placeholders). */
var SAMPLE_DETAILS = {
  name: 'Kevin Collins',
  title: 'Associate Director',
  region: 'Ontario',
  specializedTeam: 'Project Management',
  degree: ['P.Eng'],
  additionalCredentials: '',
  email: 'kevin.collins@colliersprojectleaders.com',
  phone: '4165550142',
  address: '181 Bay Street, Suite 1400\nToronto, ON\nM5J 2T3\nCanada',
}

var SAMPLES = [
  { language: 'English', file: 'Colliers-Sample-EN.pdf', pages: 2 },
  { language: 'French', file: 'Colliers-Sample-FR.pdf', pages: 2 },
  { language: 'Bilingual', file: 'Colliers-Sample-Bilingual.pdf', pages: 4 },
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
