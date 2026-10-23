import { beforeEach, describe, expect, it } from 'vitest'
import {
  addCartLineToSplit,
  addShipLocation,
  addToCart,
  clearCart,
  ensureCartAssignedToShipping,
  itemCount,
  moveLineToSplit,
  moveLocationToSplit,
  removeLine,
  removeLineFromSplit,
  removeShipLocation,
  removeSplit,
  selectedShippingItemCount,
  setGroupLocationQty,
  shippingReady,
  splitOrder,
  startShippingFromCart,
  store,
  subtotal,
  syncAssignments,
  updateQty,
} from './store.js'
import { billedBoxesCart, billedBoxesForLine, readSplitQty } from './helpers/order.js'
import { cardsFromBoxes } from './helpers/cart.js'

var CODES = ['BCAD-PL-ENG', 'BCAD-PL-FR', 'BCAD-PL-BIL']

function placeholderDetails(index) {
  return {
    name: 'Firstname Lastname',
    title: 'Title',
    email: 'first.lastname@colliersprojectleaders.com',
    phone: '+1 555 555 5555',
    // Keep lines distinct so addToCart does not merge them.
    addressName: 'Address name ' + (index + 1),
  }
}

function cartLinesNotShipping() {
  return store.cart.filter(function (line) {
    return !store.order.splits.some(function (split) {
      return (split.itemIds || []).map(String).indexOf(String(line.id)) >= 0
    })
  })
}

function seedCart(count) {
  var n
  for (n = 0; n < count; n += 1) {
    addToCart(
      {
        code: CODES[n % CODES.length],
        quantity: 1,
        details: placeholderDetails(n),
      },
      { openCart: false }
    )
  }
}

function locationBoxSum(split) {
  return (split.locations || []).reduce(function (sum, loc) {
    return sum + (Number(loc.qty) || 0)
  }, 0)
}

// Same rule the Shipping page uses for Review / Checkout.
function canCheckoutLikeShippingPage() {
  return shippingReady()
}

function resetShippingState() {
  clearCart()
  store.order.detachedIds = []
  store.order.splits.splice(0, store.order.splits.length, {
    id: 1,
    itemIds: [],
    locations: [],
    qtys: {},
  })
  store.pendingSplitId = null
}

// Split Order starts an empty shipment (SH-02). Tests that need the same cards in both
// shipments add them with Add item, as a user would.
function splitWithSameCards(splitIndex) {
  var ids = store.order.splits[splitIndex].itemIds.slice()
  splitOrder(splitIndex)
  var added = store.order.splits[store.order.splits.length - 1]
  ids.forEach(function (id) {
    addCartLineToSplit(added, id)
  })
}

describe('shipping flow: cart, split groups, and boxes', function () {
  beforeEach(function () {
    resetShippingState()
  })

  it('adds many distinct cards onto Shipping Group 1', function () {
    seedCart(6)
    ensureCartAssignedToShipping()

    expect(itemCount()).toBe(6)
    expect(selectedShippingItemCount()).toBe(6)
    expect(store.order.splits.length).toBe(1)
    expect(store.order.splits[0].itemIds.length).toBe(6)
    expect(store.order.splits[0].itemIds.slice().sort()).toEqual(
      store.cart
        .map(function (line) {
          return String(line.id)
        })
        .sort()
    )
  })

  it('add / remove cart lines keep shipping assignments in sync', function () {
    seedCart(5)
    ensureCartAssignedToShipping()
    expect(itemCount()).toBe(5)
    expect(selectedShippingItemCount()).toBe(5)

    var removedId = store.cart[2].id
    removeLine(removedId)

    expect(itemCount()).toBe(4)
    expect(selectedShippingItemCount()).toBe(4)
    expect(store.order.splits[0].itemIds).not.toContain(String(removedId))
    expect(
      store.order.splits[0].itemIds.every(function (id) {
        return store.cart.some(function (line) {
          return String(line.id) === String(id)
        })
      })
    ).toBe(true)

    removeLine(store.cart[0].id)
    removeLine(store.cart[0].id)
    expect(itemCount()).toBe(2)
    expect(selectedShippingItemCount()).toBe(2)
    expect(store.order.splits[0].itemIds.length).toBe(2)
  })

  it('ship-to boxes multiply Selected Items qty across every card in the group', function () {
    seedCart(3)
    ensureCartAssignedToShipping()
    var split = store.order.splits[0]

    addShipLocation(split, 'Address name / Unit, Street', 2)
    addShipLocation(split, "Nom de l'adresse", 3)

    expect(locationBoxSum(split)).toBe(5)
    store.cart.forEach(function (line) {
      expect(readSplitQty(split, line)).toBe(5)
      expect(line.quantity).toBe(5)
      expect(billedBoxesForLine(line, store.order)).toBe(5)
    })
    expect(billedBoxesCart(store.cart, store.order)).toBe(15)
    expect(cardsFromBoxes(billedBoxesCart(store.cart, store.order))).toBe(3750)
    expect(canCheckoutLikeShippingPage()).toBe(true)
  })

  it('changing one address box updates card qty and order totals', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    var split = store.order.splits[0]
    addShipLocation(split, 'Address name 1', 1)
    addShipLocation(split, 'Address name 2', 1)

    setGroupLocationQty(split, 1, 4)

    expect(split.locations[0].qty).toBe(1)
    expect(split.locations[1].qty).toBe(4)
    expect(locationBoxSum(split)).toBe(5)
    store.cart.forEach(function (line) {
      expect(readSplitQty(split, line)).toBe(5)
      expect(line.quantity).toBe(5)
    })
    expect(billedBoxesCart(store.cart, store.order)).toBe(10)
  })

  it('removing a ship-to lowers billed boxes but keeps the cart cards', function () {
    seedCart(3)
    ensureCartAssignedToShipping()
    var split = store.order.splits[0]
    addShipLocation(split, 'Address name 1', 2)
    addShipLocation(split, 'Address name 2', 2)
    expect(billedBoxesCart(store.cart, store.order)).toBe(12)

    removeShipLocation(split, 0)

    expect(split.locations.length).toBe(1)
    expect(itemCount()).toBe(3)
    store.cart.forEach(function (line) {
      expect(line.quantity).toBe(2)
    })
    expect(billedBoxesCart(store.cart, store.order)).toBe(6)
  })

  it('splitOrder adds an empty group; cards added to it keep per-group boxes', function () {
    seedCart(3)
    ensureCartAssignedToShipping()
    var first = store.order.splits[0]
    addShipLocation(first, 'Address name 1', 2)

    splitOrder(0)
    expect(store.order.splits.length).toBe(2)

    var second = store.order.splits[1]
    expect(second.itemIds).toEqual([])
    expect(second.locations).toEqual([])
    expect(first.itemIds.length).toBe(3)
    store.cart.forEach(function (line) {
      expect(line.quantity).toBe(2)
    })

    first.itemIds.forEach(function (id) {
      addCartLineToSplit(second, id)
    })
    expect(second.itemIds.slice().sort()).toEqual(first.itemIds.slice().sort())

    addShipLocation(second, 'Address name 2', 3)

    store.cart.forEach(function (line) {
      expect(readSplitQty(first, line)).toBe(2)
      expect(readSplitQty(second, line)).toBe(3)
      expect(line.quantity).toBe(5)
      expect(billedBoxesForLine(line, store.order)).toBe(5)
    })
    expect(billedBoxesCart(store.cart, store.order)).toBe(15)
    expect(itemCount()).toBe(3)
    expect(selectedShippingItemCount()).toBe(3)
  })

  it('shipping trash removes a card from one group only when it still lives on another', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    splitWithSameCards(0)

    var lineId = store.cart[0].id
    removeLineFromSplit(store.order.splits[0], lineId)

    expect(itemCount()).toBe(2)
    expect(store.order.splits[0].itemIds).not.toContain(String(lineId))
    expect(store.order.splits[1].itemIds).toContain(String(lineId))
  })

  it('shipping trash on the only group keeps the card in the cart as not shipping', function () {
    seedCart(3)
    ensureCartAssignedToShipping()
    splitOrder(0)

    var lineId = store.cart[1].id
    removeLineFromSplit(store.order.splits[0], lineId)
    removeLineFromSplit(store.order.splits[1], lineId)

    expect(itemCount()).toBe(3)
    expect(selectedShippingItemCount()).toBe(2)
    store.order.splits.forEach(function (split) {
      expect(split.itemIds).not.toContain(String(lineId))
    })
    expect(store.order.detachedIds).toEqual([String(lineId)])
    expect(
      cartLinesNotShipping().map(function (line) {
        return line.id
      })
    ).toEqual([lineId])
  })

  it('a not-shipping card is not pulled back onto group 1 by a sync', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    var lineId = store.cart[0].id

    removeLineFromSplit(store.order.splits[0], lineId)
    syncAssignments()
    ensureCartAssignedToShipping()

    expect(store.order.splits[0].itemIds).not.toContain(String(lineId))
    expect(cartLinesNotShipping().length).toBe(1)
  })

  it('removing the only card from the only group stays off shipping on re-entry', function () {
    seedCart(1)
    ensureCartAssignedToShipping()
    var lineId = store.cart[0].id

    removeLineFromSplit(store.order.splits[0], lineId)
    ensureCartAssignedToShipping()

    expect(itemCount()).toBe(1)
    expect(store.order.splits[0].itemIds).toEqual([])
    expect(cartLinesNotShipping().length).toBe(1)
  })

  it('a new cart card still lands on group 1 while another card is off shipping', function () {
    seedCart(1)
    ensureCartAssignedToShipping()
    var offId = store.cart[0].id
    removeLineFromSplit(store.order.splits[0], offId)

    addToCart({ code: CODES[1], quantity: 1, details: placeholderDetails(1) }, { openCart: false })
    ensureCartAssignedToShipping()

    var newId = store.cart[store.cart.length - 1].id
    expect(newId).not.toBe(offId)
    expect(store.order.splits[0].itemIds).toEqual([String(newId)])
    expect(
      cartLinesNotShipping().map(function (line) {
        return line.id
      })
    ).toEqual([offId])
  })

  it('Continue to Shipping rebuilds one group with every card when shipping is empty', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    splitOrder(0)
    store.cart.forEach(function (line) {
      store.order.splits.slice().forEach(function (split) {
        removeLineFromSplit(split, line.id)
      })
    })
    expect(store.order.splits.length).toBe(2)
    expect(cartLinesNotShipping().length).toBe(2)

    startShippingFromCart()

    expect(itemCount()).toBe(2)
    expect(store.order.splits.length).toBe(1)
    expect(store.order.detachedIds).toEqual([])
    expect(store.order.splits[0].itemIds).toEqual(
      store.cart.map(function (line) {
        return String(line.id)
      })
    )
  })

  it('Continue to Shipping keeps groups and off-shipping cards when something still ships', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    splitOrder(0)
    var offId = store.cart[0].id
    store.order.splits.slice().forEach(function (split) {
      removeLineFromSplit(split, offId)
    })

    startShippingFromCart()

    expect(store.order.splits.length).toBe(2)
    expect(
      cartLinesNotShipping().map(function (line) {
        return line.id
      })
    ).toEqual([offId])
  })

  it('adding a not-shipping card back to a group puts it on shipping again', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    var lineId = store.cart[0].id
    removeLineFromSplit(store.order.splits[0], lineId)

    addCartLineToSplit(store.order.splits[0], lineId)

    expect(store.order.splits[0].itemIds).toContain(String(lineId))
    expect(store.order.detachedIds).toEqual([])
    expect(cartLinesNotShipping()).toEqual([])
  })

  it('drawer delete removes a card from the cart and every shipping group', function () {
    seedCart(4)
    ensureCartAssignedToShipping()
    splitWithSameCards(0)
    var gone = store.cart[1].id

    removeLine(gone)

    expect(itemCount()).toBe(3)
    expect(selectedShippingItemCount()).toBe(3)
    store.order.splits.forEach(function (split) {
      expect(split.itemIds).not.toContain(String(gone))
      expect(split.itemIds.length).toBe(3)
    })
  })

  it('full journey: add many, boxes, split, remove one, retune boxes — totals match', function () {
    seedCart(5)
    ensureCartAssignedToShipping()
    expect(itemCount()).toBe(5)
    expect(selectedShippingItemCount()).toBe(5)

    var group1 = store.order.splits[0]
    addShipLocation(group1, 'Address name 1', 1)
    addShipLocation(group1, 'Address name 2', 2)
    expect(locationBoxSum(group1)).toBe(3)
    expect(billedBoxesCart(store.cart, store.order)).toBe(15)

    splitWithSameCards(0)
    expect(store.order.splits.length).toBe(2)
    var group2 = store.order.splits[1]
    addShipLocation(group2, 'Address name 3', 4)

    // 5 lines × (3 + 4) boxes
    store.cart.forEach(function (line) {
      expect(line.quantity).toBe(7)
    })
    expect(billedBoxesCart(store.cart, store.order)).toBe(35)

    var removed = store.cart[3]
    removeLine(removed.id)
    expect(itemCount()).toBe(4)
    expect(selectedShippingItemCount()).toBe(4)
    store.order.splits.forEach(function (split) {
      expect(split.itemIds).not.toContain(String(removed.id))
      expect(split.itemIds.length).toBe(4)
    })
    // 4 lines × 7 boxes
    expect(billedBoxesCart(store.cart, store.order)).toBe(28)

    setGroupLocationQty(group2, 0, 1)
    store.cart.forEach(function (line) {
      expect(readSplitQty(group1, line)).toBe(3)
      expect(readSplitQty(group2, line)).toBe(1)
      expect(line.quantity).toBe(4)
    })
    expect(billedBoxesCart(store.cart, store.order)).toBe(16)
    expect(cardsFromBoxes(16)).toBe(4000)
    expect(canCheckoutLikeShippingPage()).toBe(true)

    removeShipLocation(group1, 1)
    store.cart.forEach(function (line) {
      expect(line.quantity).toBe(2)
    })
    expect(billedBoxesCart(store.cart, store.order)).toBe(8)

    updateQty(store.cart[0].id, 1, group1)
    expect(readSplitQty(group1, store.cart[0])).toBe(1)
    expect(store.cart[0].quantity).toBe(2)

    removeSplit(1)
    expect(store.order.splits.length).toBe(1)
    expect(store.order.splits[0].itemIds.length).toBe(4)
    expect(itemCount()).toBe(4)
    expect(selectedShippingItemCount()).toBe(4)
  })

  it('cannot checkout until every group with cards has at least one ship-to', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    expect(canCheckoutLikeShippingPage()).toBe(false)

    addShipLocation(store.order.splits[0], 'Address name 1', 1)
    expect(canCheckoutLikeShippingPage()).toBe(true)

    // The new group is empty: no checkout until it has a card and a ship-to.
    splitOrder(0)
    expect(canCheckoutLikeShippingPage()).toBe(false)

    addCartLineToSplit(store.order.splits[1], store.cart[0].id)
    expect(canCheckoutLikeShippingPage()).toBe(false)

    addShipLocation(store.order.splits[1], 'Address name 2', 1)
    expect(canCheckoutLikeShippingPage()).toBe(true)
  })

  it('subtotal uses billed boxes after multi-address shipping', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    var price = store.cart[0].price
    expect(price).toBeGreaterThan(0)

    addShipLocation(store.order.splits[0], 'Address name 1', 2)
    addShipLocation(store.order.splits[0], 'Address name 2', 3)

    // 2 lines × 5 boxes × unit price
    expect(billedBoxesCart(store.cart, store.order)).toBe(10)
    expect(subtotal()).toBe(10 * price)
  })

  it('reordering a card inside one group leaves the other groups alone', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    splitOrder(0)
    var first = store.order.splits[0]
    var second = store.order.splits[1]
    var a = String(store.cart[0].id)
    var b = String(store.cart[1].id)
    addCartLineToSplit(second, a)
    addCartLineToSplit(second, b)
    expect(first.itemIds.map(String)).toEqual([a, b])
    expect(second.itemIds.map(String)).toEqual([a, b])

    moveLineToSplit(b, second.id, 0, second.id)

    expect(second.itemIds.map(String)).toEqual([b, a])
    expect(first.itemIds.map(String)).toEqual([a, b])
  })

  it('dragging a card to another group takes it out of the source group only', function () {
    seedCart(2)
    ensureCartAssignedToShipping()
    splitOrder(0)
    splitOrder(0)
    var groups = store.order.splits
    var a = String(store.cart[0].id)
    var b = String(store.cart[1].id)
    // Split Order adds empty groups; fill them: Group 1 [a, b], Group 2 [b], Group 3 [a].
    addCartLineToSplit(groups[1], b)
    addCartLineToSplit(groups[2], a)
    expect(groups[1].itemIds.map(String)).toEqual([b])

    moveLineToSplit(a, groups[1].id, 0, groups[0].id)

    expect(groups[0].itemIds.map(String)).toEqual([b])
    expect(groups[1].itemIds.map(String)).toEqual([a, b])
    expect(groups[2].itemIds.map(String)).toEqual([a])
  })

  it('dropping an address on a group that already ships there combines the boxes', function () {
    seedCart(1)
    ensureCartAssignedToShipping()
    splitWithSameCards(0)
    var first = store.order.splits[0]
    var second = store.order.splits[1]
    addShipLocation(first, 'Office A', 1)
    addShipLocation(first, 'Office B', 1)
    addShipLocation(second, 'Office B', 2)
    var moving = first.locations[1]

    var merged = moveLocationToSplit(moving.id, second.id, 0)

    expect(merged).toBe(true)
    expect(
      second.locations.map(function (loc) {
        return loc.address
      })
    ).toEqual(['Office B'])
    expect(second.locations[0].qty).toBe(3)
    expect(
      first.locations.map(function (loc) {
        return loc.address
      })
    ).toEqual(['Office A'])
    expect(moveLocationToSplit(first.locations[0].id, second.id, 0)).toBe(false)
  })
})
