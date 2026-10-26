import { describe, expect, it } from 'vitest'
import {
  clipName,
  emailFromFullName,
  formatCardPhone,
  isCompletePhone,
  isValidEmail,
  localPhoneDigits,
  NAME_MAX,
  cleanName,
  cleanCardText,
} from './validate.js'

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

describe('formatCardPhone', function () {
  it('shows a 10-digit Canadian number without +1', function () {
    expect(formatCardPhone('6139789906')).toBe('613 978 9906')
    expect(formatCardPhone('+1 613 978 9906')).toBe('613 978 9906')
    expect(formatCardPhone('16139789906')).toBe('613 978 9906')
  })

  it('never shows the form hyphen on a partial number', function () {
    expect(formatCardPhone('416 555-01')).toBe('416 555 01')
    expect(formatCardPhone('416 5')).toBe('416 5')
  })
})

describe('localPhoneDigits', function () {
  it('drops the +1 country code before keeping 10 digits (BUG-02)', function () {
    expect(localPhoneDigits('+1 416 555 0199')).toBe('4165550199')
    expect(localPhoneDigits('1-416-555-0199')).toBe('4165550199')
    expect(localPhoneDigits('+14165550199')).toBe('4165550199')
  })

  it('keeps a pasted local number whole (BUG-04)', function () {
    expect(localPhoneDigits('(416) 555-0199')).toBe('4165550199')
    expect(localPhoneDigits('416 555 0199')).toBe('4165550199')
  })

  it('keeps extra digits so the field can flag them, never cuts them (BUG-26)', function () {
    expect(localPhoneDigits('+1 4')).toBe('4')
    expect(localPhoneDigits('416 5555 0199')).toBe('41655550199')
    expect(localPhoneDigits('+44 20 7946 0958')).toBe('442079460958')
  })
})

describe('isCompletePhone: valid 10-digit Canadian number (BUG-26)', function () {
  it('accepts a Canadian number, with or without +1', function () {
    expect(isCompletePhone('416 555 0199')).toBe(true)
    expect(isCompletePhone('1-416-555-0199')).toBe(true)
    expect(isCompletePhone('555 555 5555')).toBe(true)
  })

  it('refuses too many digits, a foreign number, or 0/1 area code or exchange', function () {
    expect(isCompletePhone('416 5555 0199')).toBe(false)
    expect(isCompletePhone('+44 20 7946 0958')).toBe(false)
    expect(isCompletePhone('0000000000')).toBe(false)
    expect(isCompletePhone('016 555 0199')).toBe(false)
    expect(isCompletePhone('416 055 0199')).toBe(false)
  })
})

describe('isCompletePhone', function () {
  it('needs all 10 local digits', function () {
    expect(isCompletePhone('416 555-0123')).toBe(true)
    expect(isCompletePhone('+1 416 555 0123')).toBe(true)
    expect(isCompletePhone('416 555-01')).toBe(false)
    expect(isCompletePhone('')).toBe(false)
  })
})

describe('cleanName', function () {
  it('keeps accented letters, hyphen, apostrophe and period', function () {
    expect(cleanName("Zoë O'Brien-Lévesque Jr.")).toBe("Zoë O'Brien-Lévesque Jr.")
    expect(cleanName('François D’Amour')).toBe('François D’Amour')
  })

  it('drops emoji, digits and symbols', function () {
    expect(cleanName('Firstname 😀 Lastname')).toBe('Firstname Lastname')
    expect(cleanName('Firstname👨‍👩‍👧 Lastname2 #1 @x')).toBe('Firstname Lastname x')
    expect(cleanName('<b>Name</b>')).toBe('bNameb')
  })

  it('collapses spaces, drops a leading space and clips to NAME_MAX', function () {
    expect(cleanName('  Firstname    Lastname')).toBe('Firstname Lastname')
    expect(cleanName('a'.repeat(80)).length).toBe(50)
  })
})

describe('cleanCardText', function () {
  it('strips emoji but keeps normal punctuation and accents', function () {
    expect(cleanCardText('Équipe santé 🚀 & R&D (Est) ✅')).toBe('Équipe santé  & R&D (Est) ')
    expect(cleanCardText('P.Eng., LEED AP BD+C')).toBe('P.Eng., LEED AP BD+C')
    expect(cleanCardText('1️⃣ ❤️')).toBe('1 ')
  })
})

describe('isValidEmail', function () {
  it('accepts name@domain.tld', function () {
    expect(isValidEmail('first.lastname@colliersprojectleaders.com')).toBe(true)
    expect(isValidEmail(' a@b.ca ')).toBe(true)
  })

  it('rejects blanks, missing parts and spaces', function () {
    ;[
      '',
      'first.lastname',
      'first@',
      'first@colliers',
      'first@colliers.c',
      'a b@c.com',
      '@c.com',
    ].forEach(function (value) {
      expect(isValidEmail(value)).toBe(false)
    })
  })
})

describe('emailFromFullName with a fit check', function () {
  it('shortens the local part until the email fits, keeping the domain', function () {
    var fits = function (email) {
      return email.length <= 40
    }
    var email = emailFromFullName('Christopher Harrington-Wellington', fits)
    expect(email.length).toBeLessThanOrEqual(40)
    expect(email.endsWith('@colliersprojectleaders.com')).toBe(true)
    expect(email.startsWith('christopher.')).toBe(true)
  })

  it('leaves a short email unchanged', function () {
    expect(
      emailFromFullName('Ada Lovelace', function () {
        return true
      })
    ).toBe('ada.lovelace@colliersprojectleaders.com')
  })
})
