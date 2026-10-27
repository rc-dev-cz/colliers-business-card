// CartDrawer component namedAction syncOffShipping (runs on sl-show).
// Cards the user took off every shipment (order.detachedIds) are not ordered: the drawer says so
// (Vue isLineOffShipping, BUG-01). app.order is not reactive, so the ids go on app.header.
if (typeof app === 'undefined') return
var order = app.order
if (!order) {
  try {
    order = JSON.parse(sessionStorage.getItem('colliers-tab.order') || 'null')
  } catch (err) {}
}
var cartIds = {}
;(Array.isArray(app.cart) ? app.cart : []).forEach(function (line) {
  cartIds[String(line.id)] = true
})
var ids = ((order && order.detachedIds) || []).map(String).filter(function (id) {
  return cartIds[id]
})
app.header = app.header || {}
if ((app.header.offShippingIds || []).join('|') === ids.join('|')) return
if (typeof Vue !== 'undefined' && Vue.set) Vue.set(app.header, 'offShippingIds', ids)
else app.header.offShippingIds = ids
