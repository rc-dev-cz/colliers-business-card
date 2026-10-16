import { jobTitlesEn } from '../data/products.js'
import { MOCK_OFFICES } from '../data/offices.js'

export { MOCK_OFFICES }

// Offices come from the local managed list (Manage Addresses) until the FileMaker
// hook supplies them. No GET to the old /api host.

function field(address, camel, snake) {
  return String(
    (address && (address[camel] != null ? address[camel] : address[snake])) || ''
  ).trim()
}

export function formatAddressLine(address) {
  if (!address) return ''
  const street = [
    field(address, 'addressStreet', 'address_street'),
    field(address, 'addressStreet2', 'address_street2'),
  ]
    .filter(Boolean)
    .join(', ')
  const city = field(address, 'addressCity', 'address_city')
  const region = [
    field(address, 'addressProvince', 'address_province'),
    field(address, 'addressPostalZip', 'address_postal_zip'),
  ]
    .filter(Boolean)
    .join(' ')
  const cityLine = [city, region].filter(Boolean).join(', ')
  const fromFields = [street, cityLine].filter(Boolean).join(', ')
  if (fromFields) return fromFields
  if (address.line) return String(address.line).trim()
  if (address.cardAddress) {
    return String(address.cardAddress)
      .replace(/\r/g, '')
      .split('\n')
      .filter(Boolean)
      .join(', ')
      .trim()
  }
  if (address.line) return String(address.line).trim()
  if (address.listLabel) return String(address.listLabel).trim()
  return ''
}

export function formatAddressCard(address) {
  if (!address) return ''
  const street = field(address, 'addressStreet', 'address_street')
  const street2 = field(address, 'addressStreet2', 'address_street2')
  const city = field(address, 'addressCity', 'address_city')
  const province = field(address, 'addressProvince', 'address_province')
  const postal = field(address, 'addressPostalZip', 'address_postal_zip')
  const country = field(address, 'addressCountry', 'address_country') || 'Canada'

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
  if (address && String(address.listLabel || '').trim()) return String(address.listLabel).trim()
  const name = field(address, 'addressName', 'address_name')
  const line = formatAddressLine(address)
  return [name, line].filter(Boolean).join(' — ')
}

export async function fetchTitles() {
  return { data: jobTitlesEn.slice(), source: 'mock', error: '' }
}

export async function submitOrder(payload) {
  return {
    ok: true,
    source: 'mock',
    orderId: 'mock-' + Date.now(),
    payload: payload || {},
  }
}
