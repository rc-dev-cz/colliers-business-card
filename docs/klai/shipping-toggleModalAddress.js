var opts = (action && action.options) || {}
var address = String(opts.address || opts.value || '').trim()
if (!address) return

if (!model.view) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'view', {})
  else model.view = {}
}

var selected = Array.isArray(model.view.modalSelected) ? model.view.modalSelected.slice() : []
var idx = selected.indexOf(address)
var raw = opts.checked
var on
if (raw === undefined || raw === null || raw === '') on = idx < 0
else on = raw === true || raw === 1 || raw === 'true' || raw === '1'

if (on && idx < 0) selected.push(address)
if (!on && idx >= 0) selected.splice(idx, 1)

if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model.view, 'modalSelected', selected)
else model.view.modalSelected = selected

try {
  if (typeof BF !== 'undefined' && BF.rebuildReactivity) BF.rebuildReactivity()
} catch (err) {}
