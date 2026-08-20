import { makeLine } from './cart.js'
import { snapshotOrder } from './order.js'
import { productNameKey } from '../i18n/messages.js'

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
      title: 'Associate | Canada',
      email: 'demo@colliers.com',
      phone: '+1 416 555-0100',
      company: 'Colliers',
      website: 'colliers.com/canada',
      address: TORONTO_CARD,
    },
    overrides || {},
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

export function seedOrderHistory() {
  return [
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

export function boxCount(record) {
  return (record.cart || []).reduce(function (sum, line) {
    return sum + (Number(line.quantity) || 0)
  }, 0)
}

export function orderTotal(record) {
  return boxCount(record) * BOX_PRICE
}

export function cardholderName(record) {
  const line = record.cart && record.cart[0]
  const name = line && line.details && line.details.name
  return String(name || '').replace(/\n/g, ' ').trim()
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
  const q = String(query || '').trim().toLowerCase()
  if (!q) return true
  const haystack = [record.id, cardholderName(record), itemLabel(record)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.indexOf(q) !== -1
}

export function formatOrderDate(value) {
  const raw = String(value || '')
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return raw
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[Number(match[2]) - 1]
  if (!month) return raw
  return month + ' ' + Number(match[3]) + ', ' + match[1]
}
