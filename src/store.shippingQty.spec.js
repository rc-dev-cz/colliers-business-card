import { beforeEach, describe, expect, it } from 'vitest'
import {
  addPersonal,
  addShipLocation,
  clearCart,
  deletePersonal,
  itemCount,
  removeLine,
  removeLineFromSplit,
  removeShipLocation,
  addCartLineToSplit,
  setGroupLocationQty,
  splitOrder,
  ensureCartAssignedToShipping,
  store,
  subtotal,
  updateQty,
} from './store.js'
import { billedBoxesCart, billedBoxesForLine as lineBilled, readSplitQty } from './helpers/order.js'
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
    store.order.splits[0].locations = [
      { id: 'loc-1', address: 'Burlington', qty: 2 },
      { id: 'loc-2', address: 'Calgary', qty: 2 },
    ]
  })

  it('deleting an address keeps Selected Items qty', function () {
    expect(store.cart[0].quantity).toBe(4)
    removeShipLocation(store.order.splits[0], 0)
    expect(store.order.splits[0].locations.length).toBe(1)
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].quantity).toBe(2)
  })

  it('deleting the last address keeps the cart line', function () {
    removeShipLocation(store.order.splits[0], 0)
    removeShipLocation(store.order.splits[0], 0)
    expect(store.order.splits[0].locations.length).toBe(0)
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].quantity).toBe(2)
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

  it('three addresses of 1 box each show 3 boxes on the card', function () {
    addShipLocation(store.order.splits[0], 'Burlington')
    addShipLocation(store.order.splits[0], 'Calgary')
    addShipLocation(store.order.splits[0], 'Edmonton')
    expect(readSplitQty(store.order.splits[0], store.cart[0])).toBe(3)
    expect(store.cart[0].quantity).toBe(3)
    expect(lineBilled(store.cart[0], store.order)).toBe(3)
    expect(billedBoxesCart(store.cart, store.order)).toBe(3)
    expect(itemCount()).toBe(1)
    expect(subtotal()).toBe(189)
    store.order.splits[0].locations.forEach(function (loc) {
      expect(loc.qty).toBe(1)
    })
  })

  it('raising Cambridge and Edmonton to 4 and 6 copies 10 onto the card', function () {
    addShipLocation(store.order.splits[0], 'Cambridge', 4)
    addShipLocation(store.order.splits[0], 'Edmonton', 6)
    expect(readSplitQty(store.order.splits[0], store.cart[0])).toBe(10)
    expect(billedBoxesCart(store.cart, store.order)).toBe(10)
  })

  it('a second design copies the same address total and doubles the bill', function () {
    addShipLocation(store.order.splits[0], 'Cambridge', 4)
    addShipLocation(store.order.splits[0], 'Edmonton', 6)
    store.cart.push(
      makeLine({
        id: 'line-2',
        code: 'BCAD-PL-FR',
        language: 'French',
        quantity: 1,
        price: 63,
        details: { name: 'Firstname Lastname' },
      })
    )
    addCartLineToSplit(store.order.splits[0], 'line-2')
    expect(readSplitQty(store.order.splits[0], store.cart[0])).toBe(10)
    expect(readSplitQty(store.order.splits[0], store.cart[1])).toBe(10)
    expect(lineBilled(store.cart[0], store.order)).toBe(10)
    expect(lineBilled(store.cart[1], store.order)).toBe(10)
    expect(billedBoxesCart(store.cart, store.order)).toBe(20)
    expect(itemCount()).toBe(2)
    expect(subtotal()).toBe(1260)
    store.order.splits[0].locations.forEach(function (loc, index) {
      expect(loc.qty).toBe(index === 0 ? 4 : 6)
    })
  })

  it('setGroupLocationQty updates the selected-items readout immediately', function () {
    addShipLocation(store.order.splits[0], 'Cambridge', 4)
    addShipLocation(store.order.splits[0], 'Edmonton', 1)
    setGroupLocationQty(store.order.splits[0], 1, 6)
    expect(store.order.splits[0].locations[1].qty).toBe(6)
    expect(readSplitQty(store.order.splits[0], store.cart[0])).toBe(10)
    expect(billedBoxesCart(store.cart, store.order)).toBe(10)
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

describe('splitOrder copies products into the new group', function () {
  beforeEach(function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-1',
        code: 'BCAD-PL-ENG',
        language: 'English',
        quantity: 1,
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

  it('copies the source split item ids', function () {
    splitOrder(0)
    expect(store.order.splits.length).toBe(2)
    expect(store.order.splits[0].itemIds).toEqual(['line-1'])
    expect(store.order.splits[1].itemIds).toEqual(['line-1'])
  })

  it('changes quantity in the second split only', function () {
    store.cart[0].quantity = 3
    store.order.splits[0].locations = [{ id: 'loc-1', address: '123 Street', qty: 4 }]
    store.order.splits[0].qtys = { 'line-1': 3 }
    splitOrder(0)
    store.order.splits[1].locations = [{ id: 'loc-2', address: '99 West Street', qty: 4 }]
    updateQty('line-1', 2, store.order.splits[1])
    expect(readSplitQty(store.order.splits[0], store.cart[0])).toBe(3)
    expect(readSplitQty(store.order.splits[1], store.cart[0])).toBe(2)
    expect(itemCount()).toBe(1)
    expect(store.cart[0].quantity).toBe(5)
  })
})

describe('remove a card from shipping or the cart drawer', function () {
  beforeEach(function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-en',
        code: 'BCAD-PL-ENG',
        language: 'English',
        quantity: 1,
        details: { name: 'Firstname Lastname' },
      }),
      makeLine({
        id: 'line-bi',
        code: 'BCAD-PL-ENG-FR',
        language: 'Bilingual',
        quantity: 1,
        details: { name: 'Firstname Lastname' },
      }),
    ]
    store.order.splits = [
      { id: 1, itemIds: ['line-en', 'line-bi'], locations: [], qtys: {} },
      { id: 2, itemIds: ['line-en', 'line-bi'], locations: [], qtys: {} },
    ]
  })

  it('shipping trash removes only the selected duplicate from its group', function () {
    removeLineFromSplit(store.order.splits[0], 'line-en')
    expect(
      store.cart.map(function (line) {
        return line.id
      })
    ).toEqual(['line-en', 'line-bi'])
    expect(store.order.splits[0].itemIds).toEqual(['line-bi'])
    expect(store.order.splits[1].itemIds).toEqual(['line-en', 'line-bi'])
    expect(itemCount()).toBe(2)
  })

  it('drawer delete removes the card from the cart and every split', function () {
    removeLine('line-en')
    expect(
      store.cart.map(function (line) {
        return line.id
      })
    ).toEqual(['line-bi'])
    expect(store.order.splits[0].itemIds).toEqual(['line-bi'])
    expect(store.order.splits[1].itemIds).toEqual(['line-bi'])
    expect(itemCount()).toBe(1)
  })
})

describe('shipping actions require selected cards', function () {
  beforeEach(function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-1',
        code: 'BCAD-PL-ENG',
        language: 'English',
        quantity: 1,
        details: { name: 'Firstname Lastname' },
      }),
    ]
    store.order.splits = [
      {
        id: 1,
        itemIds: [],
        locations: [{ id: 'loc-1', address: '123 Street', qty: 1 }],
      },
    ]
  })

  it('does not split a group with no selected items', function () {
    splitOrder(0)
    expect(store.order.splits.length).toBe(1)
  })

  it('clears leftover ship-tos when the last card leaves the group', function () {
    store.order.splits[0].itemIds = ['line-1']
    removeLineFromSplit(store.order.splits[0], 'line-1')
    expect(store.cart.length).toBe(1)
    expect(store.order.splits[0].itemIds).toEqual([])
    expect(store.order.splits[0].locations).toEqual([])
    expect(store.order.detachedIds).toEqual(['line-1'])
    expect(itemCount()).toBe(1)
  })

  it('keeps a detached cart line off shipping even when every group is empty', function () {
    store.order.detachedIds = ['line-1']
    ensureCartAssignedToShipping()
    expect(store.order.splits[0].itemIds).toEqual([])
    expect(store.order.detachedIds).toEqual(['line-1'])
  })

  it('assigns a new cart line to group 1 even if leftover dummy itemIds remain', function () {
    store.order.splits[0].itemIds = ['line-dev-1', 'line-dev-2']
    store.order.detachedIds = []
    ensureCartAssignedToShipping()
    expect(store.order.splits[0].itemIds).toEqual(['line-1'])
  })
})
