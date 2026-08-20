import { describe, expect, it } from 'vitest'
import {
  createPersonalRecord,
  emptyPersonal,
  matchesSearch,
} from './addressBook'

const HOME = {
  addressName: 'Home Office',
  addressStreet: '100 King Street West',
  addressStreet2: 'Suite 5600',
  addressCity: 'Toronto',
  addressProvince: 'ON',
  addressPostalZip: 'M5X 1C9',
  addressCountry: 'Canada',
}

describe('addressBook helpers', function () {
  it('AB-H01 emptyPersonal defaults country to Canada', function () {
    expect(emptyPersonal().addressCountry).toBe('Canada')
  })

  it('AB-H02 createPersonalRecord assigns an id', function () {
    const row = createPersonalRecord({
      addressName: 'Cabin',
      addressStreet: '1 Pine',
      addressCity: 'Banff',
    })
    expect(String(row.id || '').length).toBeGreaterThan(0)
  })

  it('AB-H03 matchesSearch by location name', function () {
    expect(matchesSearch(HOME, 'Home Office')).toBe(true)
  })

  it('AB-H04 matchesSearch by address text', function () {
    expect(matchesSearch(HOME, 'Toronto')).toBe(true)
    expect(matchesSearch(HOME, 'M5X')).toBe(true)
    expect(matchesSearch(HOME, 'King Street')).toBe(true)
  })

  it('AB-H05 empty query matches all', function () {
    expect(matchesSearch(HOME, '')).toBe(true)
    expect(matchesSearch(HOME, '   ')).toBe(true)
  })

  it('AB-H06 unrelated query matches none', function () {
    expect(matchesSearch(HOME, 'Burlington')).toBe(false)
  })
})
