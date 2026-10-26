/**
 * Full name: USR-032 clips the field at 50 characters so a paste cannot flood
 * the form. That is not the card capacity. The print/preview planner wraps the
 * name by whole words in the 141.52 pt identity column (Open Sans Bold 10 pt) and
 * allows at most two lines. A hyphenated surname can use the whole second line
 * and still fail well under 50 characters.
 * Email max: guide USR-034 was 40; set to 50 so full
 * `@colliersprojectleaders.com` addresses fit (e.g. first.lastname@… = 41).
 */
export const NAME_MAX = 50
export const EMAIL_MAX = 50
export const PHONE_DIGITS = 10

// Name: letters in any language (é, ñ, ç…), spaces, hyphen, apostrophe, period.
// Emoji, digits and symbols cannot print on the card (Open Sans has no glyphs).
var NAME_DISALLOWED = /[^\p{L}\p{M}\s.'\u2019-]/gu
// Free-text card fields: drop emoji, pictographs, symbol-other and invisible joiners.
var CARD_TEXT_DISALLOWED =
  /[\p{Extended_Pictographic}\p{So}\p{Cs}\p{Co}\p{Cc}\u200d]|\ufe0e|\ufe0f|\u20e3/gu

/** Allowed name characters only, single spaces, no leading space, max NAME_MAX. */
export function cleanName(value) {
  return String(value || '')
    .replace(NAME_DISALLOWED, '')
    .replace(/\s+/g, ' ')
    .replace(/^ /, '')
    .slice(0, NAME_MAX)
}

/** Strip emoji / pictographs from other card text (title FR, credentials, team). */
export function cleanCardText(value) {
  return String(value || '').replace(CARD_TEXT_DISALLOWED, '')
}

export function clipName(value) {
  return cleanName(value)
}

/** name@domain.tld, no spaces. Blank is "not valid" too; callers check blank separately. */
var EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value) {
  return EMAIL_FORMAT.test(String(value || '').trim())
}

export function clipEmail(value) {
  return String(value || '').slice(0, EMAIL_MAX)
}

export var EMAIL_DOMAIN = 'colliersprojectleaders.com'

function emailLocalPart(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '')
}

/**
 * firstname.lastname@colliersprojectleaders.com once the name has a first and last part.
 * Returns '' until then. The domain is kept intact if the local part must be shortened,
 * both for EMAIL_MAX and, when `fits` is given, for the printed email line.
 */
export function emailFromFullName(name, fits) {
  var parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (parts.length < 2) return ''
  var first = emailLocalPart(parts[0])
  var last = emailLocalPart(parts[parts.length - 1])
  if (!first || !last) return ''
  var domain = '@' + EMAIL_DOMAIN
  var local = first + '.' + last
  var maxLocal = EMAIL_MAX - domain.length
  if (local.length > maxLocal) local = local.slice(0, maxLocal).replace(/\.+$/, '')
  if (typeof fits === 'function') {
    while (local && !fits(local + domain)) local = local.slice(0, -1).replace(/\.+$/, '')
  }
  if (!local || local.charAt(0) === '.') return ''
  return local + domain
}

// Longest number kept in the Mobile field (E.164). Extra digits stay visible so the
// error can say so; they are never cut silently (a typo must not print a wrong number).
var PHONE_INPUT_MAX_DIGITS = 15
// Canadian (NANP) number: area code and exchange both start 2–9 ("0000000000" fails).
var CANADIAN_LOCAL = /^[2-9]\d{2}[2-9]\d{6}$/

/**
 * Mobile field: the local digits from whatever was typed or pasted.
 * Canadian area codes never start with 1, so a leading 1 is the +1 country
 * code and is dropped ("+1 416 555 0199" → 4165550199).
 */
export function localPhoneDigits(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .replace(/^1/, '')
    .slice(0, PHONE_INPUT_MAX_DIGITS)
}

export function formatCanadianLocal(digits) {
  const source = String(digits || '')
  if (source.length <= 3) return source
  if (source.length <= 6) return source.slice(0, 3) + ' ' + source.slice(3)
  return source.slice(0, 3) + ' ' + source.slice(3, 6) + ' ' + source.slice(6)
}

/** Card preview / PDF: Canadian 10-digit local, spaced, no country code. */
export function formatCardPhone(value) {
  if (!value) return ''
  var cleaned = String(value).replace(/\D/g, '')
  var local = cleaned
  if (cleaned.length === 11 && cleaned.charAt(0) === '1') local = cleaned.slice(1)
  // Spaces only, same as the Mobile field ("416 555 1234"); a partial number keeps the grouping.
  return [local.slice(0, 3), local.slice(3, 6), local.slice(6)].filter(Boolean).join(' ')
}

/**
 * Mobile is complete when it is a valid 10-digit Canadian number (an 11-digit
 * 1-prefixed number counts). Too many digits, or an area code / exchange starting
 * with 0 or 1, is not.
 */
export function isCompletePhone(value) {
  var cleaned = String(value || '').replace(/\D/g, '')
  if (cleaned.length === 11 && cleaned.charAt(0) === '1') cleaned = cleaned.slice(1)
  return cleaned.length === PHONE_DIGITS && CANADIAN_LOCAL.test(cleaned)
}
