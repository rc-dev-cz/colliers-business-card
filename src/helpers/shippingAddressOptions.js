export function buildAddressOptionGroups(personalRows, officeRows, formatAddressLine, officeLabel) {
  const personal = (personalRows || []).map((row) => ({
    value: formatAddressLine(row),
    label: officeLabel(row),
  }))
  const offices = (officeRows || []).map((row) => ({
    value: formatAddressLine(row),
    label: officeLabel(row),
  }))
  return { personal, offices }
}

export function allAddressValues(groups) {
  if (!groups) return []
  return [...groups.personal, ...groups.offices].map((row) => row.value)
}

export function isKnownAddress(address, groups) {
  const value = String(address || '').trim()
  if (!value) return false
  return allAddressValues(groups).includes(value)
}
