var splitIndex = Number(action && action.options && action.options.splitIndex)
var locIndex = Number(action && action.options && action.options.locIndex)
var qty = Math.max(1, Number(action && action.options && action.options.qty) || 1)
var split = model.order && model.order.splits && model.order.splits[splitIndex]
if (!split || !split.locations || !split.locations[locIndex]) return
if (!(split.lines && split.lines.length) && !(split.itemIds && split.itemIds.length)) return
split.locations[locIndex].qty = qty
if (typeof app !== 'undefined') {
  if (!app.order || !Array.isArray(app.order.splits)) app.order = model.order
  var appSplit = app.order.splits[splitIndex]
  if (appSplit && appSplit !== split && appSplit.locations && appSplit.locations[locIndex]) {
    appSplit.locations[locIndex].qty = qty
  }
}
BF.namedAction('refreshView')
