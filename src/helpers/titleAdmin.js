import { readStorage, writeStorage } from './storage'
import { jobTitlesEn, jobTitlesFr } from '../data/products.js'
import { isBilingualLanguage, isFrenchLanguage } from './formatCardIdentity.js'
import { uniqueLabels } from './labels.js'

export const TITLES_STORAGE_KEY = 'managedTitles'
/** Bump when the official title seed changes so local stubs refresh. */
export const TITLES_SEED_VERSION = 4
export const TITLES_SEED_VERSION_KEY = 'managedTitlesVersion'

function normalizeTitle(title) {
  return String(title || '')
    .split('|')[0]
    .trim()
}

export function loadManagedTitles() {
  const stored = readStorage(TITLES_STORAGE_KEY, null)
  const version = readStorage(TITLES_SEED_VERSION_KEY, 0)
  const source =
    Array.isArray(stored) && stored.length && version === TITLES_SEED_VERSION
      ? stored.slice()
      : jobTitlesEn.slice()
  // Strip legacy "| Region" suffixes; Region is a separate customize field.
  const titles = uniqueLabels(source.map(normalizeTitle))
  if (version !== TITLES_SEED_VERSION) {
    saveManagedTitles(titles)
    writeStorage(TITLES_SEED_VERSION_KEY, TITLES_SEED_VERSION)
  }
  return titles
}

/**
 * Titles shown in Customize for a product language.
 * English + Bilingual → managed / English seed. French-only → French seed.
 */
export function titlesForProductLanguage(language, managedTitles) {
  if (isFrenchLanguage(language) && !isBilingualLanguage(language)) {
    return uniqueLabels(jobTitlesFr.map(normalizeTitle))
  }
  var managed = Array.isArray(managedTitles) ? managedTitles : []
  if (managed.length) return uniqueLabels(managed.map(normalizeTitle))
  return uniqueLabels(jobTitlesEn.map(normalizeTitle))
}

export function saveManagedTitles(rows) {
  writeStorage(TITLES_STORAGE_KEY, uniqueLabels((rows || []).map(normalizeTitle)))
}
