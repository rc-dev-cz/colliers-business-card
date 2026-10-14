var lineId = String((action && action.options && action.options.lineId) || '')
var splitId = String((action && action.options && action.options.splitId) || '')
var qty = Number(action && action.options && action.options.qty)
if (!lineId) return
function list() {
  if (typeof app !== 'undefined' && Array.isArray(app.cart)) return app.cart
  return Array.isArray(model.cart) ? model.cart : []
}
function splitQty(split, row) {
  var stored = split && split.qtys ? split.qtys[String(row.id)] : null
  if (stored != null && stored !== '') return Math.max(1, Number(stored) || 1)
  return Math.max(1, Number(row.quantity) || 1)
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
  var ids = (row.itemIds || []).map(String)
  if (ids.indexOf(lineId) < 0) return
  if (!splitId || String(row.id) === splitId) split = row
})
if (!split) return
var max = 1
if (split.locations && split.locations.length) {
  var limit = 0
  split.locations.forEach(function (loc) {
    limit += Number(loc.qty) || 0
  })
  var others = 0
  ;(split.itemIds || []).forEach(function (id) {
    if (String(id) === lineId) return
    cart.forEach(function (row) {
      if (String(row.id) === String(id)) others += splitQty(split, row)
    })
  })
  max = Math.max(1, limit - others)
}
if (!split.qtys || typeof split.qtys !== 'object') split.qtys = {}
split.qtys[lineId] = Math.max(1, Math.min(max, qty || 1))
if (typeof app !== 'undefined' && app.order && Array.isArray(app.order.splits)) {
  app.order.splits.forEach(function (row) {
    if (String(row.id) !== String(split.id)) return
    if (!row.qtys || typeof row.qtys !== 'object') row.qtys = {}
    row.qtys[lineId] = split.qtys[lineId]
  })
}
BF.namedAction('refreshView')
