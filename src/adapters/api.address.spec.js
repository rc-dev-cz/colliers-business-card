import { describe, expect, it } from 'vitest'
import { formatAddressCard } from '../adapters/api.js'

describe('formatAddressCard', function () {
  it('formats street, suite, city/province, and postal with Canada', function () {
    expect(
      formatAddressCard({
        addressStreet: '181 Bay Street',
        addressStreet2: 'Suite 1400',
        addressCity: 'Toronto',
        addressProvince: 'ON',
        addressPostalZip: 'M5J 2T3',
        addressCountry: 'Canada',
      }),
    ).toBe('181 Bay Street\nSuite 1400\nToronto, ON\nM5J 2T3 Canada')
  })

  it('omits empty suite line', function () {
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
