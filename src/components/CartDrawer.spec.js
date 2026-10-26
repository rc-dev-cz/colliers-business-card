import { afterEach, describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import CartDrawer from './CartDrawer.vue'
import { clearCart, removeLineFromSplit, setLocale, store, syncAssignments } from '../store.js'
import { makeLine } from '../helpers/cart.js'

const localVue = createLocalVue()

function openDrawer() {
  store.cart = [makeLine({ id: 'line-1', code: 'BCAD-PL-ENG', language: 'English', details: {} })]
  store.cartOpen = true
  return mount(CartDrawer, { localVue: localVue, stubs: { CardPreview: true } })
}

describe('CartDrawer shipping (BUG-07)', function () {
  afterEach(function () {
    store.cartOpen = false
    setLocale('EN')
    clearCart()
  })

  it('shows Shipping & Handling as TBD, not $0.00', function () {
    var text = openDrawer().text()
    expect(text).toContain('Shipping & Handling')
    expect(text).toContain('TBD')
    expect(text).not.toContain('$0.00')
  })

  it('shows À déterminer in FR', function () {
    setLocale('FR')
    expect(openDrawer().text()).toContain('À déterminer')
  })
})

describe('CartDrawer card off every shipment (BUG-01)', function () {
  afterEach(function () {
    store.cartOpen = false
    setLocale('EN')
    clearCart()
  })

  it('marks it "Not in a shipment" and Add back puts it on Shipment 1', async function () {
    var wrapper = openDrawer()
    syncAssignments()
    removeLineFromSplit(store.order.splits[0], 'line-1')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Not in a shipment')

    var addBack = wrapper.findAll('button').filter(function (b) {
      return b.text() === 'Add back'
    })
    await addBack.at(0).trigger('click')
    expect(store.order.splits[0].itemIds).toContain('line-1')
    expect(wrapper.text()).not.toContain('Not in a shipment')
  })

  it('shows prices in French format in FR', function () {
    setLocale('FR')
    expect(openDrawer().text()).toContain('63,00\u00a0$')
  })
})
