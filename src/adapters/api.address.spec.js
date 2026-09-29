import { describe, expect, it } from 'vitest'
import { formatAddressCard } from '../adapters/api.js'

describe('formatAddressCard', function () {
  it('puts name and suite on the first line, then street', function () {
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
    ).toBe('TD Tower, Suite 1703\n10088 102 Avenue NW\nEdmonton, AB\nT5J 2Z1 Canada')
  })

  it('keeps a trailing comma on the street when there is no name', function () {
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
    ).toBe('1800 Avenue McGill College,\nbureau 410\nMontréal, QC\nH3A 3J6 Canada')
  })

  it('shows the office name then street when there is no suite', function () {
    expect(
      formatAddressCard({
        addressName: 'Toronto -- Bay Street',
        addressStreet: '181 Bay Street',
        addressStreet2: '',
        addressCity: 'Toronto',
        addressProvince: 'ON',
        addressPostalZip: 'M5J 2T3',
        addressCountry: 'Canada',
      }),
    ).toBe('Toronto -- Bay Street\n181 Bay Street\nToronto, ON\nM5J 2T3 Canada')
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
