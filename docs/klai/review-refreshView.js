function findProduct(code) {
  return _.find(model.products || [], { code: code }) || {}
}
function money(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2)
}
function itemQty(line) {
  return Math.max(1, Number(line && line.quantity) || 1)
}
if (typeof app !== 'undefined') {
  if (Array.isArray(app.cart)) model.cart = app.cart
  else if (app.cart && Array.isArray(app.cart.items)) model.cart = app.cart.items
  if (app.order && Array.isArray(app.order.splits) && app.order.splits.length)
    model.order = app.order
}
model.cart = Array.isArray(model.cart) ? model.cart : []
model.order = model.order || { splits: [] }
if (!Array.isArray(model.order.splits)) model.order.splits = []
// Review drops groups with no items (reachable by URL past the Shipping check). Keeps one.
var inCart = {}
model.cart.forEach(function (line) {
  inCart[String(line.id)] = true
})
var filledSplits = model.order.splits.filter(function (split) {
  return (split.itemIds || []).some(function (id) {
    return inCart[String(id)]
  })
})
if (filledSplits.length && filledSplits.length < model.order.splits.length)
  model.order.splits.splice.apply(
    model.order.splits,
    [0, model.order.splits.length].concat(filledSplits)
  )
model.view = model.view || {}
model.view.lines = model.cart.map(function (line, cartIndex) {
  var p = findProduct(line.code)
  var qty = itemQty(line)
  var price = Number(p.price || line.price || 63)
  var nameKey = p.nameKey || ''
  var name =
    nameKey && typeof BF !== 'undefined' && BF.i18n ? BF.i18n(nameKey) : line.language || line.code
  return {
    id: line.id,
    code: line.code,
    language: line.language || p.language || '',
    quantity: qty,
    name: name,
    personName: String((line.details && line.details.name) || '').trim(),
    cardsQty: qty,
    unitPrice: money(price),
    amount: money(price * qty),
    // CardPreview thumbnail reads the cart line's card (same path as Shipping).
    previewModel: 'cart.' + cartIndex + '.details',
  }
})
model.view.splits = (model.order.splits || []).map(function (split) {
  var lines = (split.itemIds || [])
    .map(function (id) {
      var row = _.find(model.view.lines, function (found) {
        return String(found.id) === String(id)
      })
      if (!row) return null
      var stored = split.qtys ? split.qtys[String(id)] : null
      var qty =
        stored != null && stored !== ''
          ? Math.max(1, Number(stored) || 1)
          : Number(row.quantity) || 1
      var price = Number(row.unitPrice) || 0
      return Object.assign({}, row, { quantity: qty, cardsQty: qty, amount: money(price * qty) })
    })
    .filter(Boolean)
  var splitSub = lines.reduce(function (sum, row) {
    return sum + Number(row.amount || 0)
  }, 0)
  var locations = (split.locations || []).map(function (loc) {
    return Object.assign({}, loc, { cardsQty: Number(loc.qty) || 0 })
  })
  return { id: split.id, lines: lines, locations: locations, subtotal: money(splitSub) }
})
// Sum of the shipment subtotals: a card taken off shipping stays in the cart but is not
// ordered (Vue ReviewPage orderTotal, BUG-01).
var subtotal = model.view.splits.reduce(function (sum, split) {
  return sum + Number(split.subtotal || 0)
}, 0)
model.view.totals = { subtotal: money(subtotal), shipping: '0.00' }
var shippedIds = {}
model.view.splits.forEach(function (split) {
  split.lines.forEach(function (row) {
    shippedIds[String(row.id)] = true
  })
})
var shippedCount = Object.keys(shippedIds).length
if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model.view, 'shippedCount', shippedCount)
else model.view.shippedCount = shippedCount
// Place Order needs cards and a ship-to on every group (Vue shippingReady).
var shipReady =
  model.view.splits.length > 0 &&
  model.view.splits.every(function (s) {
    return s.lines.length && s.locations.length
  })
if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model.view, 'shipReady', shipReady)
else model.view.shipReady = shipReady
model.header = model.header || {}
model.header.cartCount = model.cart.length
if (typeof app !== 'undefined' && typeof BF !== 'undefined' && BF.namedAction)
  BF.namedAction('syncCartHeader')
