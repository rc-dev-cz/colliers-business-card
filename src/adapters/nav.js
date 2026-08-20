let router = null

const PATHS = {
  login: '/login',
  catalog: '/',
  details: '/details/:code',
  customize: '/customize/:code',
  shipping: '/shipping',
  addresses: '/addresses',
  history: '/history',
  review: '/review',
  confirmed: '/confirmed',
  admin: '/admin',
  'admin-addresses': '/admin/addresses',
  'admin-titles': '/admin/titles',
  'admin-orders': '/admin/orders',
  'admin-invoices': '/admin/invoices',
  'admin-reporting': '/admin/reporting',
  'rc-web-dev-board': '/rc-web-dev/board',
  'rc-web-dev-roadmap': '/rc-web-dev/roadmap',
  'rc-web-dev-logs': '/rc-web-dev/logs',
  'rc-web-dev-architecture': '/rc-web-dev/architecture',
}

function fill(path, params) {
  const source = params || {}
  return path.replace(/:([A-Za-z0-9_]+)/g, function (_, key) {
    return encodeURIComponent(source[key] == null ? '' : source[key])
  })
}

export function bindRouter(instance) {
  router = instance
}

export function go(name, params) {
  const bf = typeof window !== 'undefined' && window.BF && window.BF.router
  if (bf && typeof bf.go === 'function') {
    bf.go(name, params)
    return
  }
  if (router) {
    router.push({ name: name, params: params })
    return
  }
  const path = PATHS[name] || '/'
  if (typeof window !== 'undefined') {
    window.location.hash = '#' + fill(path, params)
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
  const path = currentHashPath()
  if (path === '/' || path === '') return 'catalog'
  const match = Object.keys(PATHS).find(function (name) {
    return PATHS[name] === path
  })
  return match || ''
}
