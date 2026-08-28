import { readStorage, writeStorage } from './storage'
import { jobTitles } from '../data/products.js'

export const TITLES_STORAGE_KEY = 'managedTitles'

export function loadManagedTitles() {
  const stored = readStorage(TITLES_STORAGE_KEY, null)
  if (Array.isArray(stored) && stored.length) return stored.slice()
  return jobTitles.slice()
}

export function saveManagedTitles(rows) {
  writeStorage(TITLES_STORAGE_KEY, Array.isArray(rows) ? rows : [])
}
