import { describe, expect, it } from 'vitest'
import { t } from '../store'
import {
  boxCount,
  cardCount,
  cardholderName,
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
    const personal = seedOrderHistory()
    expect(personal.length).toBe(3)
    expect(boxCount(personal[0])).toBe(2)
    expect(cardCount(personal[0])).toBe(500)
    expect(orderTotal(personal[0])).toBe(126)
    expect(boxCount(personal[1])).toBe(1)
    expect(cardCount(personal[1])).toBe(250)
    expect(orderTotal(personal[1])).toBe(63)
  })

  it('OH-03 admin seed exposes designer rows with card qty and totals', function () {
    const admin = seedAdminOrderHistory()
    expect(admin.length).toBe(5)
    expect(admin[0].id).toBe('ORD-8472')
    expect(cardholderName(admin[0])).toBe('Alex Johnson')
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
  })

  it('OH-06 nextOrderId advances past admin seed ids', function () {
    const admin = seedAdminOrderHistory()
    expect(nextOrderId(admin)).toBe('ORD-8473')
  })
})
