/** Live Colliers API host (FileMaker / client-portal). */
export const COLLIERS_API_HOST = 'https://colliers-dev-rc.clientportal.cloud'

/**
 * In local Vite, call same-origin `/api` (proxied) to avoid CORS / hung browser fetches.
 * Elsewhere use the absolute API host.
 */
export const COLLIERS_API_BASE = import.meta.env.DEV
  ? '/api'
  : `${COLLIERS_API_HOST}/api`

const FETCH_TIMEOUT_MS = 10000

/**
 * @typedef {object} ColliersAddress
 * @property {number} id
 * @property {string} addressName
 * @property {string} addressStreet
 * @property {string} addressStreet2
 * @property {string} addressCity
 * @property {string} addressProvince
 * @property {string} addressPostalZip
 * @property {string} addressCountry
 */

async function fetchJson(url, { timeoutMs = FETCH_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs / 1000}s`)
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/**
 * List Colliers office addresses from FileMaker.
 * @returns {Promise<{ data: ColliersAddress[], source: 'api' }>}
 */
export async function fetchOfficeAddresses() {
  const body = await fetchJson(`${COLLIERS_API_BASE}/addresses`)
  if (!body || body.success !== true || !Array.isArray(body.data)) {
    throw new Error('Invalid addresses response')
  }
  return { data: body.data, source: 'api' }
}

function field(address, camel, snake) {
  return String(address?.[camel] ?? address?.[snake] ?? '').trim()
}

/** One-line display string for an office (or personal) address record. */
export function formatAddressLine(address) {
  if (!address) return ''
  const street = [field(address, 'addressStreet', 'address_street'), field(address, 'addressStreet2', 'address_street2')]
    .filter(Boolean)
    .join(', ')
  const city = field(address, 'addressCity', 'address_city')
  const region = [field(address, 'addressProvince', 'address_province'), field(address, 'addressPostalZip', 'address_postal_zip')]
    .filter(Boolean)
    .join(' ')
  const cityLine = [city, region].filter(Boolean).join(', ')
  return [street, cityLine].filter(Boolean).join(', ')
}

/** Multiline string printed on the business card. */
export function formatAddressCard(address) {
  if (!address) return ''
  const line1 = [field(address, 'addressStreet', 'address_street'), field(address, 'addressStreet2', 'address_street2')]
    .filter(Boolean)
    .join(', ')
  const line2 = [
    field(address, 'addressCity', 'address_city'),
    [field(address, 'addressProvince', 'address_province'), field(address, 'addressPostalZip', 'address_postal_zip')]
      .filter(Boolean)
      .join(' '),
  ]
    .filter(Boolean)
    .join(', ')
  return [line1, line2].filter(Boolean).join('\n')
}

export function officeLabel(address) {
  const name = field(address, 'addressName', 'address_name')
  const line = formatAddressLine(address)
  return [name, line].filter(Boolean).join(' — ')
}
