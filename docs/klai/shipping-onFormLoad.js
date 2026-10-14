function setModel(key, value) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, key, value)
  else model[key] = value
}
function normalizeCart(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray(raw.items)) return raw.items
  return null
}
function firstNonEmpty() {
  var lists = []
  var i
  for (i = 0; i < arguments.length; i += 1) lists.push(arguments[i])
  for (i = 0; i < lists.length; i += 1) {
    if (Array.isArray(lists[i]) && lists[i].length) return lists[i]
  }
  return []
}
function field(row, a, b) {
  if (!row) return ''
  var v = row[a] != null ? row[a] : row[b]
  return v != null ? String(v).trim() : ''
}
function hydrateOffices(rows) {
  return (rows || []).map(function (row, i) {
    var next = Object.assign({}, row)
    if (!next.id) next.id = String(i + 1)
    if (!String(next.cardAddress || '').trim()) {
      var street = field(next, 'addressStreet', 'address_street')
      var street2 = field(next, 'addressStreet2', 'address_street2')
      var city = field(next, 'addressCity', 'address_city')
      var province = field(next, 'addressProvince', 'address_province')
      var postal = field(next, 'addressPostalZip', 'address_postal_zip')
      var country = field(next, 'addressCountry', 'address_country') || 'Canada'
      var lines = []
      if (street) lines.push(street)
      if (street2) lines.push(street2)
      var cityProvince = [city, province].filter(Boolean).join(', ')
      if (cityProvince) lines.push(cityProvince)
      var postalCountry = [postal, country].filter(Boolean).join(' ')
      if (postalCountry) lines.push(postalCountry)
      next.cardAddress = lines.join('\n')
    }
    if (!String(next.listLabel || '').trim()) {
      var name = field(next, 'addressName', 'address_name')
      var line = String(next.cardAddress || '')
        .split('\n')
        .filter(Boolean)
        .join(', ')
      next.listLabel = [name, line].filter(Boolean).join(' — ')
    }
    return next
  })
}
function deleteModelKey(key) {
  if (model[key] === undefined) return
  if (typeof Vue !== 'undefined' && Vue.delete) Vue.delete(model, key)
  else delete model[key]
}
function readTabCache() {
  var empty = { cart: null, order: null, personalAddresses: null }
  if (typeof sessionStorage === 'undefined') return empty
  try {
    var cartRaw = sessionStorage.getItem('colliers-tab.cart')
    var orderRaw = sessionStorage.getItem('colliers-tab.order')
    var addrRaw =
      sessionStorage.getItem('colliers-tab.personalAddresses') ||
      sessionStorage.getItem('colliers-tab.addresses')
    return {
      cart: cartRaw ? JSON.parse(cartRaw) : null,
      order: orderRaw ? JSON.parse(orderRaw) : null,
      personalAddresses: addrRaw ? JSON.parse(addrRaw) : null,
    }
  } catch (err) {
    return empty
  }
}
var cached = readTabCache()
if (typeof app !== 'undefined') {
  var liveCart = normalizeCart(app.cart)
  var liveOrder = app.order && Array.isArray(app.order.splits) && app.order.splits.length
  if (!(liveCart && liveCart.length) && cached.cart && Array.isArray(cached.cart))
    app.cart = cached.cart
  if (
    !liveOrder &&
    cached.order &&
    Array.isArray(cached.order.splits) &&
    cached.order.splits.length
  )
    app.order = cached.order
  var appList = normalizeCart(app.cart)
  if (appList && appList.length) {
    app.cart = appList
    setModel('cart', appList)
    if (app.order && Array.isArray(app.order.splits) && app.order.splits.length) {
      setModel('order', app.order)
    } else {
      setModel('order', { splits: [{ id: 1, itemIds: [], locations: [] }] })
    }
  }
}
var personalRows = firstNonEmpty(
  model.personalAddresses,
  typeof app !== 'undefined' ? app.personalAddresses : null,
  cached.personalAddresses
)
setModel('personalAddresses', personalRows)
deleteModelKey('addresses')
deleteModelKey('header')
var officeRows = hydrateOffices(
  firstNonEmpty(
    model.offices,
    model.officeOptions,
    typeof app !== 'undefined' ? app.offices : null,
    typeof app !== 'undefined' ? app.officeOptions : null
  )
)
if (officeRows.length) setModel('offices', officeRows)
else if (!Array.isArray(model.offices)) setModel('offices', [])
if (typeof app !== 'undefined') {
  app.personalAddresses = model.personalAddresses
  if (app.addresses !== undefined) {
    if (typeof Vue !== 'undefined' && Vue.delete) Vue.delete(app, 'addresses')
    else delete app.addresses
  }
  if (officeRows.length) app.offices = officeRows
}
try {
  if (personalRows.length && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('colliers-tab.personalAddresses', JSON.stringify(personalRows))
    sessionStorage.removeItem('colliers-tab.addresses')
  }
} catch (errAddr) {}
function refreshLater() {
  if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('refreshView')
}
refreshLater()
if (typeof setTimeout !== 'undefined') {
  setTimeout(refreshLater, 50)
  setTimeout(refreshLater, 300)
  setTimeout(refreshLater, 1000)
}
