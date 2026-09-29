import { describe, expect, it } from 'vitest'
import { clipName, emailFromFullName, NAME_MAX } from './validate.js'

describe('NAME_MAX', function () {
  it('allows 50 characters and clips beyond that', function () {
    expect(NAME_MAX).toBe(50)
    var fifty = 'Anna Marie Elizabeth Catherine Thompson Smith Jr A'
    expect(fifty.length).toBe(50)
    expect(clipName(fifty)).toBe(fifty)
    expect(clipName(fifty + 'Y').length).toBe(50)
  })
})

describe('emailFromFullName', function () {
  it('waits until the name has a first and last part', function () {
    expect(emailFromFullName('')).toBe('')
    expect(emailFromFullName('Ada')).toBe('')
    expect(emailFromFullName('Ada Lovelace')).toBe('ada.lovelace@colliersprojectleaders.com')
  })

  it('uses the first and last words and drops accents', function () {
    expect(emailFromFullName('Mary Anne Smith')).toBe('mary.smith@colliersprojectleaders.com')
    expect(emailFromFullName('José García')).toBe('jose.garcia@colliersprojectleaders.com')
  })
})
