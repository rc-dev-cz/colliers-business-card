import { describe, expect, it } from 'vitest'
import { wrapCardName } from './wrapCardName.js'

describe('wrapCardName', function () {
  it('keeps names of 20 characters on one line', function () {
    expect(wrapCardName('abcdefghijklmnopqrst')).toBe('abcdefghijklmnopqrst')
  })

  it('wraps at 20 when there is no space', function () {
    expect(wrapCardName('abcdefghijklmnopqrstu')).toBe('abcdefghijklmnopqrst\nu')
  })

  it('wraps at the last space at or before 20', function () {
    expect(wrapCardName('Christopher Montgomery')).toBe('Christopher\nMontgomery')
  })

  it('trims empty input', function () {
    expect(wrapCardName('  ')).toBe('')
  })
})
