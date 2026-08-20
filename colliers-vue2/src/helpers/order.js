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
  return (removed.itemIds || []).slice()
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
  if (!trimmed) return
  split.locations.push(createLocation(trimmed, qty == null ? 1 : qty))
}

export function removeLocation(split, index) {
  split.locations.splice(index, 1)
}

export function resetOrder(order) {
  const next = defaultOrder()
  order.splits.splice(0, order.splits.length)
  next.splits.forEach(function (split) {
    order.splits.push(split)
  })
}
