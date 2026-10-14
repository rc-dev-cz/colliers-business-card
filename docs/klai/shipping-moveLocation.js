var locId = String((action && action.options && action.options.locId) || '')
var splitId = String((action && action.options && action.options.splitId) || '')
var target = _.find(model.order.splits || [], function (row) {
  return String(row.id) === splitId
})
if (!locId || !target) return
if (!(target.lines && target.lines.length) && !(target.itemIds && target.itemIds.length)) return
var moved = null
;(model.order.splits || []).forEach(function (split) {
  if (moved) return
  split.locations = split.locations || []
  var i
  for (i = 0; i < split.locations.length; i += 1) {
    if (String(split.locations[i] && split.locations[i].id) !== locId) continue
    moved = split.locations.splice(i, 1)[0]
    break
  }
})
if (!moved) return
target.locations = target.locations || []
var idx = action && action.options && action.options.newIndex
idx = idx == null || idx === '' ? target.locations.length : Number(idx)
if (isNaN(idx) || idx < 0) idx = target.locations.length
if (idx > target.locations.length) idx = target.locations.length
target.locations.splice(idx, 0, moved)
BF.namedAction('refreshView')
