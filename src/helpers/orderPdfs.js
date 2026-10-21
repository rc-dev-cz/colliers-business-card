import { buildPrintPdfBytes } from './printPdf.js'
import { removeStorage } from './storage.js'

/**
 * Place Order: every ordered card gets its print-ready PDF as base64 (FileMaker converts it
 * back to a PDF). It travels in the order object only: nothing is stored in the browser, and
 * a PDF problem never blocks the order. Real cards only: no preview samples (C.M., sample
 * address).
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

/** Set to false to not build or send the print PDFs at all. */
export var SEND_PDFS_TO_FILEMAKER = true

/**
 * Older versions kept the PDFs of the last orders in localStorage ("colliers-v2.printPdfs").
 * They hold names and addresses, so any leftovers are removed at login, logout and Place Order.
 */
export var LEGACY_PRINT_PDFS_KEY = 'printPdfs'
export function clearStoredPrintPdfs() {
  removeStorage(LEGACY_PRINT_PDFS_KEY)
}

/**
 * payload.cards[]: one PDF per unique card (however many shipping groups use it),
 * linked to payload.groups[].items[] by line_ref. order.print_pdf_status says what happened
 * (ok | disabled | failed: ...).
 */
export function attachPrintPdfCards(payload, pdfs, lines, sendToFileMaker) {
  var send = sendToFileMaker === undefined ? SEND_PDFS_TO_FILEMAKER : sendToFileMaker
  payload.cards = send
    ? Object.keys(pdfs).map(function (ref) {
        var line = (lines || []).find(function (row) {
          return String(row.id) === ref
        })
        return {
          line_ref: ref,
          language: String(
            (line && (line.language || (line.details && line.details.language))) || ''
          ),
          print_pdf_file_name: pdfs[ref].file_name,
          print_pdf_base64: pdfs[ref].base64,
        }
      })
    : []
  payload.order.print_pdf_status = send ? 'ok' : 'disabled'
  return payload
}

export function markPrintPdfFailed(payload, error) {
  payload.cards = []
  payload.order.print_pdf_status =
    'failed: ' + (error && error.message ? error.message : String(error))
  return payload
}
