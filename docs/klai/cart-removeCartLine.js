var opts = (action && action.options) || {}
var lineId = String(opts.lineId || '')
function cartList() {
  if (typeof app !== 'undefined' && Array.isArray(app.cart)) return app.cart
  if (typeof app !== 'undefined' && app.cart && Array.isArray(app.cart.items)) return app.cart.items
  if (Array.isArray(model.cart)) return model.cart
  return []
}
var cart = cartList()
if (!lineId && opts.index != null) {
  var row = cart[opts.index]
  lineId = row ? String(row.id) : ''
}
if (!lineId) return
var next = cart.filter(function (row) {
  return String(row.id) !== lineId
})
if (typeof app !== 'undefined') app.cart = next
if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, 'cart', next)
else model.cart = next
function unassign(order) {
  if (!order || !Array.isArray(order.splits)) return
  order.splits.forEach(function (split) {
    split.itemIds = (split.itemIds || []).filter(function (id) {
      return String(id) !== lineId
    })
  })
  if (Array.isArray(order.detachedIds)) {
    order.detachedIds = order.detachedIds.map(String).filter(function (id) {
      return id !== lineId
    })
  }
}
unassign(model.order)
if (typeof app !== 'undefined') unassign(app.order)
try {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('colliers-tab.cart', JSON.stringify(next))
    var order = (typeof app !== 'undefined' && app.order) || model.order
    if (order) sessionStorage.setItem('colliers-tab.order', JSON.stringify(order))
  }
} catch (err) {}
if (typeof app !== 'undefined') {
  app.header = app.header || {}
  var count = next.length
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(app.header, 'cartCount', count)
  else app.header.cartCount = count
}
if (typeof BF !== 'undefined' && BF.namedAction) {
  try {
    BF.namedAction('syncCartHeader')
  } catch (err2) {}
  try {
    BF.namedAction('refreshView')
  } catch (err3) {}
}
