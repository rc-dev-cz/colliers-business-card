import { readStorage, writeStorage } from './storage'
import { MOCK_OFFICES } from '../adapters/api.js'

export const OFFICES_STORAGE_KEY = 'managedOffices'

function createId() {
  return 'office-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export function emptyOffice() {
  return {
    id: '',
    addressName: '',
    addressStreet: '',
    addressStreet2: '',
    addressCity: '',
    addressProvince: '',
    addressPostalZip: '',
    addressCountry: 'Canada',
  }
}

export function createOfficeRecord(fields) {
  const payload = fields || {}
  return Object.assign(emptyOffice(), payload, {
    id: payload.id || createId(),
    addressCountry: String(payload.addressCountry || '').trim() || 'Canada',
  })
}

export function loadManagedOffices() {
  const stored = readStorage(OFFICES_STORAGE_KEY, null)
  if (Array.isArray(stored) && stored.length) {
    return stored.map(function (row) {
      return createOfficeRecord(row)
    })
  }
  return MOCK_OFFICES.map(function (row) {
    return createOfficeRecord(row)
  })
}

export function saveManagedOffices(rows) {
  writeStorage(OFFICES_STORAGE_KEY, Array.isArray(rows) ? rows : [])
}
