function cloneDetails(src) {
  try {
    return JSON.parse(JSON.stringify(src || {}))
  } catch (e) {
    var details = Object.assign({}, src || {})
    if (Array.isArray(src && src.degree)) details.degree = src.degree.slice()
    return details
  }
}
function cartList() {
  if (model.cart && model.cart.length) return model.cart
  if (typeof app !== 'undefined' && Array.isArray(app.cart)) return app.cart
  if (typeof app !== 'undefined' && app.cart && Array.isArray(app.cart.items)) return app.cart.items
  return []
}
var lineId = String((action && action.options && action.options.lineId) || '')
var line = _.find(cartList(), function (row) {
  return String(row.id) === lineId
})
if (!line) return
var details = cloneDetails(line.details)
var payload = {
  lineId: line.id,
  code: line.code,
  language: line.language,
  details: details,
}
if (typeof app !== 'undefined') {
  app.editLineId = line.id
  app.editCard = payload
  app.proof = { code: line.code, language: line.language, details: details, editLineId: line.id }
}
BF.namedAction('goCustomize', { code: line.code, lineId: line.id, id: line.id })
