import { describe, expect, it } from 'vitest'
import { copyOrderForRepeat } from './repeatOrder.js'
import { formatAddressLine } from '../adapters/api.js'
import { seedOrderHistory } from './orderHistory.js'
import { MOCK_OFFICES } from '../data/offices.js'
import { seedPersonalAddresses } from './addressBook.js'

var OFFICE = {
  id: 'off-1',
  addressName: 'Address name',
  addressStreet: '1 Office Street',
  addressCity: 'City',
  addressProvince: 'ON',
  addressPostalZip: 'A1A 1A1',
}
var HOME = {
  id: 'per-1',
  addressName: 'Home',
  addressStreet: '2 Home Street',
  addressCity: 'City',
  addressProvince: 'ON',
  addressPostalZip: 'B2B 2B2',
}

function details(n) {
  return { name: 'Firstname Lastname', email: 'first.lastname@colliersprojectleaders.com', n: n }
}

function pastOrder() {
  return {
    id: 'ORD-2001',
    cart: [
      { id: 'old-a', code: 'BCAD-PL-ENG', language: 'English', quantity: 2, details: details(1) },
      { id: 'old-b', code: 'BCAD-PL-FR', language: 'French', quantity: 1, details: details(2) },
    ],
    order: {
      detachedIds: [],
      splits: [
        {
          id: 1,
          itemIds: ['old-a'],
          qtys: { 'old-a': 2 },
          locations: [
            {
              id: 'old-loc-1',
              address: 'Old text',
              qty: 2,
              addressId: 'off-1',
              addressType: 'office',
            },
          ],
        },
        {
          id: 2,
          itemIds: ['old-b'],
          qtys: { 'old-b': 1 },
          locations: [
            {
              id: 'old-loc-2',
              address: 'Deleted home',
              qty: 1,
              addressId: 'per-gone',
              addressType: 'personal',
            },
            { id: 'old-loc-3', address: formatAddressLine(HOME), qty: 1 },
          ],
        },
      ],
    },
  }
}

describe('copyOrderForRepeat', function () {
  it('RO-01 keeps cards, groups and box counts with new line, group and ship-to ids', function () {
    var copy = copyOrderForRepeat(pastOrder(), { offices: [OFFICE], personal: [HOME] })
    expect(copy.cart.map((l) => l.code)).toEqual(['BCAD-PL-ENG', 'BCAD-PL-FR'])
    expect(copy.cart.map((l) => l.quantity)).toEqual([2, 1])
    copy.cart.forEach(function (line) {
      expect(['old-a', 'old-b']).not.toContain(line.id)
    })
    var [a, b] = copy.cart
    expect(copy.order.splits).toHaveLength(2)
    expect(copy.order.splits[0].itemIds).toEqual([String(a.id)])
    expect(copy.order.splits[0].qtys).toEqual({ [a.id]: 2 })
    expect(copy.order.splits[1].itemIds).toEqual([String(b.id)])
    expect(copy.order.splits.map((s) => s.id)).not.toContain(1)
    copy.order.splits.forEach(function (split) {
      split.locations.forEach(function (loc) {
        expect(loc.id).not.toMatch(/^old-loc/)
      })
    })
  })

  it('RO-02 refreshes the address text from the current address book row', function () {
    var copy = copyOrderForRepeat(pastOrder(), { offices: [OFFICE], personal: [HOME] })
    var loc = copy.order.splits[0].locations[0]
    expect(loc.address).toBe(formatAddressLine(OFFICE))
    expect(loc.addressId).toBe('off-1')
    expect(loc.addressType).toBe('office')
    expect(loc.qty).toBe(2)
  })

  it('RO-03 drops a ship-to whose address was deleted and counts it', function () {
    var copy = copyOrderForRepeat(pastOrder(), { offices: [OFFICE], personal: [HOME] })
    expect(copy.removedAddresses).toBe(1)
    var group2 = copy.order.splits[1].locations
    expect(group2).toHaveLength(1)
    // Old text-only ship-to matched by text gets the address-book id.
    expect(group2[0].addressId).toBe('per-1')
    expect(group2[0].addressType).toBe('personal')
  })

  it('RO-04 keeps ship-tos it cannot check (list not loaded, or old text with no match)', function () {
    var record = pastOrder()
    record.order.splits[1].locations[1].address = 'Some old address'
    var copy = copyOrderForRepeat(record, { offices: [OFFICE], personal: null })
    expect(copy.removedAddresses).toBe(0)
    expect(copy.order.splits[1].locations.map((l) => l.address)).toEqual([
      'Deleted home',
      'Some old address',
    ])
  })

  it('RO-05 an office that was deleted is removed too, leaving the group to fix on Shipping', function () {
    var copy = copyOrderForRepeat(pastOrder(), { offices: [], personal: [HOME] })
    expect(copy.order.splits[0].locations).toEqual([])
    expect(copy.removedAddresses).toBe(2)
  })

  it('RO-06 seed ORD-1004: the deleted ship-to is dropped from both shipments', function () {
    var record = seedOrderHistory().find((row) => row.id === 'ORD-1004')
    var copy = copyOrderForRepeat(record, {
      offices: MOCK_OFFICES,
      personal: seedPersonalAddresses(),
    })
    expect(copy.removedAddresses).toBe(2)
    expect(copy.order.splits[0].locations.map((l) => l.addressId)).toEqual(['9'])
    expect(copy.order.splits[1].locations).toEqual([])
    expect(copy.cart).toHaveLength(3)
  })

  it('RO-07 seed ORD-1006: three cards and two shipments come back whole', function () {
    var record = seedOrderHistory().find((row) => row.id === 'ORD-1006')
    var copy = copyOrderForRepeat(record, {
      offices: MOCK_OFFICES,
      personal: seedPersonalAddresses(),
    })
    expect(copy.removedAddresses).toBe(0)
    expect(copy.cart.map((l) => l.quantity)).toEqual([3, 3, 3])
    expect(copy.order.splits.map((s) => s.itemIds.length)).toEqual([2, 1])
    expect(copy.order.splits.map((s) => s.locations.map((l) => l.qty))).toEqual([
      [2, 1],
      [1, 2],
    ])
  })
})
