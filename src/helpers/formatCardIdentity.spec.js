import { describe, expect, it } from 'vitest'
import {
  formatCredentialSuffix,
  formatNameLine,
  formatTitleLine,
  isBilingualLanguage,
  isFrenchLanguage,
  websiteForProduct,
  WEBSITE_EN,
  WEBSITE_FR,
} from './formatCardIdentity.js'

describe('formatCredentialSuffix', function () {
  it('joins degree array and additional credentials', function () {
    expect(formatCredentialSuffix(['Arch. Tech', 'Architect'], 'C.M.')).toBe(
      'Arch. Tech, Architect, C.M.',
    )
  })

  it('handles string degree and empty extra', function () {
    expect(formatCredentialSuffix('P.Eng', '')).toBe('P.Eng')
    expect(formatCredentialSuffix('', 'C.M.')).toBe('C.M.')
    expect(formatCredentialSuffix([], '')).toBe('')
  })
})

describe('formatNameLine', function () {
  it('builds Name, degrees, additional credentials', function () {
    expect(formatNameLine('Firstname Lastname', ['Arch. Tech', 'Architect'], 'C.M.')).toBe(
      'Firstname Lastname, Arch. Tech, Architect, C.M.',
    )
  })

  it('returns name only when no credentials', function () {
    expect(formatNameLine('Ada Lovelace', [], '')).toBe('Ada Lovelace')
  })

  it('returns empty when nothing set', function () {
    expect(formatNameLine('', [], '')).toBe('')
  })
})

describe('formatTitleLine', function () {
  it('uses region field, not a pipe suffix in the title', function () {
    expect(formatTitleLine('Broker | Canada', 'USA', 'Title', 'Region')).toBe('Broker | USA')
  })

  it('joins plain title and region', function () {
    expect(formatTitleLine('Broker', 'USA', 'Title', 'Region')).toBe('Broker | USA')
  })

  it('shows title alone when region is empty', function () {
    expect(formatTitleLine('Broker | Canada', '', 'Title', 'Region')).toBe('Broker')
  })

  it('falls back to sample title and region when both empty', function () {
    expect(formatTitleLine('', '', 'Title', 'Region')).toBe('Title | Region')
  })
})

describe('language helpers', function () {
  it('detects French and bilingual', function () {
    expect(isFrenchLanguage('French')).toBe(true)
    expect(isFrenchLanguage('English')).toBe(false)
    expect(isBilingualLanguage('Bilingual')).toBe(true)
    expect(isBilingualLanguage('English')).toBe(false)
  })

  it('locks website by product language', function () {
    expect(websiteForProduct('English')).toBe(WEBSITE_EN)
    expect(websiteForProduct('Bilingual')).toBe(WEBSITE_EN)
    expect(websiteForProduct('French')).toBe(WEBSITE_FR)
  })
})
