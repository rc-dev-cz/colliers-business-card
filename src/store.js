import Vue from 'vue'
import { messages } from './i18n/messages'
import { readStorage, writeStorage, removeStorage } from './helpers/storage'
import { cloneCardDetails, consolidateCart, lineTotal, makeLine, sameDetails } from './helpers/cart'
import {
  addLocation as pushLocation,
  addSplit,
  assignItem,
  attachLine,
  boxesPerAddressForSplit,
  detachLine,
  fitGroupToLimit,
  includeItem,
  linesForSplit,
  maxItemQty,
  moveItem,
  moveLocation as relocateLocation,
  normalizeOrder,
  pruneLocationsWithoutItems,
  removeLocation as spliceLocation,
  removeSplitAt,
  resetOrder,
  snapshotOrder,
  splitForLineId,
  syncCartAssignments,
  syncLineQuantityFromSplits,
  unassignItem,
  writeSplitQty,
} from './helpers/order'
import { fetchTitles, submitOrder } from './adapters/api'
import {
  loadPersonalAddresses as readPersonalAddresses,
  savePersonalAddresses,
  loadOrderHistory as readOrderHistory,
  saveOrderHistory,
} from './adapters/profileStorage'
import { createPersonalRecord } from './helpers/addressBook'
import { createOfficeRecord, loadManagedOffices, saveManagedOffices } from './helpers/officeAdmin'
import { loadManagedTitles, saveManagedTitles } from './helpers/titleAdmin'
import { loadManagedDegrees, saveManagedDegrees } from './helpers/degreeAdmin'
import { loadAllPortalOrders } from './helpers/adminData'
import { buildOrderPayload, logOrderPayload } from './helpers/orderPayload'
import {
  attachPrintPdfCards,
  buildPrintPdfs,
  clearStoredPrintPdfs,
  markPrintPdfFailed,
  SEND_PDFS_TO_FILEMAKER,
} from './helpers/orderPdfs'
import { buildHistoryRecord, nextOrderId } from './helpers/orderHistory'
import { getProduct } from './data/products.js'
import { go } from './adapters/nav'
import {
  PLACEHOLDER_SHIP_ADDRESS,
  sampleShippingCart,
  sampleShippingOrder,
} from './helpers/shippingSample.js'

const storedLocale = readStorage('locale', 'EN')

export const store = Vue.observable({
  locale: storedLocale === 'FR' ? 'FR' : 'EN',
  session: readStorage('session', null),
  cart: consolidateCart(readStorage('cart', [])),
  cartOpen: false,
  proof: null,
  editLineId: null,
  /** Shipping group to receive the next proof add-to-cart (from + Add item). */
  pendingSplitId: null,
  locationOpen: false,
  locationTarget: null,
  order: normalizeOrder(readStorage('order', null)),
  offices: [],
  officesLoading: false,
  officesError: '',
  officesSource: 'api',
  titles: [],
  titlesFr: [],
  degrees: [],
  personalAddresses: [],
  orderHistory: [],
  adminOrders: [],
  submitting: false,
  submitError: '',
})

function persistCart() {
  writeStorage('cart', store.cart)
}

function persistOrder() {
  writeStorage('order', snapshotOrder(store.order))
}

function persistLocale() {
  writeStorage('locale', store.locale)
}

function persistSession() {
  if (store.session) writeStorage('session', store.session)
  else removeStorage('session')
}

function replaceList(target, next) {
  target.splice(0, target.length)
  ;(next || []).forEach(function (row) {
    target.push(row)
  })
}

function persistPersonal() {
  savePersonalAddresses(userEmail(), store.personalAddresses.slice())
}

function persistHistory() {
  saveOrderHistory(userEmail(), store.orderHistory.slice())
}

export function loadProfileCollections() {
  replaceList(store.personalAddresses, readPersonalAddresses(userEmail()))
  replaceList(store.orderHistory, readOrderHistory(userEmail()))
}

export function t(key) {
  const entry = messages[key]
  if (!entry) return key
  return entry[store.locale] || entry.EN || key
}

export function setLocale(next) {
  store.locale = next === 'FR' ? 'FR' : 'EN'
  persistLocale()
}

function roleFromEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase() === 'admin'
    ? 'admin'
    : 'user'
}

export function isAuthenticated() {
  return Boolean(store.session && store.session.email)
}

export function userEmail() {
  return (store.session && store.session.email) || ''
}

export function sessionRole() {
  if (store.session && (store.session.role === 'admin' || store.session.role === 'user')) {
    return store.session.role
  }
  return roleFromEmail(userEmail())
}

export function isAdmin() {
  return sessionRole() === 'admin'
}

export function login(email) {
  const trimmed = String(email || 'demo').trim() || 'demo'
  Vue.set(store, 'session', {
    email: trimmed,
    role: roleFromEmail(trimmed),
    loggedInAt: Date.now(),
  })
  persistSession()
  clearStoredPrintPdfs()
  loadProfileCollections()
}

export function logout() {
  Vue.set(store, 'session', null)
  persistSession()
  clearStoredPrintPdfs()
  replaceList(store.personalAddresses, [])
  replaceList(store.orderHistory, [])
  // Cart and shipping draft are not per-user, so the next login must not inherit them.
  clearCart()
  clearOrder()
}

export function addPersonal(fields) {
  const next = createPersonalRecord(fields)
  store.personalAddresses.push(next)
  persistPersonal()
  return next
}

export function updatePersonal(id, fields) {
  const index = store.personalAddresses.findIndex(function (row) {
    return row.id === id
  })
  if (index === -1) return
  Vue.set(
    store.personalAddresses,
    index,
    Object.assign({}, store.personalAddresses[index], fields || {}, { id: id })
  )
  persistPersonal()
}

export function deletePersonal(id) {
  const index = store.personalAddresses.findIndex(function (row) {
    return row.id === id
  })
  if (index === -1) return
  store.personalAddresses.splice(index, 1)
  persistPersonal()
}

export function getPersonal(id) {
  return (
    store.personalAddresses.find(function (row) {
      return row.id === id
    }) || null
  )
}

export function appendConfirmedOrder() {
  const record = buildHistoryRecord(store.cart, store.order, {
    id: nextOrderId(store.orderHistory),
    status: 'Processing',
  })
  store.orderHistory.unshift(record)
  persistHistory()
  return record
}

export function repeatOrder(id) {
  const record =
    store.orderHistory.find(function (row) {
      return row.id === id
    }) ||
    store.adminOrders.find(function (row) {
      return row.id === id
    })
  if (!record) return false
  return loadOrderIntoCart(record)
}

function loadOrderIntoCart(record) {
  replaceList(
    store.cart,
    (record.cart || []).map(function (line) {
      return makeLine(line)
    })
  )
  Vue.set(store, 'order', normalizeOrder(record.order))
  persistCart()
  persistOrder()
  return true
}

export function itemCount() {
  return store.cart.length
}

export function selectedShippingItemCount() {
  var seen = {}
  var n = 0
  ;(store.order.splits || []).forEach(function (split) {
    linesInSplit(split).forEach(function (line) {
      var key = String(line.id)
      if (seen[key]) return
      seen[key] = true
      n += 1
    })
  })
  return n
}

export function assignedItems() {
  return store.cart.reduce(function (sum, line) {
    return sum + (Number(line.quantity) || 0)
  }, 0)
}

export function subtotal() {
  return store.cart.reduce(function (sum, line) {
    return sum + lineTotal(line)
  }, 0)
}

function syncAllLineQuantities() {
  store.cart.forEach(function (line) {
    syncLineQuantityFromSplits(store.order, line)
  })
}

function fitAllGroups() {
  ;(store.order.splits || []).forEach(function (split) {
    fitGroupToLimit(split, store.cart)
  })
  syncAllLineQuantities()
}

export function syncShippingQuantities() {
  fitAllGroups()
  persistCart()
  persistOrder()
}

export function startNewCustomize() {
  store.editLineId = null
  Vue.set(store, 'proof', null)
}

export function openCart() {
  store.cartOpen = true
}

export function closeCart() {
  store.cartOpen = false
}

export function setProof(payload) {
  if (!payload || !payload.code) {
    Vue.set(store, 'proof', null)
    return
  }
  var editId = payload.editLineId != null ? payload.editLineId : store.editLineId
  if (editId != null && editId !== '') {
    store.editLineId = editId
  }
  Vue.set(store, 'proof', {
    code: payload.code,
    language: payload.language || '',
    details: cloneCardDetails(payload.details),
    editLineId: store.editLineId,
  })
}

export function setEditLineId(id) {
  store.editLineId = id || null
  if (store.proof && store.editLineId) {
    Vue.set(store.proof, 'editLineId', store.editLineId)
  }
}

export function addToCart(payload, options) {
  const product = getProduct(payload.code)
  if (!product) return
  const existing = store.cart.find(function (item) {
    return item.code === payload.code && sameDetails(item.details, payload.details)
  })
  if (existing) {
    existing.quantity += payload.quantity || 1
  } else {
    store.cart.push(
      makeLine({
        code: payload.code,
        language: payload.language || product.language,
        quantity: payload.quantity || 1,
        details: payload.details || {},
      })
    )
  }
  persistCart()
  syncAssignments()
  fitAllGroups()
  persistCart()
  persistOrder()
  if (!options || options.openCart !== false) {
    store.cartOpen = true
  }
}

function applyPendingSplit(lineId) {
  if (!store.pendingSplitId || !lineId) return
  const split = store.order.splits.find(function (row) {
    return String(row.id) === String(store.pendingSplitId)
  })
  store.pendingSplitId = null
  if (!split) return
  assignItem(store.order, split, lineId)
  fitAllGroups()
  persistCart()
  persistOrder()
}

function findCartLineForProof(proof) {
  if (!proof || !proof.code) return null
  return store.cart.find(function (item) {
    return item.code === proof.code && sameDetails(item.details, proof.details)
  })
}

function findCartLineById(id) {
  if (id == null || id === '') return null
  return (
    store.cart.find(function (item) {
      return String(item.id) === String(id)
    }) || null
  )
}

/** Remember the line this proof put in the cart, so Back to Edit updates it. */
function rememberProofLine(proof, line) {
  if (proof && line) Vue.set(proof, 'cartLineId', line.id)
}

function clearEditLine() {
  store.editLineId = null
  if (store.proof) Vue.set(store.proof, 'editLineId', null)
}

function applyProofToCart(options) {
  const proof = store.proof
  const opts = options || {}
  if (!proof || !proof.code) return
  const editId = store.editLineId || proof.editLineId
  const clearEdit =
    opts.clearEdit !== false && (opts.bumpIfExisting || opts.openCart || opts.clearEdit === true)
  if (editId != null && editId !== '') {
    const line = findCartLineById(editId)
    if (line) {
      line.code = proof.code
      line.language = proof.language || line.language
      line.details = cloneCardDetails(proof.details)
      const product = getProduct(proof.code)
      if (product) line.price = product.price
      persistCart()
      syncAssignments()
      rememberProofLine(proof, line)
      if (clearEdit) clearEditLine()
      if (opts.openCart) store.cartOpen = true
      return
    }
    return
  }
  const existing = findCartLineForProof(proof)
  if (existing) {
    if (opts.bumpIfExisting) {
      var nextQty = (Number(existing.quantity) || 1) + 1
      var existingSplit = splitForLineId(store.order, existing.id)
      var cap = existingSplit ? maxItemQty(existingSplit, store.cart, existing.id) : nextQty
      existing.quantity = Math.max(1, Math.min(cap, nextQty))
    }
    persistCart()
    rememberProofLine(proof, existing)
    applyPendingSplit(existing.id)
    if (opts.openCart) store.cartOpen = true
    return
  }
  addToCart(
    {
      code: proof.code,
      language: proof.language,
      quantity: 1,
      details: cloneCardDetails(proof.details),
    },
    { openCart: Boolean(opts.openCart) }
  )
  const added = findCartLineForProof(proof)
  rememberProofLine(proof, added)
  if (added) applyPendingSplit(added.id)
}

export function addProofToCart() {
  applyProofToCart({ bumpIfExisting: true, openCart: true, clearEdit: true })
}

export function ensureProofInCart() {
  applyProofToCart({ bumpIfExisting: false, openCart: false, clearEdit: false })
}

export function updateQty(id, quantity, split) {
  const line = store.cart.find(function (item) {
    return item.id === id
  })
  if (!line) return
  var target = split || splitForLineId(store.order, id)
  if (!target) {
    line.quantity = Math.max(1, Number(quantity) || 1)
    persistCart()
    return
  }
  var cap = maxItemQty(target, store.cart, id)
  writeSplitQty(target, line, Math.max(1, Math.min(cap, Number(quantity) || 1)))
  syncLineQuantityFromSplits(store.order, line)
  persistCart()
  persistOrder()
}

export function removeLine(id) {
  var lineId = String(id)
  store.cart = store.cart.filter(function (item) {
    return String(item.id) !== lineId
  })
  unassignItem(store.order, id)
  attachLine(store.order, lineId)
  pruneLocationsWithoutItems(store.order, store.cart)
  persistCart()
  persistOrder()
}

export function removeLineFromSplit(split, id) {
  if (!split) {
    removeLine(id)
    return
  }
  var lineId = String(id)
  Vue.set(
    split,
    'itemIds',
    (split.itemIds || []).filter(function (itemId) {
      return String(itemId) !== lineId
    })
  )
  if (Array.isArray(split.lines)) {
    Vue.set(
      split,
      'lines',
      split.lines.filter(function (line) {
        return String(line.id) !== lineId
      })
    )
  }
  if (split.qtys && Object.prototype.hasOwnProperty.call(split.qtys, lineId)) {
    Vue.delete(split.qtys, lineId)
  }
  if (!split.itemIds.length) Vue.set(split, 'locations', [])

  var remainsAssigned = store.order.splits.some(function (row) {
    return (row.itemIds || []).some(function (itemId) {
      return String(itemId) === lineId
    })
  })
  // Last group gone: keep the card in the cart, just stop shipping it.
  if (!remainsAssigned) detachLine(store.order, lineId)

  var line = store.cart.find(function (item) {
    return String(item.id) === lineId
  })
  if (line) syncLineQuantityFromSplits(store.order, line)
  pruneLocationsWithoutItems(store.order, store.cart)
  persistCart()
  persistOrder()
}

export function clearCart() {
  store.cart = []
  store.pendingSplitId = null
  persistCart()
  syncAssignments()
  persistOrder()
}

function stripPlaceholderShipTos() {
  var changed = false
  ;(store.order.splits || []).forEach(function (split) {
    var next = (split.locations || []).filter(function (loc) {
      return String(loc.address || '').trim() !== PLACEHOLDER_SHIP_ADDRESS
    })
    if (next.length !== (split.locations || []).length) {
      split.locations.splice(0, split.locations.length)
      next.forEach(function (loc) {
        split.locations.push(loc)
      })
      changed = true
    }
  })
  if (changed) persistOrder()
}

/**
 * Cart lines that are not on any group show on Shipping Group 1,
 * unless the user took them off shipping (detachedIds).
 */
export function ensureCartAssignedToShipping() {
  syncAssignments()
}

/**
 * Continue to Shipping from the cart or proof. When no group holds a card
 * (everything was removed from shipping), start over: one group with every
 * cart card. Otherwise keep the user's groups as they are.
 */
export function startShippingFromCart() {
  var hasVisible = (store.order.splits || []).some(function (split) {
    return linesInSplit(split).length
  })
  if (!hasVisible && store.cart.length) resetOrder(store.order)
  syncAssignments()
}

/** Empty cart only. Two placeholder lines on Group 1 so Shipping is usable in localhost. */
export function ensureSampleShippingDraft() {
  if (Array.isArray(store.cart) && store.cart.length) {
    stripPlaceholderShipTos()
    ensureCartAssignedToShipping()
    return false
  }
  store.cart = sampleShippingCart()
  var sample = sampleShippingOrder()
  store.order.splits.splice(0, store.order.splits.length)
  sample.splits.forEach(function (split) {
    store.order.splits.push(split)
  })
  persistCart()
  persistOrder()
  return true
}

export function openLocationPicker(target) {
  store.locationTarget = target
  store.locationOpen = true
}

export function closeLocationPicker() {
  store.locationOpen = false
  store.locationTarget = null
}

export function syncAssignments() {
  syncCartAssignments(
    store.order,
    store.cart.map(function (line) {
      return line.id
    })
  )
  pruneLocationsWithoutItems(store.order, store.cart)
  persistOrder()
}

export function splitOrder(splitIndex) {
  var splits = store.order.splits || []
  var idx = Number(splitIndex)
  if (isNaN(idx) || idx < 0 || idx >= splits.length) idx = splits.length - 1
  var source = splits[idx] || splits[0]
  if (!linesInSplit(source).length) return
  syncAssignments()
  var ids = source && Array.isArray(source.itemIds) ? source.itemIds.slice() : []
  var qtys = {}
  ids.forEach(function (id) {
    var key = String(id)
    var line = store.cart.find(function (row) {
      return String(row.id) === key
    })
    var stored = source && source.qtys ? source.qtys[key] : null
    qtys[key] =
      stored != null && stored !== ''
        ? Math.max(1, Number(stored) || 1)
        : Math.max(1, line ? Number(line.quantity) || 1 : 1)
  })
  addSplit(store.order, ids, qtys)
  store.cart.forEach(function (line) {
    syncLineQuantityFromSplits(store.order, line)
  })
  persistCart()
  persistOrder()
}

export function removeSplit(index) {
  removeSplitAt(store.order, index)
  fitAllGroups()
  persistCart()
  persistOrder()
}

export function moveLineToSplit(lineId, splitId, newIndex, fromSplitId) {
  moveItem(store.order, lineId, splitId, newIndex, fromSplitId)
  pruneLocationsWithoutItems(store.order, store.cart)
  fitAllGroups()
  persistCart()
  persistOrder()
}

/** Returns true when the address was already in the target group and the boxes were combined. */
export function moveLocationToSplit(locId, splitId, newIndex) {
  var target = (store.order.splits || []).find(function (row) {
    return String(row.id) === String(splitId)
  })
  if (target && !linesInSplit(target).length) return false
  var kept = relocateLocation(store.order, locId, splitId, newIndex)
  fitAllGroups()
  persistCart()
  persistOrder()
  return Boolean(kept) && String(kept.id) !== String(locId)
}

export function assignLine(split, itemId) {
  assignItem(store.order, split, itemId)
  persistOrder()
}

export function cartLinesOutsideSplit(split) {
  const ids = {}
  ;(split && split.itemIds ? split.itemIds : []).forEach(function (id) {
    ids[String(id)] = true
  })
  return store.cart.filter(function (line) {
    return !ids[String(line.id)]
  })
}

export function addCartItemToSplit(split) {
  store.pendingSplitId = split && split.id != null ? split.id : null
  go('catalog')
}

export function addCartLineToSplit(split, lineId) {
  if (!split || lineId == null || lineId === '') return
  includeItem(store.order, split, lineId)
  fitAllGroups()
  persistCart()
  persistOrder()
}

export function addShipLocation(split, address, qty) {
  if (!linesInSplit(split).length) return
  var boxes = qty != null ? qty : boxesPerAddressForSplit(split, store.cart)
  pushLocation(split, address, boxes)
  fitGroupToLimit(split, store.cart)
  syncAllLineQuantities()
  persistCart()
  persistOrder()
}

export function setGroupLocationQty(split, locIndex, qty) {
  if (!linesInSplit(split).length) return
  if (!split || !split.locations || !split.locations[locIndex]) return
  split.locations[locIndex].qty = Math.max(1, Number(qty) || 1)
  fitGroupToLimit(split, store.cart)
  syncAllLineQuantities()
  persistCart()
  persistOrder()
}

export function removeShipLocation(split, index) {
  if (!linesInSplit(split).length) return
  spliceLocation(split, index)
  fitGroupToLimit(split, store.cart)
  syncAllLineQuantities()
  persistCart()
  persistOrder()
}

export function persistOrderNow() {
  persistOrder()
}

export function persistCartNow() {
  persistCart()
}

export function linesInSplit(split) {
  return linesForSplit(split, store.cart)
}

export function clearOrder() {
  resetOrder(store.order)
  persistOrder()
}

export function getOffice(id) {
  return (
    store.offices.find(function (row) {
      return String(row.id) === String(id)
    }) || null
  )
}

export function addOffice(fields) {
  const next = createOfficeRecord(fields)
  store.offices.push(next)
  saveManagedOffices(store.offices)
  return next
}

export function updateOffice(id, fields) {
  const index = store.offices.findIndex(function (row) {
    return String(row.id) === String(id)
  })
  if (index === -1) return
  Vue.set(
    store.offices,
    index,
    createOfficeRecord(
      Object.assign({}, store.offices[index], fields || {}, { id: store.offices[index].id })
    )
  )
  saveManagedOffices(store.offices)
}

export function deleteOffice(id) {
  const index = store.offices.findIndex(function (row) {
    return String(row.id) === String(id)
  })
  if (index === -1) return
  store.offices.splice(index, 1)
  saveManagedOffices(store.offices)
}

/** English ('EN', default) or French ('FR') managed title list. */
function titleList(language) {
  return language === 'FR' ? store.titlesFr : store.titles
}

function sortTitles(list) {
  list.sort(function (a, b) {
    return a.localeCompare(b)
  })
}

export function addTitle(label, language) {
  const list = titleList(language)
  const trimmed = String(label || '').trim()
  if (!trimmed) return false
  if (list.indexOf(trimmed) !== -1) return false
  list.push(trimmed)
  sortTitles(list)
  saveManagedTitles(list, language)
  return true
}

export function updateTitle(index, label, language) {
  const list = titleList(language)
  const trimmed = String(label || '').trim()
  if (!trimmed || index < 0 || index >= list.length) return false
  list.splice(index, 1, trimmed)
  sortTitles(list)
  saveManagedTitles(list, language)
  return true
}

export function deleteTitle(index, language) {
  const list = titleList(language)
  if (index < 0 || index >= list.length) return
  list.splice(index, 1)
  saveManagedTitles(list, language)
}

export function addDegree(label) {
  const trimmed = String(label || '').trim()
  if (!trimmed) return false
  if (store.degrees.indexOf(trimmed) !== -1) return false
  store.degrees.push(trimmed)
  saveManagedDegrees(store.degrees)
  return true
}

export function updateDegree(oldValue, label) {
  const trimmed = String(label || '').trim()
  if (!trimmed) return false
  const index = store.degrees.indexOf(oldValue)
  if (index === -1) return false
  if (store.degrees.indexOf(trimmed) !== -1 && store.degrees[index] !== trimmed) return false
  store.degrees.splice(index, 1, trimmed)
  saveManagedDegrees(store.degrees)
  return true
}

export function deleteDegree(value) {
  const index = store.degrees.indexOf(value)
  if (index === -1) return
  store.degrees.splice(index, 1)
  saveManagedDegrees(store.degrees)
}

export function loadDegrees(force) {
  if (store.degrees.length && !force) return store.degrees
  store.degrees = loadManagedDegrees()
  return store.degrees
}

export function loadAdminOrders() {
  replaceList(store.adminOrders, loadAllPortalOrders())
  return store.adminOrders
}

export async function loadOffices(force) {
  if (store.offices.length && !force) return store.offices
  store.officesLoading = true
  store.officesError = ''
  // Local managed list (seed + Manage Addresses edits). FileMaker hook replaces this later.
  store.offices = loadManagedOffices()
  store.officesSource = 'local'
  store.officesLoading = false
  if (!store.titles.length) store.titles = loadManagedTitles('EN')
  if (!store.titlesFr.length) store.titlesFr = loadManagedTitles('FR')
  return store.offices
}

export async function loadTitles() {
  // Always re-read managed titles so seed-version bumps apply.
  store.titles = loadManagedTitles('EN')
  store.titlesFr = loadManagedTitles('FR')
  if (!store.titles.length) {
    const titles = await fetchTitles()
    store.titles = titles.data.slice()
    saveManagedTitles(store.titles, 'EN')
  }
  return store.titles
}

export async function confirmSubmit() {
  store.submitting = true
  store.submitError = ''
  try {
    // Review can load straight from a refresh, before any page filled store.offices
    const offices = await loadOffices()
    const payload = buildOrderPayload({
      cart: store.cart,
      order: snapshotOrder(store.order),
      session: store.session,
      offices: offices,
      personalAddresses: store.personalAddresses,
    })
    // One print PDF (base64) per unique card, in payload.cards[] only (nothing is stored in the browser).
    // A PDF problem never blocks the order; order.print_pdf_status says what happened.
    clearStoredPrintPdfs()
    try {
      const pdfs = SEND_PDFS_TO_FILEMAKER ? await buildPrintPdfs(payload, store.cart) : {}
      attachPrintPdfCards(payload, pdfs, store.cart)
    } catch (error) {
      console.warn('[Colliers order] print PDF not saved', error)
      markPrintPdfFailed(payload, error)
    }
    const result = await submitOrder(payload)
    if (!result.ok) {
      store.submitError = 'Submit failed'
      return false
    }
    const record = appendConfirmedOrder()
    logOrderPayload(result.orderId || record.id, payload)
    return true
  } catch (error) {
    store.submitError = error && error.message ? error.message : 'Submit failed'
    return false
  } finally {
    store.submitting = false
  }
}

persistLocale()
syncAssignments()
if (isAuthenticated()) loadProfileCollections()
