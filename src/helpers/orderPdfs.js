import { buildPrintPdfBytes } from './printPdf.js'

/**
 * Place Order: every ordered card gets its print-ready PDF as base64, ready to be
 * stored in a FileMaker container field. Added to each payload item as
 * print_pdf_file_name + print_pdf_base64. The same card shipped to several groups is
 * built once. Real cards only: no preview samples (C.M., sample address).
 */

export function bytesToBase64(bytes) {
  var out = ''
  var chunk = 0x8000
  for (var at = 0; at < bytes.length; at += chunk) {
    out += String.fromCharCode.apply(null, bytes.subarray(at, at + chunk))
  }
  return btoa(out)
}

function fileNameFor(line) {
  var details = line.details || {}
  var safe =
    String(details.name || 'card')
      .trim()
      .replace(/[^\w-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'card'
  return 'Colliers-Business-Card-' + safe + '-' + line.id + '.pdf'
}

export async function printPdfForLine(line) {
  var details = line.details || {}
  var language = line.language || details.language || 'English'
  var bytes = await buildPrintPdfBytes(details, language, { placeholders: false })
  return { file_name: fileNameFor(line), base64: bytesToBase64(bytes) }
}

/** Adds the PDFs to payload.groups[].items[]. Throws a readable error if a card cannot be printed. */
export async function attachPrintPdfs(payload, cart) {
  var byId = {}
  ;(cart || []).forEach(function (line) {
    byId[String(line.id)] = line
  })
  var cache = {}
  var groups = (payload && payload.groups) || []
  for (var g = 0; g < groups.length; g += 1) {
    var items = groups[g].items || []
    for (var n = 0; n < items.length; n += 1) {
      var item = items[n]
      var line = byId[String(item.line_ref)]
      if (!line) throw new Error('Card ' + item.line_ref + ' is no longer in the cart.')
      var key = String(line.id)
      if (!cache[key]) {
        try {
          cache[key] = await printPdfForLine(line)
        } catch (error) {
          var who = String((line.details && line.details.name) || 'A card').trim()
          throw new Error(
            who + ': ' + (error && error.message ? error.message : 'cannot be printed')
          )
        }
      }
      item.print_pdf_file_name = cache[key].file_name
      item.print_pdf_base64 = cache[key].base64
    }
  }
  return payload
}
