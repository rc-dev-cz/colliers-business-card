// Order History → namedAction repeatOrder({ id, confirmed })
// Replaces the old two steps (log + runUtilityHook type "repeat"): Repeat Order no longer asks
// FileMaker to duplicate the order. It copies the order into the cart and opens Shipping, and
// Place Order creates the new order (Vue repeatOrder / copyOrderForRepeat).
//
// - Cart has cards and not confirmed yet: open the "Replace your cart?" modal (model.confirmRepeat).
// - New line, group and ship-to ids, so the new order never reuses the old line_ref / location_ref.
// - Ship-tos keep addressId / addressType. Shipping onFormLoad checks them once against the address
//   book it loads and drops the ones that were deleted (app.repeatNotice).
var opts = (action && action.options) || (typeof options !== 'undefined' && options) || {}
var id = opts.id
var record = (model.orders || []).find(function (row) {
  return String(row.id) === String(id)
})
if (!record || !(record.cart || []).length) return

function cartList() {
  if (typeof app === 'undefined') return []
  if (Array.isArray(app.cart)) return app.cart
  if (app.cart && Array.isArray(app.cart.items)) return app.cart.items
  return []
}
var current = cartList()
if (current.length && !opts.confirmed) {
  model.confirmRepeat = { id: record.id, count: current.length }
  return
}
model.confirmRepeat = null

function uid(prefix) {
  return prefix + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}
function cloneDetails(details) {
  var out = Object.assign({}, details || {})
  out.degree = Array.isArray(out.degree) ? out.degree.slice() : out.degree ? [out.degree] : []
  return out
}

var lineIds = {}
var cart = record.cart.map(function (line) {
  var copy = Object.assign({}, line, { id: uid('line-'), details: cloneDetails(line.details) })
  lineIds[String(line.id)] = copy.id
  return copy
})
function mapId(oldId) {
  return lineIds[String(oldId)]
}

var stamp = Date.now()
var source = (record.order && Array.isArray(record.order.splits) && record.order.splits) || []
var splits = source.map(function (split, index) {
  var qtys = {}
  Object.keys(split.qtys || {}).forEach(function (key) {
    var next = mapId(key)
    if (next) qtys[next] = split.qtys[key]
  })
  return {
    id: stamp + index,
    itemIds: (split.itemIds || []).map(mapId).filter(Boolean),
    qtys: qtys,
    locations: (split.locations || []).map(function (loc) {
      return {
        id: uid('loc-'),
        address: loc.address || '',
        qty: loc.qty,
        addressId: loc.addressId != null && loc.addressId !== '' ? String(loc.addressId) : '',
        addressType: loc.addressType || '',
      }
    }),
  }
})
if (!splits.length)
  splits = [
    {
      id: stamp,
      itemIds: cart.map(function (line) {
        return line.id
      }),
      locations: [],
    },
  ]
var order = {
  detachedIds: ((record.order && record.order.detachedIds) || []).map(mapId).filter(Boolean),
  splits: splits,
}

if (typeof app !== 'undefined') {
  app.cart = cart
  app.order = order
  app.editLineId = null
  if (app.proof) app.proof.editLineId = null
  app.pendingSplitId = null
  app.pendingAddressSplitId = null
  app.repeatNotice = { orderId: record.id, checked: false, removedAddresses: 0 }
}
try {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('colliers-tab.cart', JSON.stringify(cart))
    sessionStorage.setItem('colliers-tab.order', JSON.stringify(order))
  }
} catch (err) {}
if (typeof BF !== 'undefined' && BF.namedAction) {
  try {
    BF.namedAction('syncCartHeader')
  } catch (errHeader) {}
}
model.details = null
if (typeof BF !== 'undefined' && BF.goto) {
  BF.goto('/shipping')
  return
}
if (window.location) window.location.hash = '#/shipping'
