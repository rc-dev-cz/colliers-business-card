function uid(prefix) {
  return prefix + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}
function setModel(key, value) {
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(model, key, value)
  else model[key] = value
}
function normalizeCart(raw) {
  if (Array.isArray(raw)) return raw
  if (raw && Array.isArray(raw.items)) return raw.items
  return null
}
function catalogProducts() {
  return [
    {
      code: 'BCAD-PL-BIL',
      language: 'Bilingual',
      nameKey: 'label_colliers_productBilingual',
      price: 63,
    },
    {
      code: 'BCAD-PL-ENG',
      language: 'English',
      nameKey: 'label_colliers_productEnglish',
      price: 63,
    },
    { code: 'BCAD-PL-FR', language: 'French', nameKey: 'label_colliers_productFrench', price: 63 },
  ]
}
function findProduct(code) {
  return _.find(model.products || [], { code: code }) || {}
}
function canonicalCode(line) {
  var code = String((line && line.code) || '')
  if (findProduct(code).code) return code
  var lang = String((line && line.language) || '').toLowerCase()
  if (lang.indexOf('bil') >= 0) return 'BCAD-PL-BIL'
  if (lang.indexOf('fr') >= 0) return 'BCAD-PL-FR'
  return 'BCAD-PL-ENG'
}
function pickField(row, keys) {
  if (!row) return ''
  var i
  for (i = 0; i < keys.length; i += 1) {
    var value = row[keys[i]]
    if (value != null && String(value).trim()) return String(value).trim()
  }
  return ''
}
function formatLine(row) {
  if (!row) return ''
  var fromFields = [
    pickField(row, ['addressStreet', 'address_street', 'address']),
    pickField(row, ['addressCity', 'address_city']),
    pickField(row, ['addressProvince', 'address_province', 'address_pr']),
    pickField(row, ['addressPostalZip', 'address_postal_zip', 'addressPostal']),
  ]
    .filter(Boolean)
    .join(', ')
  if (fromFields) return fromFields
  if (row.cardAddress)
    return String(row.cardAddress).replace(/\r/g, '').split('\n').filter(Boolean).join(', ').trim()
  if (row.line) return String(row.line).trim()
  if (row.listLabel) return String(row.listLabel).trim()
  if (row.value && String(row.value).indexOf('\n') === -1) return String(row.value).trim()
  return ''
}
function addressLabel(row) {
  return pickField(row, ['addressName', 'address_name', 'name', 'label'])
}
function toOptions(rows) {
  return (rows || [])
    .map(function (row) {
      var value = formatLine(row)
      var name = addressLabel(row)
      return { value: value, label: name ? name + ' — ' + value : value }
    })
    .filter(function (opt) {
      return opt.value
    })
}
function readCachedAddresses() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    var raw =
      sessionStorage.getItem('colliers-tab.personalAddresses') ||
      sessionStorage.getItem('colliers-tab.addresses')
    var parsed = JSON.parse(raw || 'null')
    return Array.isArray(parsed) && parsed.length ? parsed : null
  } catch (err) {
    return null
  }
}
function addressRows() {
  var lists = [
    model.personalAddresses,
    typeof app !== 'undefined' ? app.personalAddresses : null,
    readCachedAddresses(),
  ]
  var i
  for (i = 0; i < lists.length; i += 1) {
    if (Array.isArray(lists[i]) && lists[i].length) return lists[i]
  }
  return []
}
function officeRows() {
  if (Array.isArray(model.offices) && model.offices.length) return model.offices
  if (Array.isArray(model.officeOptions) && model.officeOptions.length) return model.officeOptions
  if (typeof app !== 'undefined' && Array.isArray(app.offices) && app.offices.length)
    return app.offices
  if (typeof app !== 'undefined' && Array.isArray(app.officeOptions) && app.officeOptions.length)
    return app.officeOptions
  return []
}
function i18n(key) {
  return typeof BF !== 'undefined' && BF.i18n ? BF.i18n(key) : key
}
function labelOr(key, fallback) {
  var value = i18n(key)
  return !value || value === key ? fallback : value
}
function lineName(line, p) {
  p = p && p.code ? p : findProduct(canonicalCode(line))
  var key = p.nameKey || line.nameKey || 'label_colliers_productEnglish'
  var name = i18n(key)
  if (!name || name === key || name.indexOf('label_') === 0) {
    name = p.language ? 'Business Card' : labelOr('label_colliers_productEnglish', 'Business Card')
  }
  var language = String(line.language || p.language || '').trim()
  return language ? name + ' - ' + language : name
}
function personName(line) {
  var details = (line && line.details) || {}
  return (
    pickField(details, ['name', 'nameWrapped', 'fullName', 'FullName', 'personName']) ||
    pickField(line, ['personName', 'name', 'fullName'])
  )
}
function shipMultiplier(split) {
  var n = split && split.locations ? split.locations.length : 0
  return n > 0 ? n : 1
}
function splitForLine(lineId, splits) {
  var id = String(lineId)
  splits = splits || []
  for (var i = 0; i < splits.length; i += 1) {
    if ((splits[i].itemIds || []).indexOf(id) >= 0) return splits[i]
  }
  return splits[0] || null
}
function splitQty(split, line) {
  var id = String(line && line.id)
  var stored = split && split.qtys ? split.qtys[id] : null
  if (stored != null && stored !== '') return Math.max(1, Number(stored) || 1)
  return Math.max(1, Number(line && line.quantity) || 1)
}
function writeSplitQty(split, line, qty) {
  var n = Math.max(1, Number(qty) || 1)
  var id = String(line && line.id)
  if (!split.qtys || typeof split.qtys !== 'object') split.qtys = {}
  split.qtys[id] = n
  return n
}
function orderedBoxes(split, cart) {
  var sum = 0
  ;(split.itemIds || []).forEach(function (id) {
    var line = _.find(cart, function (row) {
      return String(row.id) === String(id)
    })
    if (line) sum += splitQty(split, line)
  })
  return sum > 0 ? sum : 1
}
function groupLines(split, cart) {
  return (split.itemIds || [])
    .map(function (id) {
      return _.find(cart, function (row) {
        return String(row.id) === String(id)
      })
    })
    .filter(Boolean)
}
function locationBoxSum(split) {
  var total = 0
  ;(split.locations || []).forEach(function (loc) {
    total += Number(loc.qty) || 0
  })
  return total
}
function fitGroup(split, cart) {
  var lines = groupLines(split, cart)
  if (!lines.length) return
  if (split.locations && split.locations.length) {
    var total = locationBoxSum(split)
    if (!(total > 0)) total = 1
    lines.forEach(function (line) {
      writeSplitQty(split, line, total)
    })
    return
  }
  lines.forEach(function (line) {
    writeSplitQty(split, line, splitQty(split, line))
  })
}
function isVueApp(obj) {
  return !!(obj && (obj._isVue || obj.$options || typeof obj.$mount === 'function'))
}
function klaiApp() {
  if (typeof app === 'undefined' || !app || isVueApp(app)) return null
  return app
}
var storeApp = klaiApp()
var appList = null
if (Array.isArray(model.cart)) {
  appList = model.cart
} else if (storeApp) {
  appList = normalizeCart(storeApp.cart)
}
if (
  !(appList && appList.length) &&
  !Array.isArray(model.cart) &&
  typeof sessionStorage !== 'undefined'
) {
  try {
    var cachedCart = JSON.parse(sessionStorage.getItem('colliers-tab.cart') || 'null')
    if (Array.isArray(cachedCart) && cachedCart.length) appList = cachedCart
  } catch (errCache) {}
}
var liveCart = appList && appList.length ? appList : null
var cart = liveCart || []
if (storeApp && appList) storeApp.cart = appList
setModel('cart', cart)
setModel('products', catalogProducts())
var cachedOrder = null
try {
  if (typeof sessionStorage !== 'undefined') {
    cachedOrder = JSON.parse(sessionStorage.getItem('colliers-tab.order') || 'null')
  }
} catch (errOrd) {
  cachedOrder = null
}
var appOrder =
  storeApp && storeApp.order && Array.isArray(storeApp.order.splits) ? storeApp.order : null
if (!(appOrder && appOrder.splits.length) && cachedOrder && Array.isArray(cachedOrder.splits))
  appOrder = cachedOrder
var modelOrder = model.order || {}
var appLen = appOrder ? appOrder.splits.length : 0
var modelLen = Array.isArray(modelOrder.splits) ? modelOrder.splits.length : 0
var sourceOrder
if (modelLen) sourceOrder = modelOrder
else if (appOrder && appLen) sourceOrder = appOrder
else sourceOrder = { splits: [{ id: 1, itemIds: [], locations: [] }] }
var splits =
  sourceOrder.splits && sourceOrder.splits.length
    ? sourceOrder.splits.map(function (split) {
        return {
          id: split.id,
          itemIds: (split.itemIds || []).slice(),
          qtys: Object.assign({}, split.qtys || {}),
          locations: (split.locations || []).map(function (loc) {
            return {
              id: loc.id || uid('loc-'),
              address: loc.address || '',
              qty: loc.qty,
              cardsQty: loc.cardsQty,
            }
          }),
        }
      })
    : [{ id: 1, itemIds: [], locations: [] }]
cart.forEach(function (line) {
  if (!line.id) line.id = uid('line-')
  line.code = canonicalCode(line)
  var p = findProduct(canonicalCode(line))
  line.language = p.language || line.language || ''
  line.price = p.price || line.price || 63
  line.nameKey = p.nameKey
  line.quantity = Math.max(1, Number(line.quantity) || 1)
  line.details = line.details || {}
  if (line.details.language !== undefined) delete line.details.language
})
var ids = {}
cart.forEach(function (line) {
  ids[String(line.id)] = true
})
splits.forEach(function (split) {
  split.itemIds = (split.itemIds || []).map(String).filter(function (id) {
    return ids[id]
  })
})
var skipAssign = {}
;(model._skipAssignLineIds || []).forEach(function (id) {
  skipAssign[String(id)] = true
})
model._skipAssignLineIds = []
var detachedIds = []
function collectDetached(order) {
  ;((order && order.detachedIds) || []).forEach(function (id) {
    var key = String(id)
    if (detachedIds.indexOf(key) === -1) detachedIds.push(key)
    skipAssign[key] = true
  })
}
collectDetached(model.order)
if (typeof app !== 'undefined') collectDetached(app.order)
var hasVisible = splits.some(function (split) {
  return split.itemIds && split.itemIds.length
})
if (!hasVisible && cart.length) {
  detachedIds = []
  skipAssign = {}
}
cart.forEach(function (line) {
  if (skipAssign[String(line.id)]) return
  var assigned = splits.some(function (split) {
    return split.itemIds.indexOf(String(line.id)) >= 0
  })
  if (!assigned) splits[0].itemIds.push(String(line.id))
})
splits.forEach(function (split) {
  if (!split.itemIds.length && split.locations && split.locations.length) split.locations = []
})
detachedIds = detachedIds.filter(function (id) {
  if (!ids[id]) return false
  return !splits.some(function (split) {
    return (split.itemIds || []).indexOf(id) >= 0
  })
})
splits.forEach(function (split) {
  fitGroup(split, cart)
})
var personal = toOptions(addressRows())
var officeList = officeRows()
if (officeList.length) {
  setModel('offices', officeList)
  if (typeof app !== 'undefined') app.offices = officeList
}
var offices = toOptions(officeList)
var known = []
var knownSeen = {}
personal.concat(offices).forEach(function (opt) {
  var key = String((opt && opt.value) || '').trim()
  if (!key || knownSeen[key]) return
  knownSeen[key] = true
  known.push(opt)
})
splits.forEach(function (split) {
  var perAddr = orderedBoxes(split, cart)
  var boxWord = labelOr('label_colliers_box', 'box')
  var boxesWord = labelOr('label_colliers_boxes', 'boxes')
  var cardsWord = labelOr('label_colliers_cards', 'cards')
  split.locations.forEach(function (loc) {
    var qty = Number(loc.qty)
    if (!(qty > 0)) qty = perAddr
    loc.qty = qty
    loc.cardsQty = qty * 250
    loc.boxLabel = qty === 1 ? '1 ' + boxWord : qty + ' ' + boxesWord
    loc.cardsLabel = String(qty)
    loc.cardsCountLabel = qty * 250 + ' ' + cardsWord
    var minN = 1
    var maxN = Math.max(12, qty, perAddr, minN)
    loc.boxOptions = []
    var n
    for (n = minN; n <= maxN; n += 1) {
      loc.boxOptions.push({
        value: String(n),
        label: n === 1 ? '1 ' + boxWord : n + ' ' + boxesWord,
      })
    }
  })
  var assigned = 0
  split.locations.forEach(function (loc) {
    assigned += Number(loc.qty) || 0
  })
  split.locCardsQty = split.locations.length ? assigned : perAddr
  split.locBoxLabel = perAddr === 1 ? '1 ' + boxWord : perAddr + ' ' + boxesWord
  split.locCardsLabel = String(split.locations.length ? assigned : perAddr)
  split.locationValues = split.locations
    .map(function (loc) {
      return loc.address
    })
    .filter(Boolean)
  split.lines = split.itemIds
    .map(function (id) {
      return _.find(cart, function (row) {
        return String(row.id) === String(id)
      })
    })
    .filter(Boolean)
    .map(function (line) {
      var p = findProduct(canonicalCode(line))
      var cartIndex = -1
      cart.forEach(function (row, i) {
        if (String(row.id) === String(line.id)) cartIndex = i
      })
      return {
        id: line.id,
        code: line.code,
        language: line.language || p.language || '',
        quantity: splitQty(split, line),
        cardsQty: splitQty(split, line) * 250,
        boxLabel:
          splitQty(split, line) === 1 ? '1 ' + boxWord : splitQty(split, line) + ' ' + boxesWord,
        cardsLabel: splitQty(split, line) * 250 + ' ' + cardsWord,
        qtyMax: split.locations.length
          ? Math.max(
              1,
              split.locations.reduce(function (sum, loc) {
                return sum + (Number(loc.qty) || 0)
              }, 0) -
                (orderedBoxes(split, cart) - splitQty(split, line))
            )
          : 1,
        price: line.price || p.price || 63,
        nameKey: p.nameKey || '',
        lineName: lineName(line, p),
        personName: personName(line),
        cartIndex: cartIndex,
        details: (function () {
          var d = Object.assign({}, line.details || {})
          if (d.language !== undefined) delete d.language
          return d
        })(),
      }
    })
  var inGroup = {}
  ;(split.itemIds || []).forEach(function (id) {
    inGroup[String(id)] = true
  })
  split.outsideLines = cart
    .filter(function (line) {
      return !inGroup[String(line.id)]
    })
    .map(function (line) {
      var p = findProduct(canonicalCode(line))
      return { id: line.id, lineName: lineName(line, p), personName: personName(line) }
    })
  split.hasCards = split.lines.length > 0
})
cart.forEach(function (line) {
  var parts = []
  splits.forEach(function (split) {
    if ((split.itemIds || []).map(String).indexOf(String(line.id)) === -1) return
    parts.push(splitQty(split, line))
  })
  if (parts.length)
    line.quantity = parts.reduce(function (sum, n) {
      return sum + n
    }, 0)
})
var itemSum = 0
splits.forEach(function (split) {
  ;(split.lines || []).forEach(function (line) {
    itemSum += Number(line.quantity) || 0
  })
})
var selectedCount = 0
var seenSelected = {}
splits.forEach(function (split) {
  ;(split.lines || []).forEach(function (line) {
    var key = String(line.id)
    if (seenSelected[key]) return
    seenSelected[key] = true
    selectedCount += 1
  })
})
var productCount = cart.length
var boxesTotal = 0
splits.forEach(function (split) {
  var designCount = (split.lines || []).length
  if (split.locations && split.locations.length && designCount) {
    var locSum = 0
    split.locations.forEach(function (loc) {
      locSum += Number(loc.qty) || 0
    })
    boxesTotal += locSum * designCount
  }
})
var boxWordTotal = labelOr('label_colliers_box', 'box')
var boxesWordTotal = labelOr('label_colliers_boxes', 'boxes')
var boxesLabel = boxesTotal === 1 ? '1 ' + boxWordTotal : boxesTotal + ' ' + boxesWordTotal
var itemDollars = 0
splits.forEach(function (split) {
  ;(split.lines || []).forEach(function (line) {
    itemDollars += (Number(line.price) || 63) * (Number(line.quantity) || 0)
  })
})
var hasReviewItems = false
var missingShipTo = false
splits.forEach(function (split) {
  if (!(split.lines && split.lines.length)) return
  hasReviewItems = true
  if (!(split.locations && split.locations.length)) missingShipTo = true
})
var canReview = hasReviewItems && !missingShipTo
var hasAssignedBoxes = splits.some(function (split) {
  return split.lines && split.lines.length && split.locations && split.locations.length
})
var prev = model.view || {}
setModel('order', { splits: splits, detachedIds: detachedIds })
setModel('view', {
  itemCount: selectedCount,
  cardsCount: selectedCount,
  boxesCount: boxesTotal,
  cardsTotal: boxesTotal * 250,
  boxesLabel: boxesLabel,
  canReview: canReview ? 1 : 0,
  hasAssignedBoxes: hasAssignedBoxes ? 1 : 0,
  addressOptions: { personal: personal, offices: offices, all: known },
  knownAddresses: known.map(function (opt) {
    return opt.value
  }),
  addItemMenuIndex: prev.addItemMenuIndex == null ? null : prev.addItemMenuIndex,
  selectMenuIndex: prev.selectMenuIndex == null ? null : prev.selectMenuIndex,
  modalOpen: Boolean(prev.modalOpen),
  modalSplitIndex: prev.modalSplitIndex == null ? null : prev.modalSplitIndex,
  modalSelected: Array.isArray(prev.modalSelected) ? prev.modalSelected : [],
})
if (model.addresses !== undefined) {
  if (typeof Vue !== 'undefined' && Vue.delete) Vue.delete(model, 'addresses')
  else delete model.addresses
}
if (model.header !== undefined) {
  if (typeof Vue !== 'undefined' && Vue.delete) Vue.delete(model, 'header')
  else delete model.header
}
var persistOrder = {
  detachedIds: detachedIds.slice(),
  splits: splits.map(function (split) {
    return {
      id: split.id,
      itemIds: (split.itemIds || []).slice(),
      qtys: Object.assign({}, split.qtys || {}),
      locations: (split.locations || []).map(function (loc) {
        return { id: loc.id, address: loc.address || '', qty: loc.qty }
      }),
    }
  }),
}
try {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('colliers-tab.cart', JSON.stringify(cart))
    sessionStorage.setItem('colliers-tab.order', JSON.stringify(persistOrder))
  }
} catch (err) {}
if (storeApp) {
  storeApp.cart = cart
  storeApp.order = persistOrder
}
if (typeof BF !== 'undefined' && BF.namedAction) {
  try {
    BF.namedAction('syncCartHeader')
  } catch (errHeader) {}
}
function ensureSortable(done) {
  if (window.Sortable) {
    done()
    return
  }
  if (window.__colliersSortableLoading) {
    var wait = setInterval(function () {
      if (!window.Sortable) return
      clearInterval(wait)
      done()
    }, 40)
    return
  }
  window.__colliersSortableLoading = true
  if (!document.getElementById('colliers-sortable-css')) {
    var css = document.createElement('style')
    css.id = 'colliers-sortable-css'
    css.textContent =
      '.sortable-ghost{opacity:.4}.sortable-drag,.sortable-fallback{background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.12)}'
    document.head.appendChild(css)
  }
  var script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.7/Sortable.min.js'
  script.onload = function () {
    window.__colliersSortableLoading = false
    done()
  }
  script.onerror = function () {
    window.__colliersSortableLoading = false
  }
  document.head.appendChild(script)
}
function bindCartSortables() {
  var root = document.getElementById('shipping-root')
  if (!root || !window.Sortable) return
  ;(window.__colliersShippingSortables || []).forEach(function (inst) {
    try {
      inst.destroy()
    } catch (err) {}
  })
  window.__colliersShippingSortables = []
  var sortableOpts = {
    handle: '.drag-handle',
    animation: 180,
    forceFallback: true,
    fallbackOnBody: true,
    ghostClass: 'sortable-ghost',
  }
  ;[].slice.call(root.querySelectorAll('.js-cart-sortable')).forEach(function (el) {
    var inst = window.Sortable.create(
      el,
      Object.assign({}, sortableOpts, {
        group: 'split-cart-lines',
        onEnd: function (evt) {
          var item = evt.item
          var movedId = item && item.getAttribute('data-line-id')
          var toId = evt.to && evt.to.getAttribute('data-split-id')
          if (!movedId || !toId) return
          BF.namedAction('moveLine', { lineId: movedId, splitId: toId, newIndex: evt.newIndex })
        },
      })
    )
    window.__colliersShippingSortables.push(inst)
  })
  ;[].slice.call(root.querySelectorAll('.js-loc-sortable')).forEach(function (el) {
    var inst = window.Sortable.create(
      el,
      Object.assign({}, sortableOpts, {
        group: 'split-locations',
        disabled: el.getAttribute('data-has-items') !== '1',
        onEnd: function (evt) {
          var item = evt.item
          var movedId = item && item.getAttribute('data-loc-id')
          var toId = evt.to && evt.to.getAttribute('data-split-id')
          if (!movedId || !toId) return
          BF.namedAction('moveLocation', { locId: movedId, splitId: toId, newIndex: evt.newIndex })
        },
      })
    )
    window.__colliersShippingSortables.push(inst)
  })
}
ensureSortable(function () {
  if (typeof Vue !== 'undefined' && Vue.nextTick) Vue.nextTick(bindCartSortables)
  else setTimeout(bindCartSortables, 0)
})
