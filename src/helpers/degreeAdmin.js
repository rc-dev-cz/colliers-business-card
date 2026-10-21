import { readStorage, writeStorage } from './storage'
import { uniqueLabels } from './labels.js'

export const DEGREES_STORAGE_KEY = 'managedDegrees'

/** Bump when the official seed changes so local stubs refresh. */
export const DEGREES_SEED_VERSION = 2
export const DEGREES_SEED_VERSION_KEY = 'managedDegreesVersion'

/** Client-approved credentials (Designations.xlsx, Oct 2026), same as FileMaker store_degrees. */
export const DEFAULT_DEGREES = [
  'Arch. Tech',
  'Architect',
  'BA',
  'BSc',
  'CA',
  'CAPM',
  'CEC',
  'CEM',
  'CET',
  'CGA',
  'CMA',
  'CPA',
  'CSDP',
  'Dipl. Arch. Tech',
  'Eng. Tech',
  'EP(CEA)',
  'GSC',
  'LEED AP',
  'LEED AP BD+C',
  'LEED AP Homes',
  'LEED AP ID+C',
  'LEED AP ND',
  'LEED AP O+M',
  'LEED Green Assoc.',
  'MSc',
  'P. Eng.',
  'PgMP',
  'PMI-RMP',
  'PMI-SP',
  'PMP',
  'PQS',
  'Real Estate Broker',
]

export function loadManagedDegrees() {
  if (readStorage(DEGREES_SEED_VERSION_KEY, 0) !== DEGREES_SEED_VERSION) {
    saveManagedDegrees(DEFAULT_DEGREES)
    writeStorage(DEGREES_SEED_VERSION_KEY, DEGREES_SEED_VERSION)
  }
  const stored = readStorage(DEGREES_STORAGE_KEY, null)
  if (Array.isArray(stored) && stored.length) return uniqueLabels(stored)
  return DEFAULT_DEGREES.slice()
}

export function saveManagedDegrees(rows) {
  writeStorage(DEGREES_STORAGE_KEY, uniqueLabels(rows))
}
