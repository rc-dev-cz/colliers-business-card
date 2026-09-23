import { describe, expect, it } from 'vitest'
import { uniqueLabels } from './labels.js'
import { DEFAULT_DEGREES } from './degreeAdmin.js'

describe('uniqueLabels', function () {
  it('drops blanks and exact duplicates', function () {
    expect(uniqueLabels([' PMP ', 'PMP', '', 'LEED AP'])).toEqual(['PMP', 'LEED AP'])
  })
})

describe('DEFAULT_DEGREES', function () {
  it('has no duplicate spellings', function () {
    expect(uniqueLabels(DEFAULT_DEGREES)).toEqual(DEFAULT_DEGREES)
  })
})
