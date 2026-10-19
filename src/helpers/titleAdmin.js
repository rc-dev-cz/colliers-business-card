import { readStorage, writeStorage } from './storage'
import { jobTitlesEn, jobTitlesFr } from '../data/products.js'
import { isBilingualLanguage, isFrenchLanguage } from './formatCardIdentity.js'
import { uniqueLabels } from './labels.js'

/** Managed English titles (English + bilingual cards). */
export const TITLES_STORAGE_KEY = 'managedTitles'
/** Managed French titles (French cards, bilingual French title). */
export const TITLES_FR_STORAGE_KEY = 'managedTitlesFr'
/** Bump when the official title seed changes so local stubs refresh. */
export const TITLES_SEED_VERSION = 6
export const TITLES_SEED_VERSION_KEY = 'managedTitlesVersion'

function normalizeTitle(title) {
  return String(title || '')
    .split('|')[0]
    .trim()
}

function byTitle(a, b) {
  return a.localeCompare(b)
}

function isFrenchList(language) {
  return language === 'FR'
}

function storageKey(language) {
  return isFrenchList(language) ? TITLES_FR_STORAGE_KEY : TITLES_STORAGE_KEY
}

function seedTitles(language) {
  return isFrenchList(language) ? jobTitlesFr : jobTitlesEn
}

/** Managed titles for one list: 'EN' (default) or 'FR'. Same split as FileMaker store_titles.language. */
export function loadManagedTitles(language) {
  if (readStorage(TITLES_SEED_VERSION_KEY, 0) !== TITLES_SEED_VERSION) {
    saveManagedTitles(jobTitlesEn, 'EN')
    saveManagedTitles(jobTitlesFr, 'FR')
    writeStorage(TITLES_SEED_VERSION_KEY, TITLES_SEED_VERSION)
  }
  const stored = readStorage(storageKey(language), null)
  const source = Array.isArray(stored) && stored.length ? stored : seedTitles(language)
  // Strip legacy "| Region" suffixes; Region is a separate customize field.
  return uniqueLabels(source.map(normalizeTitle)).sort(byTitle)
}

export function saveManagedTitles(rows, language) {
  writeStorage(storageKey(language), uniqueLabels((rows || []).map(normalizeTitle)))
}

/**
 * Titles shown in Customize for a product language.
 * English + Bilingual → English list. French-only → French list.
 */
export function titlesForProductLanguage(language, managedEn, managedFr) {
  var french = isFrenchLanguage(language) && !isBilingualLanguage(language)
  var managed = french ? managedFr : managedEn
  var list = Array.isArray(managed) && managed.length ? managed : seedTitles(french ? 'FR' : 'EN')
  return uniqueLabels(list.map(normalizeTitle))
}
