import { describe, expect, it } from 'vitest'
import { jobTitlesEn, jobTitlesFr } from '../data/products.js'
import { titlesForProductLanguage } from './titleAdmin.js'

describe('titlesForProductLanguage', function () {
  it('returns English titles for bilingual Customize', function () {
    expect(titlesForProductLanguage('Bilingual', [])).toEqual(jobTitlesEn)
    expect(titlesForProductLanguage('Bilingual', [])[0]).toBe('Associate')
    expect(titlesForProductLanguage('Bilingual', [])).not.toContain(
      'Responsable du développement commercial'
    )
  })

  it('returns English titles for English Customize', function () {
    expect(titlesForProductLanguage('English', jobTitlesEn)).toEqual(jobTitlesEn)
  })

  it('returns French titles for French-only Customize', function () {
    expect(titlesForProductLanguage('French', jobTitlesEn)).toEqual(jobTitlesFr)
    expect(titlesForProductLanguage('French', [])[0]).toBe(
      'Responsable du développement commercial'
    )
  })

  it('prefers managed English titles for bilingual when provided', function () {
    expect(titlesForProductLanguage('Bilingual', ['Managing Director', 'Broker'])).toEqual([
      'Managing Director',
      'Broker',
    ])
  })
})
