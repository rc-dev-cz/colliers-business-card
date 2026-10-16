import { isBilingualLanguage } from './formatCardIdentity'
import { bilingualEnglishPreviewDetails, bilingualFrenchPreviewDetails } from './titleLocale'

/**
 * Width for each card in the "Business Card Preview" modal so every card
 * (one, or two for bilingual) fits inside the modal without a scrollbar.
 * Budget: AppModal panel max 92vh, minus its header (~90px), the body's
 * py-5 padding (40px) and space-y-4 gaps (16px each). Cards are 1.75:1.
 */
export var PREVIEW_CARD_MAX_PX = 480

export function previewFrameStyle(count) {
  var n = Math.max(1, Number(count) || 1)
  var chrome = 90 + 40 + 16 * (n - 1) + 4
  return {
    maxWidth:
      'min(' + PREVIEW_CARD_MAX_PX + 'px, calc((92vh - ' + chrome + 'px) / ' + n + ' * 1.75))',
  }
}

/** Faces shown in the preview popup: bilingual lines show English then French. */
export function cardPreviewSlots(line) {
  var src = line || {}
  var details = src.details || {}
  if (isBilingualLanguage(src.language)) {
    return [
      { language: 'English', details: bilingualEnglishPreviewDetails(details) },
      { language: 'French', details: bilingualFrenchPreviewDetails(details) },
    ]
  }
  return [{ language: src.language, details: details }]
}
