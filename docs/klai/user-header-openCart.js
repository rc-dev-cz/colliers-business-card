app.header = app.header || {};
app.header.menuOpen = false;
app.header.mobileMenuOpen = false;

if (typeof Vue !== 'undefined' && Vue.set) {
  Vue.set(app.header, 'cartOpen', true);
} else {
  app.header.cartOpen = true;
}

if (!customElements.get('sl-drawer')) {
  await BF.libraryLoadOnce(
    'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/light.css',
    { type: 'stylesheet' }
  );
  await BF.libraryLoadOnce(
    'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/components/drawer/drawer.js',
    { moduleType: 'module' }
  );
  await customElements.whenDefined('sl-drawer');
}

var el = document.getElementById('colliersCartDrawer');
if (el && typeof el.show === 'function') el.show();
