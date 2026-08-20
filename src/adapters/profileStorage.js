import { readStorage, writeStorage, profileStorageKey } from '../helpers/storage'
import { seedPersonalAddresses } from '../helpers/addressBook'
import { cloneHistoryRecord, seedOrderHistory } from '../helpers/orderHistory'

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

export function loadOrderHistory(email) {
  const stored = readStorage(historyKey(email), null)
  if (Array.isArray(stored)) {
    return stored.map(function (row) {
      return cloneHistoryRecord(row)
    })
  }
  const seed = seedOrderHistory()
  writeStorage(historyKey(email), seed)
  return seed
}

export function saveOrderHistory(email, rows) {
  writeStorage(
    historyKey(email),
    (Array.isArray(rows) ? rows : []).map(function (row) {
      return cloneHistoryRecord(row)
    }),
  )
}
