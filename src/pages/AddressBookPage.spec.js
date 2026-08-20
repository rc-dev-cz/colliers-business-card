import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import AddressBookPage from './AddressBookPage.vue'
import { store } from '../store'
import { TEST_HOME, TEST_OFFICE, TEST_TEMP, resetAddressBookStore } from '../test/resetStore'

const localVue = createLocalVue()

function mountPage() {
  return mount(AddressBookPage, {
    localVue: localVue,
    stubs: {
      ColliersPageShell: { template: '<div class="shell-stub"><slot /></div>' },
    },
  })
}

function buttonByText(wrapper, text) {
  const nodes = wrapper.findAll('button')
  for (let i = 0; i < nodes.length; i += 1) {
    if (nodes.at(i).text().indexOf(text) !== -1) return nodes.at(i)
  }
  return null
}

function setField(wrapper, id, value) {
  const input = wrapper.find('#' + id + ' input')
  input.element.value = value
  input.trigger('input')
}

describe('AddressBookPage', function () {
  beforeEach(function () {
    resetAddressBookStore({
      personal: [TEST_HOME, TEST_TEMP],
      offices: [TEST_OFFICE],
    })
  })

  afterEach(function () {
    vi.restoreAllMocks()
  })

  it('AB-01 page opens with two tabs', function () {
    const wrapper = mountPage()
    const html = wrapper.text()
    expect(html).toContain('My Address Book')
    expect(html).toContain('Office Addresses')
  })

  it('AB-02 My tab lists only personal rows', function () {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('Home Office')
    expect(wrapper.text()).toContain('Temporary Location')
    expect(wrapper.text()).not.toContain('Burlington Office')
  })

  it('AB-03 on My tab, + New Address is visible', function () {
    const wrapper = mountPage()
    const btn = buttonByText(wrapper, '+ New Address')
    expect(btn).not.toBe(null)
    expect(btn.isVisible()).toBe(true)
  })

  it('AB-04 + New Address opens the form modal', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, '+ New Address').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.find('#addr-nickname').exists()).toBe(true)
  })

  it('AB-05 Save creates a personal address', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, '+ New Address').trigger('click')
    await wrapper.vm.$nextTick()
    setField(wrapper, 'addr-nickname', 'Cabin')
    setField(wrapper, 'addr-street', '1 Pine Road')
    setField(wrapper, 'addr-city', 'Banff')
    wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Cabin')
    expect(wrapper.text()).toContain('Banff')
  })

  it('AB-06 saved row is personal, not an office', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, '+ New Address').trigger('click')
    await wrapper.vm.$nextTick()
    setField(wrapper, 'addr-nickname', 'Cabin')
    setField(wrapper, 'addr-street', '1 Pine Road')
    setField(wrapper, 'addr-city', 'Banff')
    wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Cabin')
    expect(store.personalAddresses.some(function (row) {
      return row.addressName === 'Cabin'
    })).toBe(true)
    expect(store.offices.some(function (row) {
      return row.addressName === 'Cabin'
    })).toBe(false)
  })

  it('AB-07 form uses Canada labels / default', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, '+ New Address').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Province')
    expect(wrapper.text()).toContain('Postal code')
    expect(wrapper.vm.form.addressCountry).toBe('Canada')
  })

  it('AB-08 Edit opens modal with that row filled', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Edit').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.vm.form.addressName).toBe('Home Office')
    expect(wrapper.vm.form.addressStreet).toBe('100 King Street West')
    expect(wrapper.vm.form.addressCity).toBe('Toronto')
  })

  it('AB-09 Save on edit updates only that row', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Edit').trigger('click')
    await wrapper.vm.$nextTick()
    setField(wrapper, 'addr-nickname', 'Home')
    wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(store.personalAddresses[0].addressName).toBe('Home')
    expect(store.personalAddresses[1].addressName).toBe('Temporary Location')
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Temporary Location')
  })

  it('AB-10 Delete shows confirm', function () {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = mountPage()
    buttonByText(wrapper, 'Delete').trigger('click')
    expect(confirmSpy).toHaveBeenCalled()
    expect(String(confirmSpy.mock.calls[0][0])).toContain('Delete this personal address')
  })

  it('AB-11 Cancel on confirm keeps the row', function () {
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    const wrapper = mountPage()
    buttonByText(wrapper, 'Delete').trigger('click')
    expect(store.personalAddresses.length).toBe(2)
    expect(wrapper.text()).toContain('Home Office')
  })

  it('AB-12 Confirm delete removes the row', async function () {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = mountPage()
    buttonByText(wrapper, 'Delete').trigger('click')
    await wrapper.vm.$nextTick()
    expect(store.personalAddresses.some(function (row) {
      return row.id === TEST_HOME.id
    })).toBe(false)
    expect(wrapper.text()).not.toContain('Home Office')
    expect(wrapper.text()).toContain('Temporary Location')
  })

  it('AB-13 Office tab shows Colliers offices', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Burlington Office')
    expect(wrapper.text()).toContain('5515 North Service Road')
  })

  it('AB-14 on Office tab, + New Address is hidden', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    expect(buttonByText(wrapper, '+ New Address')).toBe(null)
  })

  it('AB-15 cannot edit an office here', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    expect(buttonByText(wrapper, 'Edit')).toBe(null)
  })

  it('AB-16 cannot delete an office here', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    expect(buttonByText(wrapper, 'Delete')).toBe(null)
  })

  it('AB-17 Office tab does not create company offices', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    const before = store.offices.length
    expect(buttonByText(wrapper, '+ New Address')).toBe(null)
    expect(store.offices.length).toBe(before)
  })

  it('AB-18 Search on My tab filters personal list', async function () {
    const wrapper = mountPage()
    setField(wrapper, 'address-search', 'Home')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Home Office')
    expect(wrapper.text()).not.toContain('Temporary Location')
  })

  it('AB-19 Clear search on My tab', async function () {
    const wrapper = mountPage()
    setField(wrapper, 'address-search', 'Home')
    await wrapper.vm.$nextTick()
    setField(wrapper, 'address-search', '')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Home Office')
    expect(wrapper.text()).toContain('Temporary Location')
  })

  it('AB-20 Search on Office tab filters offices', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    setField(wrapper, 'address-search', 'Burlington')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Burlington Office')
    setField(wrapper, 'address-search', 'zzzz-no-match')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Burlington Office')
  })

  it('AB-21 Clear search on Office tab', async function () {
    const wrapper = mountPage()
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    setField(wrapper, 'address-search', 'zzzz-no-match')
    await wrapper.vm.$nextTick()
    setField(wrapper, 'address-search', '')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Burlington Office')
  })

  it('AB-22 same search box filters the active tab', async function () {
    const wrapper = mountPage()
    setField(wrapper, 'address-search', 'Home')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Home Office')
    expect(wrapper.text()).not.toContain('Temporary Location')
    buttonByText(wrapper, 'Office Addresses').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Burlington Office')
    expect(wrapper.text()).not.toContain('Home Office')
    setField(wrapper, 'address-search', 'L7L')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Burlington Office')
  })
})
