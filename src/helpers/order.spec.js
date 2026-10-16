import { describe, expect, it } from 'vitest'
import {
  addSplit,
  assignItem,
  billedBoxesCart,
  billedBoxesForLine,
  createLocation,
  createSplit,
  pruneLocationsWithoutItems,
  defaultOrder,
  moveItem,
  moveLocation,
  nextLocationQty,
  orderedBoxesForSplit,
  removeSplitAt,
  syncCartAssignments,
  syncLocationQtyFromOrdered,
  fitGroupToLimit,
  readSplitQty,
  syncLineQuantityFromSplits,
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
      splits: [createSplit({ id: 1, itemIds: ['a'] }), createSplit({ id: 2, itemIds: ['b', 'c'] })],
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

  it('moveLocation relocates an address without duplicating it', function () {
    var first = createLocation('123 Street', 2)
    var second = createLocation('456 Street', 1)
    var order = {
      splits: [
        createSplit({ id: 1, itemIds: ['a'], locations: [first, second] }),
        createSplit({ id: 2, itemIds: ['b'], locations: [] }),
      ],
    }
    moveLocation(order, second.id, 2, 0)
    expect(
      order.splits[0].locations.map(function (loc) {
        return loc.address
      })
    ).toEqual(['123 Street'])
    expect(
      order.splits[1].locations.map(function (loc) {
        return loc.address
      })
    ).toEqual(['456 Street'])
    expect(order.splits[1].locations[0].qty).toBe(1)
  })

  it('moveLocation combines boxes when the target group already has that address', function () {
    var moving = createLocation('300-5515 North Service Road, Burlington, ON L7L 6G4', 1)
    var order = {
      splits: [
        createSplit({
          id: 1,
          itemIds: ['a'],
          locations: [createLocation('123 Street', 1), moving],
        }),
        createSplit({
          id: 2,
          itemIds: ['a'],
          locations: [
            createLocation('1100 1st St SE', 1),
            createLocation('  300-5515 north service road,  Burlington, ON L7L 6G4 ', 3),
          ],
        }),
      ],
    }
    var kept = moveLocation(order, moving.id, 2, 0)
    var target = order.splits[1].locations
    expect(target.length).toBe(2)
    expect(target[1].qty).toBe(4)
    expect(kept).toBe(target[1])
    expect(order.splits[0].locations.length).toBe(1)
  })

  it('moveLocation reorders addresses inside a group', function () {
    var first = createLocation('123 Street', 1)
    var second = createLocation('456 Street', 1)
    var order = {
      splits: [createSplit({ id: 1, locations: [first, second] })],
    }
    moveLocation(order, second.id, 1, 0)
    expect(
      order.splits[0].locations.map(function (loc) {
        return loc.address
      })
    ).toEqual(['456 Street', '123 Street'])
  })

  it('moveItem relocates a line without duplicating it', function () {
    var order = {
      splits: [createSplit({ id: 1, itemIds: ['a', 'b'] }), createSplit({ id: 2, itemIds: [] })],
    }
    moveItem(order, 'b', 2)
    expect(order.splits[0].itemIds).toEqual(['a'])
    expect(order.splits[1].itemIds).toEqual(['b'])
  })

  it('moveItem can insert at a drop index', function () {
    var order = {
      splits: [
        createSplit({ id: 1, itemIds: ['a', 'b'] }),
        createSplit({ id: 2, itemIds: ['c', 'd'] }),
      ],
    }
    moveItem(order, 'b', 2, 0)
    expect(order.splits[0].itemIds).toEqual(['a'])
    expect(order.splits[1].itemIds).toEqual(['b', 'c', 'd'])
  })

  it('assignItem keeps a cart line in only one group', function () {
    var order = {
      splits: [createSplit({ id: 1, itemIds: ['a'] }), createSplit({ id: 2, itemIds: [] })],
    }
    assignItem(order, order.splits[1], 'a')
    expect(order.splits[0].itemIds).toEqual([])
    expect(order.splits[1].itemIds).toEqual(['a'])
  })

  it('leaves a detached cart line out of Shipping Group 1', function () {
    var order = {
      splits: [createSplit({ id: 1, itemIds: [] })],
      detachedIds: ['x'],
    }
    syncCartAssignments(order, ['x', 'y'])
    expect(order.splits[0].itemIds).toEqual(['y'])
    expect(order.detachedIds).toEqual(['x'])
  })

  it('unassigned cart ids land in Shipping Group 1', function () {
    var order = {
      splits: [createSplit({ id: 1, itemIds: [] }), createSplit({ id: 2, itemIds: [] })],
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
          locations: [
            createLocation('One', 1),
            createLocation('Two', 1),
            createLocation('Three', 1),
          ],
        }),
      ],
    }
    expect(billedBoxesForLine(cart[0], order)).toBe(3)
    expect(billedBoxesCart(cart, order)).toBe(3)
  })

  it('bills the location box when it differs from the cart line', function () {
    var cart = [{ id: 'a', quantity: 8 }]
    var order = {
      splits: [
        createSplit({
          id: 1,
          itemIds: ['a'],
          locations: [createLocation('One', 1)],
        }),
      ],
    }
    expect(billedBoxesForLine(cart[0], order)).toBe(1)
    expect(billedBoxesCart(cart, order)).toBe(1)
  })

  it('bills Selected Items qty when there are no addresses yet', function () {
    var cart = [{ id: 'a', quantity: 2 }]
    var order = { splits: [createSplit({ id: 1, itemIds: ['a'], locations: [] })] }
    expect(billedBoxesForLine(cart[0], order)).toBe(2)
  })

  it('does not overwrite address quantities from the card qty', function () {
    var split = createSplit({
      id: 1,
      itemIds: ['a'],
      locations: [createLocation('One', 1), createLocation('Two', 9)],
    })
    var cart = [{ id: 'a', quantity: 2 }]
    syncLocationQtyFromOrdered(split, cart)
    expect(split.locations[0].qty).toBe(1)
    expect(split.locations[1].qty).toBe(9)
  })
})

describe('each design copies the address total', function () {
  it('sets one card to the address box sum', function () {
    var cart = [{ id: 'a', quantity: 1 }]
    var split = createSplit({
      id: 1,
      itemIds: ['a'],
      locations: [createLocation('Cambridge', 4), createLocation('Edmonton', 6)],
    })
    fitGroupToLimit(split, cart)
    expect(readSplitQty(split, cart[0])).toBe(10)
    expect(billedBoxesForLine(cart[0], { splits: [split] })).toBe(10)
    expect(billedBoxesCart(cart, { splits: [split] })).toBe(10)
  })

  it('copies the same address total onto every design', function () {
    var cart = [
      { id: 'a', quantity: 1 },
      { id: 'b', quantity: 1 },
    ]
    var split = createSplit({
      id: 1,
      itemIds: ['a', 'b'],
      locations: [createLocation('Cambridge', 4), createLocation('Edmonton', 6)],
    })
    fitGroupToLimit(split, cart)
    expect(readSplitQty(split, cart[0])).toBe(10)
    expect(readSplitQty(split, cart[1])).toBe(10)
    expect(split.locations[0].qty).toBe(4)
    expect(billedBoxesCart(cart, { splits: [split] })).toBe(20)
  })

  it('keeps two groups on their own address totals', function () {
    var cart = [{ id: 'a', quantity: 1 }]
    var first = createSplit({
      id: 1,
      itemIds: ['a'],
      locations: [createLocation('123 Street', 4)],
      qtys: { a: 1 },
    })
    var second = createSplit({
      id: 2,
      itemIds: ['a'],
      locations: [createLocation('99 West Street', 6)],
      qtys: { a: 1 },
    })
    fitGroupToLimit(first, cart)
    fitGroupToLimit(second, cart)
    expect(readSplitQty(first, cart[0])).toBe(4)
    expect(readSplitQty(second, cart[0])).toBe(6)
    expect(cart[0].quantity).toBe(1)
    syncLineQuantityFromSplits({ splits: [first, second] }, cart[0])
    expect(cart[0].quantity).toBe(10)
    expect(billedBoxesCart(cart, { splits: [first, second] })).toBe(10)
  })

  it('does not raise an address when a second design is added', function () {
    var cart = [
      { id: 'a', quantity: 1 },
      { id: 'b', quantity: 1 },
    ]
    var split = createSplit({
      id: 1,
      itemIds: ['a', 'b'],
      locations: [createLocation('456 Street', 1)],
    })
    fitGroupToLimit(split, cart)
    expect(split.locations[0].qty).toBe(1)
    expect(readSplitQty(split, cart[0])).toBe(1)
    expect(readSplitQty(split, cart[1])).toBe(1)
    expect(billedBoxesCart(cart, { splits: [split] })).toBe(2)
  })
})

describe('pruneLocationsWithoutItems', function () {
  it('clears ship-tos when a group has no selected cards', function () {
    var order = {
      splits: [
        createSplit({
          id: 1,
          itemIds: [],
          locations: [createLocation('123 Street', 1)],
        }),
        createSplit({
          id: 2,
          itemIds: ['a'],
          locations: [createLocation('456 Street', 2)],
        }),
      ],
    }
    pruneLocationsWithoutItems(order, [{ id: 'a', quantity: 1 }])
    expect(order.splits[0].locations).toEqual([])
    expect(order.splits[1].locations.length).toBe(1)
  })
})
