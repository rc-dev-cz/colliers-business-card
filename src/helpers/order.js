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
  return {
    id: opts.id == null ? Date.now() : opts.id,
    itemIds: Array.isArray(opts.itemIds) ? opts.itemIds.map(String) : [],
    locations: locations,
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
    splits: source.splits.map(function (split, index) {
      return createSplit({
        id: split.id == null ? index + 1 : split.id,
        itemIds: Array.isArray(split.itemIds) ? split.itemIds.map(String) : [],
        locations: (split.locations || []).filter(function (loc) {
          return String((loc && loc.address) || '').trim()
        }),
      })
    }),
  }
}

export function snapshotOrder(value) {
  return {
    splits: (value.splits || []).map(function (split) {
      return {
        id: split.id,
        itemIds: (split.itemIds || []).slice(),
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
      (split.itemIds || []).filter(function (id) {
        return idSet[String(id)]
      }).map(String),
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

  ids.forEach(function (id) {
    if (!assigned[id]) {
      order.splits[0].itemIds.push(id)
      assigned[id] = true
    }
  })
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

/** Boxes ordered in this shipping group (sum of cart line quantities). */
export function orderedBoxesForSplit(split, cartLines) {
  return linesForSplit(split, cartLines).reduce(function (sum, line) {
    return sum + (Number(line.quantity) || 0)
  }, 0)
}

/** Boxes already assigned to ship-to rows in this group. */
export function assignedBoxesForSplit(split) {
  return (split.locations || []).reduce(function (sum, loc) {
    return sum + (Number(loc.qty) > 0 ? Number(loc.qty) : 0)
  }, 0)
}

/**
 * Default boxes for a newly added ship-to row.
 * Uses remaining unallocated boxes from the cart lines in this group.
 * Falls back to 1 when nothing remains (user must raise Selected Items qty).
 */
export function nextLocationQty(split, cartLines) {
  var remaining = orderedBoxesForSplit(split, cartLines) - assignedBoxesForSplit(split)
  return remaining > 0 ? remaining : 1
}

export function addSplit(order, itemIds) {
  const split = createSplit({
    locations: [],
    itemIds: Array.isArray(itemIds) ? itemIds : [],
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

export function assignItem(order, split, itemId) {
  const id = String(itemId)
  order.splits.forEach(function (row) {
    Vue.set(
      row,
      'itemIds',
      (row.itemIds || []).filter(function (x) {
        return x !== id
      }),
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
      }),
    )
  })
}

export function moveItem(order, itemId, toSplitId) {
  const target = order.splits.find(function (row) {
    return String(row.id) === String(toSplitId)
  })
  if (!target) return
  assignItem(order, target, itemId)
}

export function addLocation(split, address, qty) {
  const trimmed = String(address || '').trim()
  split.locations.push(createLocation(trimmed, qty == null ? 1 : qty))
}

export function removeLocation(split, index) {
  const removed = split.locations.splice(index, 1)[0]
  return removed || null
}

/**
 * Reduce cart line quantities for items in this shipping group by `boxes`.
 * Mutates matching lines. Returns ids whose quantity dropped to 0 (caller should drop them).
 */
export function reduceCartBoxesForSplit(cartLines, split, boxes) {
  var remaining = Math.max(0, Number(boxes) || 0)
  if (remaining <= 0) return []

  var idSet = {}
  ;(split && split.itemIds ? split.itemIds : []).forEach(function (id) {
    idSet[String(id)] = true
  })

  var zeroIds = []
  ;(cartLines || []).forEach(function (line) {
    if (remaining <= 0 || !idSet[String(line.id)]) return
    var qty = Number(line.quantity) || 0
    if (qty <= 0) {
      zeroIds.push(line.id)
      return
    }
    var take = Math.min(qty, remaining)
    line.quantity = qty - take
    remaining -= take
    if (line.quantity <= 0) zeroIds.push(line.id)
  })
  return zeroIds
}

/**
 * Keep Selected Items boxes equal to the sum of ship-to location qtys.
 * - Location qty up → cart up
 * - Location qty down / remove → cart down (0 → lines removed)
 */
export function syncCartBoxesToAssigned(cartLines, split) {
  var ordered = orderedBoxesForSplit(split, cartLines)
  var assigned = assignedBoxesForSplit(split)
  if (assigned === ordered) return []
  if (assigned < ordered) {
    return reduceCartBoxesForSplit(cartLines, split, ordered - assigned)
  }
  var lines = linesForSplit(split, cartLines)
  if (!lines.length) return []
  lines[0].quantity = (Number(lines[0].quantity) || 0) + (assigned - ordered)
  return []
}

export function resetOrder(order) {
  const next = defaultOrder()
  order.splits.splice(0, order.splits.length)
  next.splits.forEach(function (split) {
    order.splits.push(split)
  })
}
