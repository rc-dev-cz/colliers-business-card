import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import AddressBookPage from './AddressBookPage.vue'
import { clearCart, clearOrder, startNewAddressForShipping, store, syncAssignments } from '../store'
import { makeLine } from '../helpers/cart'
import { TEST_HOME, TEST_OFFICE, resetAddressBookStore } from '../test/resetStore'

const localVue = createLocalVue()

function mountPage() {
  return mount(AddressBookPage, {
    localVue: localVue,
    stubs: { ColliersPageShell: { template: '<div><slot /></div>' } },
  })
}

function setField(wrapper, id, value) {
  const input = wrapper.find('#' + id)
  input.element.value = value
  input.trigger('input')
}

describe('Shipping "+ Add new address" round trip (BUG-20)', function () {
  beforeEach(function () {
    resetAddressBookStore({ personal: [TEST_HOME], offices: [TEST_OFFICE] })
    clearCart()
    clearOrder()
    store.cart = [makeLine({ id: 'line-1', code: 'BCAD-PL-ENG', language: 'English', details: {} })]
    syncAssignments()
    window.location.hash = '#/shipping'
    startNewAddressForShipping(store.order.splits[0].id)
  })
  afterEach(function () {
    store.pendingAddressSplitId = null
    clearCart()
    clearOrder()
  })

  it('opens the new-address form straight away', async function () {
    expect(window.location.hash).toBe('#/address-book')
    const wrapper = mountPage()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#addr-nickname').exists()).toBe(true)
  })

  it('Save adds the address to that shipment and returns to Shipping', async function () {
    const wrapper = mountPage()
    await wrapper.vm.$nextTick()
    setField(wrapper, 'addr-nickname', 'Cabin')
    setField(wrapper, 'addr-street', '1 Pine Road')
    setField(wrapper, 'addr-city', 'Banff')
    wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    const locations = store.order.splits[0].locations
    expect(locations.length).toBe(1)
    expect(locations[0].address).toContain('1 Pine Road')
    expect(locations[0].qty).toBe(1)
    expect(store.pendingAddressSplitId).toBe(null)
    expect(window.location.hash).toBe('#/shipping')
  })

  it('Cancel goes back to Shipping and adds nothing', async function () {
    const wrapper = mountPage()
    wrapper.vm.onFormClose()
    await wrapper.vm.$nextTick()
    expect(store.order.splits[0].locations).toEqual([])
    expect(store.pendingAddressSplitId).toBe(null)
    expect(window.location.hash).toBe('#/shipping')
  })
})
