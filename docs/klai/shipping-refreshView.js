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
  return pickField(row, ['addressName', 'address_name', 'name'])
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
function addressRows() {
  var cachedAddr = null
  try {
    if (typeof sessionStorage !== 'undefined') {
      cachedAddr = JSON.parse(sessionStorage.getItem('colliers-tab.addresses') || 'null')
    }
  } catch (errAddr) {}
  var lists = [model.personalAddresses, model.addresses]
  if (typeof app !== 'undefined') lists.push(app.personalAddresses, app.addresses)
  lists.push(cachedAddr)
  var i
  for (i = 0; i < lists.length; i += 1) {
    if (Array.isArray(lists[i]) && lists[i].length) return lists[i]
  }
  if (Array.isArray(model.personalAddresses) && model.personalAddresses.length)
    return model.personalAddresses
  if (Array.isArray(model.addresses) && model.addresses.length) return model.addresses
  if (
    typeof app !== 'undefined' &&
    Array.isArray(app.personalAddresses) &&
    app.personalAddresses.length
  )
    return app.personalAddresses
  if (typeof app !== 'undefined' && Array.isArray(app.addresses) && app.addresses.length)
    return app.addresses
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
  if (!name || name === key || String(name).indexOf('label_') === 0)
    name = labelOr('label_colliers_productEnglish', 'Business Card')
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
// Nothing ships until the group has an address, so show 0 instead of the stored qty (Vue assignedLineQty).
function assignedQty(split, line) {
  return (split.locations || []).length ? splitQty(split, line) : 0
}
function splitQty(split, line) {
  var id = String(line && line.id)
  var stored = split && split.qtys ? split.qtys[id] : null
  if (stored != null && stored !== '') return Math.max(1, Number(stored) || 1)
  return Math.max(1, Number(line && line.quantity) || 1)
}
function writeSplitQty(split, line, qty) {
  var n = Math.max(1, Number(qty) || 1)
  if (!split.qtys || typeof split.qtys !== 'object') split.qtys = {}
  split.qtys[String(line.id)] = n
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
function fitGroup(split, cart) {
  var lines = groupLines(split, cart)
  lines.forEach(function (line) {
    writeSplitQty(split, line, splitQty(split, line))
  })
  if (lines.length && split.locations && split.locations.length) {
    var addressTotal = 0
    split.locations.forEach(function (loc) {
      addressTotal += Number(loc.qty) || 0
    })
    if (!(addressTotal > 0)) addressTotal = 1
    lines.forEach(function (line) {
      writeSplitQty(split, line, addressTotal)
    })
  }
}
var appList = Array.isArray(model.cart) ? model.cart : null
if (!Array.isArray(model.cart) && typeof sessionStorage !== 'undefined') {
  try {
    var cachedCart = JSON.parse(sessionStorage.getItem('colliers-tab.cart') || 'null')
    if (Array.isArray(cachedCart) && cachedCart.length) appList = cachedCart
  } catch (errCache) {}
}
var liveCart = appList && appList.length ? appList : null
var cart = liveCart || []
setModel('cart', cart)
setModel('products', catalogProducts())
var appOrder =
  typeof app !== 'undefined' && app.order && Array.isArray(app.order.splits) ? app.order : null
var modelOrder = model.order || {}
var appLen = appOrder ? appOrder.splits.length : 0
var modelLen = Array.isArray(modelOrder.splits) ? modelOrder.splits.length : 0
var sourceOrder
var cachedOrder = null
try {
  if (typeof sessionStorage !== 'undefined')
    cachedOrder = JSON.parse(sessionStorage.getItem('colliers-tab.order') || 'null')
} catch (errOrd) {
  cachedOrder = null
}
if (
  !(appOrder && appLen) &&
  cachedOrder &&
  Array.isArray(cachedOrder.splits) &&
  cachedOrder.splits.length
) {
  appOrder = cachedOrder
  appLen = cachedOrder.splits.length
}
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
  if (typeof Vue !== 'undefined' && Vue.set) Vue.set(line.details, 'language', line.language || '')
  else line.details.language = line.language || ''
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
cart.forEach(function (line) {
  if (skipAssign[String(line.id)]) return
  var assigned = splits.some(function (split) {
    return split.itemIds.indexOf(String(line.id)) >= 0
  })
  if (!assigned) splits[0].itemIds.push(String(line.id))
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
    loc.cardsLabel = loc.cardsQty + ' ' + cardsWord
    loc.cardsCountLabel = qty * 250 + ' ' + cardsWord
    var maxN = Math.max(12, qty, perAddr)
    loc.boxOptions = []
    var n
    for (n = 1; n <= maxN; n += 1) {
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
  split.locCardsQty = (split.locations.length ? assigned : perAddr) * 250
  split.locBoxLabel = perAddr === 1 ? '1 ' + boxWord : perAddr + ' ' + boxesWord
  split.locCardsLabel = (split.locations.length ? assigned : perAddr) * 250 + ' ' + cardsWord
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
          assignedQty(split, line) === 1
            ? '1 ' + boxWord
            : assignedQty(split, line) + ' ' + boxesWord,
        cardsLabel: assignedQty(split, line) * 250 + ' ' + cardsWord,
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
        previewModel: cartIndex < 0 ? '' : 'cart.' + cartIndex + '.details',
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
  split.hasCards =
    split.lines.length > 0 ||
    (split.itemIds || []).some(function (id) {
      return !!ids[String(id)]
    })
})
var billed = splits.reduce(function (sum, split) {
  var designCount = (split.lines || []).length
  if (!designCount) return sum
  if (split.locations && split.locations.length) {
    var locSum = split.locations.reduce(function (inner, loc) {
      return inner + (Number(loc.qty) || 0)
    }, 0)
    return sum + locSum * designCount
  }
  return sum + orderedBoxes(split, cart)
}, 0)
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
  modalInitial: Array.isArray(prev.modalInitial) ? prev.modalInitial : [],
  modalSearch: prev.modalSearch || '',
})
// Keep the Add location groups current while the modal is open (filterModalAddresses).
if (model.view.modalOpen && typeof BF !== 'undefined' && BF.namedAction)
  BF.namedAction('filterModalAddresses', { search: model.view.modalSearch })
function money(n) {
  return (Math.round(Number(n) * 100) / 100).toFixed(2)
}
var billedTotal = splits.reduce(function (sum, split) {
  if (!(split.itemIds && split.itemIds.length)) return sum
  var boxes =
    split.locations && split.locations.length
      ? split.locations.reduce(function (locSum, loc) {
          return locSum + (Number(loc.qty) || 0)
        }, 0)
      : orderedBoxes(split, cart)
  var lines = (split.itemIds || [])
    .map(function (id) {
      return _.find(cart, function (row) {
        return String(row.id) === String(id)
      })
    })
    .filter(Boolean)
  if (!lines.length) return sum
  return (
    sum +
    lines.reduce(function (lineSum, line) {
      var boxesEach = split.locations && split.locations.length ? boxes : Number(line.quantity) || 0
      return lineSum + boxesEach * (Number(line.price) || 63)
    }, 0)
  )
}, 0)
model.header = model.header || {}
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
var productCount = cart.length
var itemDollars = cart.reduce(function (sum, line) {
  return sum + (Number(line.price) || 63) * (Number(line.quantity) || 0)
}, 0)
model.header.cartCount = productCount
if (typeof app !== 'undefined') {
  if (app.cart && Array.isArray(app.cart.items) && !Array.isArray(app.cart))
    app.cart = app.cart.items
  app.cart = cart
  app.order = {
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
  if (typeof Vue !== 'undefined' && Vue.set) {
    if (!app.header) Vue.set(app, 'header', {})
    Vue.set(app.header, 'cartCount', productCount)
    Vue.set(app.header, 'cartTotal', money(itemDollars))
  } else {
    app.header = app.header || {}
    app.header.cartCount = productCount
    app.header.cartTotal = money(itemDollars)
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      if (cart.length) sessionStorage.setItem('colliers-tab.cart', JSON.stringify(cart))
      sessionStorage.setItem('colliers-tab.order', JSON.stringify(app.order))
    }
  } catch (err) {}
  function applyBilledHeader() {
    if (!app.header) return
    if (typeof Vue !== 'undefined' && Vue.set) {
      Vue.set(app.header, 'cartCount', productCount)
      Vue.set(app.header, 'cartTotal', money(itemDollars))
    } else {
      app.header.cartCount = productCount
      app.header.cartTotal = money(itemDollars)
    }
  }
  applyBilledHeader()
  if (typeof BF !== 'undefined' && BF.namedAction) BF.namedAction('syncCartHeader')
  applyBilledHeader()
  if (typeof Vue !== 'undefined' && Vue.nextTick) Vue.nextTick(applyBilledHeader)
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
          var fromId = evt.from && evt.from.getAttribute('data-split-id')
          if (!movedId || !toId) return
          if (String(fromId) === String(toId) && evt.oldIndex === evt.newIndex) return
          BF.namedAction('moveLine', {
            lineId: movedId,
            splitId: toId,
            fromSplitId: fromId,
            newIndex: evt.newIndex,
          })
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
