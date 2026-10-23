import { describe, expect, it } from 'vitest'
import { regionForCard, regionOptions } from './canadianProvinces.js'
import { cardFaceTitles, resolveCardFields } from './cardLayout.js'

describe('French region names (BUG-10)', function () {
  it('prints the French name on a French face only', function () {
    expect(regionForCard('Quebec', true)).toBe('Québec')
    expect(regionForCard('Prince Edward Island', true)).toBe('Île-du-Prince-Édouard')
    expect(regionForCard('Newfoundland and Labrador', true)).toBe('Terre-Neuve-et-Labrador')
    expect(regionForCard('Quebec', false)).toBe('Quebec')
    expect(regionForCard('', true)).toBe('')
  })

  it('lists French labels in FR and keeps the English value', function () {
    var quebec = regionOptions('FR').find(function (row) {
      return row.value === 'Quebec'
    })
    expect(quebec.label).toBe('Québec')
    expect(
      regionOptions('EN').find(function (row) {
        return row.value === 'Quebec'
      }).label
    ).toBe('Quebec')
  })

  it('French card and the bilingual French face use the French region', function () {
    var details = { title: 'Director', titleFr: 'Directrice', region: 'Quebec' }
    expect(resolveCardFields({ title: 'Directrice', region: 'Quebec' }, 'French').title).toBe(
      'Directrice | Québec'
    )
    expect(cardFaceTitles(details, 'Bilingual')).toEqual([
      'Director | Quebec',
      'Directrice | Québec',
    ])
  })
})
