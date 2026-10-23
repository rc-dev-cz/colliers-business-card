import { describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import AdminStringListPanel from './AdminStringListPanel.vue'

const localVue = createLocalVue()

function panel(validate) {
  return mount(AdminStringListPanel, {
    localVue: localVue,
    propsData: {
      items: ['Director'],
      placeholder: 'Enter new English title...',
      emptyLabel: 'None',
      addLabel: 'Add',
      editLabel: 'Edit',
      deleteLabel: 'Delete',
      confirmDeleteMessage: 'Remove?',
      validate: validate,
    },
  })
}

function tooLong(value) {
  return Promise.resolve(value.length > 20 ? 'This title is too long.' : '')
}

describe('AdminStringListPanel validate', function () {
  it('refuses an add: no event, the text stays, the message shows', async function () {
    var wrapper = panel(tooLong)
    wrapper.setData({ newValue: 'A title that is far too long' })
    await wrapper.vm.onAdd()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted().add).toBeUndefined()
    expect(wrapper.vm.newValue).toBe('A title that is far too long')
    expect(wrapper.text()).toContain('This title is too long.')
  })

  it('adds a value that passes and clears the input', async function () {
    var wrapper = panel(tooLong)
    wrapper.setData({ newValue: 'Manager' })
    await wrapper.vm.onAdd()
    expect(wrapper.emitted().add[0]).toEqual(['Manager'])
    expect(wrapper.vm.newValue).toBe('')
  })

  it('refuses a rename that does not pass and keeps the edit open', async function () {
    var wrapper = panel(tooLong)
    wrapper.vm.startEdit('Director')
    wrapper.setData({ editValue: 'Director of a very long department' })
    await wrapper.vm.saveEdit()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted().update).toBeUndefined()
    expect(wrapper.vm.editingKey).toBe('Director')
    expect(wrapper.text()).toContain('This title is too long.')
  })

  it('works without validate (Manage Credentials)', async function () {
    var wrapper = panel(null)
    wrapper.setData({ newValue: 'A credential with any length at all' })
    await wrapper.vm.onAdd()
    expect(wrapper.emitted().add[0]).toEqual(['A credential with any length at all'])
  })
})
