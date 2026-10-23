import { describe, expect, it } from 'vitest'
import ShippingPage from './ShippingPage.vue'

describe('Add item menu (BUG-21)', function () {
  var ctx = {
    lineName: function () {
      return 'Business Card English - English'
    },
  }

  it('adds the card title so two cards for one person can be told apart', function () {
    var director = { details: { name: 'Test Person', title: 'Director' } }
    var manager = { details: { name: 'Test Person', title: 'Project Manager' } }
    expect(ShippingPage.methods.addItemDetail.call(ctx, director)).toBe(
      'Business Card English - English · Director'
    )
    expect(ShippingPage.methods.addItemDetail.call(ctx, manager)).toBe(
      'Business Card English - English · Project Manager'
    )
  })

  it('shows the product alone when the card has no title', function () {
    expect(ShippingPage.methods.addItemDetail.call(ctx, { details: {} })).toBe(
      'Business Card English - English'
    )
  })
})
