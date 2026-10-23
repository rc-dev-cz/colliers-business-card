if (!model.order || !Array.isArray(model.order.splits)) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'order', { splits: [] })
  else model.order = { splits: [] }
}
if (!model.order.splits.length) {
  model.order.splits.push({ id: Date.now(), itemIds: [], locations: [] })
}
// The button passes { splitIndex } as action options (same as addItem).
var idx = Number(
  action && action.options && action.options.splitIndex != null
    ? action.options.splitIndex
    : action && action.splitIndex
)
if (isNaN(idx) || idx < 0 || idx >= model.order.splits.length) {
  idx = model.order.splits.length - 1
}
var source = model.order.splits[idx] || model.order.splits[0]
if (
  !source ||
  (!(source.lines && source.lines.length) && !(source.itemIds && source.itemIds.length))
)
  return
// Business rule SH-02 (Vue splitOrder): the new shipment starts empty. Cards are moved in
// or added with Add item.
var next = { id: Date.now(), itemIds: [], qtys: {}, locations: [] }
model.order.splits.push(next)
if (typeof app !== 'undefined') {
  if (!app.order || !Array.isArray(app.order.splits)) app.order = { splits: [] }
  app.order.splits.push({ id: next.id, itemIds: [], qtys: {}, locations: [] })
}
if (model.view) model.view.addItemMenuIndex = null
BF.namedAction('refreshView')
