import { jobTitles } from '../data/products.js'

export const COLLIERS_API_HOST = 'https://colliers-dev-rc.clientportal.cloud'

const FETCH_TIMEOUT_MS = 10000

export const MOCK_OFFICES = [
  {
    id: 1,
    addressName: 'Toronto — Bay Street',
    addressStreet: '181 Bay Street',
    addressStreet2: 'Suite 1400',
    addressCity: 'Toronto',
    addressProvince: 'ON',
    addressPostalZip: 'M5J 2T3',
    addressCountry: 'Canada',
  },
  {
    id: 2,
    addressName: 'Vancouver',
    addressStreet: '200 Granville Street',
    addressStreet2: 'Suite 1900',
    addressCity: 'Vancouver',
    addressProvince: 'BC',
    addressPostalZip: 'V6C 1S4',
    addressCountry: 'Canada',
  },
]

function isDev() {
  try {
    return Boolean(import.meta.env && import.meta.env.DEV)
  } catch (error) {
    return false
  }
}

function apiBase() {
  return isDev() ? '/api' : COLLIERS_API_HOST + '/api'
}

function field(address, camel, snake) {
  return String((address && (address[camel] != null ? address[camel] : address[snake])) || '').trim()
}

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

export function formatAddressCard(address) {
  if (!address) return ''
  const street = field(address, 'addressStreet', 'address_street')
  const street2 = field(address, 'addressStreet2', 'address_street2')
  const city = field(address, 'addressCity', 'address_city')
  const province = field(address, 'addressProvince', 'address_province')
  const postal = field(address, 'addressPostalZip', 'address_postal_zip')
  const country = field(address, 'addressCountry', 'address_country') || 'Canada'

  // Card layout (matches designer): street, suite, city/province, postal + country
  const lines = []
  if (street) lines.push(street)
  if (street2) lines.push(street2)
  const cityProvince = [city, province].filter(Boolean).join(', ')
  if (cityProvince) lines.push(cityProvince)
  const postalCountry = [postal, country].filter(Boolean).join(' ')
  if (postalCountry) lines.push(postalCountry)
  return lines.join('\n')
}

export function officeLabel(address) {
  const name = field(address, 'addressName', 'address_name')
  const line = formatAddressLine(address)
  return [name, line].filter(Boolean).join(' — ')
}

async function fetchJson(url) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = setTimeout(function () {
    if (controller) controller.abort()
  }, FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined,
    })
    if (!response.ok) {
      throw new Error('HTTP ' + response.status + ' ' + response.statusText)
    }
    return await response.json()
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error('Request timed out after ' + FETCH_TIMEOUT_MS / 1000 + 's')
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchOffices() {
  try {
    const body = await fetchJson(apiBase() + '/addresses')
    if (!body || body.success !== true || !Array.isArray(body.data)) {
      throw new Error('Invalid addresses response')
    }
    return { data: body.data, source: 'api', error: '' }
  } catch (error) {
    return {
      data: MOCK_OFFICES.slice(),
      source: 'mock',
      error: error && error.message ? error.message : 'Unable to load office addresses.',
    }
  }
}

export async function fetchTitles() {
  return { data: jobTitles.slice(), source: 'mock', error: '' }
}

export async function submitOrder(payload) {
  return {
    ok: true,
    source: 'mock',
    orderId: 'mock-' + Date.now(),
    payload: payload || {},
  }
}
