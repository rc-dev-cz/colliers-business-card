import { describe, expect, it } from 'vitest'
import { CARDS_PER_BOX, cardsFromBoxes, boxesFromCards, cloneCardDetails } from './cart.js'

describe('cardsFromBoxes', function () {
  it('converts stored boxes to printed cards', function () {
    expect(CARDS_PER_BOX).toBe(250)
    expect(cardsFromBoxes(1)).toBe(250)
    expect(cardsFromBoxes(3)).toBe(750)
    expect(cardsFromBoxes(0)).toBe(0)
  })

  it('converts typed card counts back to boxes', function () {
    expect(boxesFromCards(250)).toBe(1)
    expect(boxesFromCards(500)).toBe(2)
    expect(boxesFromCards(750)).toBe(3)
    expect(boxesFromCards(100)).toBe(1)
  })
})

describe('cloneCardDetails', function () {
  it('copies degree arrays so edits do not mutate the source', function () {
    var source = { name: 'Ada', degree: ['P.Eng'] }
    var copy = cloneCardDetails(source)
    copy.degree.push('CPA')
    copy.name = 'Grace'
    expect(source.degree).toEqual(['P.Eng'])
    expect(source.name).toBe('Ada')
  })
})
