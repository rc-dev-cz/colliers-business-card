import { afterEach, describe, expect, it } from 'vitest'
import { createLocalVue, mount } from '@vue/test-utils'
import LoginPage from './LoginPage.vue'
import { setLocale, store } from '../store.js'

const localVue = createLocalVue()

describe('Login EN / FR switch (BUG-14)', function () {
  afterEach(function () {
    setLocale('EN')
  })

  it('switches the login page to French and back', async function () {
    setLocale('EN')
    var wrapper = mount(LoginPage, { localVue: localVue })
    function button(label) {
      return wrapper
        .findAll('button')
        .filter(function (b) {
          return b.text() === label
        })
        .at(0)
    }
    await button('FR').trigger('click')
    expect(store.locale).toBe('FR')
    expect(wrapper.text()).toContain('Connexion')
    expect(wrapper.text()).toContain('Mot de passe')

    await button('EN').trigger('click')
    expect(store.locale).toBe('EN')
    expect(wrapper.text()).toContain('Password')
  })
})
