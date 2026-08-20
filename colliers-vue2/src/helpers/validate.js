/** Match the Vue 3 prototype limits (USR-032 / USR-034 stay product tickets). */
export const NAME_MAX = 30
export const EMAIL_MAX = 30
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
