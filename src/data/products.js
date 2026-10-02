import { WEBSITE_EN, WEBSITE_FR, websiteForProduct } from '../helpers/formatCardIdentity.js'

export const CARD_COMPANY = 'Colliers Project Leaders'

export const PRICE_TIERS = [
  { from: 1, to: 1, pricePer: 63, unitTotal: 63 },
  { from: 2, to: 99, pricePer: 60.26, unitTotal: 120.52 },
]

function makeProduct(row) {
  return Object.assign(
    {
      price: 63,
      packaging: '250/BX',
      minQty: 1,
      status: 'Active',
      dateAdded: '7/22/2022',
      priceTiers: PRICE_TIERS,
    },
    row
  )
}

/** Catalogue of orderable cards. Same three rows on Catalogue, Product Detail, and Shipping. */
export const products = [
  makeProduct({
    code: 'BCAD-PL-BIL',
    language: 'Bilingual',
    languageKey: 'bilingual',
    nameKey: 'productBilingual',
    previewKey: 'previews.bil',
  }),
  makeProduct({
    code: 'BCAD-PL-ENG',
    language: 'English',
    languageKey: 'english',
    nameKey: 'productEnglish',
    previewKey: 'previews.eng',
  }),
  makeProduct({
    code: 'BCAD-PL-FR',
    language: 'French',
    languageKey: 'french',
    nameKey: 'productFrench',
    previewKey: 'previews.fr',
  }),
]

export function getProduct(code) {
  return (
    products.find(function (row) {
      return row.code === code
    }) || null
  )
}

/** Map a cart line (including FileMaker codes like CPL-13616) onto a catalogue SKU. */
export function catalogCodeFromLine(line) {
  var row = line || {}
  if (getProduct(row.code)) return row.code
  var lang = String(row.language || '').toLowerCase()
  if (lang.indexOf('bil') >= 0) return 'BCAD-PL-BIL'
  if (lang.indexOf('fr') >= 0) return 'BCAD-PL-FR'
  return 'BCAD-PL-ENG'
}

/** Seed for Manage Titles / Customize titleOptions until FileMaker loads. */
export const jobTitles = [
  'Associate',
  'Associate Director',
  'Business Services Administrator',
  'Senior Associate',
  'Vice President',
  'Managing Director',
  'Director',
  'Principal',
  'Broker',
  'Sales Representative',
]

/** Empty customize card. degree is always an array. */
export function emptyCard(language) {
  var lang = language || 'English'
  return {
    language: lang,
    name: '',
    nameWrapped: '',
    degree: [],
    additionalCredentials: '',
    title: '',
    region: '',
    specializedTeam: '',
    email: '',
    emailEdited: false,
    phone: '',
    address: '',
    website: websiteForProduct(lang),
    websiteFr: WEBSITE_FR,
    company: CARD_COMPANY,
  }
}

export function emptyPreviewCard(language) {
  return {
    language: language || 'English',
    name: '',
    degree: [],
    additionalCredentials: '',
    title: '',
    region: '',
    specializedTeam: '',
    email: '',
    phone: '',
    address: '',
    website: language === 'French' ? WEBSITE_FR : WEBSITE_EN,
    company: CARD_COMPANY,
  }
}
