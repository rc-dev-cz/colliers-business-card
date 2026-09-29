import lockupEn from '../assets/brand-lockup-en.png'
import lockupFr from '../assets/brand-lockup-fr.png'
import markUrl from '../assets/colliers-logo-mark.png'
import wordsEn from '../assets/lockup-words-en.svg?url'
import wordsFr from '../assets/lockup-words-fr.svg?url'
import { isFrenchLanguage } from './formatCardIdentity.js'

export function brandLockupUrl(language) {
  return isFrenchLanguage(language) ? lockupFr : lockupEn
}

/** Colliers tile (blue field, white word, color bar). Safe on the admin bar. */
export function brandMarkUrl() {
  return markUrl
}

/** Single-color wordmark. Recolor with CSS; do not filter the full lockup. */
export function brandWordmarkUrl(language) {
  return isFrenchLanguage(language) ? wordsFr : wordsEn
}

export function brandLockupAlt(language) {
  return isFrenchLanguage(language)
    ? 'Colliers Maîtres de projets'
    : 'Colliers Project Leaders'
}
