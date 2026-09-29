import { describe, expect, it } from 'vitest'
import { catalogCodeFromLine, emptyCard, getProduct, products } from './products.js'

describe('products catalogue', function () {
  it('has three language SKUs', function () {
    expect(products.map(function (row) { return row.code }).sort()).toEqual([
      'BCAD-PL-BIL',
      'BCAD-PL-ENG',
      'BCAD-PL-FR',
    ])
  })

  it('getProduct resolves by code', function () {
    expect(getProduct('BCAD-PL-ENG').language).toBe('English')
    expect(getProduct('missing')).toBe(null)
  })

  it('catalogCodeFromLine maps FileMaker codes by language', function () {
    expect(catalogCodeFromLine({ code: 'BCAD-PL-FR', language: 'French' })).toBe('BCAD-PL-FR')
    expect(catalogCodeFromLine({ code: 'CPL-13616', language: 'English' })).toBe('BCAD-PL-ENG')
    expect(catalogCodeFromLine({ code: 'CPL-13617', language: 'Bilingual' })).toBe('BCAD-PL-BIL')
  })

  it('omits unused catalogue fields', function () {
    products.forEach(function (row) {
      expect(row.longDescription).toBeUndefined()
      expect(row.productType).toBeUndefined()
      expect(row.nameKey).toBeTruthy()
      expect(row.previewKey).toBeTruthy()
    })
  })

  it('emptyCard uses a degree array and Project Leaders website', function () {
    var card = emptyCard('English')
    expect(Array.isArray(card.degree)).toBe(true)
    expect(card.degree).toEqual([])
    expect(card.website).toBe('colliersprojectleaders.com')
    expect(card.websiteFr).toBe('colliersprojectleaders.com/fr')
    expect(card.company).toBe('Colliers Project Leaders')
    expect(emptyCard('French').website).toBe('colliersprojectleaders.com/fr')
  })
})
