/**
 * Email max: guide USR-034 was 40; set to 50 so full
 * `@colliersprojectleaders.com` addresses fit (e.g. first.lastname@… = 41).
 */
export const NAME_MAX = 30
export const EMAIL_MAX = 50
export const PHONE_DIGITS = 10

export function clipName(value) {
  return String(value || '').slice(0, NAME_MAX)
}

export function clipEmail(value) {
  return String(value || '').slice(0, EMAIL_MAX)
}

export function digitsOnly(value, max) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, max == null ? PHONE_DIGITS : max)
}

export function formatCanadianLocal(digits) {
  const source = String(digits || '')
  if (source.length <= 3) return source
  if (source.length <= 6) return source.slice(0, 3) + ' ' + source.slice(3)
  return source.slice(0, 3) + ' ' + source.slice(3, 6) + '-' + source.slice(6)
}

/** Card preview / PDF: always show Canadian +1 with spaced local number. */
export function formatCardPhone(value) {
  if (!value) return ''
  var cleaned = String(value).replace(/\D/g, '')
  var local = cleaned
  if (cleaned.length === 11 && cleaned.charAt(0) === '1') local = cleaned.slice(1)
  if (local.length === 10) {
    return '+1 ' + local.slice(0, 3) + ' ' + local.slice(3, 6) + ' ' + local.slice(6)
  }
  return String(value)
}
