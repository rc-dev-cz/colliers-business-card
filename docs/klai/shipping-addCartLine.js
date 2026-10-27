var lineId = String((action && action.options && action.options.lineId) || '')
var splitId = String((action && action.options && action.options.splitId) || '')
var target = _.find((model.order && model.order.splits) || [], function (row) {
  return String(row.id) === splitId
})
if (!lineId || !target) return
// A card new to this group starts at 1 box; without this it would copy the card's total
// from every other group (Vue addCartLineToSplit, BUG-03).
function startAtOneBox(split) {
  var qtys = Object.assign({}, split.qtys || {})
  qtys[lineId] = 1
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(split, 'qtys', qtys)
  else split.qtys = qtys
}
var ids = (target.itemIds || []).map(String)
if (ids.indexOf(lineId) === -1) {
  target.itemIds = ids.concat([lineId])
  startAtOneBox(target)
}
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
    if (appIds.indexOf(lineId) === -1) {
      appTarget.itemIds = appIds.concat([lineId])
      startAtOneBox(appTarget)
    }
  }
  clearDetached(app.order)
}
if (model.view) model.view.addItemMenuIndex = null
BF.namedAction('refreshView')
