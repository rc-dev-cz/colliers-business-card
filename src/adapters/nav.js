let router = null

/** Route names and paths aligned with Klai `content.layouts` (see docs/klai/BACKEND-NAMING.md). */
const PATHS = {
  login: '/login',
  catalog: '/',
  'product-detail': '/product-detail',
  customize: '/customize',
  shipping: '/shipping',
  'address-book': '/address-book',
  'order-history': '/order-history',
  review: '/review',
  confirmed: '/confirmed',
  admin: '/admin',
  'admin-addresses': '/admin/addresses',
  'admin-titles': '/admin/titles',
  'admin-degrees': '/admin/degrees',
  'admin-orders': '/admin/orders',
  'admin-invoices': '/admin/invoices',
  'admin-reporting': '/admin/reporting',
  'rc-web-dev-board': '/rc-web-dev/board',
  'rc-web-dev-roadmap': '/rc-web-dev/roadmap',
  'rc-web-dev-logs': '/rc-web-dev/logs',
  'rc-web-dev-architecture': '/rc-web-dev/architecture',
}

/** Routes that pass product code as `?code=` (Klai style), not path params. */
const QUERY_CODE_ROUTES = {
  'product-detail': true,
  customize: true,
}

function fill(path, params) {
  const source = params || {}
  return path.replace(/:([A-Za-z0-9_]+)/g, function (_, key) {
    return encodeURIComponent(source[key] == null ? '' : source[key])
  })
}

function hashFor(name, params) {
  const source = params || {}
  const path = PATHS[name] || '/'
  if (QUERY_CODE_ROUTES[name] && source.code != null && source.code !== '') {
    return path + '?code=' + encodeURIComponent(source.code)
  }
  return fill(path, source)
}

export function bindRouter(instance) {
  router = instance
}

export function go(name, params) {
  const source = params || {}
  const bf = typeof window !== 'undefined' && window.BF && window.BF.router
  if (bf && typeof bf.go === 'function') {
    bf.go(name, params)
    return
  }
  if (router) {
    if (QUERY_CODE_ROUTES[name] && source.code != null && source.code !== '') {
      router.push({ name: name, query: { code: source.code } })
      return
    }
    router.push({ name: name, params: source })
    return
  }
  if (typeof window !== 'undefined') {
    window.location.hash = '#' + hashFor(name, source)
  }
}

export function goBack() {
  const bf = typeof window !== 'undefined' && window.BF && window.BF.router
  if (bf && typeof bf.back === 'function') {
    bf.back()
    return
  }
  if (router && typeof window !== 'undefined' && window.history.length > 1) {
    router.back()
    return
  }
  if (typeof window !== 'undefined') {
    window.history.back()
  }
}

export function currentHashPath() {
  if (typeof window === 'undefined') return '/'
  const hash = window.location.hash || ''
  return hash.replace(/^#/, '') || '/'
}

export function currentRouteName() {
  if (router && router.currentRoute) return router.currentRoute.name
  const path = currentHashPath().split('?')[0]
  if (path === '/' || path === '') return 'catalog'
  const match = Object.keys(PATHS).find(function (name) {
    return PATHS[name] === path
  })
  return match || ''
}
