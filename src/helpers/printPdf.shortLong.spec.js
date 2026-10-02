/**
 * Short / long Customize examples from docs/samples/print-pdf/short-long-examples.json.
 * Run: npm run export:print-pdf-json
 *   or: npx vitest run src/helpers/printPdf.shortLong.spec.js
 */
import { describe, expect, it } from 'vitest'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFDocument } from 'pdf-lib'
import { buildPrintPdfBytes } from './printPdf.js'

var here = dirname(fileURLToPath(import.meta.url))
var root = join(here, '../..')
var jsonPath = join(root, 'docs/samples/print-pdf/short-long-examples.json')
var config = JSON.parse(readFileSync(jsonPath, 'utf8'))
var outDir = join(root, config.outDir || 'docs/samples/print-pdf')
var samples = Array.isArray(config.samples) ? config.samples : []

describe('print PDF short / long from JSON', function () {
  it('writes short and long sample PDFs from short-long-examples.json', async function () {
    expect(samples.length).toBeGreaterThan(0)
    mkdirSync(outDir, { recursive: true })
    for (var i = 0; i < samples.length; i++) {
      var sample = samples[i]
      var language = sample.language || 'English'
      var file = sample.file || 'Colliers-Sample-' + (sample.id || i) + '.pdf'
      var bytes = await buildPrintPdfBytes(sample.details || {}, language)
      var doc = await PDFDocument.load(bytes)
      expect(doc.getPageCount()).toBeGreaterThanOrEqual(2)
      writeFileSync(join(outDir, file), Buffer.from(bytes))
    }
  })
})
