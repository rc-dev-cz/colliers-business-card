import { readStorage, writeStorage, profileStorageKey } from '../helpers/storage'
import { seedPersonalAddresses } from '../helpers/addressBook'
import {
  cloneHistoryRecord,
  ORDER_HISTORY_SEED_VERSION,
  seedOrderHistory,
} from '../helpers/orderHistory'

function personalKey(email) {
  return profileStorageKey('addressBook', email)
}

function historyKey(email) {
  return profileStorageKey('orderHistory', email)
}

export function loadPersonalAddresses(email) {
  const stored = readStorage(personalKey(email), null)
  if (Array.isArray(stored)) return stored
  const seed = seedPersonalAddresses()
  writeStorage(personalKey(email), seed)
  return seed
}

export function savePersonalAddresses(email, rows) {
  writeStorage(personalKey(email), Array.isArray(rows) ? rows : [])
}

function historySeedKey(email) {
  return profileStorageKey('orderHistorySeed', email)
}

/**
 * A history saved before newer seed orders existed gets the missing ones (by id) once,
 * newest date first. Orders the user placed are kept.
 */
function addNewSeeds(email, rows) {
  if (readStorage(historySeedKey(email), 1) >= ORDER_HISTORY_SEED_VERSION) return rows
  const have = {}
  rows.forEach(function (row) {
    have[String(row.id)] = true
  })
  const added = seedOrderHistory().filter(function (row) {
    return !have[String(row.id)]
  })
  const next = rows.concat(added).sort(function (a, b) {
    return String(b.date || '').localeCompare(String(a.date || ''))
  })
  writeStorage(historyKey(email), next)
  writeStorage(historySeedKey(email), ORDER_HISTORY_SEED_VERSION)
  return next
}

export function loadOrderHistory(email) {
  const stored = readStorage(historyKey(email), null)
  if (Array.isArray(stored)) {
    return addNewSeeds(email, stored).map(function (row) {
      return cloneHistoryRecord(row)
    })
  }
  const seed = seedOrderHistory()
  writeStorage(historyKey(email), seed)
  writeStorage(historySeedKey(email), ORDER_HISTORY_SEED_VERSION)
  return seed
}

export function saveOrderHistory(email, rows) {
  writeStorage(
    historyKey(email),
    (Array.isArray(rows) ? rows : []).map(function (row) {
      return cloneHistoryRecord(row)
    })
  )
}
