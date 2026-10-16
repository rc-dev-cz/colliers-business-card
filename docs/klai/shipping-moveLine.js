var opts = (action && action.options) || {}
var lineId = String(opts.lineId || '')
var splitId = String(opts.splitId || '')
var fromId = opts.fromSplitId == null ? '' : String(opts.fromSplitId)
var splits = model.order.splits || []
function findSplit(id) {
  return _.find(splits, function (row) {
    return String(row.id) === id
  })
}
function setValue(obj, key, value) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(obj, key, value)
  else obj[key] = value
}
function withoutLine(ids) {
  return (ids || []).filter(function (id) {
    return String(id) !== lineId
  })
}
var target = findSplit(splitId)
if (!lineId || !target) return
// Groups are independent: the same card can ship in several groups, so a drag
// changes only the source and target groups (Vue helpers/order.js moveItem).
var source = fromId ? findSplit(fromId) : null
if (!source) {
  // No source group sent (older caller): the card leaves every other group.
  splits.forEach(function (split) {
    setValue(split, 'itemIds', withoutLine(split.itemIds))
  })
} else if (source !== target) {
  var movedQty = source.qtys ? source.qtys[lineId] : null
  var alreadyThere = (target.itemIds || []).map(String).indexOf(lineId) !== -1
  setValue(source, 'itemIds', withoutLine(source.itemIds))
  if (source.qtys && source.qtys[lineId] != null) {
    var sourceQtys = Object.assign({}, source.qtys)
    delete sourceQtys[lineId]
    setValue(source, 'qtys', sourceQtys)
  }
  // Keep the boxes the card had in its old group unless the target already had it.
  if (movedQty != null && movedQty !== '' && !alreadyThere) {
    var targetQtys = Object.assign({}, target.qtys || {})
    targetQtys[lineId] = movedQty
    setValue(target, 'qtys', targetQtys)
  }
}
var ids = withoutLine(target.itemIds).map(String)
var idx = opts.newIndex
idx = idx == null || idx === '' ? ids.length : Number(idx)
if (isNaN(idx) || idx < 0) idx = ids.length
if (idx > ids.length) idx = ids.length
ids.splice(idx, 0, lineId)
setValue(target, 'itemIds', ids)
function clearDetached(order) {
  if (!order || !Array.isArray(order.detachedIds)) return
  order.detachedIds = order.detachedIds.map(String).filter(function (id) {
    return id !== lineId
  })
}
clearDetached(model.order)
if (typeof app !== 'undefined') clearDetached(app.order)
BF.namedAction('refreshView')
