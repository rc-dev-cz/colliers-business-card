if (typeof app === 'undefined') return
if (app.cart && Array.isArray(app.cart.items) && !Array.isArray(app.cart)) app.cart = app.cart.items
var cart = Array.isArray(app.cart) ? app.cart : []
app.cart = cart
var count = cart.length
var total = 0
cart.forEach(function (line) {
  total += (Number(line.price) || 0) * (Number(line.quantity) || 0)
})
var nextTotal = total.toFixed(2)
if (app.header && app.header.cartCount === count && app.header.cartTotal === nextTotal) return
if (typeof Vue !== 'undefined' && Vue.set) {
  if (!app.header) Vue.set(app, 'header', {})
  Vue.set(app.header, 'cartCount', count)
  Vue.set(app.header, 'cartTotal', nextTotal)
} else {
  app.header = app.header || {}
  app.header.cartCount = count
  app.header.cartTotal = nextTotal
}
