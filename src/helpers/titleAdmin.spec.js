import { describe, expect, it } from 'vitest'
import { jobTitlesEn, jobTitlesFr } from '../data/products.js'
import { titlesForProductLanguage } from './titleAdmin.js'

describe('titlesForProductLanguage', function () {
  it('returns English titles for bilingual Customize', function () {
    expect(titlesForProductLanguage('Bilingual', [], [])).toEqual(jobTitlesEn)
    expect(titlesForProductLanguage('Bilingual', [], [])).toHaveLength(31)
    expect(titlesForProductLanguage('Bilingual', [], [])).not.toContain('Directrice')
  })

  it('returns English titles for English Customize', function () {
    expect(titlesForProductLanguage('English', jobTitlesEn, jobTitlesFr)).toEqual(jobTitlesEn)
  })

  it('returns French titles for French-only Customize', function () {
    expect(titlesForProductLanguage('French', jobTitlesEn, [])).toEqual(jobTitlesFr)
    expect(titlesForProductLanguage('French', [], [])).toHaveLength(8)
    expect(titlesForProductLanguage('French', [], [])).toContain('Chef d’équipe')
  })

  it('prefers the managed list for the card language', function () {
    expect(titlesForProductLanguage('Bilingual', ['Managing Director', 'Broker'], [])).toEqual([
      'Managing Director',
      'Broker',
    ])
    expect(titlesForProductLanguage('French', ['Broker'], ['Courtier'])).toEqual(['Courtier'])
  })
})
