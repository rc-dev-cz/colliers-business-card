function cartList() {
  if (typeof app !== 'undefined' && Array.isArray(app.cart)) return app.cart
  if (typeof app !== 'undefined' && app.cart && Array.isArray(app.cart.items)) return app.cart.items
  return []
}
var opts = (action && action.options) || {}
var cart = cartList()
var line = opts.lineId
  ? _.find(cart, function (row) {
      return String(row.id) === String(opts.lineId)
    })
  : cart[opts.index]
if (!line) return
var details = Object.assign({}, line.details || {})
if (typeof app !== 'undefined') {
  app.editLineId = line.id
  app.editCard = { lineId: line.id, code: line.code, language: line.language, details: details }
  app.proof = { code: line.code, language: line.language, details: details, editLineId: line.id }
  app.header = app.header || {}
  app.header.cartOpen = false
}
var drawer = document.getElementById('colliersCartDrawer')
if (drawer && typeof drawer.hide === 'function') drawer.hide()
var path = '/customize?code=' + encodeURIComponent(line.code || '')
path += '&lineId=' + encodeURIComponent(line.id)
if (window.location) window.location.hash = '#' + path
