import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  addPersonal,
  addShipLocation,
  clearCart,
  deletePersonal,
  itemCount,
  removeShipLocation,
  store,
  subtotal,
} from './store.js'
import { billedBoxesForLine as lineBilled } from './helpers/order.js'
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
})

describe('ship-to multiplies Selected Items qty', function () {
  beforeEach(function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-1',
        code: 'BCAD-PL-ENG',
        language: 'English',
        quantity: 1,
        price: 63,
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
  })

  it('three addresses bill three boxes and 750 cards', function () {
    addShipLocation(store.order.splits[0], 'Burlington')
    addShipLocation(store.order.splits[0], 'Calgary')
    addShipLocation(store.order.splits[0], 'Edmonton')
    expect(store.cart[0].quantity).toBe(1)
    expect(lineBilled(store.cart[0], store.order)).toBe(3)
    expect(itemCount()).toBe(3)
    expect(subtotal()).toBe(189)
    store.order.splits[0].locations.forEach(function (loc) {
      expect(loc.qty).toBe(1)
    })
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
