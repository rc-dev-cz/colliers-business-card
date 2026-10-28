import { describe, expect, it } from 'vitest'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import AdminInvoicesPage from './AdminInvoicesPage.vue'

const localVue = createLocalVue()

describe('Invoice History', function () {
  it('says there are no invoices yet when the list is empty (Klai twin: no sample invoices)', function () {
    var wrapper = shallowMount(AdminInvoicesPage, {
      localVue: localVue,
      data: function () {
        return { invoices: [] }
      },
    })
    expect(wrapper.text()).toContain('No invoices yet.')
  })
})
