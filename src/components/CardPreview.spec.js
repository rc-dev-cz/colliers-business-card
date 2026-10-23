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

  it('omits empty specialized team even when title is still empty, matching print', function () {
    var wrapper = mount(CardPreview, {
      localVue: localVue,
      propsData: {
        details: {
          name: 'Carlos Zabaleta Copa',
          title: '',
          region: 'Ontario',
          specializedTeam: '',
        },
        language: 'English',
        placeholders: true,
      },
    })
    expect(wrapper.vm.view.team).toBe('')
    expect(wrapper.text()).not.toContain('Specialized team')
    // Placeholder title and region share one line when they fit
    expect(wrapper.vm.view.title).toBe('Title | Ontario')
    expect(wrapper.vm.view.regionLine).toBeFalsy()
    expect(wrapper.vm.view.titleY).toBeCloseTo(58.99, 2)
    expect(wrapper.vm.view.emailY).toBe(43)
    expect(wrapper.vm.view.phoneY).toBe(35)
    expect(wrapper.vm.view.websiteY).toBe(27)
  })

  it('keeps print contact spacing when specialized team is filled', async function () {
    var fonts = await loadLayoutFonts()
    var product = planProductLayout(longCredDetails, 'French', fonts)
    var printEmailY = product.pages[0].layout.emailY

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

    expect(wrapper.vm.view.team).toBe('Specialized Team | Ontario')
    expect(wrapper.vm.view.regionLine).toBeFalsy()
    expect(wrapper.vm.view.emailY).toBe(printEmailY)
    expect(wrapper.vm.view.emailY).toBe(43)
    expect(wrapper.vm.view.phoneY).toBe(35)
    expect(wrapper.vm.view.websiteY).toBe(27)
  })

  it('sizes type from print points on the 252 pt trim', async function () {
    var wrapper = mount(CardPreview, {
      localVue: localVue,
      propsData: {
        details: longCredDetails,
        language: 'English',
      },
    })
    expect(wrapper.vm.nameLineStyle(0).fontSize).toBe((10 / 252) * 100 + 'cqw')
    expect(wrapper.vm.rowStyle(50, true).fontSize).toBe((7 / 252) * 100 + 'cqw')
    expect(wrapper.vm.rowStyle(50, false).fontSize).toBe((6.5 / 252) * 100 + 'cqw')
    expect(wrapper.vm.addressStyle.fontSize).toBe((6.5 / 252) * 100 + 'cqw')
  })

  it('mirrors EN and FR bilingual faces: region joins the team line', async function () {
    var details = {
      name: 'Firstname Lastname',
      title: 'Talent Acquisition Business Partner',
      region: 'Ontario',
      specializedTeam: 'human resources',
    }
    var faces = ['English', 'French'].map(function (language) {
      return mount(CardPreview, { localVue: localVue, propsData: { details: details, language } })
    })
    await faces[0].vm.$nextTick()
    await new Promise(function (resolve) {
      setTimeout(resolve, 0)
    })
    faces.forEach(function (wrapper) {
      expect(wrapper.vm.view.title).not.toContain('|')
      expect(wrapper.vm.view.team).toBe('human resources | Ontario')
      expect(wrapper.vm.view.regionLine).toBeFalsy()
    })
  })

  it('puts region on its own line when Title | Region overflows', async function () {
    var wrapper = mount(CardPreview, {
      localVue: localVue,
      propsData: {
        details: {
          name: 'Prénom Nom',
          title: 'Responsable du développement commercial',
          region: 'Quebec',
          email: 'prenom.nom@colliersprojectleaders.com',
          phone: '4165550100',
        },
        language: 'French',
      },
    })
    await wrapper.vm.$nextTick()
    await new Promise(function (resolve) {
      setTimeout(resolve, 0)
    })
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.view.title).toBe('Responsable du développement commercial')
    // French face prints the French region name (BUG-10).
    expect(wrapper.vm.view.regionLine).toBe('Québec')
    expect(wrapper.text()).toContain('Responsable du développement commercial')
    expect(wrapper.text()).toContain('Québec')
    expect(wrapper.text()).not.toContain('Quebec')
  })
})
