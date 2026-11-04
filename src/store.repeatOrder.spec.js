import { beforeEach, describe, expect, it } from 'vitest'
import Vue from 'vue'
import {
  ensureCartAssignedToShipping,
  ensureSampleShippingDraft,
  loadProfileCollections,
  logout,
  removeEmptySplits,
  repeatOrder,
  shippingReady,
  store,
  syncShippingQuantities,
} from './store.js'
import { readSplitQty } from './helpers/order.js'

/** The same calls ShippingPage makes in mounted(), in the same order. */
function openShipping() {
  ensureSampleShippingDraft()
  ensureCartAssignedToShipping()
  removeEmptySplits()
  syncShippingQuantities()
}

function lineByName(name) {
  return store.cart.find(function (line) {
    return line.details.name === name
  })
}

describe('Repeat Order then Shipping', function () {
  beforeEach(function () {
    logout()
    localStorage.clear()
    Vue.set(store, 'session', { email: 'repeat-flow@colliers.com', role: 'user', loggedInAt: 1 })
    store.offices.splice(0, store.offices.length)
    loadProfileCollections()
  })

  it('RS-01 ORD-1005: a card in two shipments keeps 4 + 1 boxes after Shipping opens', function () {
    expect(repeatOrder('ORD-1005')).toBe(true)
    openShipping()
    var partner = lineByName('Demo Partner')
    var associate = lineByName('Demo Associate')
    var [first, second] = store.order.splits
    expect(store.order.splits).toHaveLength(2)
    expect(readSplitQty(first, partner)).toBe(4)
    expect(readSplitQty(second, partner)).toBe(1)
    expect(readSplitQty(second, associate)).toBe(1)
    expect(partner.quantity).toBe(5)
    expect(associate.quantity).toBe(1)
    expect(first.locations.map((loc) => loc.qty)).toEqual([4])
    expect(second.locations.map((loc) => loc.addressId)).toEqual(['seed-temp'])
    expect(store.repeatNotice).toEqual({ orderId: 'ORD-1005', removedAddresses: 0 })
    expect(shippingReady()).toBe(true)
  })

  it('RS-02 ORD-1004: the shipment that lost its only address stays, and blocks checkout', function () {
    expect(repeatOrder('ORD-1004')).toBe(true)
    openShipping()
    expect(store.order.splits).toHaveLength(2)
    expect(store.order.splits[0].locations.map((loc) => loc.addressId)).toEqual(['9'])
    expect(store.order.splits[1].locations).toEqual([])
    expect(store.cart).toHaveLength(3)
    expect(store.repeatNotice.removedAddresses).toBe(2)
    expect(shippingReady()).toBe(false)
  })

  it('RS-03 unknown order id leaves the cart alone', function () {
    expect(repeatOrder('ORD-NOPE')).toBe(false)
    expect(store.cart).toHaveLength(0)
    expect(store.repeatNotice).toBe(null)
  })
})
