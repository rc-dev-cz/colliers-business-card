import { makeLine } from './cart.js'
import { normalizeOrder, snapshotOrder } from './order.js'
import { formatAddressLine } from '../adapters/api.js'

function uid(prefix) {
  return prefix + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

function oneLine(row) {
  return String(formatAddressLine(row) || '').trim()
}

function byId(id) {
  return function (row) {
    return row && String(row.id) === String(id)
  }
}

/**
 * The address-book row a repeated ship-to points at today.
 *   { row, type }   still in the book (office list or the cardholder's personal addresses)
 *   { gone: true }  its address id is no longer in the book
 *   null            cannot tell (no id and no text match, or the list is not loaded): keep as is
 */
function currentAddress(loc, books) {
  var offices = books.offices
  var personal = books.personal
  var id = loc.addressId != null && loc.addressId !== '' ? String(loc.addressId) : ''
  if (id) {
    var type = loc.addressType || ''
    var office = type !== 'personal' && offices ? offices.find(byId(id)) : null
    if (office) return { row: office, type: 'office' }
    var mine = type !== 'office' && personal ? personal.find(byId(id)) : null
    if (mine) return { row: mine, type: 'personal' }
    // Only call it gone when the list it belongs to is loaded.
    var checked =
      type === 'office' ? !!offices : type === 'personal' ? !!personal : !!(offices && personal)
    return checked ? { gone: true } : null
  }
  // Ship-tos saved before ids were kept: match by address text, else leave it alone.
  var text = String(loc.address || '').trim()
  if (!text) return null
  var matchText = function (row) {
    return oneLine(row) === text
  }
  var officeByText = (offices || []).find(matchText)
  if (officeByText) return { row: officeByText, type: 'office' }
  var personalByText = (personal || []).find(matchText)
  if (personalByText) return { row: personalByText, type: 'personal' }
  return null
}

/**
 * Copy a past order for Repeat Order: the same cards, groups, ship-tos and box counts, with
 *   - new line, group and ship-to ids, so the new order never reuses the old order's refs
 *     (line_ref / location_ref sent to FileMaker);
 *   - each ship-to checked against today's address book: the text is refreshed when the row
 *     changed, and a ship-to whose address was deleted is dropped (the group then needs a
 *     new address on Shipping).
 *
 * books: { offices, personal } — pass null for a list that is not loaded (then it is not checked).
 * Returns { cart, order, removedAddresses }.
 */
export function copyOrderForRepeat(record, books) {
  var lists = books || {}
  var source = record || {}
  var lineIds = {}
  var cart = (source.cart || []).map(function (line) {
    var copy = makeLine(Object.assign({}, line, { id: null }))
    lineIds[String(line.id)] = copy.id
    return copy
  })
  var mapId = function (id) {
    return lineIds[String(id)]
  }

  var removed = 0
  var stamp = Date.now()
  var old = snapshotOrder(normalizeOrder(source.order))
  var splits = old.splits.map(function (split, index) {
    var qtys = {}
    Object.keys(split.qtys || {}).forEach(function (key) {
      var next = mapId(key)
      if (next) qtys[next] = split.qtys[key]
    })
    var locations = []
    ;(split.locations || []).forEach(function (loc) {
      var found = currentAddress(loc, lists)
      if (found && found.gone) {
        removed += 1
        return
      }
      var next = Object.assign({}, loc, { id: uid('loc-') })
      if (found) {
        next.address = oneLine(found.row) || next.address
        next.addressId = String(found.row.id)
        next.addressType = found.type
      }
      locations.push(next)
    })
    return {
      id: stamp + index,
      itemIds: (split.itemIds || []).map(mapId).filter(Boolean),
      qtys: qtys,
      locations: locations,
    }
  })

  return {
    cart: cart,
    order: normalizeOrder({
      detachedIds: (old.detachedIds || []).map(mapId).filter(Boolean),
      splits: splits,
    }),
    removedAddresses: removed,
  }
}
