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
 * Returns '' until then. The domain is kept intact if the local part must be shortened.
 */
export function emailFromFullName(name) {
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
  if (!local || local.charAt(0) === '.') return ''
  return local + domain
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
