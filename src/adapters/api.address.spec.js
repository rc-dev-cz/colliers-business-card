import { describe, expect, it } from 'vitest'
import { formatAddressCard } from '../adapters/api.js'

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
      }),
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
      }),
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
      }),
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
      }),
    ).toBe('301-1559 Brunswick Street\nHalifax, NS\nB3J 2G1 Canada')
  })
})
