import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import openSansRegularUrl from '../assets/fonts/OpenSans-Regular.ttf?url'
import openSansBoldUrl from '../assets/fonts/OpenSans-Bold.ttf?url'

var bytesCache = null
var fontsCache = null
var fontsPromise = null

export async function loadBytes(url) {
  try {
    if (typeof fetch === 'function') {
      var res = await fetch(url)
      if (res.ok) return new Uint8Array(await res.arrayBuffer())
    }
  } catch (e) {}
  var fs = await import('node:fs')
  var path = await import('node:path')
  var { fileURLToPath } = await import('node:url')
  var filePath = String(url || '')
  if (filePath.indexOf('file:') === 0) filePath = fileURLToPath(filePath)
  else if (filePath.charAt(0) === '/') {
    var abs = path.join(process.cwd(), filePath.replace(/^\//, ''))
    if (fs.existsSync(abs)) filePath = abs
    else {
      var fromSrc = path.join(process.cwd(), 'src', filePath.replace(/^.*\/src\//, ''))
      if (fs.existsSync(fromSrc)) filePath = fromSrc
    }
  }
  return new Uint8Array(fs.readFileSync(filePath))
}

export async function loadOpenSansBytes() {
  if (bytesCache) return bytesCache
  bytesCache = {
    regular: await loadBytes(openSansRegularUrl),
    bold: await loadBytes(openSansBoldUrl),
  }
  return bytesCache
}

/** Measurement fonts only. Cached. printPdf embeds the same bytes into the output PDF. */
export async function loadLayoutFonts() {
  if (fontsCache) return fontsCache
  if (fontsPromise) return fontsPromise
  fontsPromise = (async function () {
    var bytes = await loadOpenSansBytes()
    var doc = await PDFDocument.create()
    doc.registerFontkit(fontkit)
    fontsCache = {
      font: await doc.embedFont(bytes.regular),
      fontBold: await doc.embedFont(bytes.bold),
    }
    return fontsCache
  })()
  try {
    return await fontsPromise
  } finally {
    fontsPromise = null
  }
}

export function getLayoutFontsSync() {
  return fontsCache
}
