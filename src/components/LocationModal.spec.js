import { describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import LocationModal from './LocationModal.vue'
import { TEST_HOME, TEST_OFFICE, TEST_TEMP } from '../test/resetStore'
import { formatAddressLine } from '../helpers/addressBook'

const localVue = createLocalVue()

function mountModal(props) {
  return mount(LocationModal, {
    localVue: localVue,
    propsData: Object.assign(
      {
        open: true,
        personalAddresses: [TEST_TEMP, TEST_HOME],
        offices: [TEST_OFFICE],
        selectedAddresses: [],
      },
      props
    ),
  })
}

function sectionNames(wrapper) {
  return wrapper.vm.visibleGroups.map(function (group) {
    return group.key + ':' + group.options.map((opt) => opt.name).join(',')
  })
}

describe('LocationModal', function () {
  it('lists My Addresses first, then Office Addresses, each sorted by name', function () {
    var wrapper = mountModal()
    expect(sectionNames(wrapper)).toEqual([
      'personal:Home Office,Temporary Location',
      'offices:Burlington Office',
    ])
  })

  it('shows an address that is both personal and an office once, under My Addresses', function () {
    var wrapper = mountModal({ personalAddresses: [TEST_OFFICE], offices: [TEST_OFFICE] })
    expect(sectionNames(wrapper)).toEqual(['personal:Burlington Office'])
  })

  it('filters both sections by name, street or city', async function () {
    var wrapper = mountModal()
    wrapper.setData({ search: 'toronto' })
    await wrapper.vm.$nextTick()
    expect(sectionNames(wrapper)).toEqual(['personal:Home Office,Temporary Location'])

    wrapper.setData({ search: 'north service' })
    await wrapper.vm.$nextTick()
    expect(sectionNames(wrapper)).toEqual(['offices:Burlington Office'])

    wrapper.setData({ search: 'nowhere' })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.visibleCount).toBe(0)
    expect(wrapper.text()).toContain('No addresses match your search.')
  })

  it('keeps a ship-to that is in neither list under Other so it can be unticked', function () {
    var wrapper = mountModal({ selectedAddresses: ['1 Old Road, Nowhere'] })
    expect(sectionNames(wrapper)).toContain('other:1 Old Road, Nowhere')
  })

  it('emits the ticked address strings on Done', async function () {
    var wrapper = mountModal({ open: false })
    await wrapper.setProps({ open: true, selectedAddresses: [formatAddressLine(TEST_OFFICE)] })
    wrapper.vm.toggle(formatAddressLine(TEST_HOME))
    wrapper.vm.done()
    expect(wrapper.emitted().done[0][0]).toEqual([
      formatAddressLine(TEST_OFFICE),
      formatAddressLine(TEST_HOME),
    ])
  })
})
