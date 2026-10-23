export const CANADIAN_PROVINCES = [
  { value: 'AB', label: 'Alberta', labelFr: 'Alberta' },
  { value: 'BC', label: 'British Columbia', labelFr: 'Colombie-Britannique' },
  { value: 'MB', label: 'Manitoba', labelFr: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick', labelFr: 'Nouveau-Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador', labelFr: 'Terre-Neuve-et-Labrador' },
  { value: 'NS', label: 'Nova Scotia', labelFr: 'Nouvelle-Écosse' },
  { value: 'ON', label: 'Ontario', labelFr: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island', labelFr: 'Île-du-Prince-Édouard' },
  { value: 'QC', label: 'Quebec', labelFr: 'Québec' },
  { value: 'SK', label: 'Saskatchewan', labelFr: 'Saskatchewan' },
  { value: 'NT', label: 'Northwest Territories', labelFr: 'Territoires du Nord-Ouest' },
  { value: 'NU', label: 'Nunavut', labelFr: 'Nunavut' },
  { value: 'YT', label: 'Yukon', labelFr: 'Yukon' },
]

/**
 * Full province/territory names for Customize Region. The saved value is the
 * English name; the label follows the card's language, as printed: English
 * card → Quebec, French card → Québec, bilingual → "Quebec / Québec" when they differ.
 */
export const CANADIAN_REGION_OPTIONS = CANADIAN_PROVINCES.map(function (row) {
  return { value: row.label, label: row.label }
})

export function regionOptions(cardLanguage) {
  var language = String(cardLanguage || '').toLowerCase()
  return CANADIAN_PROVINCES.map(function (row) {
    var label = row.label
    if (language === 'french') label = row.labelFr
    else if (language === 'bilingual' && row.labelFr !== row.label) {
      label = row.label + ' / ' + row.labelFr
    }
    return { value: row.label, label: label }
  })
}

/** Region as printed on a card face: French faces use the French name. */
export function regionForCard(region, french) {
  var text = region != null ? String(region).trim() : ''
  if (!french || !text) return text
  var row = CANADIAN_PROVINCES.find(function (item) {
    return item.label === text
  })
  return row ? row.labelFr : text
}

export const OFFICE_COUNTRY_OPTIONS = [{ value: 'Canada', label: 'Canada' }]
