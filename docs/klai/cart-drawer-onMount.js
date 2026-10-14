if (typeof app === 'undefined') return
if (app.cart && Array.isArray(app.cart.items) && !Array.isArray(app.cart)) {
  app.cart = app.cart.items
}
if (!Array.isArray(app.cart)) app.cart = []
if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('syncCartHeader')
var el = document.getElementById('colliersCartDrawer')
if (app.header && app.header.cartOpen && el && typeof el.show === 'function') el.show()
