import { afterEach, describe, expect, it } from 'vitest'
import { clearCart, ensureSampleShippingDraft, itemCount, store } from '../store.js'
import { makeLine } from './cart.js'

describe('ensureSampleShippingDraft', function () {
  afterEach(function () {
    clearCart()
  })

  it('seeds two placeholder lines and no ship-to until Add location', function () {
    clearCart()
    expect(ensureSampleShippingDraft()).toBe(true)
    expect(store.cart.length).toBe(2)
    expect(store.cart[0].id).toBe('line-dev-1')
    expect(store.cart[0].code).toBe('BCAD-PL-ENG')
    expect(store.cart[1].id).toBe('line-dev-2')
    expect(store.cart[1].code).toBe('BCAD-PL-FR')
    expect(store.cart[0].details.name).toBe('')
    expect(store.order.splits.length).toBe(1)
    expect(store.order.splits[0].itemIds).toEqual(['line-dev-1', 'line-dev-2'])
    expect(store.order.splits[0].locations).toEqual([])
    expect(itemCount()).toBe(2)
  })

  it('drops a persisted Unit, Street ship-to left from the old preview seed', function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-real',
        code: 'BCAD-PL-ENG',
        language: 'English',
        quantity: 1,
        details: { name: '', language: 'English' },
      }),
    ]
    store.order.splits = [
      {
        id: 1,
        itemIds: ['line-real'],
        locations: [{ id: 'loc-old', address: 'Unit, Street', qty: 1 }],
      },
    ]
    expect(ensureSampleShippingDraft()).toBe(false)
    expect(store.order.splits[0].locations).toEqual([])
  })

  it('does not overwrite a real cart', function () {
    clearCart()
    store.cart = [
      makeLine({
        id: 'line-real',
        code: 'BCAD-PL-BIL',
        language: 'Bilingual',
        quantity: 3,
        details: { name: '', language: 'Bilingual' },
      }),
    ]
    expect(ensureSampleShippingDraft()).toBe(false)
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].id).toBe('line-real')
    expect(store.order.splits[0].itemIds).toEqual(['line-real'])
  })
})
