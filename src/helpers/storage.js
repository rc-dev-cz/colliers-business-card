const PREFIX = 'colliers-v2.'

const TICKET_STORAGE_KEYS = ['rcTicketLogs', 'rcDeletedTicketIds', 'devTrackerV4', 'rcStorageVersion']
const TICKET_STORAGE_RAW_KEYS = ['colliers.devTrackerV4', 'colliers.rcDeletedTicketIds', 'colliers.rcTicketLogs']

export function profileStorageKey(base, email) {
  const slug = String(email || 'demo').trim().toLowerCase() || 'demo'
  return base + ':' + slug
}

/** Drop leftover ticket keys. Tickets live in git + Supabase, not localStorage. */
export function clearTicketLocalStorage() {
  TICKET_STORAGE_KEYS.forEach(function (key) {
    removeStorage(key)
  })
  TICKET_STORAGE_RAW_KEYS.forEach(function (key) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      /* ignore */
    }
  })
}

export function readStorage(key, fallback) {
  const nextFallback = arguments.length > 1 ? fallback : null
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return nextFallback
    return JSON.parse(raw)
  } catch (error) {
    return nextFallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (error) {
    /* ignore quota / private mode */
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (error) {
    /* ignore */
  }
}
