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
})
