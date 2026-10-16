// Review → namedAction submitOrder, step 1 of 3 (see review-namedActions.json).
// Builds the FileMaker order payload into model.orderPayload. Same shape as Vue
// src/helpers/orderPayload.js (sync_BR_order_group dashboard):
//
//   order                header: email, full name, date, order type, totals
//   groups[]             one per shipping group      → sync_BR_order_group
//     items[]            Prod. Code, QTY, Cat. ID, Unit Price, Price → _items
//     locations[]        Location ID + boxes         → _shipment
//       address          Address Name, Contact, Street 1 … → _shipment_addresses
//
// Clean data: snake_case keys, numbers as numbers, money in cents precision,
// blank text → null, only printed card fields. *_ref = client refs; FM assigns ids.
var cart = Array.isArray(app.cart) ? app.cart : Array.isArray(model.cart) ? model.cart : []
var order = app.order || model.order || { splits: [] }
var splits = Array.isArray(order.splits) ? order.splits : []
if (!cart.length) return

var CARDS_PER_BOX = 250
var offices = model.offices || app.offices || []
var personal = model.personalAddresses || app.personalAddresses || []
var user = app.user || {}

function money(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}
function text(value) {
  var out = value == null ? '' : String(value).trim()
  return out ? out : null
}
function isBilingual(lang) {
  return /bilingual|bilin/i.test(String(lang || ''))
}
function addressLine(row) {
  if (!row) return ''
  var street = [row.addressStreet, row.addressStreet2].filter(Boolean).join(', ')
  var region = [row.addressProvince, row.addressPostalZip].filter(Boolean).join(' ')
  var cityLine = [row.addressCity, region].filter(Boolean).join(', ')
  return [street, cityLine].filter(Boolean).join(', ') || String(row.listLabel || row.line || '')
}
function findAddress(oneLine) {
  var target = String(oneLine || '').trim()
  if (!target) return null
  var match = function (row) {
    return addressLine(row) === target || String(row.line || '').trim() === target
  }
  var office = offices.find(match)
  if (office) return { type: 'office', row: office }
  var mine = personal.find(match)
  if (mine) return { type: 'personal', row: mine }
  return null
}
function cleanAddress(row, oneLine) {
  var src = row || {}
  return {
    address_name: text(src.addressName),
    address_contact: text([src.firstName, src.lastName].filter(Boolean).join(' ')),
    company: text(src.company),
    street_1: text(src.addressStreet),
    street_2: text(src.addressStreet2),
    city: text(src.addressCity),
    province: text(src.addressProvince),
    postal_code: text(src.addressPostalZip),
    country: text(src.addressCountry),
    phone: text(src.phone),
    email: text(src.email),
    one_line: text(oneLine || addressLine(src)),
  }
}
function cleanCard(details, language) {
  var src = details || {}
  var degrees = (Array.isArray(src.degree) ? src.degree : src.degree ? [src.degree] : [])
    .map(text)
    .filter(Boolean)
  return {
    name: text(src.name),
    title: text(src.title),
    title_fr: isBilingual(language) ? text(src.titleFr) : null,
    degrees: degrees,
    additional_credentials: text(src.additionalCredentials),
    region: text(src.region),
    specialized_team: text(src.specializedTeam),
    email: text(src.email),
    phone: text(src.phone),
    office_address: text(src.address),
    website: text(src.website),
  }
}
function splitQty(split, line) {
  var q = split.qtys && split.qtys[String(line.id)]
  return Math.max(1, Number(q != null && q !== '' ? q : line.quantity) || 1)
}

var groups = []
splits.forEach(function (split) {
  var ids = (split.itemIds || []).map(String)
  var lines = cart.filter(function (line) {
    return ids.indexOf(String(line.id)) !== -1
  })
  if (!lines.length) return
  var number = groups.length + 1
  var items = lines.map(function (line) {
    var qty = splitQty(split, line)
    var price = Number(line.price) || 0
    return {
      line_ref: String(line.id),
      product_code: line.code,
      catalogue_id: line.catalogueId != null ? line.catalogueId : null,
      language: text(line.language),
      qty: qty,
      cards: qty * CARDS_PER_BOX,
      unit_price: money(price),
      price: money(price * qty),
      card: cleanCard(line.details, line.language),
    }
  })
  var locations = (split.locations || []).map(function (loc) {
    var boxes = Math.max(1, Number(loc.qty) || 1)
    var found = findAddress(loc.address)
    return {
      location_ref: String(loc.id),
      location_id: found && found.row.id != null ? found.row.id : null,
      location_type: found ? found.type : null,
      // Same as the Shipping box picker: boxes of EACH item sent to this address
      boxes_per_item: boxes,
      cards_per_item: boxes * CARDS_PER_BOX,
      address: cleanAddress(found ? found.row : {}, loc.address),
    }
  })
  var totalItems = money(
    items.reduce(function (sum, row) {
      return sum + row.price
    }, 0)
  )
  groups.push({
    group_ref: 'group-' + number,
    shipment_number: number,
    count_locations: locations.length,
    items: items,
    locations: locations,
    total_items: totalItems,
    total_shipping: null,
  })
})

var orderItems = money(
  groups.reduce(function (sum, g) {
    return sum + g.total_items
  }, 0)
)

model.orderPayload = {
  order: {
    order_type: 'business_cards',
    cart_status: 'submitted',
    date: new Date().toISOString(),
    contact_id: user.contactId != null ? user.contactId : user.id != null ? user.id : null,
    full_name: text(user.fullName || user.name),
    email: text(user.email),
    currency: 'CAD',
    group_count: groups.length,
    item_count: groups.reduce(function (sum, g) {
      return sum + g.items.length
    }, 0),
    total_items: orderItems,
    total_shipping: null,
  },
  groups: groups,
}
model.submitting = 1
model.submitError = ''
console.info(
  '[Colliers order] Submitting: ' +
    model.orderPayload.order.group_count +
    ' group(s) · ' +
    model.orderPayload.order.item_count +
    ' item(s) · $' +
    orderItems.toFixed(2) +
    ' CAD',
  model.orderPayload
)
