import { describe, expect, it } from 'vitest'
import { MOCK_OFFICES, officeDisplayName } from './offices.js'

describe('official offices', function () {
  it('names Excel offices with an Office suffix', function () {
    expect(officeDisplayName('Toronto')).toBe('Toronto Office')
    expect(officeDisplayName('Toronto North')).toBe('Toronto North Office')
    expect(officeDisplayName('Ottawa (Head Office)')).toBe('Ottawa Office')
    expect(officeDisplayName("St. John's")).toBe("St. John's Office")
  })

  it('lists all 22 Excel offices', function () {
    expect(MOCK_OFFICES.length).toBe(22)
    expect(MOCK_OFFICES.some(function (row) { return row.addressName === 'Toronto Office' })).toBe(true)
    expect(MOCK_OFFICES.some(function (row) { return row.addressPostalZip === 'M5J 2V1' })).toBe(true)
    expect(MOCK_OFFICES.some(function (row) { return row.addressName === 'Ottawa Office' && row.addressStreet === '2720 Iris Street' })).toBe(true)
  })
})
