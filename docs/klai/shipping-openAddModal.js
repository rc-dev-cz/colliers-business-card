var splitIndex = Number(action && action.options && action.options.splitIndex)
if (!model.view) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'view', {})
  else model.view = {}
}

var split = model.order && model.order.splits && model.order.splits[splitIndex]
if (!split || (!(split.lines && split.lines.length) && !(split.itemIds && split.itemIds.length))) {
  return
}

var selected = (split.locations || [])
  .map(function (row) {
    return String((row && row.address) || '').trim()
  })
  .filter(Boolean)

if (typeof Vue !== 'undefined' && Vue.set) {
  Vue.set(model.view, 'selectMenuIndex', null)
  Vue.set(model.view, 'modalSplitIndex', splitIndex)
  Vue.set(model.view, 'modalSelected', selected)
  Vue.set(model.view, 'modalOpen', true)
} else {
  model.view.selectMenuIndex = null
  model.view.modalSplitIndex = splitIndex
  model.view.modalSelected = selected
  model.view.modalOpen = true
}

try {
  if (typeof BF !== 'undefined' && BF.rebuildReactivity) BF.rebuildReactivity()
} catch (err) {}
