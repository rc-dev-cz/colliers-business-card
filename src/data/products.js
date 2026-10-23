import { WEBSITE_EN, WEBSITE_FR, websiteForProduct } from '../helpers/formatCardIdentity.js'

export const CARD_COMPANY = 'Colliers Project Leaders'

/** Every box is $63.00 at any quantity: no volume discount, so the math stays simple. */
export const BOX_PRICE = 63

// Product Detail price table: one row, the same box price the cart bills.
export const PRICE_TIERS = [{ from: 1, to: 99, pricePer: BOX_PRICE, unitTotal: BOX_PRICE }]

function makeProduct(row) {
  return Object.assign(
    {
      price: BOX_PRICE,
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

/**
 * English title seed (English + Bilingual Customize, Manage Titles English tab) until FileMaker
 * loads store_titles. Colliers Project Leaders Titles.xlsx, Oct 2026.
 */
export const jobTitlesEn = [
  'Advisor',
  'Assistant Preconstruction Manager',
  'Assistant Project Manager',
  'Associate',
  'Business Development Manager',
  'Director',
  'Director, Preconstruction',
  'Human Resources Business Partner',
  'Independent Consultant',
  'Manager',
  'Manager, Infrastructure Advisory',
  'Managing Principal',
  'National Sector Lead',
  'Preconstruction Manager',
  'Principal',
  'Professional Practice Specialist',
  'Project Director',
  'Project Manager',
  'Proposal Writer',
  'Regional Marketing Specialist',
  'Sector Director',
  'Senior Advisor',
  'Senior Associate - Infrastructure Advisory',
  'Senior Manager, Project Controls',
  'Senior Preconstruction Manager',
  'Senior Project Manager',
  'Senior Proposal Writer',
  'Senior Vice President',
  'Talent Acquisition Business Partner',
  'Team Lead',
  'Vice President',
]

/** French title seed (French Customize, bilingual French title, Manage Titles French tab). Titles French.xlsx, Oct 2026. */
export const jobTitlesFr = [
  'Chef d’équipe',
  'Directrice',
  'Gestionnaire de Projet',
  'Gestionnaire de projet adjoint',
  'Gestionnaire de projets principal',
  'Gestionnaire de projets Senior',
  'Partenaire d’affaires sénior en acquisition de talent',
  'Responsable du développement commercial',
]

/** @deprecated Prefer jobTitlesEn / jobTitlesFr. Defaults to English for admin + bilingual. */
export const jobTitles = jobTitlesEn

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
    titleFr: '',
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
    titleFr: '',
    region: '',
    specializedTeam: '',
    email: '',
    phone: '',
    address: '',
    website: language === 'French' ? WEBSITE_FR : WEBSITE_EN,
    company: CARD_COMPANY,
  }
}
