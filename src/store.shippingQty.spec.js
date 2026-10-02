import { beforeEach, describe, expect, it } from 'vitest'
import {
  addPersonal,
  addShipLocation,
  clearCart,
  deletePersonal,
  removeShipLocation,
  store,
  syncCartToAssignedForSplit,
} from './store.js'
import { makeLine } from './helpers/cart.js'

describe('remove ship-to does not delete cart cards', function () {
  beforeEach(function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-1',
        code: 'BCAD-PL-ENG',
        language: 'English',
        quantity: 4,
        details: { name: 'Firstname Lastname' },
      }),
    ]
    store.order.splits = [
      {
        id: 1,
        itemIds: ['line-1'],
        locations: [],
      },
    ]
    addShipLocation(store.order.splits[0], 'Burlington', 2)
    addShipLocation(store.order.splits[0], 'Calgary', 2)
  })

  it('deleting an address keeps Selected Items qty', function () {
    expect(store.cart[0].quantity).toBe(4)
    removeShipLocation(store.order.splits[0], 0)
    expect(store.order.splits[0].locations.length).toBe(1)
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].quantity).toBe(4)
  })

  it('deleting the last address keeps the cart line', function () {
    removeShipLocation(store.order.splits[0], 0)
    removeShipLocation(store.order.splits[0], 0)
    expect(store.order.splits[0].locations.length).toBe(0)
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].quantity).toBe(4)
  })

  it('raising a location qty raises Selected Items to match', function () {
    store.order.splits[0].locations = []
    store.cart[0].quantity = 1
    addShipLocation(store.order.splits[0], 'Burlington', 1)
    store.order.splits[0].locations[0].qty = 2
    syncCartToAssignedForSplit(store.order.splits[0])
    expect(store.cart[0].quantity).toBe(2)
  })
})

describe('Address Book delete does not touch the cart', function () {
  it('deletePersonal leaves cart lines in place', function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-ab',
        code: 'BCAD-PL-ENG',
        language: 'English',
        quantity: 2,
        details: { name: 'Firstname Lastname' },
      }),
    ]
    var row = addPersonal({
      addressName: 'Cabin',
      addressStreet: '1 Pine Road',
      addressCity: 'Banff',
    })
    deletePersonal(row.id)
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].quantity).toBe(2)
  })
})
