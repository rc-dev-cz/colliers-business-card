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
  return products.find((p) => p.code === code) || null
}

export const savedAddresses = [
  '123 Address Street, South Plainfield, NJ 07080',
  '7481 Lakeview Court, South Plainfield, NJ 07080',
  '7105 Cherry Hill St., Millville, NJ 08332',
  '8920 Corporate Way, San Francisco, CA 94107',
  '4455 Elm Street, Toronto, ON M5G 1K4',
]

/** Job titles shown on the card (dropdown on customize). */
export const jobTitles = [
  'Associate | Canada',
  'Senior Associate | Canada',
  'Vice President | Canada',
  'Managing Director | Canada',
  'Director | Canada',
  'Principal | Canada',
  'Broker | Canada',
  'Sales Representative | Canada',
]

/** Office addresses shown on the card (dropdown on customize). */
export const officeAddresses = [
  {
    label: '181 Bay Street, Suite 1400, Toronto, ON M5J 2T3',
    value: '181 Bay Street\nSuite 1400\nToronto, ON M5J 2T3',
  },
  {
    label: '200 Granville Street, Suite 1900, Vancouver, BC V6C 1S4',
    value: '200 Granville Street\nSuite 1900\nVancouver, BC V6C 1S4',
  },
  {
    label: '400 3rd Avenue SW, Suite 3400, Calgary, AB T2P 4H2',
    value: '400 3rd Avenue SW\nSuite 3400\nCalgary, AB T2P 4H2',
  },
  {
    label: '1000 Sherbrooke Street West, Suite 2400, Montreal, QC H3A 3G4',
    value: '1000 Sherbrooke Street West\nSuite 2400\nMontreal, QC H3A 3G4',
  },
  {
    label: '150 Elgin Street, Suite 1000, Ottawa, ON K2P 1L4',
    value: '150 Elgin Street\nSuite 1000\nOttawa, ON K2P 1L4',
  },
]

export const defaultCardDetails = {
  name: 'Hubert Blaine\nWolfeschlegelstein',
  title: 'Associate | Canada',
  company: 'Colliers',
  email: 'hubert.wolfe@colliers.com',
  phone: '+1 416 555-1234',
  address: officeAddresses[0].value,
  website: 'colliers.com/canada',
}
