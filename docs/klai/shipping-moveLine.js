var lineId = String((action && action.options && action.options.lineId) || '')
var splitId = String((action && action.options && action.options.splitId) || '')
var target = _.find(model.order.splits || [], function (row) {
  return String(row.id) === splitId
})
if (!lineId || !target) return
model.order.splits.forEach(function (split) {
  split.itemIds = (split.itemIds || []).filter(function (id) {
    return String(id) !== lineId
  })
})
var idx = action && action.options && action.options.newIndex
idx = idx == null || idx === '' ? target.itemIds.length : Number(idx)
if (isNaN(idx) || idx < 0) idx = target.itemIds.length
if (idx > target.itemIds.length) idx = target.itemIds.length
target.itemIds.splice(idx, 0, lineId)
function clearDetached(order) {
  if (!order || !Array.isArray(order.detachedIds)) return
  order.detachedIds = order.detachedIds.map(String).filter(function (id) {
    return id !== lineId
  })
}
clearDetached(model.order)
if (typeof app !== 'undefined') clearDetached(app.order)
BF.namedAction('refreshView')
