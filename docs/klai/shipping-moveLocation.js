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
// Same ship-to address already in this group (ignoring case and extra spaces): add the boxes instead of listing it twice.
function addressKey(address) {
  return String(address || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}
var movedKey = addressKey(moved.address)
var twin = movedKey
  ? _.find(target.locations, function (loc) {
      return addressKey(loc && loc.address) === movedKey
    })
  : null
if (twin) {
  twin.qty = (Number(twin.qty) || 0) + (Number(moved.qty) || 0)
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'mergedSplitId', target.id)
  else model.mergedSplitId = target.id
  clearTimeout(window.__colliersMergedTimer)
  window.__colliersMergedTimer = setTimeout(function () {
    if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'mergedSplitId', null)
    else model.mergedSplitId = null
  }, 5000)
  BF.namedAction('refreshView')
  return
}
var idx = action && action.options && action.options.newIndex
idx = idx == null || idx === '' ? target.locations.length : Number(idx)
if (isNaN(idx) || idx < 0) idx = target.locations.length
if (idx > target.locations.length) idx = target.locations.length
target.locations.splice(idx, 0, moved)
BF.namedAction('refreshView')
