// Order History → namedAction openDetails({ id })
// Builds model.details for the View modal in order-history.html (same layout as Vue
// OrderHistoryPage): one entry per cart line with its card faces (bilingual = EN + FR),
// plus shipments with box / card counts.
//
// Source: the order row in model.orders (FileMaker asJSONcart → { cart: [], order: { splits } }).
// Falls back to the flat row fields (cardholder, item, qty) when the cart is missing.
var id = (action && action.options && action.options.id) || (options && options.id)
var byId = function (r) {
  return String(r.id) === String(id)
}
// model.orders = full records (cart / order); model.filtered = display rows (dateFormatted, cardholder, qty)
var record = (model.orders || []).find(byId) || {}
var shown = (model.filtered || []).find(byId) || {}
var row = Object.assign({}, record, shown)
if (!row.id) return
var UNIT_PRICE = 63

var CARDS_PER_BOX = 250
var cart = Array.isArray(record.cart) ? record.cart : []
var splits = (record.order && Array.isArray(record.order.splits) && record.order.splits) || []

function isBilingual(lang) {
  return /bilingual|bilin/i.test(String(lang || ''))
}
function isFrench(lang) {
  return /french|fran|^fr$/i.test(String(lang || '')) && !isBilingual(lang)
}
function boxesFor(line) {
  // Boxes sent to each ship-to of every shipping group this line is in, else line.quantity
  // (Vue billedBoxesForLine; same count as the Qty column).
  var total = 0
  var shipped = false
  splits.forEach(function (split) {
    var ids = (split.itemIds || []).map(String)
    if (ids.indexOf(String(line.id)) === -1 || !(split.locations || []).length) return
    shipped = true
    split.locations.forEach(function (loc) {
      total += Math.max(1, Number(loc.qty) || 1)
    })
  })
  return shipped ? total : Math.max(1, Number(line.quantity) || 1)
}
function face(details, language) {
  var d = Object.assign({}, details || {})
  d.language = language
  if (language === 'French') {
    if (String(d.titleFr || '').trim()) d.title = d.titleFr
    d.website = d.websiteFr || 'colliersprojectleaders.com/fr'
    // French faces print the French region name (Vue regionForCard, BUG-10).
    var region = String(d.region || '').trim()
    if (typeof app !== 'undefined' && app.regionFr && app.regionFr[region]) d.region = app.regionFr[region]
  }
  // CardPreview falls back to name when nameLines are not planned yet
  d.nameLines = []
  return d
}

// Region rule (Vue cardLayout.js, same as Customize wrapCardName): region never shares the
// title line. Team filled -> 'team | region'; no team -> region in the team slot under the
// title; 'team | region' too wide -> 'Title | Region' when it fits on every face, else own line.
function textWidth(text) {
  window.__colliersMeasureCtx =
    window.__colliersMeasureCtx || document.createElement('canvas').getContext('2d')
  var ctx = window.__colliersMeasureCtx
  ctx.font = '400 6.5px "Open Sans", sans-serif'
  return ctx.measureText(String(text || '')).width
}
function applyRegionRule(faces) {
  var region = String((faces[0] && faces[0].region) || '').trim()
  if (!region) return faces
  // Each face keeps its own region text (French name on French faces).
  function regionOf(f) {
    return String((f && f.region) || '').trim() || region
  }
  var team = String((faces[0] && faces[0].specializedTeam) || '').trim()
  var mode = 'own'
  if (team && faces.every(function (f) { return textWidth(team + ' | ' + regionOf(f)) <= 141.52 })) mode = 'team'
  else if (
    team &&
    faces.every(function (f) {
      return (
        textWidth(
          String(f.title || '')
            .split('|')[0]
            .trim() +
            ' | ' +
            regionOf(f)
        ) <= 141.52
      )
    })
  )
    mode = 'title'
  return faces.map(function (f) {
    var out = Object.assign({}, f, { region: '' })
    var region = regionOf(f)
    var title = String(f.title || '')
      .split('|')[0]
      .trim()
    out.title = mode === 'title' ? title + ' | ' + region : title
    if (mode === 'team') out.specializedTeam = team + ' | ' + region
    // 'own': region sits in the team slot under the title. With a team as well (nothing else
    // fits) this two-line preview keeps the team; the print PDF still shows all three lines.
    else if (mode === 'own') out.specializedTeam = team || region
    return out
  })
}

var lines = cart.map(function (line) {
  var lang = line.language || (line.details && line.details.language) || 'English'
  var boxes = boxesFor(line)
  var faces = applyRegionRule(
    isBilingual(lang)
      ? [face(line.details, 'English'), face(line.details, 'French')]
      : [face(line.details, isFrench(lang) ? 'French' : 'English')]
  )
  return {
    code: line.code,
    nameKey:
      line.nameKey ||
      'label_colliers_product' +
        (isBilingual(lang) ? 'Bilingual' : isFrench(lang) ? 'French' : 'English'),
    language: lang,
    boxes: boxes,
    cards: boxes * CARDS_PER_BOX,
    price: ((Number(line.price) || UNIT_PRICE) * boxes).toFixed(2),
    faces: faces,
  }
})

var shipments = splits
  .filter(function (split) {
    return (split.locations || []).length
  })
  .map(function (split) {
    return {
      locations: split.locations.map(function (loc) {
        var boxes = Math.max(1, Number(loc.qty) || 1)
        return { address: loc.address || '', boxes: boxes, cards: boxes * CARDS_PER_BOX }
      }),
    }
  })

var total = lines.reduce(function (sum, l) {
  return sum + Number(l.price)
}, 0)

model.details = {
  id: row.id,
  status: row.status,
  dateFormatted: row.dateFormatted || row.date || '',
  cardholder: row.cardholder || '',
  qty: row.quantity,
  total: (total || Number(row.total) || 0).toFixed(2),
  lines: lines,
  shipments: shipments,
}
