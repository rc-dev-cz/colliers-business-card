var lineId = String((action && action.options && action.options.lineId) || '')
var qty = Number(action && action.options && action.options.qty)
if (!lineId) return
function list() {
  if (typeof app !== 'undefined' && Array.isArray(app.cart)) return app.cart
  return Array.isArray(model.cart) ? model.cart : []
}
var cart = list()
var line = null
cart.forEach(function (row) {
  if (String(row.id) === lineId) line = row
})
if (!line) return
var splits = (model.order && model.order.splits) || []
var split = null
splits.forEach(function (row) {
  if ((row.itemIds || []).map(String).indexOf(lineId) >= 0) split = row
})
var max = 1
if (split && split.locations && split.locations.length) {
  var limit = 0
  split.locations.forEach(function (loc) {
    limit += Number(loc.qty) || 0
  })
  var others = 0
  ;(split.itemIds || []).forEach(function (id) {
    if (String(id) === lineId) return
    cart.forEach(function (row) {
      if (String(row.id) === String(id)) others += Math.max(1, Number(row.quantity) || 1)
    })
  })
  max = Math.max(1, limit - others)
}
line.quantity = Math.max(1, Math.min(max, qty || 1))
if (typeof app !== 'undefined' && Array.isArray(app.cart)) {
  app.cart.forEach(function (row) {
    if (String(row.id) === lineId) row.quantity = line.quantity
  })
}
if (Array.isArray(model.cart)) {
  model.cart.forEach(function (row) {
    if (String(row.id) === lineId) row.quantity = line.quantity
  })
}
BF.namedAction('refreshView')
