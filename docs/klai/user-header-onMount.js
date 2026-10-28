// UserHeader component namedActions.onMount — function action.
var options = action.options || {};
var schema = action.schema || options._componentSchema || {};
var key = schema.instanceId || schema.name || 'UserHeader';

app.header = Object.assign(
    {
        role: 'user',
        displayName: '',
        cartCount: 0,
        activeNav: 'catalog',
        menuOpen: false,
        mobileMenuOpen: false,
        cartOpen: false
    },
    app.header || {}
);

app.header.menuOpen = false;
app.header.mobileMenuOpen = false;

var registry = window.__bfComponentState =
    window.__bfComponentState || {};

var previous = registry[key];

if (previous) {
    if (previous.onDocClick) {
        document.removeEventListener('click', previous.onDocClick);
    }

    if (previous.onDocKey) {
        document.removeEventListener('keydown', previous.onDocKey);
    }

    if (previous.onHashChange) {
        window.removeEventListener('hashchange', previous.onHashChange);
    }
}

var updateActiveNav = function() {
    var path = (window.location.hash || '')
        .replace(/^#/, '')
        .split('?')[0]
        .replace(/\/+$/, '') || '/';

    var routes = {
        '/': 'catalog',
        '/admin': 'admin',
        '/admin/addresses': 'admin-addresses',
        '/admin/titles': 'admin-titles',
        '/admin/degrees': 'admin-degrees',
        '/address-book': 'address-book',
        '/order-history': 'order-history'
    };

    app.header.activeNav = routes[path] || '';
};

var onDocClick = function(event) {
    if (!app.header.menuOpen) return;

    var root = document.getElementById('colliersUserHeader');

    if (root && root.contains(event.target)) return;

    app.header.menuOpen = false;
};

var onDocKey = function(event) {
    if (event.key !== 'Escape') return;

    app.header.menuOpen = false;
    app.header.mobileMenuOpen = false;
};

// The highlight follows the route through ONE app-wide hashchange listener that is never removed
// (KLAI-05). A per-header listener was taken away when the old page's header was destroyed after the
// new one mounted, and the highlight stuck (Manage Credentials stayed highlighted on Product Detail).
window.__colliersHeaderOnHash = function() {
    app.header.menuOpen = false;
    app.header.mobileMenuOpen = false;
    updateActiveNav();
};

document.addEventListener('click', onDocClick);
document.addEventListener('keydown', onDocKey);
if (!window.__colliersHeaderHashBound) {
    window.__colliersHeaderHashBound = true;
    window.addEventListener('hashchange', function() {
        if (window.__colliersHeaderOnHash) window.__colliersHeaderOnHash();
    });
}

registry[key] = {
    onDocClick: onDocClick,
    onDocKey: onDocKey
};

updateActiveNav();
