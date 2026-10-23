import { describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import PhoneField from './PhoneField.vue'

const localVue = createLocalVue()

function typeInto(text) {
  var wrapper = mount(PhoneField, { localVue: localVue, propsData: { value: '' } })
  var input = wrapper.find('input')
  input.element.value = text
  input.trigger('input')
  return wrapper
}

describe('PhoneField', function () {
  it('turns +1 416 555 0199 into 416 555 0199 (BUG-02)', function () {
    expect(typeInto('+1 416 555 0199').emitted().input[0]).toEqual(['416 555 0199'])
  })

  it('accepts a pasted (416) 555-0199 whole (BUG-04)', function () {
    var wrapper = typeInto('(416) 555-0199')
    expect(wrapper.find('input').attributes('maxlength')).toBeUndefined()
    expect(wrapper.emitted().input[0]).toEqual(['416 555 0199'])
  })
})
