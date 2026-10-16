import { describe, expect, it, vi } from 'vitest'
import { buildOrderPayload, cleanCard, logOrderPayload } from './orderPayload.js'
import { makeLine } from './cart.js'
import { MOCK_OFFICES } from '../data/offices.js'

var cart = [
  makeLine({
    id: 'line-bil',
    code: 'BCAD-PL-BIL',
    language: 'Bilingual',
    quantity: 3,
    details: {
      name: ' Firstname Lastname ',
      title: 'Associate',
      titleFr: 'Associé',
      degree: ['B.A.', ''],
      additionalCredentials: '',
      region: 'Ontario',
      specializedTeam: '',
      nameWrapped: 'UI only',
      displayTitle: 'UI only',
    },
  }),
  makeLine({ id: 'line-en', code: 'BCAD-PL-ENG', language: 'English', quantity: 1 }),
]

var personal = [
  {
    id: 'seed-home',
    addressName: 'Home Office',
    firstName: 'Firstname',
    lastName: 'Lastname',
    addressStreet: '100 King Street West',
    addressStreet2: 'Suite 5600',
    addressCity: 'Toronto',
    addressProvince: 'ON',
    addressPostalZip: 'M5X 1C9',
    addressCountry: 'Canada',
  },
]

var order = {
  splits: [
    {
      id: 1,
      itemIds: ['line-bil'],
      qtys: { 'line-bil': 3 },
      locations: [
        { id: 'loc-a', address: '300-5515 North Service Road, Burlington, ON L7L 6G4', qty: 2 },
        { id: 'loc-b', address: '100 King Street West, Suite 5600, Toronto, ON M5X 1C9', qty: 1 },
        { id: 'loc-c', address: '1 Unknown Road, Nowhere', qty: 1 },
      ],
    },
    { id: 2, itemIds: ['line-en'], qtys: {}, locations: [] },
    { id: 3, itemIds: [], qtys: {}, locations: [] },
  ],
}

describe('buildOrderPayload', function () {
  var payload = buildOrderPayload({
    cart: cart,
    order: order,
    session: { email: 'demo' },
    offices: MOCK_OFFICES,
    personalAddresses: personal,
    placedAt: '2026-10-15T12:00:00.000Z',
  })

  it('makes one group per shipping group that has items', function () {
    expect(payload.groups.map((g) => g.group_ref)).toEqual(['group-1', 'group-2'])
    expect(payload.groups[0].count_locations).toBe(3)
  })

  it('sends items with Prod. Code, QTY, Unit Price and Price', function () {
    expect(payload.groups[0].items[0]).toMatchObject({
      line_ref: 'line-bil',
      product_code: 'BCAD-PL-BIL',
      catalogue_id: null,
      qty: 3,
      cards: 750,
      unit_price: 63,
      price: 189,
    })
  })

  it('sends a structured address and type for each location', function () {
    var locs = payload.groups[0].locations
    expect(locs[0]).toMatchObject({ location_id: 1, location_type: 'office', boxes_per_item: 2 })
    expect(locs[0].address).toMatchObject({
      address_name: 'Burlington Office',
      street_1: '300-5515 North Service Road',
      street_2: null,
      city: 'Burlington',
      province: 'ON',
      postal_code: 'L7L 6G4',
      country: 'Canada',
    })
    expect(locs[1]).toMatchObject({ location_id: 'seed-home', location_type: 'personal' })
    expect(locs[1].address.address_contact).toBe('Firstname Lastname')
    expect(locs[2]).toMatchObject({ location_id: null, location_type: null })
    expect(locs[2].address.one_line).toBe('1 Unknown Road, Nowhere')
  })

  it('totals each group and the order', function () {
    expect(payload.groups[0]).toMatchObject({ total_items: 189, total_shipping: null })
    expect(payload.groups[0]).not.toHaveProperty('grand_total')
    expect(payload.order).toMatchObject({
      order_type: 'business_cards',
      email: 'demo',
      full_name: null,
      group_count: 2,
      item_count: 2,
      total_items: 252,
      total_shipping: null,
      currency: 'CAD',
    })
    expect(payload.order).not.toHaveProperty('grand_total')
  })

  it('logs one confirmation line with the payload', function () {
    var logger = { info: vi.fn() }
    logOrderPayload('ORD-1004', payload, logger)
    expect(logger.info).toHaveBeenCalledTimes(1)
    expect(logger.info.mock.calls[0][0]).toContain('Order confirmed: ORD-1004')
    expect(logger.info.mock.calls[0][1]).toBe(payload)
  })
})

describe('cleanCard', function () {
  it('keeps only printed fields, trims, and turns blanks into null', function () {
    var card = cleanCard(cart[0].details, 'Bilingual')
    expect(Object.keys(card)).not.toContain('nameWrapped')
    expect(Object.keys(card)).not.toContain('displayTitle')
    expect(card).toMatchObject({
      name: 'Firstname Lastname',
      title_fr: 'Associé',
      degrees: ['B.A.'],
      additional_credentials: null,
      specialized_team: null,
    })
  })

  it('drops the French title on single-language cards', function () {
    expect(cleanCard({ titleFr: 'Associé' }, 'English').title_fr).toBeNull()
  })
})
