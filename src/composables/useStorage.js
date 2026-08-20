const PREFIX = 'colliers.'

const TICKET_STORAGE_KEYS = ['rcTicketLogs', 'rcDeletedTicketIds', 'devTrackerV4', 'rcStorageVersion']
const TICKET_STORAGE_RAW_KEYS = ['colliers.devTrackerV4', 'colliers.rcDeletedTicketIds']

/** Drop leftover ticket keys. Tickets live in git + Supabase, not localStorage. */
export function clearTicketLocalStorage() {
  for (const key of TICKET_STORAGE_KEYS) removeStorage(key)
  for (const key of TICKET_STORAGE_RAW_KEYS) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  }
}

export function readStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* ignore quota / private mode */
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}
