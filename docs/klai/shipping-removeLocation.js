var opts = (action && action.options) || {}
var splitIndex = Number(opts.splitIndex)
var locIndex = Number(opts.locIndex)
var locId = String(opts.locId || '')
var split = model.order && model.order.splits && model.order.splits[splitIndex]
if (!split) return
if (!(split.lines && split.lines.length) && !(split.itemIds && split.itemIds.length)) return
var locations = split.locations || []
var idx = locIndex
if (locId) {
  var found = -1
  locations.forEach(function (loc, i) {
    if (String(loc.id) === locId) found = i
  })
  if (found >= 0) idx = found
}
if (isNaN(idx) || idx < 0 || idx >= locations.length) return
var next = locations.slice()
next.splice(idx, 1)
if (typeof Vue !== 'undefined' && Vue.set) Vue.set(split, 'locations', next)
else split.locations = next
try {
  if (typeof sessionStorage !== 'undefined' && model.order) {
    sessionStorage.setItem(
      'colliers-tab.order',
      JSON.stringify({
        detachedIds: (model.order.detachedIds || []).map(String),
        splits: (model.order.splits || []).map(function (row) {
          return {
            id: row.id,
            itemIds: (row.itemIds || []).slice(),
            qtys: Object.assign({}, row.qtys || {}),
            locations: (row.locations || []).map(function (loc) {
              return { id: loc.id, address: loc.address || '', qty: loc.qty }
            }),
          }
        }),
      })
    )
  }
} catch (err) {}
if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('refreshView')
