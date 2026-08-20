import { formatAddressLine, officeLabel } from '../adapters/api.js'

export const SEED_PERSONAL = [
  {
    id: 'seed-home',
    addressName: 'Home Office',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    addressStreet: '100 King Street West',
    addressStreet2: 'Suite 5600',
    addressCity: 'Toronto',
    addressProvince: 'ON',
    addressPostalZip: 'M5X 1C9',
    addressCountry: 'Canada',
  },
  {
    id: 'seed-temp',
    addressName: 'Temporary Location',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    addressStreet: '200 Bay Street',
    addressStreet2: '',
    addressCity: 'Toronto',
    addressProvince: 'ON',
    addressPostalZip: 'M5J 2J2',
    addressCountry: 'Canada',
  },
]

function createId() {
  return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export function emptyPersonal() {
  return {
    id: '',
    addressName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    addressStreet: '',
    addressStreet2: '',
    addressCity: '',
    addressProvince: '',
    addressPostalZip: '',
    addressCountry: 'Canada',
  }
}

export function clonePersonal(row) {
  return Object.assign(emptyPersonal(), row || {})
}

export function seedPersonalAddresses() {
  return SEED_PERSONAL.map(function (row) {
    return clonePersonal(row)
  })
}

export function createPersonalRecord(fields) {
  return Object.assign(emptyPersonal(), fields || {}, {
    id: createId(),
    addressCountry: (fields && fields.addressCountry) || 'Canada',
  })
}

export function matchesSearch(address, query) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return true
  const haystack = [
    address.addressName,
    formatAddressLine(address),
    address.addressStreet,
    address.addressStreet2,
    address.addressCity,
    address.addressProvince,
    address.addressPostalZip,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.indexOf(q) !== -1
}

export { formatAddressLine, officeLabel }
