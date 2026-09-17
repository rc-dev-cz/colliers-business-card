export const products = [
  {
    code: 'BCAD-PL-BIL',
    language: 'Bilingual',
    languageKey: 'bilingual',
    price: 63,
    image:
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80',
    packaging: '250/BX',
    productType: 'Print on demand',
    minQty: 1,
    status: 'Active',
    dateAdded: '7/22/2022',
    longDescription: '',
    priceTiers: [
      { from: 1, to: 1, pricePer: 63, unitTotal: 63 },
      { from: 2, to: 99, pricePer: 60.26, unitTotal: 120.52 },
    ],
  },
  {
    code: 'BCAD-PL-ENG',
    language: 'English',
    languageKey: 'english',
    price: 63,
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
    packaging: '250/BX',
    productType: 'Print on demand',
    minQty: 1,
    status: 'Active',
    dateAdded: '7/22/2022',
    longDescription: '',
    priceTiers: [
      { from: 1, to: 1, pricePer: 63, unitTotal: 63 },
      { from: 2, to: 99, pricePer: 60.26, unitTotal: 120.52 },
    ],
  },
  {
    code: 'BCAD-PL-FR',
    language: 'French',
    languageKey: 'french',
    price: 63,
    image:
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&auto=format&fit=crop&q=80',
    packaging: '250/BX',
    productType: 'Print on demand',
    minQty: 1,
    status: 'Active',
    dateAdded: '7/22/2022',
    longDescription: '',
    priceTiers: [
      { from: 1, to: 1, pricePer: 63, unitTotal: 63 },
      { from: 2, to: 99, pricePer: 60.26, unitTotal: 120.52 },
    ],
  },
]

export function getProduct(code) {
  return products.find(function (row) {
    return row.code === code
  }) || null
}

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

/** Shared catalog placeholder labels — not real contact data. */
export const defaultCardDetails = {
  name: 'Full Name',
  degree: 'Degree/Certification, Additional Credentials',
  title: 'Title',
  region: 'Region',
  specializedTeam: 'Specialized Team',
  company: 'Colliers Project Leaders',
  email: 'Email:',
  phone: 'Phone Number',
  address: 'Address',
  website: 'colliersprojectleaders.com',
}
