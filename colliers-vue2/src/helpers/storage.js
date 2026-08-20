const PREFIX = 'colliers-v2.'

export function profileStorageKey(base, email) {
  const slug = String(email || 'demo').trim().toLowerCase() || 'demo'
  return base + ':' + slug
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
