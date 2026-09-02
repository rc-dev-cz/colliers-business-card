import { readStorage, writeStorage } from './storage'

export const DEGREES_STORAGE_KEY = 'managedDegrees'

export const DEFAULT_DEGREES = [
  'Arch. Tech',
  'Dipl. Arch. Tech',
  'LEED Green Assoc.',
  'BSc',
  'Architect',
  'Eng. Tech',
  'P. Eng.',
  'MSc',
  'CA',
  'EP(CEA)',
  'PgMP',
  'BA',
  'CAPM',
  'GSC',
  'PMI-RMP',
  'Real Estate Broker',
  'CEC',
  'LEED AP',
  'PMI-SP',
  'CEM',
  'BBA',
  'PEng',
  'RPP',
  'B.Arch',
  'MBA',
  'MRICS',
  'CMC',
  'CPA',
  'MCIP',
  'B.Comm',
  'B.Sc.',
  'M.Arch',
  'B.A.',
  'C.E.T',
  'M.Sc.',
  'B.Tech',
  'C.Tech',
  'P.Eng',
  'C.E.T.',
  'M.Sc',
  'P.Eng.',
  'M.A.',
  'Ph.D.',
  'OAA',
  'FMC',
  'PMP',
  'B.Eng.',
]

export function loadManagedDegrees() {
  const stored = readStorage(DEGREES_STORAGE_KEY, null)
  if (Array.isArray(stored) && stored.length) return stored.slice()
  return DEFAULT_DEGREES.slice()
}

export function saveManagedDegrees(rows) {
  writeStorage(DEGREES_STORAGE_KEY, Array.isArray(rows) ? rows : [])
}
