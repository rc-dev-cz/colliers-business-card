import { reactive, watch } from 'vue'
import { readStorage, writeStorage } from './useStorage'

function createLocation(address = '', qty = 1) {
  return {
    id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    address,
    qty,
  }
}

function createSplit({ id = Date.now(), itemIds = [], locations = null } = {}) {
  return {
    id,
    itemIds: [...itemIds],
    locations: locations ? locations.map((loc) => ({ ...loc })) : [createLocation()],
  }
}

function defaultOrder() {
  return {
    splits: [
      createSplit({
        id: 1,
        locations: [
          createLocation('123 Address Street, South Plainfield, NJ 07080', 15),
          createLocation('7481 Lakeview Court, South Plainfield, NJ 07080', 15),
          createLocation('7105 Cherry Hill St., Millville, NJ 08332', 15),
        ],
      }),
    ],
  }
}

function normalizeOrder(raw) {
  const source = raw && Array.isArray(raw.splits) ? raw : defaultOrder()
  return {
    splits: source.splits.map((split, index) =>
      createSplit({
        id: split.id ?? index + 1,
        itemIds: Array.isArray(split.itemIds) ? split.itemIds.map(String) : [],
        locations: (split.locations || []).map((loc) => ({
          id: loc.id || createLocation().id,
          address: loc.address || '',
          qty: Number(loc.qty) > 0 ? Number(loc.qty) : 1,
        })),
      }),
    ),
  }
}

function snapshotOrder(value) {
  return {
    splits: (value.splits || []).map((split) => ({
      id: split.id,
      itemIds: [...(split.itemIds || [])],
      locations: (split.locations || []).map((loc) => ({
        id: loc.id,
        address: loc.address || '',
        qty: Number(loc.qty) > 0 ? Number(loc.qty) : 1,
      })),
    })),
  }
}

const order = reactive(normalizeOrder(readStorage('order', null)))

function persistOrder() {
  writeStorage('order', snapshotOrder(order))
}

watch(order, persistOrder, { deep: true, immediate: true })

export function useOrder() {
  /** Keep each cart line in exactly one shipping group (default: group 1). */
  function syncCartAssignments(cartIds = []) {
    const ids = cartIds.map(String)
    const idSet = new Set(ids)

    order.splits.forEach((split) => {
      split.itemIds = (split.itemIds || []).filter((id) => idSet.has(String(id))).map(String)
    })

    if (!order.splits.length) {
      order.splits.push(createSplit({ id: 1 }))
    }

    const assigned = new Set(order.splits.flatMap((split) => split.itemIds))
    ids.forEach((id) => {
      if (!assigned.has(id)) {
        order.splits[0].itemIds.push(id)
        assigned.add(id)
      }
    })
  }

  function linesForSplit(split, cartLines = []) {
    const byId = new Map(cartLines.map((line) => [String(line.id), line]))
    return (split.itemIds || []).map((id) => byId.get(String(id))).filter(Boolean)
  }

  function splitOrder() {
    // Empty group: no cards, one blank location (USR-057)
    order.splits.push(createSplit({ locations: [createLocation('', 1)] }))
  }

  function removeSplit(index) {
    if (order.splits.length <= 1) return
    const [removed] = order.splits.splice(index, 1)
    const target = order.splits[0]
    ;(removed.itemIds || []).forEach((id) => {
      if (!target.itemIds.includes(id)) target.itemIds.push(id)
    })
  }

  function assignItem(split, itemId) {
    const id = String(itemId)
    order.splits.forEach((s) => {
      s.itemIds = (s.itemIds || []).filter((x) => x !== id)
    })
    if (!split.itemIds.includes(id)) split.itemIds.push(id)
  }

  function unassignItem(itemId) {
    const id = String(itemId)
    order.splits.forEach((s) => {
      s.itemIds = (s.itemIds || []).filter((x) => x !== id)
    })
  }

  function moveItem(itemId, toSplitId) {
    const target = order.splits.find((s) => String(s.id) === String(toSplitId))
    if (!target) return
    assignItem(target, itemId)
  }

  function addLocation(split, address = '', qty = 1) {
    split.locations.push(createLocation(address, qty))
  }

  function removeLocation(split, index) {
    split.locations.splice(index, 1)
  }

  function clearOrder() {
    const next = defaultOrder()
    order.splits.splice(0, order.splits.length, ...next.splits)
    persistOrder()
  }

  return {
    order,
    createLocation,
    syncCartAssignments,
    linesForSplit,
    splitOrder,
    removeSplit,
    assignItem,
    unassignItem,
    moveItem,
    addLocation,
    removeLocation,
    clearOrder,
    persistOrder,
  }
}
