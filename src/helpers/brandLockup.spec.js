import { describe, expect, it } from 'vitest'
import { brandLockupAlt, brandLockupUrl, brandMarkUrl, brandWordmarkUrl } from './brandLockup.js'

describe('brandLockupUrl', function () {
  it('returns the French lockup for FR locales', function () {
    var en = brandLockupUrl('English')
    var fr = brandLockupUrl('FR')
    expect(en).toMatch(/brand-lockup-en/)
    expect(fr).toMatch(/brand-lockup-fr/)
    expect(fr).not.toBe(en)
  })
})

describe('brandWordmarkUrl', function () {
  it('returns the French wordmark for FR locales', function () {
    expect(brandMarkUrl()).toMatch(/colliers-logo-mark/)
    expect(brandWordmarkUrl('English')).toMatch(/lockup-words-en/)
    expect(brandWordmarkUrl('FR')).toMatch(/lockup-words-fr/)
  })
})

describe('brandLockupAlt', function () {
  it('names the lockup in the card language', function () {
    expect(brandLockupAlt('English')).toBe('Colliers Project Leaders')
    expect(brandLockupAlt('French')).toBe('Colliers Maîtres de projets')
  })
})
