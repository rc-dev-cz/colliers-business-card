import { describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import MultiSelectField from './MultiSelectField.vue'

const localVue = createLocalVue()

describe('MultiSelectField', function () {
  it('locks only unavailable unselected values and keeps selected values removable', async function () {
    var wrapper = mount(MultiSelectField, {
      localVue: localVue,
      propsData: {
        value: ['PMP'],
        options: [
          { value: 'PMP', label: 'PMP' },
          { value: 'BSc Civil Engineering', label: 'BSc Civil Engineering' },
        ],
        lockedValues: ['BSc Civil Engineering'],
      },
    })

    expect(wrapper.vm.isLocked({ value: 'PMP' })).toBe(false)
    expect(wrapper.vm.isLocked({ value: 'BSc Civil Engineering' })).toBe(true)

    wrapper.vm.toggleOption({ value: 'BSc Civil Engineering' })
    expect(wrapper.emitted().locked[0]).toEqual(['BSc Civil Engineering'])
    expect(wrapper.emitted().input).toBeUndefined()

    wrapper.vm.toggleOption({ value: 'PMP' })
    expect(wrapper.emitted().input[0]).toEqual([[]])
  })

  function field(props) {
    return mount(MultiSelectField, {
      localVue: localVue,
      propsData: Object.assign(
        {
          value: [],
          options: [
            { value: 'P. Eng.', label: 'P. Eng.' },
            { value: 'PMP', label: 'PMP' },
            { value: 'LEED AP BD+C', label: 'LEED AP BD+C' },
          ],
        },
        props || {}
      ),
    })
  }

  it('closes and clears the search after a pick made from a search (BUG-09)', async function () {
    var wrapper = field()
    wrapper.vm.toggle()
    wrapper.setData({ query: 'P. E' })
    await wrapper.vm.$nextTick()
    wrapper.vm.toggleOption({ value: 'P. Eng.' })
    expect(wrapper.emitted().input[0]).toEqual([['P. Eng.']])
    expect(wrapper.vm.open).toBe(false)
    expect(wrapper.vm.query).toBe('')
  })

  it('also closes after a searched pick of a locked option, so its message shows', function () {
    var wrapper = field({ lockedValues: ['LEED AP BD+C'] })
    wrapper.vm.toggle()
    wrapper.setData({ query: 'LEED' })
    wrapper.vm.toggleOption({ value: 'LEED AP BD+C' })
    expect(wrapper.emitted().locked[0]).toEqual(['LEED AP BD+C'])
    expect(wrapper.vm.open).toBe(false)
  })

  it('also closes after a pick made by scrolling, so messages under the field show', function () {
    var wrapper = field()
    wrapper.vm.toggle()
    wrapper.vm.toggleOption({ value: 'PMP' })
    expect(wrapper.emitted().input[0]).toEqual([['PMP']])
    expect(wrapper.vm.open).toBe(false)
  })

  it('closes after a click on a locked option without a search', function () {
    var wrapper = field({ lockedValues: ['LEED AP BD+C'] })
    wrapper.vm.toggle()
    wrapper.vm.toggleOption({ value: 'LEED AP BD+C' })
    expect(wrapper.emitted().locked[0]).toEqual(['LEED AP BD+C'])
    expect(wrapper.vm.open).toBe(false)
  })

  it('shows the warning in yellow, and only when there is no error', async function () {
    var wrapper = field({ warning: 'Little space left' })
    expect(wrapper.find('p.text-amber-700').text()).toBe('Little space left')
    wrapper.setProps({ error: 'No more space' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('p.text-amber-700').exists()).toBe(false)
    expect(wrapper.find('p.text-red-600').text()).toBe('No more space')
  })

  it('locked options carry the "too long" tooltip', async function () {
    var wrapper = field({
      lockedValues: ['LEED AP BD+C'],
      lockedTitle: 'Too long to fit on the card',
    })
    wrapper.vm.toggle()
    await wrapper.vm.$nextTick()
    var rows = wrapper.findAll('li[role="option"]')
    var leed = rows.filter(function (r) {
      return r.text() === 'LEED AP BD+C'
    })
    expect(leed.at(0).attributes('title')).toBe('Too long to fit on the card')
    var pmp = rows.filter(function (r) {
      return r.text() === 'PMP'
    })
    expect(pmp.at(0).attributes('title')).toBeUndefined()
  })
})
