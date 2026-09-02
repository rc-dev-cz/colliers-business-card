import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Vue from 'vue'
import { createLocalVue, mount } from '@vue/test-utils'
import OrderHistoryPage from './OrderHistoryPage.vue'
import { store, loadAdminOrders, loadProfileCollections } from '../store'
import { seedOrderHistory } from '../helpers/orderHistory'

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
      const personal = seedOrderHistory()
      expect(personal[0].id).toBe('ORD-1001')
      expect(wrapper.text()).toContain('ORD-1001')
      expect(wrapper.text()).toContain('500')
      expect(wrapper.text()).not.toContain('ORD-8472')
    })
  })
})
