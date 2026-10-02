import { describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import CardPreview from './CardPreview.vue'
import { loadLayoutFonts } from '../helpers/cardFonts'
import { planProductLayout } from '../helpers/cardLayout'

const localVue = createLocalVue()

var longCredDetails = {
  name: 'Carlos Zabaleta Copa',
  title: 'Associate',
  region: 'Ontario',
  specializedTeam: 'Specialized Team',
  degree: ['Arch. Tech'],
  additionalCredentials: 'Additional Credentials',
  email: 'carlos.zabaleta@raymentcollins.com',
  phone: '6479179683',
  address: '202-485 Pinebush Road\nCambridge, ON\nN1T 0A6 Canada',
}

describe('CardPreview', function () {
  it('uses the approved layout planner when no plan prop is passed', async function () {
    var fonts = await loadLayoutFonts()
    var product = planProductLayout(longCredDetails, 'French', fonts)
    expect(product.pages[0].layout.credMode).toBe('own-row')

    var wrapper = mount(CardPreview, {
      localVue: localVue,
      propsData: {
        details: longCredDetails,
        language: 'French',
      },
    })
    await wrapper.vm.$nextTick()
    await new Promise(function (resolve) {
      setTimeout(resolve, 0)
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.view.credMode).toBe('own-row')
    expect(wrapper.vm.view.credentialLine).toBeTruthy()
    expect(wrapper.vm.view.inlineCredential).toBe('')
    expect(wrapper.text()).toContain('Arch. Tech')
    expect(wrapper.text()).toContain('Additional Credentials')
  })
})
