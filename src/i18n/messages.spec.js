import { describe, expect, it } from 'vitest'
import { formatMoney, languageLabel, messages } from './messages.js'

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

describe('formatMoney (FR price format)', function () {
  it('EN: $63.00, with thousands separator', function () {
    expect(formatMoney(63, 'EN')).toBe('$63.00')
    expect(formatMoney(1263, 'EN')).toBe('$1,263.00')
  })

  it('FR: 63,00 $ with non-breaking spaces', function () {
    expect(formatMoney(63, 'FR')).toBe('63,00\u00a0$')
    expect(formatMoney(1263, 'FR')).toBe('1\u00a0263,00\u00a0$')
    expect(formatMoney('126', 'FR')).toBe('126,00\u00a0$')
  })
})
