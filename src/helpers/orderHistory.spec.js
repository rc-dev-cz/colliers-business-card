import { describe, expect, it } from 'vitest'
import { t } from '../store'
import {
  boxCount,
  cardCount,
  cardsPerBox,
  formatOrderDate,
  itemLabel,
  nextOrderId,
  orderTotal,
  seedAdminOrderHistory,
  seedOrderHistory,
  shipToLines,
} from './orderHistory'

describe('orderHistory helpers', function () {
  it('OH-01 cardsPerBox reads product packaging', function () {
    expect(cardsPerBox('BCAD-PL-ENG')).toBe(250)
  })

  it('OH-02 personal seed stores box qty; cardCount converts to cards for display', function () {
    const personal = seedOrderHistory().filter(function (row) {
      return ['ORD-1001', 'ORD-1002', 'ORD-1003'].indexOf(row.id) !== -1
    })
    expect(personal.length).toBe(3)
    expect(boxCount(personal[0])).toBe(2)
    expect(cardCount(personal[0])).toBe(500)
    expect(orderTotal(personal[0])).toBe(126)
    expect(boxCount(personal[1])).toBe(1)
    expect(cardCount(personal[1])).toBe(250)
    expect(orderTotal(personal[1])).toBe(63)
    expect(personal[0].cart[0].details.degree).toEqual([])
    expect(personal[0].cart[0].details.title).toBe('Associate')
    expect(personal[0].cart[0].details.website).toBe('colliersprojectleaders.com')
  })

  it('OH-02b grouped seeds: several cards and shipments, quantities as Shipping sets them', function () {
    const byId = {}
    seedOrderHistory().forEach(function (row) {
      byId[row.id] = row
    })
    const team = byId['ORD-1006']
    expect(team.cart.map((l) => l.code)).toEqual(['BCAD-PL-ENG', 'BCAD-PL-FR', 'BCAD-PL-BIL'])
    expect(team.order.splits).toHaveLength(2)
    expect(team.order.splits[0].locations.map((l) => l.qty)).toEqual([2, 1])
    expect(team.order.splits[0].qtys).toEqual({ 'seed-1006-eng': 3, 'seed-1006-fr': 3 })
    expect(team.cart.map((l) => l.quantity)).toEqual([3, 3, 3])
    expect(boxCount(team)).toBe(9)
    expect(cardCount(team)).toBe(2250)
    expect(team.order.splits[0].locations[0]).toMatchObject({
      addressId: '17',
      addressType: 'office',
    })

    const split = byId['ORD-1005']
    // Same English card in both shipments: 4 + 1 boxes.
    expect(split.cart.map((l) => l.quantity)).toEqual([5, 1])
    expect(boxCount(split)).toBe(6)

    const stale = byId['ORD-1004']
    expect(stale.order.splits[1].locations[0].addressId).toBe('seed-deleted-cottage')
    expect(boxCount(stale)).toBe(9)
  })

  it('OH-03 admin seed exposes designer rows with card qty and totals', function () {
    const admin = seedAdminOrderHistory()
    expect(admin.length).toBe(5)
    expect(admin[0].id).toBe('ORD-8472')
    expect(admin[0].employeeName).toBe('Alex Johnson')
    expect(admin[0].ownerEmail).toBe('alex.johnson@colliers.com')
    expect(boxCount(admin[0])).toBe(2)
    expect(cardCount(admin[0])).toBe(500)
    expect(orderTotal(admin[0])).toBe(126)
    expect(shipToLines(admin[0])[0]).toContain('Burlington')
    expect(cardCount(admin[1])).toBe(250)
    expect(orderTotal(admin[1])).toBe(63)
    expect(cardCount(admin[2])).toBe(1000)
    expect(orderTotal(admin[2])).toBe(252)
  })

  it('OH-04 itemLabel uses product translation key', function () {
    const admin = seedAdminOrderHistory()
    expect(itemLabel(admin[0], t)).toBe('Business Card English')
  })

  it('OH-05 formatOrderDate renders designer-style dates', function () {
    expect(formatOrderDate('2026-08-28')).toBe('Aug 28, 2026')
    expect(formatOrderDate('2026-08-28', 'FR')).toBe('28 août 2026')
  })

  it('OH-06 nextOrderId advances past admin seed ids', function () {
    const admin = seedAdminOrderHistory()
    expect(nextOrderId(admin)).toBe('ORD-8473')
  })
})
