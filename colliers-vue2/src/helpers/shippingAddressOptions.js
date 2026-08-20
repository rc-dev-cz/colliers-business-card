export function buildAddressOptionGroups(personalRows, officeRows, formatAddressLine, officeLabel) {
  const personal = (personalRows || []).map(function (row) {
    return {
      value: formatAddressLine(row),
      label: officeLabel(row),
    }
  })
  const offices = (officeRows || []).map(function (row) {
    return {
      value: formatAddressLine(row),
      label: officeLabel(row),
    }
  })
  return { personal: personal, offices: offices }
}

export function allAddressValues(groups) {
  if (!groups) return []
  return groups.personal.concat(groups.offices).map(function (row) {
    return row.value
  })
}

export function isKnownAddress(address, groups) {
  const value = String(address || '').trim()
  if (!value) return false
  return allAddressValues(groups).indexOf(value) !== -1
}
