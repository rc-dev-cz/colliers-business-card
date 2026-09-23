import { readStorage, writeStorage } from './storage'
import { uniqueLabels } from './labels.js'

export const DEGREES_STORAGE_KEY = 'managedDegrees'

/** Unique FileMaker spellings. Do not add P.Eng / P.Eng. / M.Sc duplicates. */
export const DEFAULT_DEGREES = [
  'Arch. Tech',
  'Architect',
  'B.A.',
  'B.Arch',
  'B.Comm',
  'B.Eng.',
  'B.Tech',
  'BA',
  'BBA',
  'BSc',
  'CA',
  'CAPM',
  'CEC',
  'CEM',
  'CET',
  'CGA',
  'CMA',
  'CMC',
  'CPA',
  'CSDP',
  'C.Tech',
  'Dipl. Arch. Tech',
  'Eng. Tech',
  'EP(CEA)',
  'FMC',
  'GSC',
  'LEED AP',
  'LEED AP BD+C',
  'LEED AP Homes',
  'LEED AP ID+C',
  'LEED AP ND',
  'LEED AP O+M',
  'LEED Green Assoc.',
  'M.A.',
  'M.Arch',
  'MBA',
  'MCIP',
  'MRICS',
  'MSc',
  'OAA',
  'P. Eng.',
  'PgMP',
  'Ph.D.',
  'PMI-RMP',
  'PMI-SP',
  'PMP',
  'PQS',
  'Real Estate Broker',
  'RPP',
]

export function loadManagedDegrees() {
  const stored = readStorage(DEGREES_STORAGE_KEY, null)
  if (Array.isArray(stored) && stored.length) return uniqueLabels(stored)
  return DEFAULT_DEGREES.slice()
}

export function saveManagedDegrees(rows) {
  writeStorage(DEGREES_STORAGE_KEY, uniqueLabels(rows))
}
