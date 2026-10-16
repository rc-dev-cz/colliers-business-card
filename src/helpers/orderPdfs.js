import { buildPrintPdfBytes } from './printPdf.js'
import { readStorage, writeStorage } from './storage.js'

/**
 * Place Order: every ordered card gets its print-ready PDF as base64 (FileMaker converts it
 * back to a PDF). It is kept in localStorage, not added to the order request, so the request
 * stays small and a PDF problem never blocks the order. Real cards only: no preview
 * samples (C.M., sample address).
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

export var PRINT_PDFS_KEY = 'printPdfs'
var KEEP_ORDERS = 3

/** { [lineId]: { file_name, base64 } } for every card in the order payload. Throws if a card cannot be printed. */
export async function buildPrintPdfs(payload, cart) {
  var wanted = {}
  ;((payload && payload.groups) || []).forEach(function (group) {
    ;(group.items || []).forEach(function (item) {
      wanted[String(item.line_ref)] = true
    })
  })
  var out = {}
  var lines = (cart || []).filter(function (line) {
    return wanted[String(line.id)]
  })
  for (var n = 0; n < lines.length; n += 1) {
    try {
      out[String(lines[n].id)] = await printPdfForLine(lines[n])
    } catch (error) {
      var who = String((lines[n].details && lines[n].details.name) || 'A card').trim()
      throw new Error(who + ': ' + (error && error.message ? error.message : 'cannot be printed'))
    }
  }
  return out
}

/** Keeps the PDFs of the last orders in localStorage ("colliers-v2.printPdfs"), keyed by order date. */
export function savePrintPdfs(orderKey, pdfs) {
  var all = readStorage(PRINT_PDFS_KEY, {}) || {}
  all[orderKey] = pdfs
  Object.keys(all)
    .sort()
    .slice(0, Math.max(0, Object.keys(all).length - KEEP_ORDERS))
    .forEach(function (old) {
      delete all[old]
    })
  writeStorage(PRINT_PDFS_KEY, all)
  return all
}
