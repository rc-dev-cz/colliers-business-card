import { readStorage, writeStorage } from './storage'
import { jobTitles } from '../data/products.js'
import { uniqueLabels } from './labels.js'

export const TITLES_STORAGE_KEY = 'managedTitles'

export function loadManagedTitles() {
  const stored = readStorage(TITLES_STORAGE_KEY, null)
  const source = Array.isArray(stored) && stored.length ? stored.slice() : jobTitles.slice()
  // Strip legacy "| Region" suffixes; Region is a separate customize field.
  return uniqueLabels(
    source.map(function (title) {
      return String(title || '')
        .split('|')[0]
        .trim()
    })
  )
}

export function saveManagedTitles(rows) {
  writeStorage(
    TITLES_STORAGE_KEY,
    uniqueLabels(
      (rows || []).map(function (title) {
        return String(title || '')
          .split('|')[0]
          .trim()
      })
    )
  )
}
