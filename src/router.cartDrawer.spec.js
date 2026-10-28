import { describe, expect, it } from 'vitest'
import router from './router.js'
import { store } from './store.js'

describe('router closes the cart drawer (KLAI-10)', function () {
  it('closes an open drawer when the page changes', function () {
    store.cartOpen = true
    var hook = router.afterHooks[router.afterHooks.length - 1]
    hook({ path: '/customize' }, { path: '/' })
    expect(store.cartOpen).toBe(false)
  })
})
