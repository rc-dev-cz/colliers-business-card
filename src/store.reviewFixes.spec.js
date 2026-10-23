import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import VueRouter from 'vue-router'
import Vue from 'vue'
import {
  addProofToCart,
  addShipLocation,
  clearCart,
  clearOrder,
  confirmSubmit,
  hasEmptySplit,
  removeEmptySplits,
  removeLine,
  removeLineFromSplit,
  setEditLineId,
  setProof,
  shippingReady,
  splitOrder,
  store,
  syncAssignments,
  updateTitle,
} from './store.js'
import { makeLine } from './helpers/cart.js'
import { bindRouter, go } from './adapters/nav.js'

var CARD = {
  name: 'Firstname Lastname',
  title: 'Title',
  degree: [],
  email: 'first.lastname@colliersprojectleaders.com',
  phone: '5555555555',
  address: '300-5515 North Service Road\nBurlington, ON\nL7L 6G4 Canada',
}

function seedCart() {
  clearCart()
  clearOrder()
  store.cart = [makeLine({ id: 'line-1', code: 'BCAD-PL-ENG', language: 'English', details: CARD })]
  syncAssignments()
}

describe('Review: ship-to required', function () {
  beforeEach(seedCart)
  afterEach(function () {
    clearCart()
    clearOrder()
    store.submitError = ''
  })

  it('is not ready while a group with cards has no address', function () {
    expect(shippingReady()).toBe(false)
    addShipLocation(store.order.splits[0], CARD.address)
    expect(shippingReady()).toBe(true)
  })

  it('refuses to submit without an address and keeps the cart', async function () {
    expect(await confirmSubmit()).toBe(false)
    expect(store.submitError).not.toBe('')
    expect(store.cart.length).toBe(1)
  })

  it('empties the cart once the order is placed', async function () {
    addShipLocation(store.order.splits[0], CARD.address)
    expect(await confirmSubmit()).toBe(true)
    expect(store.cart.length).toBe(0)
  }, 20000)
})

describe('Shipping: empty shipment', function () {
  beforeEach(function () {
    seedCart()
    addShipLocation(store.order.splits[0], CARD.address)
    // Split Order adds an empty shipment.
    splitOrder(0)
  })
  afterEach(function () {
    clearCart()
    clearOrder()
  })

  it('blocks checkout while a shipment has no items', function () {
    expect(hasEmptySplit()).toBe(true)
    expect(shippingReady()).toBe(false)
  })

  it('Shipping and Review drop the empty shipment and keep the filled one', function () {
    removeEmptySplits()
    expect(store.order.splits.length).toBe(1)
    expect(store.order.splits[0].itemIds).toContain('line-1')
    expect(hasEmptySplit()).toBe(false)
    expect(shippingReady()).toBe(true)
  })
  it('keeps the only shipment even when it is empty', function () {
    removeLineFromSplit(store.order.splits[0], 'line-1')
    removeEmptySplits()
    expect(store.order.splits.length).toBe(1)
  })
})

describe('Proof: edited line removed from the cart', function () {
  beforeEach(function () {
    seedCart()
    store.proof = null
    store.editLineId = null
  })
  afterEach(function () {
    clearCart()
    store.proof = null
    store.editLineId = null
  })

  it('drops the edit link when the line is removed', function () {
    setEditLineId('line-1')
    setProof({ code: 'BCAD-PL-ENG', language: 'English', details: CARD })
    removeLine('line-1')
    expect(store.editLineId).toBe(null)
    expect(store.proof.editLineId).toBe(null)
  })

  it('adds the approved card as a new line instead of doing nothing', function () {
    setEditLineId('line-1')
    setProof({ code: 'BCAD-PL-ENG', language: 'English', details: CARD })
    store.cart = []
    addProofToCart()
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].details.name).toBe(CARD.name)
  })
})

describe('Manage Titles rename', function () {
  var saved
  beforeEach(function () {
    saved = store.titles
    store.titles = ['Advisor', 'Director']
  })
  afterEach(function () {
    store.titles = saved
  })

  it('does not rename a title onto one that already exists', function () {
    expect(updateTitle(0, 'Director', 'EN')).toBe(false)
    expect(store.titles).toEqual(['Advisor', 'Director'])
  })
})

describe('nav.go to the current page', function () {
  it('does not reject with NavigationDuplicated', async function () {
    Vue.use(VueRouter)
    var router = new VueRouter({
      mode: 'abstract',
      routes: [{ path: '/', name: 'catalog', component: { render: (h) => h('div') } }],
    })
    bindRouter(router)
    await router.push('/')
    var unhandled = []
    var onRejection = function (reason) {
      unhandled.push(reason)
    }
    process.on('unhandledRejection', onRejection)
    go('catalog')
    await new Promise((resolve) => setTimeout(resolve, 20))
    process.off('unhandledRejection', onRejection)
    bindRouter(null)
    expect(unhandled).toEqual([])
  })
})
