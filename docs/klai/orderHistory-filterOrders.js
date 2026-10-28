// Order History → namedAction filterOrders (also the first onFormLoad step).
function formatOrderDate(value) {
  const raw = String(value || '')
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return raw
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[Number(match[2]) - 1]
  if (!month) return raw
  return month + ' ' + Number(match[3]) + ', ' + match[1]
}

function cardsPerBox() {
  return 250
}

function cardholderName(record) {
  const line = record.cart && record.cart[0]
  const name = line && line.details && line.details.name
  return String(name || '').replace(/\n/g, ' ').trim()
}

function itemLabel(record) {
  const line = record.cart && record.cart[0]
  if (!line) return ''
  if (line.language === 'English') return 'Business Card English'
  if (line.language === 'Bilingual') return 'Business Card Bilingual'
  if (line.language === 'French') return 'Business Card French'
  return line.language || line.code || ''
}

// Boxes per line = boxes sent to each ship-to of every group it is in, else the line quantity
// (Vue billedBoxesForLine). The old count read line.qty, which cart lines do not have, so Qty showed 0.
function lineBoxes(record, line) {
  const splits = ((record.order && record.order.splits) || []).filter(function (split) {
    return (split.itemIds || []).map(String).indexOf(String(line.id)) !== -1 && (split.locations || []).length
  })
  if (!splits.length) return Number(line.quantity) || 0
  return splits.reduce(function (sum, split) {
    return sum + split.locations.reduce(function (boxes, loc) {
      return boxes + (Number(loc.qty) > 0 ? Number(loc.qty) : 1)
    }, 0)
  }, 0)
}

function cardCount(record) {
  return (record.cart || []).reduce(function (sum, line) {
    return sum + lineBoxes(record, line) * cardsPerBox()
  }, 0)
}

const q = String(model.search || '').trim().toLowerCase()
const statusFilter = String(model.statusFilter || 'all')

if (!Array.isArray(model.orders)) {
  model.orders = []
}

// FileMaker (BF - onFormRequest - orders) sends each order's shipping groups as Place Order saved
// them (store_BFUsers_order_group::asJSON): items with their card, locations with boxes per item.
// Rebuild the cart + order.splits this page reads, show "Ordered" as Processing, newest first.
// Vue twin: orderFromFileMaker (src/helpers/orderHistory.js).
function orderFromFileMaker(row) {
  var record = Object.assign({}, row)
  if (['Delivered', 'Shipped', 'Processing'].indexOf(record.status) === -1) record.status = 'Processing'
  if (Array.isArray(record.cart) && record.cart.length) return record
  var groups = (Array.isArray(record.groups) ? record.groups : [])
    .map(function (group) {
      if (typeof group !== 'string') return group
      try {
        return JSON.parse(group)
      } catch (e) {
        return null
      }
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return (Number(a.shipment_number) || 0) - (Number(b.shipment_number) || 0)
    })
  if (!groups.length) return record
  var cart = []
  var byId = {}
  var splits = groups.map(function (group, index) {
    var itemIds = []
    var qtys = {}
    ;(group.items || []).forEach(function (item, itemIndex) {
      var id = String(item.line_ref || 'line-' + (index + 1) + '-' + (itemIndex + 1))
      var qty = Number(item.quantity) || 1
      var card = item.card || {}
      if (!byId[id]) {
        byId[id] = {
          id: id,
          code: item.product_code || '',
          language: item.language || '',
          quantity: 0,
          price: Number(item.unit_price) || 63,
          details: {
            name: card.name || '',
            title: card.title || '',
            titleFr: card.title_fr || '',
            degree: Array.isArray(card.degrees) ? card.degrees.slice() : [],
            additionalCredentials: card.additional_credentials || '',
            region: card.region || '',
            specializedTeam: card.specialized_team || '',
            email: card.email || '',
            phone: card.phone || '',
            address: card.office_address || '',
            website: card.website || ''
          }
        }
        cart.push(byId[id])
      }
      byId[id].quantity += qty
      itemIds.push(id)
      qtys[id] = qty
    })
    return {
      id: group.group_ref || 'group-' + (index + 1),
      itemIds: itemIds,
      qtys: qtys,
      locations: (group.locations || []).map(function (loc, locIndex) {
        return {
          id: String(loc.location_ref || 'loc-' + (index + 1) + '-' + (locIndex + 1)),
          address: (loc.address && loc.address.one_line) || '',
          qty: Number(loc.boxes_per_item) || 1
        }
      })
    }
  })
  record.cart = cart
  record.order = { detachedIds: [], splits: splits }
  return record
}

model.orders = model.orders.map(orderFromFileMaker).sort(function (a, b) {
  return (
    String(b.date || '').localeCompare(String(a.date || '')) ||
    String(b.id || '').localeCompare(String(a.id || ''), undefined, { numeric: true })
  )
})

model.filtered = _.filter(model.orders, function (record) {
  if (statusFilter !== 'all' && record.status !== statusFilter) return false
  if (!q) return true
  const hay = [record.id, cardholderName(record), itemLabel(record)].join(' ').toLowerCase()
  return hay.indexOf(q) !== -1
}).map(function (record) {
  return {
    id: record.id,
    cardholder: cardholderName(record),
    item: itemLabel(record),
    qty: cardCount(record),
    dateFormatted: formatOrderDate(record.date),
    status: record.status,
    cart: record.cart,
    date: record.date
  }
})
