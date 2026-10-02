import { beforeEach, describe, expect, it } from 'vitest'
import {
  addShipLocation,
  clearCart,
  removeShipLocation,
  store,
  syncCartToAssignedForSplit,
} from './store.js'
import { makeLine } from './helpers/cart.js'

describe('remove ship-to syncs cart to remaining locations', function () {
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

  it('deleting an address sets Selected Items to remaining location qtys', function () {
    expect(store.cart[0].quantity).toBe(4)
    removeShipLocation(store.order.splits[0], 0)
    expect(store.order.splits[0].locations.length).toBe(1)
    expect(store.cart[0].quantity).toBe(2)
  })

  it('deleting the last address clears the cart line (no orphan Qty 250)', function () {
    removeShipLocation(store.order.splits[0], 0)
    removeShipLocation(store.order.splits[0], 0)
    expect(store.order.splits[0].locations.length).toBe(0)
    expect(store.cart.length).toBe(0)
  })

  it('clears leftover cart when locations never covered the full order', function () {
    store.cart[0].quantity = 4
    store.order.splits[0].locations = []
    addShipLocation(store.order.splits[0], 'Burlington', 1)
    removeShipLocation(store.order.splits[0], 0)
    expect(store.order.splits[0].locations.length).toBe(0)
    expect(store.cart.length).toBe(0)
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
