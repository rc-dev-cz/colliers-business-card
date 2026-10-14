var splitIndex = Number(model.view && model.view.modalSplitIndex)
var wanted = ((model.view && model.view.modalSelected) || [])
  .map(function (row) {
    return String(row || '').trim()
  })
  .filter(Boolean)
var split = model.order && model.order.splits && model.order.splits[splitIndex]

if (model.view) {
  if (typeof Vue !== 'undefined' && Vue.set) {
    Vue.set(model.view, 'modalOpen', false)
    Vue.set(model.view, 'modalSplitIndex', null)
  } else {
    model.view.modalOpen = false
    model.view.modalSplitIndex = null
  }
}

if (!split) {
  if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('refreshView')
  return
}

var existing = {}
;(split.locations || []).forEach(function (loc) {
  if (loc && loc.address) existing[String(loc.address)] = loc
})

var next = wanted.map(function (addr) {
  return (
    existing[addr] || {
      id: 'loc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      address: addr,
      qty: 1,
    }
  )
})

if (typeof Vue !== 'undefined' && Vue.set) Vue.set(split, 'locations', next)
else split.locations = next

if (typeof app !== 'undefined' && app.order && Array.isArray(app.order.splits)) {
  var appSplit = app.order.splits[splitIndex]
  if (appSplit) {
    if (typeof Vue !== 'undefined' && Vue.set) Vue.set(appSplit, 'locations', next)
    else appSplit.locations = next
  }
}

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
} catch (errPersist) {}

if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('refreshView')
