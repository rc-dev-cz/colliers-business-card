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
    image:
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80',
  }),
  makeProduct({
    code: 'BCAD-PL-ENG',
    language: 'English',
    languageKey: 'english',
    nameKey: 'productEnglish',
    previewKey: 'previews.eng',
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
  }),
  makeProduct({
    code: 'BCAD-PL-FR',
    language: 'French',
    languageKey: 'french',
    nameKey: 'productFrench',
    previewKey: 'previews.fr',
    image:
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&auto=format&fit=crop&q=80',
  }),
]

export function getProduct(code) {
  return (
    products.find(function (row) {
      return row.code === code
    }) || null
  )
}

/** Seed for Manage Designations / Customize titleOptions until FileMaker loads. */
export const jobTitles = [
  'Associate',
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
