import Vue from 'vue'
import { messages } from './i18n/messages'
import { readStorage, writeStorage, removeStorage } from './helpers/storage'
import { cartCount, cartSubtotal, consolidateCart, cloneLine, makeLine, sameDetails } from './helpers/cart'
import {
  addLocation as pushLocation,
  addSplit,
  assignItem,
  linesForSplit,
  moveItem,
  normalizeOrder,
  removeLocation as spliceLocation,
  removeSplitAt,
  resetOrder,
  snapshotOrder,
  syncCartAssignments,
  unassignItem,
} from './helpers/order'
import { fetchOffices, fetchTitles, submitOrder } from './adapters/api'
import {
  loadPersonalAddresses as readPersonalAddresses,
  savePersonalAddresses,
  loadOrderHistory as readOrderHistory,
  saveOrderHistory,
} from './adapters/profileStorage'
import { createPersonalRecord } from './helpers/addressBook'
import { createOfficeRecord, loadManagedOffices, saveManagedOffices } from './helpers/officeAdmin'
import { loadManagedTitles, saveManagedTitles } from './helpers/titleAdmin'
import { loadAllPortalOrders } from './helpers/adminData'
import { buildHistoryRecord, nextOrderId } from './helpers/orderHistory'
import { getProduct, products } from './data/products.js'

const storedLocale = readStorage('locale', 'EN')

export const store = Vue.observable({
  locale: storedLocale === 'FR' ? 'FR' : 'EN',
  session: readStorage('session', null),
  cart: consolidateCart(readStorage('cart', [])),
  cartOpen: false,
  locationOpen: false,
  locationTarget: null,
  order: normalizeOrder(readStorage('order', null)),
  offices: [],
  officesLoading: false,
  officesError: '',
  officesSource: 'api',
  titles: [],
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
  return String(email || '').trim().toLowerCase() === 'admin' ? 'admin' : 'user'
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
  loadProfileCollections()
}

export function logout() {
  Vue.set(store, 'session', null)
  persistSession()
  replaceList(store.personalAddresses, [])
  replaceList(store.orderHistory, [])
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
    Object.assign({}, store.personalAddresses[index], fields || {}, { id: id }),
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
  const record = store.orderHistory.find(function (row) {
    return row.id === id
  })
  if (!record) return false
  replaceList(
    store.cart,
    (record.cart || []).map(function (line) {
      return makeLine(line)
    }),
  )
  Vue.set(store, 'order', normalizeOrder(record.order))
  persistCart()
  persistOrder()
  return true
}

export function itemCount() {
  return cartCount(store.cart)
}

export function subtotal() {
  return cartSubtotal(store.cart)
}

export function openCart() {
  store.cartOpen = true
}

export function closeCart() {
  store.cartOpen = false
}

export function addToCart(payload) {
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
      }),
    )
  }
  persistCart()
  syncAssignments()
  store.cartOpen = true
}

export function updateQty(id, quantity) {
  const line = store.cart.find(function (item) {
    return item.id === id
  })
  if (!line) return
  line.quantity = Math.max(1, Number(quantity) || 1)
  persistCart()
}

export function removeLine(id) {
  store.cart = store.cart.filter(function (item) {
    return item.id !== id
  })
  unassignItem(store.order, id)
  persistCart()
  persistOrder()
}

export function clearCart() {
  store.cart = []
  persistCart()
  syncAssignments()
  persistOrder()
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
    }),
  )
  persistOrder()
}

export function splitOrder(splitIndex) {
  const source = store.order.splits[splitIndex]
  const newItemIds = []
  if (source && source.itemIds.length) {
    source.itemIds.forEach(function (id) {
      const clone = cloneLine(store.cart, id)
      if (clone) {
        store.cart.push(clone)
        newItemIds.push(clone.id)
      }
    })
  }
  addSplit(store.order, newItemIds)
  persistCart()
  persistOrder()
}

export function removeSplit(index) {
  const ids = removeSplitAt(store.order, index)
  if (!ids.length) return
  ids.forEach(function (id) {
    const rowIndex = store.cart.findIndex(function (line) {
      return String(line.id) === String(id)
    })
    if (rowIndex !== -1) store.cart.splice(rowIndex, 1)
  })
  persistCart()
  persistOrder()
}

export function moveLineToSplit(lineId, splitId) {
  moveItem(store.order, lineId, splitId)
  persistOrder()
}

export function assignLine(split, itemId) {
  assignItem(store.order, split, itemId)
  persistOrder()
}

export function addCartItemToSplit(split) {
  const first = products[0]
  const line = makeLine({
    code: first.code,
    language: first.language,
    quantity: 1,
    details: {},
  })
  store.cart.push(line)
  assignItem(store.order, split, line.id)
  persistCart()
  persistOrder()
}

export function addShipLocation(split, address, qty) {
  pushLocation(split, address, qty)
  persistOrder()
}

export function removeShipLocation(split, index) {
  spliceLocation(split, index)
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
    createOfficeRecord(Object.assign({}, store.offices[index], fields || {}, { id: store.offices[index].id })),
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

export function addTitle(label) {
  const trimmed = String(label || '').trim()
  if (!trimmed) return false
  if (store.titles.indexOf(trimmed) !== -1) return false
  store.titles.push(trimmed)
  saveManagedTitles(store.titles)
  return true
}

export function updateTitle(index, label) {
  const trimmed = String(label || '').trim()
  if (!trimmed || index < 0 || index >= store.titles.length) return false
  store.titles.splice(index, 1, trimmed)
  saveManagedTitles(store.titles)
  return true
}

export function deleteTitle(index) {
  if (index < 0 || index >= store.titles.length) return
  store.titles.splice(index, 1)
  saveManagedTitles(store.titles)
}

export function loadAdminOrders() {
  replaceList(store.adminOrders, loadAllPortalOrders())
  return store.adminOrders
}

export async function loadOffices(force) {
  if (store.offices.length && !force) return store.offices
  store.officesLoading = true
  store.officesError = ''
  const managed = loadManagedOffices()
  if (managed.length && !force) {
    store.offices = managed
    store.officesSource = 'local'
    store.officesLoading = false
  } else {
    const result = await fetchOffices()
    store.offices = result.data.length ? result.data.map(createOfficeRecord) : managed
    store.officesSource = result.source
    store.officesError = result.source === 'mock' ? '' : result.error
    saveManagedOffices(store.offices)
    store.officesLoading = false
  }
  if (!store.titles.length) {
    store.titles = loadManagedTitles()
  }
  return store.offices
}

export async function loadTitles(force) {
  if (store.titles.length && !force) return store.titles
  store.titles = loadManagedTitles()
  if (!store.titles.length) {
    const titles = await fetchTitles()
    store.titles = titles.data.slice()
    saveManagedTitles(store.titles)
  }
  return store.titles
}

export async function confirmSubmit() {
  store.submitting = true
  store.submitError = ''
  try {
    const result = await submitOrder({
      cart: store.cart.slice(),
      order: snapshotOrder(store.order),
    })
    if (!result.ok) {
      store.submitError = 'Submit failed'
      return false
    }
    appendConfirmedOrder()
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
