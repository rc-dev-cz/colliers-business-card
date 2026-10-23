import { afterEach, describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import CartDrawer from './CartDrawer.vue'
import { clearCart, setLocale, store } from '../store.js'
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
