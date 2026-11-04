import { makeLine, lineTotal } from './cart.js'
import { billedBoxesCart, billedBoxesForLine, snapshotOrder } from './order.js'
import { CARD_COMPANY, getProduct } from '../data/products.js'
import { productNameKey } from '../i18n/messages.js'
import { MOCK_OFFICES } from '../data/offices.js'
import { SEED_PERSONAL } from './addressBook.js'
import { formatAddressLine } from '../adapters/api.js'

export const BOX_PRICE = 63
export const ORDER_STATUSES = ['Delivered', 'Shipped', 'Processing']

const BURLINGTON = '300-5515 North Service Road, Burlington, ON L7L 6G4'
const TORONTO_OFFICE = '1400-181 Bay Street, Toronto, ON M5J 2V1'
const HOME_OFFICE = '100 King Street West, Suite 5600, Toronto, ON M5X 1C9'
const TORONTO_CARD = '1400-181 Bay Street\nToronto, ON M5J 2V1'

function demoDetails(overrides) {
  return Object.assign(
    {
      name: 'Demo Partner',
      title: 'Associate',
      degree: [],
      email: 'demo@colliers.com',
      phone: '+1 416 555-0100',
      company: CARD_COMPANY,
      website: 'colliersprojectleaders.com',
      address: TORONTO_CARD,
    },
    overrides || {}
  )
}

function seedLine(payload) {
  return makeLine({
    id: payload.id,
    code: payload.code,
    language: payload.language,
    quantity: payload.quantity,
    details: demoDetails(payload.details),
  })
}

function seedRecord(payload) {
  const cart = (payload.cart || []).map(seedLine)
  return {
    id: payload.id,
    date: payload.date,
    status: payload.status,
    cart: cart,
    order: snapshotOrder({
      splits: [
        {
          id: 1,
          itemIds: cart.map(function (line) {
            return line.id
          }),
          locations: [
            {
              id: payload.locationId,
              address: payload.shipTo,
              qty: boxCount({ cart: cart }),
            },
          ],
        },
      ],
    }),
  }
}

function officeShipTo(officeId, qty) {
  const row = MOCK_OFFICES.find(function (office) {
    return Number(office.id) === Number(officeId)
  })
  return { address: formatAddressLine(row), qty: qty, addressId: officeId, addressType: 'office' }
}

function personalShipTo(personalId, qty) {
  const row = SEED_PERSONAL.find(function (address) {
    return address.id === personalId
  })
  return {
    address: formatAddressLine(row),
    qty: qty,
    addressId: personalId,
    addressType: 'personal',
  }
}

/** A personal ship-to whose address was since deleted from the Address Book (Repeat Order drops it). */
function deletedShipTo(qty) {
  return {
    address: '12 Lakeshore Road, Huntsville, ON P1H 1A1',
    qty: qty,
    addressId: 'seed-deleted-cottage',
    addressType: 'personal',
  }
}

/**
 * Seed order with several cards and shipping groups, quantities as Shipping sets them: every
 * card in a group gets that group's address-box total, and a card's quantity is the sum over
 * the groups it is in.
 *   cards:  [{ id, code, language, details }]
 *   groups: [{ cards: [card ids], shipTos: [officeShipTo / personalShipTo / deletedShipTo] }]
 */
function seedGroupedRecord(payload) {
  const totals = {}
  const splits = payload.groups.map(function (group, index) {
    const boxes = group.shipTos.reduce(function (sum, loc) {
      return sum + loc.qty
    }, 0)
    const qtys = {}
    group.cards.forEach(function (cardId) {
      qtys[cardId] = boxes
      totals[cardId] = (totals[cardId] || 0) + boxes
    })
    return {
      id: index + 1,
      itemIds: group.cards.slice(),
      qtys: qtys,
      locations: group.shipTos.map(function (loc, locIndex) {
        return Object.assign({ id: payload.id + '-loc-' + (index + 1) + '-' + (locIndex + 1) }, loc)
      }),
    }
  })
  const cart = payload.cards.map(function (card) {
    return seedLine(Object.assign({}, card, { quantity: totals[card.id] || 1 }))
  })
  return {
    id: payload.id,
    date: payload.date,
    status: payload.status,
    cart: cart,
    order: snapshotOrder({ splits: splits }),
  }
}

const SEED_CARD_PARTNER = { name: 'Demo Partner' }
const SEED_CARD_ASSOCIATE = { name: 'Demo Associate', email: 'demo.associate@colliers.com' }
const SEED_CARD_DIRECTOR = { name: 'Demo Director', email: 'demo.director@colliers.com' }

/** Seed orders added after ORD-1001…1003; loadOrderHistory merges them into saved histories. */
export const ORDER_HISTORY_SEED_VERSION = 2

export function seedOrderHistory() {
  return [
    // Three cards, two shipments, two addresses each.
    seedGroupedRecord({
      id: 'ORD-1006',
      date: '2026-10-30',
      status: 'Processing',
      cards: [
        {
          id: 'seed-1006-eng',
          code: 'BCAD-PL-ENG',
          language: 'English',
          details: SEED_CARD_PARTNER,
        },
        {
          id: 'seed-1006-fr',
          code: 'BCAD-PL-FR',
          language: 'French',
          details: SEED_CARD_ASSOCIATE,
        },
        {
          id: 'seed-1006-bil',
          code: 'BCAD-PL-BIL',
          language: 'Bilingual',
          details: SEED_CARD_DIRECTOR,
        },
      ],
      groups: [
        {
          cards: ['seed-1006-eng', 'seed-1006-fr'],
          shipTos: [officeShipTo(17, 2), personalShipTo('seed-home', 1)],
        },
        {
          cards: ['seed-1006-bil'],
          shipTos: [officeShipTo(11, 1), officeShipTo(19, 2)],
        },
      ],
    }),
    // The same card in two shipments (4 boxes to Burlington, 1 more to a temporary address).
    seedGroupedRecord({
      id: 'ORD-1005',
      date: '2026-10-22',
      status: 'Shipped',
      cards: [
        {
          id: 'seed-1005-eng',
          code: 'BCAD-PL-ENG',
          language: 'English',
          details: SEED_CARD_PARTNER,
        },
        {
          id: 'seed-1005-fr',
          code: 'BCAD-PL-FR',
          language: 'French',
          details: SEED_CARD_ASSOCIATE,
        },
      ],
      groups: [
        { cards: ['seed-1005-eng'], shipTos: [officeShipTo(1, 4)] },
        {
          cards: ['seed-1005-eng', 'seed-1005-fr'],
          shipTos: [personalShipTo('seed-temp', 1)],
        },
      ],
    }),
    // A ship-to that is no longer in the Address Book: Repeat Order removes it, and the second
    // shipment is left with no address to pick on Shipping.
    seedGroupedRecord({
      id: 'ORD-1004',
      date: '2026-10-15',
      status: 'Delivered',
      cards: [
        {
          id: 'seed-1004-eng',
          code: 'BCAD-PL-ENG',
          language: 'English',
          details: SEED_CARD_PARTNER,
        },
        {
          id: 'seed-1004-eng-2',
          code: 'BCAD-PL-ENG',
          language: 'English',
          details: SEED_CARD_ASSOCIATE,
        },
        {
          id: 'seed-1004-bil',
          code: 'BCAD-PL-BIL',
          language: 'Bilingual',
          details: SEED_CARD_DIRECTOR,
        },
      ],
      groups: [
        {
          cards: ['seed-1004-eng', 'seed-1004-eng-2'],
          shipTos: [officeShipTo(9, 2), deletedShipTo(1)],
        },
        { cards: ['seed-1004-bil'], shipTos: [deletedShipTo(3)] },
      ],
    }),
    seedRecord({
      id: 'ORD-1001',
      date: '2026-08-12',
      status: 'Delivered',
      locationId: 'seed-loc-burlington',
      shipTo: BURLINGTON,
      cart: [{ id: 'seed-eng-1', code: 'BCAD-PL-ENG', language: 'English', quantity: 2 }],
    }),
    seedRecord({
      id: 'ORD-1002',
      date: '2026-08-11',
      status: 'Shipped',
      locationId: 'seed-loc-home',
      shipTo: HOME_OFFICE,
      cart: [{ id: 'seed-bil-1', code: 'BCAD-PL-BIL', language: 'Bilingual', quantity: 1 }],
    }),
    seedRecord({
      id: 'ORD-1003',
      date: '2026-08-10',
      status: 'Processing',
      locationId: 'seed-loc-toronto',
      shipTo: TORONTO_OFFICE,
      cart: [{ id: 'seed-fr-1', code: 'BCAD-PL-FR', language: 'French', quantity: 1 }],
    }),
  ]
}

export function seedAdminOrderHistory() {
  const rows = [
    {
      id: 'ORD-8472',
      date: '2026-08-28',
      status: 'Delivered',
      employeeName: 'Alex Johnson',
      ownerEmail: 'alex.johnson@colliers.com',
      boxes: 2,
      shipTo: BURLINGTON,
    },
    {
      id: 'ORD-8471',
      date: '2026-08-25',
      status: 'Shipped',
      employeeName: 'Samantha Lee',
      ownerEmail: 'samantha.lee@colliers.com',
      boxes: 1,
      shipTo: TORONTO_OFFICE,
    },
    {
      id: 'ORD-8465',
      date: '2026-08-20',
      status: 'Processing',
      employeeName: 'Alex Johnson',
      ownerEmail: 'alex.johnson@colliers.com',
      boxes: 4,
      shipTo: TORONTO_OFFICE,
    },
    {
      id: 'ORD-8460',
      date: '2026-08-15',
      status: 'Delivered',
      employeeName: 'Alex Johnson',
      ownerEmail: 'alex.johnson@colliers.com',
      boxes: 2,
      shipTo: HOME_OFFICE,
    },
    {
      id: 'ORD-8455',
      date: '2026-08-10',
      status: 'Delivered',
      employeeName: 'Samantha Lee',
      ownerEmail: 'samantha.lee@colliers.com',
      boxes: 1,
      shipTo: BURLINGTON,
    },
  ]
  return rows.map(function (row) {
    const record = seedRecord({
      id: row.id,
      date: row.date,
      status: row.status,
      locationId: 'seed-loc-' + row.id,
      shipTo: row.shipTo,
      cart: [
        {
          id: 'cart-' + row.id,
          code: 'BCAD-PL-ENG',
          language: 'English',
          quantity: row.boxes,
          details: { name: row.employeeName, email: row.ownerEmail },
        },
      ],
    })
    return Object.assign(record, { employeeName: row.employeeName, ownerEmail: row.ownerEmail })
  })
}

export function boxCount(record) {
  return billedBoxesCart(record.cart || [], record.order)
}

export function cardsPerBox(code) {
  const product = getProduct(code)
  const packaging = product && product.packaging ? String(product.packaging) : ''
  const match = packaging.match(/^(\d+)\/BX/i)
  return match ? Number(match[1]) : 250
}

export function cardCount(record) {
  return (record.cart || []).reduce(function (sum, line) {
    return sum + billedBoxesForLine(line, record.order, record.cart) * cardsPerBox(line.code)
  }, 0)
}

export function orderTotal(record) {
  return (record.cart || []).reduce(function (sum, line) {
    return sum + lineTotal(line, billedBoxesForLine(line, record.order, record.cart))
  }, 0)
}

export function cardholderName(record) {
  const line = record.cart && record.cart[0]
  const name = line && line.details && line.details.name
  return String(name || '')
    .replace(/\n/g, ' ')
    .trim()
}

export function itemLabel(record, t) {
  const line = record.cart && record.cart[0]
  if (!line) return ''
  if (typeof t === 'function') return t(productNameKey(line.code))
  return line.language || line.code || ''
}

export function shipToLines(record) {
  const lines = []
  const splits = (record.order && record.order.splits) || []
  splits.forEach(function (split) {
    ;(split.locations || []).forEach(function (loc) {
      const address = String((loc && loc.address) || '').trim()
      if (address) lines.push(address)
    })
  })
  return lines
}

export function proofDetails(record) {
  const line = record.cart && record.cart[0]
  return (line && line.details) || {}
}

export function cloneHistoryRecord(record) {
  return {
    id: record.id,
    date: record.date,
    status: record.status,
    cart: (record.cart || []).map(function (line) {
      return makeLine(line)
    }),
    order: snapshotOrder(record.order || { splits: [] }),
  }
}

export function buildHistoryRecord(cart, order, options) {
  const opts = options || {}
  return {
    id: opts.id,
    date: opts.date || new Date().toISOString().slice(0, 10),
    status: opts.status || 'Processing',
    cart: (cart || []).map(function (line) {
      return makeLine(line)
    }),
    order: snapshotOrder(order || { splits: [] }),
  }
}

export function nextOrderId(records) {
  let max = 1000
  ;(records || []).forEach(function (record) {
    const match = String(record && record.id ? record.id : '').match(/^ORD-(\d+)$/i)
    if (match) {
      const value = Number(match[1])
      if (value > max) max = value
    }
  })
  return 'ORD-' + (max + 1)
}

export function matchesOrderSearch(record, query) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return true
  const haystack = [record.id, cardholderName(record), itemLabel(record)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.indexOf(q) !== -1
}

export function formatOrderDate(value, locale) {
  const raw = String(value || '')
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return raw
  const months =
    locale === 'FR'
      ? [
          'janv.',
          'févr.',
          'mars',
          'avr.',
          'mai',
          'juin',
          'juil.',
          'août',
          'sept.',
          'oct.',
          'nov.',
          'déc.',
        ]
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[Number(match[2]) - 1]
  if (!month) return raw
  if (locale === 'FR') return Number(match[3]) + ' ' + month + ' ' + match[1]
  return month + ' ' + Number(match[3]) + ', ' + match[1]
}
