import { formatAddressLine } from '../adapters/api.js'
import { getProduct } from '../data/products.js'
import { cardsFromBoxes } from './cart.js'
import { isBilingualLanguage } from './formatCardIdentity.js'
import { boxesPerAddressForSplit, linesForSplit, readSplitQty } from './order.js'

/**
 * Place Order payload for FileMaker (sync_BR_order_group dashboard):
 *
 *   order                     header: email, full name, date, order type, totals
 *   groups[]                  one per shipping group  → sync_BR_order_group
 *     items[]                 product_code, quantity, catalogue_id, unit_price, price → _items
 *     locations[]             Location ID + boxes     → _shipment
 *       address               Address Name, Contact, Street 1 … → _shipment_addresses
 *     total_items / total_shipping   (grand_total comes back once shipping is priced;
 *                                      until then it would only repeat total_items)
 *
 * Clean data rules: snake_case keys, numbers as numbers, money rounded to cents,
 * blank text → null, only whitelisted card fields (no UI/preview keys).
 * *_ref values are client refs; FileMaker assigns the real ids.
 */

export var ORDER_TYPE = 'business_cards'

function money(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

function text(value) {
  var out = value == null ? '' : String(value).trim()
  return out ? out : null
}

function unitPrice(line) {
  var product = getProduct(line.code)
  return Number((product && product.price) || line.price || 0)
}

/** Only the fields printed on the card. Bilingual keeps the French title. */
export function cleanCard(details, language) {
  var src = details || {}
  var degrees = (Array.isArray(src.degree) ? src.degree : src.degree ? [src.degree] : [])
    .map(text)
    .filter(Boolean)
  return {
    name: text(src.name),
    title: text(src.title),
    title_fr: isBilingualLanguage(language) ? text(src.titleFr) : null,
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

/** store_catalogue::id: the line's own id, else the number on a FileMaker code (CPL-13616 → 13616). */
export function catalogueIdForLine(line) {
  var row = line || {}
  if (row.catalogueId != null && row.catalogueId !== '') return Number(row.catalogueId)
  var match = /-(\d+)$/.exec(String(row.code || ''))
  return match ? Number(match[1]) : null
}

function contactName(row) {
  return text([row.firstName, row.lastName].filter(Boolean).join(' '))
}

/** Structured shipping address for sync_BR_order_group_shipment_addresses. */
export function cleanAddress(row, oneLine) {
  var src = row || {}
  return {
    address_name: text(src.addressName),
    address_contact: contactName(src),
    company: text(src.company),
    street_1: text(src.addressStreet),
    street_2: text(src.addressStreet2),
    city: text(src.addressCity),
    province: text(src.addressProvince),
    postal_code: text(src.addressPostalZip),
    country: text(src.addressCountry),
    phone: text(src.phone),
    email: text(src.email),
    one_line: text(oneLine || formatAddressLine(src)),
  }
}

/**
 * The ship-to's address-book row: by the id kept on the location (picked in Shipping), else by
 * matching the address text (ship-tos saved before ids were kept).
 */
function findLocationAddress(loc, offices, personal) {
  var id = loc && loc.addressId != null && loc.addressId !== '' ? String(loc.addressId) : ''
  if (id) {
    var byId = function (row) {
      return String(row.id) === id
    }
    var type = loc.addressType
    var office = type !== 'personal' ? (offices || []).find(byId) : null
    if (office) return { type: 'office', row: office }
    var mine = type !== 'office' ? (personal || []).find(byId) : null
    if (mine) return { type: 'personal', row: mine }
    // Not in the loaded lists (e.g. Review opened before they loaded): still send the id.
    return { type: type || null, row: { id: id } }
  }
  return findAddress(loc && loc.address, offices, personal)
}

function findAddress(oneLine, offices, personal) {
  var target = String(oneLine || '').trim()
  if (!target) return null
  var match = function (row) {
    return formatAddressLine(row) === target
  }
  var office = (offices || []).find(match)
  if (office) return { type: 'office', row: office }
  var mine = (personal || []).find(match)
  if (mine) return { type: 'personal', row: mine }
  return null
}

export function buildOrderPayload(input) {
  var src = input || {}
  var cart = src.cart || []
  var splits = (src.order && src.order.splits) || []
  var session = src.session || {}
  var placedAt = src.placedAt || new Date().toISOString()

  var groups = []
  splits.forEach(function (split) {
    var lines = linesForSplit(split, cart)
    if (!lines.length) return
    var number = groups.length + 1

    var items = lines.map(function (line) {
      var qty = readSplitQty(split, line)
      var price = unitPrice(line)
      return {
        line_ref: String(line.id),
        product_code: line.code,
        catalogue_id: catalogueIdForLine(line),
        language: text(line.language),
        quantity: qty,
        cards: cardsFromBoxes(qty),
        unit_price: money(price),
        price: money(price * qty),
        card: cleanCard(line.details, line.language),
      }
    })

    var locations = (split.locations || []).map(function (loc) {
      var boxes = Number(loc.qty) > 0 ? Number(loc.qty) : boxesPerAddressForSplit(split, cart)
      var found = findLocationAddress(loc, src.offices, src.personalAddresses)
      return {
        location_ref: String(loc.id),
        location_id: found && found.row.id != null ? found.row.id : null,
        location_type: found ? found.type : null,
        // Same as the Shipping box picker: boxes of EACH item sent to this address
        boxes_per_item: boxes,
        cards_per_item: cardsFromBoxes(boxes),
        address: found ? cleanAddress(found.row, loc.address) : cleanAddress({}, loc.address),
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
    groups.reduce(function (sum, group) {
      return sum + group.total_items
    }, 0)
  )

  return {
    order: {
      order_type: ORDER_TYPE,
      cart_status: 'submitted',
      date: placedAt,
      contact_id: session.contactId != null ? session.contactId : null,
      full_name: text(session.fullName || session.name),
      email: text(session.email),
      currency: 'CAD',
      group_count: groups.length,
      item_count: groups.reduce(function (sum, group) {
        return sum + group.items.length
      }, 0),
      total_items: orderItems,
      total_shipping: null,
    },
    groups: groups,
  }
}

/** Payload as readable JSON: each print PDF's base64 becomes a short size note. */
export function payloadJsonForDisplay(payload) {
  return JSON.stringify(
    payload,
    function (key, value) {
      if (key === 'print_pdf_base64' && typeof value === 'string') {
        return '<base64 PDF, ' + value.length.toLocaleString('en-US') + ' characters>'
      }
      return value
    },
    2
  )
}

/** One console block the backend can read when Place Order succeeds. */
export function logOrderPayload(orderId, payload, logger) {
  var out = logger || console
  var order = payload.order
  out.info(
    '[Colliers order] Order confirmed: ' +
      orderId +
      ' · ' +
      order.group_count +
      ' group(s) · ' +
      order.item_count +
      ' item(s) · $' +
      order.total_items.toFixed(2) +
      ' ' +
      order.currency,
    payload
  )
}
