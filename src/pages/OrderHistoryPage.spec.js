import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import { createLocalVue, mount } from '@vue/test-utils'
import OrderHistoryPage from './OrderHistoryPage.vue'
import { store, loadAdminOrders, loadProfileCollections } from '../store'
import { seedOrderHistory } from '../helpers/orderHistory'
import { go } from '../adapters/nav'

vi.mock('../adapters/nav', function () {
  return { go: vi.fn() }
})

const localVue = createLocalVue()

function mountPage(routeName) {
  return mount(OrderHistoryPage, {
    localVue: localVue,
    mocks: {
      $route: { name: routeName || 'history' },
    },
    stubs: {
      ColliersPageShell: { template: '<div class="shell-stub"><slot /></div>' },
    },
  })
}

describe('OrderHistoryPage', function () {
  describe('admin company orders', function () {
    beforeEach(function () {
      Vue.set(store, 'session', { email: 'admin@colliers.com', role: 'admin', loggedInAt: 1 })
      loadAdminOrders()
    })

    afterEach(function () {
      vi.restoreAllMocks()
    })

    it('OH-P01 admin route shows company orders with card quantity', function () {
      const wrapper = mountPage('admin-orders')
      const html = wrapper.text()
      expect(html).toContain('ORD-8472')
      expect(html).toContain('Alex Johnson')
      expect(html).toContain('Business Card English')
      expect(html).toContain('500')
      expect(html).toContain('Back to Dashboard')
    })

    it('OH-P02 View shows full order details with quantity and total', async function () {
      const wrapper = mountPage('admin-orders')
      const viewBtn = wrapper.findAll('button').filter(function (btn) {
        return btn.text().trim() === 'View'
      })
      viewBtn.at(0).trigger('click')
      await wrapper.vm.$nextTick()
      const dialog = wrapper.find('[role="dialog"]')
      const text = dialog.text()
      expect(text).toContain('Quantity')
      expect(text).toContain('500')
      expect(text).toContain('$126.00')
      expect(text).toContain('Burlington')
    })

    it('OH-P04 phone cards: each order has its own Repeat Order and View (BUG-24)', function () {
      const wrapper = mountPage('admin-orders')
      const cards = wrapper.findAll('ul.sm\\:hidden > li')
      expect(cards.length).toBeGreaterThan(0)
      const first = cards.at(0)
      expect(first.text()).toContain('ORD-')
      const labels = first.findAll('button').wrappers.map(function (b) {
        return b.text().trim()
      })
      expect(labels).toEqual(['Repeat Order', 'View'])
    })

    it('OH-P03 profile route for admin still shows company orders', function () {
      const wrapper = mountPage('history')
      expect(wrapper.text()).toContain('ORD-8472')
      expect(wrapper.text()).not.toContain('Back to Dashboard')
    })
  })

  describe('personal orders', function () {
    beforeEach(function () {
      Vue.set(store, 'session', { email: 'demo@colliers.com', role: 'user', loggedInAt: 1 })
      loadProfileCollections()
    })

    it('OH-P04 personal route shows card quantity not box count', function () {
      const wrapper = mountPage('history')
      const ids = seedOrderHistory().map((row) => row.id)
      expect(ids).toContain('ORD-1001')
      expect(wrapper.text()).toContain('ORD-1001')
      expect(wrapper.text()).toContain('ORD-1006')
      expect(wrapper.text()).toContain('500')
      expect(wrapper.text()).not.toContain('ORD-8472')
    })

    it('OH-P05 an order with no cards is not listed (QA BUG-005)', function () {
      store.orderHistory.push({ id: 'ORD-EMPTY', date: '2026-11-01', status: 'Ordered', cart: [] })
      const wrapper = mountPage('history')
      expect(wrapper.text()).toContain('ORD-1001')
      expect(wrapper.text()).not.toContain('ORD-EMPTY')
    })
  })

  describe('Repeat Order', function () {
    function repeatButton(wrapper) {
      return wrapper
        .findAll('button')
        .filter(function (btn) {
          return btn.text().trim() === 'Repeat Order'
        })
        .at(0)
    }

    function buttonByText(wrapper, label) {
      return wrapper
        .findAll('button')
        .filter(function (btn) {
          return btn.text().trim() === label
        })
        .at(0)
    }

    var existing = {
      id: 'in-cart-1',
      code: 'BCAD-PL-ENG',
      language: 'English',
      quantity: 1,
      details: { name: 'Firstname Lastname' },
    }

    beforeEach(function () {
      Vue.set(store, 'session', { email: 'demo@colliers.com', role: 'user', loggedInAt: 1 })
      loadProfileCollections()
      store.cart.splice(0, store.cart.length)
      store.repeatNotice = null
      go.mockClear()
    })

    it('OH-P06 empty cart: copies the order and opens Shipping with new line ids', async function () {
      const wrapper = mountPage('history')
      repeatButton(wrapper).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('Replace your cart?')
      expect(go).toHaveBeenCalledWith('shipping')
      const source = seedOrderHistory()[0]
      expect(store.repeatNotice.orderId).toBe(source.id)
      expect(store.cart.length).toBe(source.cart.length)
      expect(store.cart[0].id).not.toBe(source.cart[0].id)
      expect(store.order.splits).toHaveLength(source.order.splits.length)
    })

    it('OH-P07 cart has cards: asks first, Cancel keeps the cart', async function () {
      store.cart.push(Object.assign({}, existing))
      const wrapper = mountPage('history')
      repeatButton(wrapper).trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Replace your cart?')
      expect(wrapper.text()).toContain('Your cart has 1 item(s)')
      buttonByText(wrapper, 'Cancel').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).not.toContain('Replace your cart?')
      expect(go).not.toHaveBeenCalled()
      expect(store.cart.map((l) => l.id)).toEqual(['in-cart-1'])
    })

    it('OH-P08 cart has cards: Replace cart copies the order and opens Shipping', async function () {
      store.cart.push(Object.assign({}, existing))
      const wrapper = mountPage('history')
      repeatButton(wrapper).trigger('click')
      await wrapper.vm.$nextTick()
      buttonByText(wrapper, 'Replace cart').trigger('click')
      await wrapper.vm.$nextTick()
      expect(go).toHaveBeenCalledWith('shipping')
      expect(store.cart.map((l) => l.id)).not.toContain('in-cart-1')
      expect(store.cart.length).toBe(seedOrderHistory()[0].cart.length)
    })
  })
})
