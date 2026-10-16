// Shared snippet for Continue to Shipping (CartDrawer goShipping, Proof continueToShipping).
// When no group holds a cart card (everything was removed from shipping), start over:
// one group, nothing detached. Shipping refreshView then puts every cart card on Group 1.
;(function startShippingIfEmpty() {
  if (typeof app === 'undefined') return
  var cart = Array.isArray(app.cart) && app.cart.length ? app.cart : null
  var order = app.order && Array.isArray(app.order.splits) && app.order.splits.length ? app.order : null
  try {
    if (!cart) cart = JSON.parse(sessionStorage.getItem('colliers-tab.cart') || 'null')
    if (!order) order = JSON.parse(sessionStorage.getItem('colliers-tab.order') || 'null')
  } catch (errRead) {}
  if (!Array.isArray(cart) || !cart.length) return
  var ids = {}
  cart.forEach(function (line) {
    ids[String(line.id)] = true
  })
  var shipping =
    order &&
    Array.isArray(order.splits) &&
    order.splits.some(function (split) {
      return (split.itemIds || []).some(function (id) {
        return ids[String(id)]
      })
    })
  if (shipping) return
  var fresh = { splits: [{ id: 1, itemIds: [], locations: [] }], detachedIds: [] }
  app.order = fresh
  try {
    sessionStorage.setItem('colliers-tab.order', JSON.stringify(fresh))
  } catch (errWrite) {}
  // Cart drawer only: already on Shipping, the page keeps its old order in memory, so reload it.
  if (/^#\/shipping/.test(String(window.location.hash || '')))
    setTimeout(function () {
      window.location.reload()
    }, 0)
})()
