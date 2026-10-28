if (typeof app === 'undefined') return;
if (app.cart && Array.isArray(app.cart.items) && !Array.isArray(app.cart)) {
  app.cart = app.cart.items;
}
if (!Array.isArray(app.cart)) app.cart = [];
if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('syncCartHeader');
// Leaving the page closes the drawer (KLAI-10, Vue router.afterEach): otherwise the next page's
// drawer reopens from app.header.cartOpen. One listener for the whole app, never removed.
if (!window.__colliersCartCloseOnNav) {
  window.__colliersCartCloseOnNav = function () {
    if (!app.header || !app.header.cartOpen) return;
    app.header.cartOpen = false;
    var drawer = document.getElementById('colliersCartDrawer');
    if (drawer && typeof drawer.hide === 'function' && drawer.open) drawer.hide();
  };
  window.addEventListener('hashchange', window.__colliersCartCloseOnNav);
}
var el = document.getElementById('colliersCartDrawer');
if (app.header && app.header.cartOpen && el && typeof el.show === 'function') el.show();
