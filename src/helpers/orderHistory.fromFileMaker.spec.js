import { describe, expect, it } from 'vitest'
import { makeLine } from './cart.js'
import { buildOrderPayload } from './orderPayload.js'
import {
  cardCount,
  cardholderName,
  orderFromFileMaker,
  orderTotal,
  shipToLines,
} from './orderHistory'

var cart = [
  makeLine({
    id: 'line-bil',
    code: 'BCAD-PL-BIL',
    language: 'Bilingual',
    quantity: 3,
    details: {
      name: 'Firstname Lastname',
      title: 'Associate',
      titleFr: 'Associé',
      degree: ['B.A.'],
    },
  }),
  makeLine({
    id: 'line-en',
    code: 'BCAD-PL-ENG',
    language: 'English',
    quantity: 1,
    details: { name: 'Firstname Lastname', title: 'Associate' },
  }),
]
var order = {
  splits: [
    {
      id: 1,
      itemIds: ['line-bil'],
      qtys: { 'line-bil': 3 },
      locations: [
        { id: 'loc-a', address: '300-5515 North Service Road, Burlington, ON L7L 6G4', qty: 2 },
        { id: 'loc-b', address: '100 King Street West, Toronto, ON M5X 1C9', qty: 1 },
      ],
    },
    {
      id: 2,
      itemIds: ['line-en'],
      qtys: { 'line-en': 1 },
      locations: [{ id: 'loc-c', address: '1 Main Street, Calgary, AB T2P 1J9', qty: 1 }],
    },
  ],
}
var payload = buildOrderPayload({ cart: cart, order: order, session: { email: 'demo' } })

// What BF - onFormRequest - orders sends: asJSONsmall plus each group's asJSON, in any order.
var row = {
  id: 'ORD-2185',
  date: '2026-10-28',
  status: 'Ordered',
  groups: [JSON.stringify(payload.groups[1]), payload.groups[0]],
}

describe('orderFromFileMaker', function () {
  var record = orderFromFileMaker(row)

  it('rebuilds the cart lines with their card details', function () {
    expect(record.cart.map((line) => [line.id, line.code, line.language, line.quantity])).toEqual([
      ['line-bil', 'BCAD-PL-BIL', 'Bilingual', 3],
      ['line-en', 'BCAD-PL-ENG', 'English', 1],
    ])
    expect(record.cart[0].details).toMatchObject({
      name: 'Firstname Lastname',
      title: 'Associate',
      titleFr: 'Associé',
      degree: ['B.A.'],
    })
    expect(cardholderName(record)).toBe('Firstname Lastname')
  })

  it('rebuilds one shipment per group, in shipment order, with boxes per address', function () {
    expect(record.order.splits.map((split) => split.itemIds)).toEqual([['line-bil'], ['line-en']])
    expect(shipToLines(record)).toEqual([
      '300-5515 North Service Road, Burlington, ON L7L 6G4',
      '100 King Street West, Toronto, ON M5X 1C9',
      '1 Main Street, Calgary, AB T2P 1J9',
    ])
  })

  it('counts the same cards and total the order was placed with', function () {
    expect(cardCount(record)).toBe((3 + 1) * 250)
    expect(orderTotal(record)).toBe(payload.order.total_items)
  })

  it('shows FileMaker "Ordered" as Processing', function () {
    expect(record.status).toBe('Processing')
    expect(orderFromFileMaker({ id: 'ORD-1', status: 'Shipped' }).status).toBe('Shipped')
  })

  it('keeps a row that already has a cart, and a row without groups', function () {
    var withCart = { id: 'ORD-1', status: 'Delivered', cart: cart, order: order }
    expect(orderFromFileMaker(withCart).cart).toBe(cart)
    expect(orderFromFileMaker({ id: 'ORD-2', status: 'Ordered' }).cart).toBeUndefined()
  })
})
