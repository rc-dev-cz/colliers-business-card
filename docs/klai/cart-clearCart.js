// CartDrawer component namedActions.clearCart — function action.
// Clear cart (Vue clearCart, KLAI-09): empty the cart, take every card off every shipment and save
// both, then let Shipping / Review rebuild their view so the old lines, total and address go at once.
if (typeof app === 'undefined') return;
if (!Array.isArray(app.cart)) app.cart = [];
app.cart.splice(0, app.cart.length);
if (Array.isArray(model.cart) && model.cart !== app.cart) model.cart.splice(0, model.cart.length);
app.editLineId = null;
if (app.proof) app.proof.editLineId = null;
var order = app.order;
if (!order) {
  try {
    order = JSON.parse(sessionStorage.getItem('colliers-tab.order') || 'null');
  } catch (err) {}
}
function unassign(target) {
  if (!target || !Array.isArray(target.splits)) return;
  target.splits.forEach(function (split) {
    split.itemIds = [];
    split.qtys = {};
  });
  target.detachedIds = [];
}
unassign(order);
unassign(model.order);
if (order) app.order = order;
try {
  sessionStorage.setItem('colliers-tab.cart', '[]');
  if (order) sessionStorage.setItem('colliers-tab.order', JSON.stringify(order));
} catch (err) {}
app.header = app.header || {};
app.header.cartCount = 0;
app.header.cartTotal = '0.00';
namedAction('syncOffShipping');
if (typeof BF !== 'undefined' && BF.namedAction) {
  try { BF.namedAction('syncCartHeader'); } catch (err2) {}
  try { BF.namedAction('refreshView'); } catch (err3) {}
}
