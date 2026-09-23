import { describe, expect, it } from 'vitest'
import { emailFromFullName } from './validate.js'

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
