import { describe, expect, it } from 'vitest'
import {
  addSplit,
  assignedBoxesForSplit,
  assignItem,
  createLocation,
  createSplit,
  defaultOrder,
  moveItem,
  nextLocationQty,
  orderedBoxesForSplit,
  reduceCartBoxesForSplit,
  removeSplitAt,
  syncCartAssignments,
  syncCartBoxesToAssigned,
} from './order.js'

describe('shipping groups', function () {
  it('addSplit creates an empty group without copying item ids', function () {
    var order = defaultOrder()
    order.splits[0].itemIds = ['a', 'b']
    var added = addSplit(order, [])
    expect(order.splits.length).toBe(2)
    expect(added.itemIds).toEqual([])
    expect(order.splits[0].itemIds).toEqual(['a', 'b'])
  })

  it('removeSplitAt reassigns lines to the remaining group', function () {
    var order = {
      splits: [
        createSplit({ id: 1, itemIds: ['a'] }),
        createSplit({ id: 2, itemIds: ['b', 'c'] }),
      ],
    }
    var ids = removeSplitAt(order, 1)
    expect(ids).toEqual(['b', 'c'])
    expect(order.splits.length).toBe(1)
    expect(order.splits[0].itemIds).toEqual(['a', 'b', 'c'])
  })

  it('cannot remove the last shipping group', function () {
    var order = defaultOrder()
    order.splits[0].itemIds = ['a']
    expect(removeSplitAt(order, 0)).toEqual([])
    expect(order.splits.length).toBe(1)
    expect(order.splits[0].itemIds).toEqual(['a'])
  })

  it('moveItem relocates a line without duplicating it', function () {
    var order = {
      splits: [
        createSplit({ id: 1, itemIds: ['a', 'b'] }),
        createSplit({ id: 2, itemIds: [] }),
      ],
    }
    moveItem(order, 'b', 2)
    expect(order.splits[0].itemIds).toEqual(['a'])
    expect(order.splits[1].itemIds).toEqual(['b'])
  })

  it('assignItem keeps a cart line in only one group', function () {
    var order = {
      splits: [
        createSplit({ id: 1, itemIds: ['a'] }),
        createSplit({ id: 2, itemIds: [] }),
      ],
    }
    assignItem(order, order.splits[1], 'a')
    expect(order.splits[0].itemIds).toEqual([])
    expect(order.splits[1].itemIds).toEqual(['a'])
  })

  it('unassigned cart ids land in Shipping Group 1', function () {
    var order = {
      splits: [
        createSplit({ id: 1, itemIds: [] }),
        createSplit({ id: 2, itemIds: [] }),
      ],
    }
    syncCartAssignments(order, ['x', 'y'])
    expect(order.splits[0].itemIds).toEqual(['x', 'y'])
    expect(order.splits[1].itemIds).toEqual([])
  })
})

describe('ship-to allocation', function () {
  it('defaults new location qty to remaining ordered boxes', function () {
    var split = createSplit({ id: 1, itemIds: ['a'] })
    var cart = [{ id: 'a', quantity: 3 }]
    expect(orderedBoxesForSplit(split, cart)).toBe(3)
    expect(assignedBoxesForSplit(split)).toBe(0)
    expect(nextLocationQty(split, cart)).toBe(3)

    split.locations.push(createLocation('One', 2))
    expect(nextLocationQty(split, cart)).toBe(1)

    split.locations.push(createLocation('Two', 1))
    expect(nextLocationQty(split, cart)).toBe(1)
  })

  it('reduceCartBoxesForSplit lowers cart qty when a ship-to is removed', function () {
    var split = createSplit({ id: 1, itemIds: ['a'] })
    var cart = [{ id: 'a', quantity: 4 }]
    var zeroIds = reduceCartBoxesForSplit(cart, split, 1)
    expect(cart[0].quantity).toBe(3)
    expect(zeroIds).toEqual([])
  })

  it('reduceCartBoxesForSplit drops lines that reach zero boxes', function () {
    var split = createSplit({ id: 1, itemIds: ['a'] })
    var cart = [{ id: 'a', quantity: 1 }]
    var zeroIds = reduceCartBoxesForSplit(cart, split, 1)
    expect(cart[0].quantity).toBe(0)
    expect(zeroIds).toEqual(['a'])
  })

  it('syncCartBoxesToAssigned does not clear cart when ship-to is empty', function () {
    var split = createSplit({ id: 1, itemIds: ['a'], locations: [] })
    var cart = [{ id: 'a', quantity: 1 }]
    var zeroIds = syncCartBoxesToAssigned(cart, split)
    expect(cart[0].quantity).toBe(1)
    expect(zeroIds).toEqual([])
  })

  it('syncCartBoxesToAssigned drops unallocated cart boxes after a partial remove', function () {
    var split = createSplit({
      id: 1,
      itemIds: ['a'],
      locations: [createLocation('Calgary', 1)],
    })
    var cart = [{ id: 'a', quantity: 4 }]
    syncCartBoxesToAssigned(cart, split)
    expect(cart[0].quantity).toBe(1)
  })

  it('syncCartBoxesToAssigned raises cart when ship-to qty goes up', function () {
    var split = createSplit({
      id: 1,
      itemIds: ['a'],
      locations: [createLocation('Burlington', 2)],
    })
    var cart = [{ id: 'a', quantity: 1 }]
    syncCartBoxesToAssigned(cart, split)
    expect(cart[0].quantity).toBe(2)
  })
})
