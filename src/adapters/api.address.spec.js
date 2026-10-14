import { describe, expect, it } from 'vitest'
import { formatAddressCard, formatAddressLine, officeLabel } from '../adapters/api.js'

describe('formatAddressCard', function () {
  it('prints street then suite, never the office name', function () {
    expect(
      formatAddressCard({
        addressName: 'TD Tower',
        addressStreet: '10088 102 Avenue NW',
        addressStreet2: 'Suite 1703',
        addressCity: 'Edmonton',
        addressProvince: 'AB',
        addressPostalZip: 'T5J 2Z1',
        addressCountry: 'Canada',
      })
    ).toBe('10088 102 Avenue NW\nSuite 1703\nEdmonton, AB\nT5J 2Z1 Canada')
  })

  it('prints street then unit when there is no name', function () {
    expect(
      formatAddressCard({
        addressName: '',
        addressStreet: '1800 Avenue McGill College',
        addressStreet2: 'bureau 410',
        addressCity: 'Montréal',
        addressProvince: 'QC',
        addressPostalZip: 'H3A 3J6',
        addressCountry: 'Canada',
      })
    ).toBe('1800 Avenue McGill College\nbureau 410\nMontréal, QC\nH3A 3J6 Canada')
  })

  it('omits the office name when there is no suite', function () {
    expect(
      formatAddressCard({
        addressName: 'Toronto Office',
        addressStreet: '1400-181 Bay Street',
        addressStreet2: '',
        addressCity: 'Toronto',
        addressProvince: 'ON',
        addressPostalZip: 'M5J 2V1',
        addressCountry: 'Canada',
      })
    ).toBe('1400-181 Bay Street\nToronto, ON\nM5J 2V1 Canada')
  })

  it('omits empty name and suite lines', function () {
    expect(
      formatAddressCard({
        addressStreet: '301-1559 Brunswick Street',
        addressStreet2: '',
        addressCity: 'Halifax',
        addressProvince: 'NS',
        addressPostalZip: 'B3J 2G1',
        addressCountry: 'Canada',
      })
    ).toBe('301-1559 Brunswick Street\nHalifax, NS\nB3J 2G1 Canada')
  })
})

describe('formatAddressLine FileMaker fallbacks', function () {
  it('uses cardAddress when street fields are empty', function () {
    expect(
      formatAddressLine({
        addressName: 'Toronto Office',
        cardAddress: '181 Bay Street\nToronto, ON',
      })
    ).toBe('181 Bay Street, Toronto, ON')
  })

  it('uses line when street fields are empty', function () {
    expect(
      formatAddressLine({
        addressName: 'My House',
        line: '123 Street',
      })
    ).toBe('123 Street')
  })

  it('uses listLabel when no street or cardAddress', function () {
    expect(formatAddressLine({ listLabel: 'Ottawa Office — 45 O’Connor' })).toBe(
      'Ottawa Office — 45 O’Connor'
    )
  })

  it('prefers listLabel for the picker caption', function () {
    expect(
      officeLabel({
        listLabel: 'Toronto Office — 181 Bay Street',
        addressName: 'Toronto',
        addressStreet: '181 Bay Street',
      })
    ).toBe('Toronto Office — 181 Bay Street')
  })
})
