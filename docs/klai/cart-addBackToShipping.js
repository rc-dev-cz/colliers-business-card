// CartDrawer component namedAction addBackToShipping.
// Cart drawer "Add back": put an off-shipping card back on Shipment 1 at 1 box (Vue addLineBackToShipping).
if (typeof app === 'undefined') return
var lineId = String((action && action.options && action.options.lineId) || '')
if (!lineId) return
var order = app.order
if (!order) {
  try {
    order = JSON.parse(sessionStorage.getItem('colliers-tab.order') || 'null')
  } catch (err) {}
}
if (!order || !Array.isArray(order.splits)) order = { splits: [] }
if (!order.splits.length) order.splits.push({ id: 1, itemIds: [], locations: [] })
var first = order.splits[0]
first.itemIds = (first.itemIds || []).map(String)
if (first.itemIds.indexOf(lineId) === -1) {
  first.itemIds.push(lineId)
  first.qtys = Object.assign({}, first.qtys || {})
  first.qtys[lineId] = 1
}
order.detachedIds = (order.detachedIds || []).map(String).filter(function (id) {
  return id !== lineId
})
app.order = order
try {
  sessionStorage.setItem('colliers-tab.order', JSON.stringify(order))
} catch (err) {}
namedAction('syncOffShipping')
// Shipping and Review keep their own copy of the order in memory: reload them to show the card.
if (/^#\/(shipping|review)/.test(String(window.location.hash || '')))
  setTimeout(function () {
    window.location.reload()
  }, 0)
