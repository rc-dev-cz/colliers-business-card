if (typeof app === 'undefined') return
var opts = action.options || {}
var proof = app.proof || (typeof model !== 'undefined' ? model.proof : null)
if (!proof || !proof.code) return
if (typeof model !== 'undefined' && model.approved === false) return
var bump = !!opts.bumpIfExisting
var shouldOpen = !!opts.openCart
var clearEdit = opts.clearEdit !== false && (bump || shouldOpen || opts.clearEdit === true)
var details = Object.assign({}, proof.details || {})
if (Array.isArray(details.degree)) details.degree = details.degree.slice()
else if (details.degree) details.degree = [details.degree]
else details.degree = []
if (app.cart && Array.isArray(app.cart.items) && !Array.isArray(app.cart)) app.cart = app.cart.items
var cart = Array.isArray(app.cart) ? app.cart : []
app.cart = cart
var editId =
  app.editLineId ||
  (proof && proof.editLineId) ||
  (typeof model !== 'undefined' ? model.editLineId : null)
if (editId != null && String(editId).trim() !== '') {
  var line = cart.find(function (item) {
    return String(item.id) === String(editId)
  })
  if (line) {
    line.code = proof.code
    line.language = proof.language || line.language
    line.details = details
    var product =
      typeof model !== 'undefined' && model.product && model.product.code === proof.code
        ? model.product
        : null
    if (!product && Array.isArray(model && model.products))
      product = model.products.find(function (p) {
        return p && p.code === proof.code
      })
    if (product && product.price) line.price = product.price
    if (product && product.nameKey) line.nameKey = product.nameKey
    if (clearEdit) {
      app.editLineId = null
      if (proof) proof.editLineId = null
      if (typeof model !== 'undefined') model.editLineId = null
    }
    BF.namedAction('syncCartHeader')
    if (shouldOpen) BF.namedAction('openCart')
    return
  }
  // The line being edited left the cart meanwhile: add the approved card as a new line (Vue applyProofToCart).
  app.editLineId = null
  if (proof) proof.editLineId = null
  if (typeof model !== 'undefined') model.editLineId = null
}
var existing = cart.find(function (item) {
  return item.code === proof.code && JSON.stringify(item.details || {}) === JSON.stringify(details)
})
if (existing) {
  if (bump) existing.quantity = (Number(existing.quantity) || 0) + 1
  BF.namedAction('syncCartHeader')
  if (shouldOpen) BF.namedAction('openCart')
  return
}
BF.namedAction('addToCart', {
  code: proof.code,
  language: proof.language,
  quantity: 1,
  details: details,
  openCart: shouldOpen,
})
