import { readStorage, writeStorage } from './storage'
import { MOCK_OFFICES } from '../data/offices.js'

export const OFFICES_STORAGE_KEY = 'managedOffices'
/** Bump when the official Excel office seed changes so local stubs refresh. */
export const OFFICES_SEED_VERSION = 3
export const OFFICES_SEED_VERSION_KEY = 'managedOfficesVersion'

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
  const version = readStorage(OFFICES_SEED_VERSION_KEY, 0)
  if (Array.isArray(stored) && stored.length && version === OFFICES_SEED_VERSION) {
    return stored.map(function (row) {
      return createOfficeRecord(row)
    })
  }
  const seeded = MOCK_OFFICES.map(function (row) {
    return createOfficeRecord(row)
  })
  saveManagedOffices(seeded)
  writeStorage(OFFICES_SEED_VERSION_KEY, OFFICES_SEED_VERSION)
  return seeded
}

export function saveManagedOffices(rows) {
  writeStorage(OFFICES_STORAGE_KEY, Array.isArray(rows) ? rows : [])
}
