import { describe, expect, it, beforeAll } from 'vitest'
import { loadLayoutFonts } from './cardFonts.js'
import {
  CARD_LAYOUT,
  LAYOUT_ERROR,
  fitsLine,
  planCardLayout,
  planProductLayout,
  resolveCardFields,
} from './cardLayout.js'

var fonts
var L = CARD_LAYOUT

function fields(overrides, language) {
  return resolveCardFields(
    Object.assign(
      {
        name: 'Ada Lovelace',
        title: 'Associate',
        region: 'Ontario',
        email: 'ada@example.com',
        phone: '4165550100',
      },
      overrides || {},
    ),
    language || 'English',
  )
}

function plan(overrides, language, degreeCount) {
  return planCardLayout(fields(overrides, language), fonts, {
    degreeCount: degreeCount != null ? degreeCount : 0,
  })
}

function padToWidth(font, size, maxWidth, seed) {
  var s = seed || 'a'
  while (fitsLine(font, s + 'i', size, maxWidth)) s += 'i'
  return s
}

beforeAll(async function () {
  fonts = await loadLayoutFonts()
})

describe('planCardLayout', function () {
  it('one-line name, no credentials uses title 66.99 and team 58.99', function () {
    var layout = plan({})
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('none')
    expect(layout.lastNameY).toBe(L.nameY)
    expect(layout.titleY).toBe(66.99)
    expect(layout.teamY).toBe(58.99)
    expect(layout.emailY).toBe(42.99)
    expect(layout.phoneY).toBe(34.99)
    expect(layout.websiteY).toBe(26.99)
    expect(layout.emailY - layout.phoneY).toBeCloseTo(L.bodyLineHeight)
    expect(layout.phoneY - layout.websiteY).toBeCloseTo(L.bodyLineHeight)
  })

  it('approved blank sample card uses the same baselines', function () {
    var layout = planCardLayout(resolveCardFields({}, 'English'), fonts, { degreeCount: 0 })
    expect(layout.valid).toBe(true)
    expect(layout.nameLines).toEqual(['Firstname Lastname'])
    expect(layout.address.lines).toEqual([
      'Address name',
      'Unit, Street',
      'City, Province',
      'Postal Code, Country',
    ])
    expect(layout.titleY).toBe(66.99)
    expect(layout.teamY).toBe(58.99)
    expect(layout.credentialLine).toBe('')
  })

  it('French blank sample uses the four-line address labels', function () {
    var layout = planCardLayout(resolveCardFields({}, 'French'), fonts, { degreeCount: 0 })
    expect(layout.valid).toBe(true)
    expect(layout.address.lines).toEqual([
      "Nom de l'adresse",
      'Unité, Rue',
      'Ville, Province',
      'Code postal, Pays',
    ])
  })

  it('short inline credential keeps title at 66.99', function () {
    var layout = plan({ degree: ['CPA'] }, 'English', 1)
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('inline')
    expect(layout.inlineCredential).toBe(', CPA')
    expect(layout.credentialLine).toBe('')
    expect(layout.titleY).toBe(66.99)
    expect(layout.teamY).toBe(58.99)
  })

  it('moves the entire credential string to its own row when it cannot sit on the name', function () {
    var cred = padToWidth(fonts.fontBold, L.credentialSize, L.identityWidth - 8, 'Arch. Tech ')
    var last = 'Ada Lovelace'
    var used = fonts.fontBold.widthOfTextAtSize(last, L.nameSize)
    var credW = fonts.fontBold.widthOfTextAtSize(', ' + cred, L.credentialSize)
    expect(used + credW).toBeGreaterThan(L.identityWidth)
    expect(fitsLine(fonts.fontBold, cred, L.credentialSize, L.identityWidth)).toBe(true)

    var layout = plan({ additionalCredentials: cred })
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('own-row')
    expect(layout.inlineCredential).toBe('')
    expect(layout.credentialLine).toBe(cred)
    expect(layout.credentialY).toBe(66.99)
    expect(layout.titleY).toBe(58.99)
    expect(layout.teamY).toBe(50.99)
  })

  it('two-line name keeps the last line at 75.49 and grows upward', function () {
    var layout = plan({ name: 'Carlos Moises Zabaleta Copa' })
    expect(layout.valid).toBe(true)
    expect(layout.nameLines.length).toBe(2)
    expect(layout.lastNameY).toBe(75.49)
    expect(layout.nameLineYs[1]).toBe(75.49)
    expect(layout.nameLineYs[0]).toBe(75.49 + L.nameLineHeight)
    expect(layout.nameLineYs[0]).toBeLessThan(L.lockupY)
  })

  it('accepts a long name that fills two lines without overlapping the lockup', function () {
    // Field allows 50 chars (NAME_MAX); layout still rejects wraps beyond two lines.
    var longName = 'Carlos Moises Zabaleta Copa Project Lead'
    expect(longName.length).toBeLessThanOrEqual(50)
    expect(longName.length).toBeGreaterThan(30)
    var layout = plan({ name: longName })
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.name)
    expect(layout.nameLines.length).toBe(2)
    expect(layout.nameLineYs[0]).toBeLessThan(L.lockupY)
    expect(layout.lastNameY).toBe(L.nameY)
  })

  it('rejects a name that still fits in 50 characters but needs a third wrap line', function () {
    var name = 'Christopher Harrington-Wellinton Second'
    expect(name.length).toBeLessThan(50)
    var layout = plan({ name: name })
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.name)
  })

  it('rejects a 50-character name that would need a third line', function () {
    var fiftyName = 'Anna Marie Elizabeth Catherine Thompson Smith Jr A'
    expect(fiftyName.length).toBe(50)
    var layout = plan({ name: fiftyName })
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.name)
  })

  it('two-line name plus own credential row stays below the logo', function () {
    var cred = padToWidth(fonts.fontBold, L.credentialSize, L.identityWidth - 8, 'LEED ')
    var layout = plan({
      name: 'Carlos Moises Zabaleta Copa',
      additionalCredentials: cred,
    })
    expect(layout.valid).toBe(true)
    expect(layout.nameLines.length).toBe(2)
    expect(layout.credMode).toBe('own-row')
    expect(layout.nameLineYs[0]).toBeLessThan(L.lockupY)
    expect(layout.teamY).toBeGreaterThan(layout.emailY)
  })

  it('fits the ICT sample email in the 130 pt lane with ~18 pt remaining to trim', function () {
    var email = 'first.lastname@colliersprojectleaders.com'
    expect(fitsLine(fonts.font, email, L.bodySize, L.emailMaxWidth)).toBe(true)
    var layout = plan({ email: email })
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.email)
    var used = fonts.font.widthOfTextAtSize(email, L.bodySize)
    var remainingToTrim = L.bleed + L.trimW - (L.identityX + used)
    expect(remainingToTrim).toBeGreaterThan(18)
    expect(L.emailMaxWidth).toBe(130)
    expect(L.identityWidth).toBe(130)
  })

  it('rejects an email that is within 50 characters but wider than 130 pt', function () {
    var wide = 'WWWWWWWWWW@colliersprojectleaders.comWWWW'
    expect(wide.length).toBeLessThanOrEqual(50)
    expect(fitsLine(fonts.font, wide, L.bodySize, L.emailMaxWidth)).toBe(false)
    var layout = plan({ email: wide })
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.email)
  })

  it('accepts an email of 50 characters when it still fits 130 pt, and rejects 51', function () {
    var fifty = 'carlos.zabaleta@colliersprojectleaders.comssssssss'
    expect(fifty.length).toBe(50)
    var ok = plan({ email: fifty })
    if (fitsLine(fonts.font, fifty, L.bodySize, L.emailMaxWidth)) {
      expect(ok.valid).toBe(true)
      expect(ok.errors).not.toContain(LAYOUT_ERROR.email)
    } else {
      expect(ok.errors).toContain(LAYOUT_ERROR.email)
    }

    var fiftyOne = fifty + 'x'
    var bad = plan({ email: fiftyOne })
    expect(bad.valid).toBe(false)
    expect(bad.errors).toContain(LAYOUT_ERROR.email)
  })

  it('rejects two very long degrees when the count is within the cap', function () {
    var longA = padToWidth(fonts.fontBold, L.credentialSize, L.identityWidth + 20, 'Dipl. Architectural ')
    var layout = plan(
      { degree: [longA, longA] },
      'English',
      2,
    )
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.credentials)
  })

  it('rejects a third degree because of the selection cap', function () {
    var layout = plan({ degree: ['A', 'B', 'C'] }, 'English', 3)
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.degrees)
  })

  it('does not block on a long region, team, mobile, or office', function () {
    var over = padToWidth(fonts.font, L.bodySize, L.identityWidth, 'Long ') + ' overflow'
    var layout = plan({
      title: over,
      region: over,
      specializedTeam: over,
      email: 'ada@example.com',
      phone: '4165550100',
      address: 'One\nTwo\nThree\nFour\nFive\nSix',
    })
    expect(layout.errors).not.toContain(LAYOUT_ERROR.title)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.team)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.email)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.phone)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.address)
    expect(layout.valid).toBe(true)
    expect(layout.address.lines.length).toBe(6)
  })

  it('keeps a long office address and does not report it as too long', function () {
    var five = 'One\nTwo\nThree\nFour\nFive'
    var six = five + '\nSix'
    var ok = plan({ address: five })
    expect(ok.valid).toBe(true)
    expect(ok.address.lines.length).toBe(5)
    expect(ok.address.bottomY).toBe(27)
    var longer = plan({ address: six })
    expect(longer.valid).toBe(true)
    expect(longer.errors).not.toContain(LAYOUT_ERROR.address)
    expect(longer.address.lines.length).toBe(6)
  })

  it('keeps address bottom-aligned for 1, 3 and 5 lines', function () {
    ;[1, 3, 5].forEach(function (n) {
      var lines = []
      for (var i = 0; i < n; i++) lines.push('Line ' + (i + 1))
      var layout = plan({ address: lines.join('\n') })
      expect(layout.valid).toBe(true)
      expect(layout.address.lines.length).toBe(n)
      expect(layout.address.bottomY).toBe(27)
    })
  })

  it('still rejects a website that does not fit on one line', function () {
    var over = padToWidth(fonts.font, L.bodySize, L.identityWidth, 'https://') + ' overflow'
    expect(plan({ website: over }).errors).toContain(LAYOUT_ERROR.website)
  })

  it('does not letter-split an oversized name token', function () {
    var token = padToWidth(fonts.fontBold, L.nameSize, L.identityWidth, 'Name') + 'x'
    var layout = plan({ name: token })
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.name)
  })
})

describe('planProductLayout', function () {
  it('validates both bilingual pages before success', function () {
    var product = planProductLayout(
      {
        name: 'Ada Lovelace',
        title: 'Associate',
        region: 'Ontario',
        email: 'ada@example.com',
        phone: '4165550100',
      },
      'Bilingual',
      fonts,
    )
    expect(product.valid).toBe(true)
    expect(product.pages.length).toBe(2)
    expect(product.pages[0].language).toBe('English')
    expect(product.pages[1].language).toBe('French')
    product.pages.forEach(function (page) {
      expect(page.layout.valid).toBe(true)
    })
  })
})
