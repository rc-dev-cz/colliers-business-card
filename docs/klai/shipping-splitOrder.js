if (!model.order || !Array.isArray(model.order.splits)) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'order', { splits: [] })
  else model.order = { splits: [] }
}
if (!model.order.splits.length) {
  model.order.splits.push({ id: Date.now(), itemIds: [], locations: [] })
}
var idx = Number(action && action.splitIndex)
if (isNaN(idx) || idx < 0 || idx >= model.order.splits.length) {
  idx = model.order.splits.length - 1
}
var source = model.order.splits[idx] || model.order.splits[0]
if (
  !source ||
  (!(source.lines && source.lines.length) && !(source.itemIds && source.itemIds.length))
)
  return
var ids = (source && Array.isArray(source.itemIds) ? source.itemIds : []).map(String)
if (!ids.length) return
var qtys = {}
ids.forEach(function (id) {
  var stored = source && source.qtys ? source.qtys[id] : null
  var line = null
  var cart =
    typeof app !== 'undefined' && Array.isArray(app.cart)
      ? app.cart
      : Array.isArray(model.cart)
        ? model.cart
        : []
  cart.forEach(function (row) {
    if (String(row.id) === id) line = row
  })
  qtys[id] =
    stored != null && stored !== ''
      ? Math.max(1, Number(stored) || 1)
      : Math.max(1, line ? Number(line.quantity) || 1 : 1)
})
var next = { id: Date.now(), itemIds: ids.slice(), qtys: qtys, locations: [] }
model.order.splits.push(next)
if (typeof app !== 'undefined') {
  if (!app.order || !Array.isArray(app.order.splits)) app.order = { splits: [] }
  app.order.splits.push({
    id: next.id,
    itemIds: ids.slice(),
    qtys: Object.assign({}, qtys),
    locations: [],
  })
}
if (model.view) model.view.addItemMenuIndex = null
BF.namedAction('refreshView')
