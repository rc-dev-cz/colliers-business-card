var lineId = String((action && action.options && action.options.lineId) || '')
var splitId = String((action && action.options && action.options.splitId) || '')
if (!lineId) return

function setValue(target, key, value) {
  if (!target) return
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(target, key, value)
  else target[key] = value
}

var orders = []
function addOrder(order) {
  if (!order || !Array.isArray(order.splits) || orders.indexOf(order) >= 0) return
  orders.push(order)
}
addOrder(model.order)
if (typeof app !== 'undefined') addOrder(app.order)

orders.forEach(function (order) {
  order.splits.forEach(function (split) {
    if (splitId && String(split.id) !== splitId) return
    var itemIds = (split.itemIds || []).filter(function (id) {
      return String(id) !== lineId
    })
    setValue(split, 'itemIds', itemIds)
    if (Array.isArray(split.lines)) {
      setValue(
        split,
        'lines',
        split.lines.filter(function (row) {
          return String(row.id) !== lineId
        })
      )
    }
    var qtys = Object.assign({}, split.qtys || {})
    delete qtys[lineId]
    setValue(split, 'qtys', qtys)
    if (!itemIds.length) setValue(split, 'locations', [])
  })
})

// Removing from a group never deletes the card from the cart.
var keepCartLine = Boolean(splitId)
var stillAssigned = Boolean(
  splitId &&
  orders.some(function (order) {
    return order.splits.some(function (split) {
      return (split.itemIds || []).some(function (id) {
        return String(id) === lineId
      })
    })
  })
)
var source = Array.isArray(model.cart)
  ? model.cart
  : typeof app !== 'undefined' && Array.isArray(app.cart)
    ? app.cart
    : []
var next = keepCartLine
  ? source
  : source.filter(function (row) {
      return String(row.id) !== lineId
    })
setValue(model, 'cart', next)
if (typeof app !== 'undefined') app.cart = next

if (!keepCartLine) {
  orders.forEach(function (order) {
    if (!Array.isArray(order.detachedIds)) return
    setValue(
      order,
      'detachedIds',
      order.detachedIds.map(String).filter(function (id) {
        return id !== lineId
      })
    )
  })
}

// Last group gone: keep the card in the cart, just take it off shipping.
if (keepCartLine && !stillAssigned) {
  orders.forEach(function (order) {
    var list = (order.detachedIds || []).map(String)
    if (list.indexOf(lineId) === -1) list.push(lineId)
    setValue(order, 'detachedIds', list)
  })
}

try {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('colliers-tab.cart', JSON.stringify(next))
    if (model.order) {
      sessionStorage.setItem(
        'colliers-tab.order',
        JSON.stringify({
          detachedIds: (model.order.detachedIds || []).map(String),
          splits: (model.order.splits || []).map(function (split) {
            return {
              id: split.id,
              itemIds: (split.itemIds || []).slice(),
              qtys: Object.assign({}, split.qtys || {}),
              locations: (split.locations || []).map(function (loc) {
                return { id: loc.id, address: loc.address || '', qty: loc.qty }
              }),
            }
          }),
        })
      )
    }
  }
} catch (err) {}

if (typeof BF !== 'undefined' && BF.namedAction) {
  try {
    BF.namedAction('syncCartHeader')
  } catch (errHeader) {}
  BF.namedAction('refreshView')
}
