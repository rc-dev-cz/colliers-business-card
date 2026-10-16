import Vue from 'vue'

function uid(prefix) {
  return prefix + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export function createLocation(address, qty) {
  return {
    id: uid('loc-'),
    address: address || '',
    qty: Number(qty) > 0 ? Number(qty) : 1,
  }
}

export function createSplit(options) {
  const opts = options || {}
  const locations = opts.locations
    ? opts.locations.map(function (loc) {
        return {
          id: loc.id || uid('loc-'),
          address: loc.address || '',
          qty: Number(loc.qty) > 0 ? Number(loc.qty) : 1,
        }
      })
    : []
  var qtys = {}
  if (opts.qtys && typeof opts.qtys === 'object') {
    Object.keys(opts.qtys).forEach(function (key) {
      qtys[String(key)] = Math.max(1, Number(opts.qtys[key]) || 1)
    })
  }
  return {
    id: opts.id == null ? Date.now() : opts.id,
    itemIds: Array.isArray(opts.itemIds) ? opts.itemIds.map(String) : [],
    locations: locations,
    qtys: qtys,
  }
}

export function defaultOrder() {
  return {
    splits: [
      createSplit({
        id: 1,
        locations: [],
      }),
    ],
  }
}

export function normalizeOrder(raw) {
  const source = raw && Array.isArray(raw.splits) ? raw : defaultOrder()
  return {
    detachedIds: Array.isArray(source.detachedIds) ? source.detachedIds.map(String) : [],
    splits: source.splits.map(function (split, index) {
      return createSplit({
        id: split.id == null ? index + 1 : split.id,
        itemIds: Array.isArray(split.itemIds) ? split.itemIds.map(String) : [],
        qtys: split.qtys || {},
        locations: (split.locations || []).filter(function (loc) {
          return String((loc && loc.address) || '').trim()
        }),
      })
    }),
  }
}

export function snapshotOrder(value) {
  return {
    detachedIds: ((value && value.detachedIds) || []).map(String),
    splits: (value.splits || []).map(function (split) {
      return {
        id: split.id,
        itemIds: (split.itemIds || []).slice(),
        qtys: Object.assign({}, split.qtys || {}),
        locations: (split.locations || []).map(function (loc) {
          return {
            id: loc.id,
            address: loc.address || '',
            qty: Number(loc.qty) > 0 ? Number(loc.qty) : 1,
          }
        }),
      }
    }),
  }
}

export function syncCartAssignments(order, cartIds) {
  const ids = (cartIds || []).map(String)
  const idSet = {}
  ids.forEach(function (id) {
    idSet[id] = true
  })

  order.splits.forEach(function (split) {
    Vue.set(
      split,
      'itemIds',
      (split.itemIds || [])
        .filter(function (id) {
          return idSet[String(id)]
        })
        .map(String)
    )
  })

  if (!order.splits.length) {
    order.splits.push(createSplit({ id: 1 }))
  }

  const assigned = {}
  order.splits.forEach(function (split) {
    ;(split.itemIds || []).forEach(function (id) {
      assigned[id] = true
    })
  })

  const detached = {}
  ;((order && order.detachedIds) || []).forEach(function (id) {
    detached[String(id)] = true
  })

  ids.forEach(function (id) {
    if (assigned[id] || detached[id]) return
    order.splits[0].itemIds.push(id)
    assigned[id] = true
  })

  const kept = ((order && order.detachedIds) || []).map(String).filter(function (id) {
    return idSet[id] && !assigned[id]
  })
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(order, 'detachedIds', kept)
  else order.detachedIds = kept
}

export function linesForSplit(split, cartLines) {
  const byId = {}
  ;(cartLines || []).forEach(function (line) {
    byId[String(line.id)] = line
  })
  return (split.itemIds || [])
    .map(function (id) {
      return byId[String(id)]
    })
    .filter(Boolean)
}

/** Quantity of one card inside one shipping group. */
export function readSplitQty(split, line) {
  var id = String(line && line.id)
  var stored = split && split.qtys ? split.qtys[id] : null
  if (stored != null && stored !== '') return Math.max(1, Number(stored) || 1)
  return Math.max(1, Number(line && line.quantity) || 1)
}

/** Remember that quantity on the split, without touching the other splits. */
export function writeSplitQty(split, line, qty) {
  var n = Math.max(1, Number(qty) || 1)
  var id = String(line && line.id)
  if (!split.qtys || typeof split.qtys !== 'object' || Array.isArray(split.qtys)) {
    if (typeof Vue !== 'undefined' && Vue.set) Vue.set(split, 'qtys', {})
    else split.qtys = {}
  }
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(split.qtys, id, n)
  else split.qtys[id] = n
  return n
}

/**
 * Cart line quantity is the items for that card across splits.
 * One split keeps the card's own quantity. Several splits add up.
 */
export function syncLineQuantityFromSplits(order, line) {
  var id = String(line && line.id)
  var parts = []
  ;((order && order.splits) || []).forEach(function (split) {
    var ids = (split.itemIds || []).map(String)
    if (ids.indexOf(id) === -1) return
    parts.push(readSplitQty(split, line))
  })
  if (!parts.length) return line.quantity
  line.quantity = parts.reduce(function (sum, n) {
    return sum + n
  }, 0)
  return line.quantity
}

/** Boxes ordered in this shipping group (sum of that group's quantities). */
export function orderedBoxesForSplit(split, cartLines) {
  return linesForSplit(split, cartLines).reduce(function (sum, line) {
    return sum + readSplitQty(split, line)
  }, 0)
}

/** Boxes already assigned to ship-to rows in this group (persist/readout). */
export function assignedBoxesForSplit(split) {
  return (split.locations || []).reduce(function (sum, loc) {
    return sum + (Number(loc.qty) > 0 ? Number(loc.qty) : 0)
  }, 0)
}

export function splitForLineId(order, lineId) {
  var id = String(lineId == null ? '' : lineId)
  if (!id) return null
  var splits = (order && order.splits) || []
  for (var i = 0; i < splits.length; i += 1) {
    var ids = splits[i].itemIds || []
    for (var j = 0; j < ids.length; j += 1) {
      if (String(ids[j]) === id) return splits[i]
    }
  }
  return null
}

/** Each ship-to receives the full Selected Items qty. Zero addresses still bills 1×. */
export function shipMultiplier(split) {
  var n = split && split.locations ? split.locations.length : 0
  return n > 0 ? n : 1
}

export function groupLines(split, cartLines) {
  var ids = ((split && split.itemIds) || []).map(String)
  return (cartLines || []).filter(function (line) {
    return ids.indexOf(String(line && line.id)) >= 0
  })
}

/**
 * Address boxes are the only editor. Every design in the group
 * copies that group's address total. Cart line quantity is left
 * to syncLineQuantityFromSplits so another group's copy is kept.
 */
export function fitGroupToLimit(split, cartLines) {
  var lines = groupLines(split, cartLines)
  if (!lines.length) return
  if (split.locations && split.locations.length) {
    var total = locationBoxSum(split)
    if (!(total > 0)) total = 1
    lines.forEach(function (line) {
      writeSplitQty(split, line, total)
    })
    return
  }
  lines.forEach(function (line) {
    writeSplitQty(split, line, readSplitQty(split, line))
  })
}

export function maxItemQty(split) {
  if (!split || !split.locations || !split.locations.length) return 1
  return Math.max(1, locationBoxSum(split))
}

export function locationQtyFloor() {
  return 1
}

export function locationBoxSum(split) {
  if (!split || !split.locations || !split.locations.length) return 0
  return split.locations.reduce(function (sum, loc) {
    var qty = Number(loc && loc.qty)
    return sum + (qty > 0 ? qty : 0)
  }, 0)
}

function splitsForLineId(order, lineId) {
  var id = String(lineId == null ? '' : lineId)
  return ((order && order.splits) || []).filter(function (split) {
    return (split.itemIds || []).some(function (itemId) {
      return String(itemId) === id
    })
  })
}

/**
 * Boxes billed for one cart line. Each group with addresses contributes
 * that group's full address total (a copy, not a share). Groups without
 * addresses contribute the cart line quantity once.
 */
export function billedBoxesForLine(line, order) {
  var qty = Number(line && line.quantity) || 0
  var splits = splitsForLineId(order, line && line.id)
  var withLocs = splits.filter(function (split) {
    return split.locations && split.locations.length
  })
  if (!withLocs.length) return qty
  return withLocs.reduce(function (sum, split) {
    return sum + locationBoxSum(split)
  }, 0)
}

export function billedBoxesCart(cart, order) {
  var cartIds = {}
  ;(cart || []).forEach(function (line) {
    cartIds[String(line && line.id)] = true
  })
  var covered = {}
  var total = 0
  ;((order && order.splits) || []).forEach(function (split) {
    var designs = (split.itemIds || []).map(String).filter(function (id) {
      return cartIds[id]
    })
    if (!(split.locations && split.locations.length) || !designs.length) return
    total += locationBoxSum(split) * designs.length
    designs.forEach(function (id) {
      covered[id] = true
    })
  })
  ;(cart || []).forEach(function (line) {
    var id = String(line && line.id)
    if (covered[id]) return
    total += Number(line && line.quantity) || 0
  })
  return total
}

/**
 * Default boxes for a new address: one box of each design, or the
 * single card's quantity when the group has no addresses yet.
 * A later address copies the previous address quantity.
 */
export function boxesPerAddressForSplit(split, cartLines) {
  var locs = (split && split.locations) || []
  if (locs.length) {
    var last = Number(locs[locs.length - 1] && locs[locs.length - 1].qty)
    if (last > 0) return last
  }
  var lines = linesForSplit(split, cartLines)
  if (lines.length > 1) return 1
  var ordered = orderedBoxesForSplit(split, cartLines)
  return ordered > 0 ? ordered : 1
}

/**
 * Default boxes copied onto a newly added ship-to row (same as Selected Items).
 */
export function nextLocationQty(split, cartLines) {
  return boxesPerAddressForSplit(split, cartLines)
}

/** Addresses are the qty editor. Card quantities follow them; this does not rewrite addresses. */
export function syncLocationQtyFromOrdered() {}

export function addSplit(order, itemIds, qtys) {
  const split = createSplit({
    locations: [],
    itemIds: Array.isArray(itemIds) ? itemIds : [],
    qtys: qtys || {},
  })
  order.splits.push(split)
  return split
}

export function removeSplitAt(order, index) {
  if (order.splits.length <= 1) return []
  const removed = order.splits.splice(index, 1)[0]
  const ids = (removed.itemIds || []).map(String)
  const target = order.splits[0]
  ids.forEach(function (id) {
    if (target.itemIds.indexOf(id) === -1) target.itemIds.push(id)
  })
  return ids
}

export function detachLine(order, itemId) {
  const id = String(itemId)
  const list = ((order && order.detachedIds) || []).map(String)
  if (list.indexOf(id) === -1) list.push(id)
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(order, 'detachedIds', list)
  else order.detachedIds = list
}

export function attachLine(order, itemId) {
  const id = String(itemId)
  const list = ((order && order.detachedIds) || []).map(String).filter(function (row) {
    return row !== id
  })
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(order, 'detachedIds', list)
  else order.detachedIds = list
}

/** Add a cart line to one group without removing it from the others. */
export function includeItem(order, split, itemId) {
  const id = String(itemId)
  if (!split.itemIds) split.itemIds = []
  if (split.itemIds.map(String).indexOf(id) === -1) split.itemIds.push(id)
  attachLine(order, id)
}

export function assignItem(order, split, itemId) {
  const id = String(itemId)
  attachLine(order, id)
  order.splits.forEach(function (row) {
    Vue.set(
      row,
      'itemIds',
      (row.itemIds || []).filter(function (x) {
        return x !== id
      })
    )
  })
  if (split.itemIds.indexOf(id) === -1) split.itemIds.push(id)
}

export function unassignItem(order, itemId) {
  const id = String(itemId)
  order.splits.forEach(function (row) {
    Vue.set(
      row,
      'itemIds',
      (row.itemIds || []).filter(function (x) {
        return x !== id
      })
    )
  })
}

function findSplit(order, splitId) {
  return (order.splits || []).find(function (row) {
    return String(row.id) === String(splitId)
  })
}

/**
 * Drag a card between or within shipping groups. Groups are independent: the same
 * card can ship in several groups, so only the source and target groups change.
 * Without `fromSplitId` the card leaves every other group (legacy behaviour).
 */
export function moveItem(order, itemId, toSplitId, newIndex, fromSplitId) {
  const target = findSplit(order, toSplitId)
  if (!target) return
  var id = String(itemId)
  var source = fromSplitId != null && fromSplitId !== '' ? findSplit(order, fromSplitId) : null
  if (!source) {
    assignItem(order, target, itemId)
  } else if (source !== target) {
    var hadQty = source.qtys && source.qtys[id] != null
    var movedQty = hadQty ? source.qtys[id] : null
    Vue.set(
      source,
      'itemIds',
      (source.itemIds || []).filter(function (x) {
        return String(x) !== id
      })
    )
    if (source.qtys && source.qtys[id] != null) Vue.delete(source.qtys, id)
    var alreadyThere = (target.itemIds || []).map(String).indexOf(id) !== -1
    includeItem(order, target, id)
    // Keep the boxes the card had in its old group unless the target already had it.
    if (hadQty && !alreadyThere) writeSplitQty(target, { id: id }, movedQty)
  }
  if (newIndex == null || newIndex === '') return
  var ids = target.itemIds || []
  var at = ids.map(String).indexOf(id)
  if (at === -1) return
  var row = ids.splice(at, 1)[0]
  var idx = Number(newIndex)
  if (isNaN(idx) || idx < 0) idx = ids.length
  if (idx > ids.length) idx = ids.length
  ids.splice(idx, 0, row)
}

export function moveLocation(order, locId, toSplitId, newIndex) {
  var id = String(locId || '')
  if (!id) return null
  var target = (order.splits || []).find(function (row) {
    return String(row.id) === String(toSplitId)
  })
  if (!target) return null
  var moved = null
  ;(order.splits || []).forEach(function (split) {
    if (moved) return
    var list = split.locations || []
    var i
    for (i = 0; i < list.length; i += 1) {
      if (String(list[i] && list[i].id) !== id) continue
      moved = list.splice(i, 1)[0]
      break
    }
  })
  if (!moved) return null
  target.locations = target.locations || []
  var idx = newIndex == null || newIndex === '' ? target.locations.length : Number(newIndex)
  if (isNaN(idx) || idx < 0) idx = target.locations.length
  if (idx > target.locations.length) idx = target.locations.length
  target.locations.splice(idx, 0, moved)
  return moved
}

export function addLocation(split, address, qty) {
  const trimmed = String(address || '').trim()
  split.locations.push(createLocation(trimmed, qty == null ? 1 : qty))
}

export function removeLocation(split, index) {
  const removed = split.locations.splice(index, 1)[0]
  return removed || null
}

/** Ship-to rows only belong on a group that still has selected cards. */
export function pruneLocationsWithoutItems(order, cartLines) {
  ;(order && order.splits ? order.splits : []).forEach(function (split) {
    if (linesForSplit(split, cartLines).length) return
    if (!split.locations || !split.locations.length) return
    split.locations.splice(0, split.locations.length)
  })
}

export function resetOrder(order) {
  const next = defaultOrder()
  order.splits.splice(0, order.splits.length)
  next.splits.forEach(function (split) {
    order.splits.push(split)
  })
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(order, 'detachedIds', [])
  else order.detachedIds = []
}
