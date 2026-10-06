import { describe, expect, it } from 'vitest'
import {
  addSplit,
  assignItem,
  billedBoxesCart,
  billedBoxesForLine,
  createLocation,
  createSplit,
  defaultOrder,
  moveItem,
  nextLocationQty,
  orderedBoxesForSplit,
  removeSplitAt,
  syncCartAssignments,
  syncLocationQtyFromOrdered,
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
  it('copies Selected Items qty onto each new address', function () {
    var split = createSplit({ id: 1, itemIds: ['a'] })
    var cart = [{ id: 'a', quantity: 3 }]
    expect(orderedBoxesForSplit(split, cart)).toBe(3)
    expect(nextLocationQty(split, cart)).toBe(3)

    split.locations.push(createLocation('One', nextLocationQty(split, cart)))
    expect(nextLocationQty(split, cart)).toBe(3)

    split.locations.push(createLocation('Two', nextLocationQty(split, cart)))
    expect(split.locations[0].qty).toBe(3)
    expect(split.locations[1].qty).toBe(3)
  })

  it('bills Selected Items qty times the number of addresses', function () {
    var cart = [{ id: 'a', quantity: 1 }]
    var order = {
      splits: [
        createSplit({
          id: 1,
          itemIds: ['a'],
          locations: [createLocation('One', 1), createLocation('Two', 1), createLocation('Three', 1)],
        }),
      ],
    }
    expect(billedBoxesForLine(cart[0], order)).toBe(3)
    expect(billedBoxesCart(cart, order)).toBe(3)
  })

  it('bills Selected Items qty when there are no addresses yet', function () {
    var cart = [{ id: 'a', quantity: 2 }]
    var order = { splits: [createSplit({ id: 1, itemIds: ['a'], locations: [] })] }
    expect(billedBoxesForLine(cart[0], order)).toBe(2)
  })

  it('syncLocationQtyFromOrdered copies Selected Items onto every ship-to', function () {
    var split = createSplit({
      id: 1,
      itemIds: ['a'],
      locations: [createLocation('One', 1), createLocation('Two', 9)],
    })
    var cart = [{ id: 'a', quantity: 2 }]
    syncLocationQtyFromOrdered(split, cart)
    expect(split.locations[0].qty).toBe(2)
    expect(split.locations[1].qty).toBe(2)
  })
})
