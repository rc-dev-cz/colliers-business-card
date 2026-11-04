import { beforeEach, describe, expect, it } from 'vitest'
import { loadOrderHistory } from './profileStorage'
import { readStorage, writeStorage, profileStorageKey } from '../helpers/storage'

var EMAIL = 'seed-merge@colliers.com'

describe('loadOrderHistory seed merge', function () {
  beforeEach(function () {
    localStorage.clear()
  })

  it('PS-01 a history saved before the grouped seeds gets them once, placed orders kept', function () {
    writeStorage(profileStorageKey('orderHistory', EMAIL), [
      { id: 'ORD-2001', date: '2026-11-03', status: 'Processing', cart: [], order: { splits: [] } },
      { id: 'ORD-1001', date: '2026-08-12', status: 'Delivered', cart: [], order: { splits: [] } },
    ])
    var ids = loadOrderHistory(EMAIL).map((row) => row.id)
    expect(ids[0]).toBe('ORD-2001')
    expect(ids).toEqual(expect.arrayContaining(['ORD-1004', 'ORD-1005', 'ORD-1006']))
    expect(ids.filter((id) => id === 'ORD-1001')).toHaveLength(1)
    expect(readStorage(profileStorageKey('orderHistorySeed', EMAIL), 0)).toBe(2)
  })
})
