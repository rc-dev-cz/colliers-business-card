var lineId = String((action && action.options && action.options.lineId) || '')
var splitId = String((action && action.options && action.options.splitId) || '')
var target = _.find((model.order && model.order.splits) || [], function (row) {
  return String(row.id) === splitId
})
if (!lineId || !target) return
var ids = (target.itemIds || []).map(String)
if (ids.indexOf(lineId) === -1) target.itemIds = ids.concat([lineId])
function clearDetached(order) {
  if (!order || !Array.isArray(order.detachedIds)) return
  order.detachedIds = order.detachedIds.map(String).filter(function (id) {
    return id !== lineId
  })
}
clearDetached(model.order)
if (typeof app !== 'undefined' && app.order && app.order !== model.order) {
  var appTarget = _.find(app.order.splits || [], function (row) {
    return String(row.id) === splitId
  })
  if (appTarget) {
    var appIds = (appTarget.itemIds || []).map(String)
    if (appIds.indexOf(lineId) === -1) appTarget.itemIds = appIds.concat([lineId])
  }
  clearDetached(app.order)
}
if (model.view) model.view.addItemMenuIndex = null
BF.namedAction('refreshView')
