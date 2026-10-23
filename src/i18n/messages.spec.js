import { describe, expect, it } from 'vitest'
import { languageLabel, messages } from './messages.js'

function translate(locale) {
  return function (key) {
    return messages[key][locale]
  }
}

describe('languageLabel (BUG-13)', function () {
  it('translates the card language in FR', function () {
    expect(languageLabel('English', translate('FR'))).toBe('Anglais')
    expect(languageLabel('French', translate('FR'))).toBe('Français')
    expect(languageLabel('Bilingual', translate('FR'))).toBe('Bilingue')
  })

  it('keeps English labels in EN and passes unknown values through', function () {
    expect(languageLabel('English', translate('EN'))).toBe('English')
    expect(languageLabel('Klingon', translate('FR'))).toBe('Klingon')
    expect(languageLabel('', translate('FR'))).toBe('')
  })
})
