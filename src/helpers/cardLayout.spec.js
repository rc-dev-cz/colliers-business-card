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
  it('one-line name, no credentials uses title 74.99 and team 66.99', function () {
    var layout = plan({})
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('none')
    expect(layout.lastNameY).toBe(L.nameY)
    expect(layout.titleY).toBe(74.99)
    expect(layout.teamY).toBe(66.99)
    expect(layout.emailY).toBe(50.99)
    expect(layout.phoneY).toBe(42.99)
    expect(layout.websiteY).toBe(26.99)
  })

  it('approved blank sample card uses the same baselines', function () {
    var layout = planCardLayout(resolveCardFields({}, 'English'), fonts, { degreeCount: 0 })
    expect(layout.valid).toBe(true)
    expect(layout.nameLines).toEqual(['Full Name'])
    expect(layout.titleY).toBe(74.99)
    expect(layout.teamY).toBe(66.99)
    expect(layout.credentialLine).toBe('')
  })

  it('short inline credential keeps title at 74.99', function () {
    var layout = plan({ degree: ['CPA'] }, 'English', 1)
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('inline')
    expect(layout.inlineCredential).toBe(', CPA')
    expect(layout.credentialLine).toBe('')
    expect(layout.titleY).toBe(74.99)
    expect(layout.teamY).toBe(66.99)
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
    expect(layout.credentialY).toBe(74.99)
    expect(layout.titleY).toBe(66.99)
    expect(layout.teamY).toBe(58.99)
  })

  it('two-line name keeps the last line at 83.49 and grows upward', function () {
    var layout = plan({ name: 'Carlos Moises Zabaleta Copa' })
    expect(layout.valid).toBe(true)
    expect(layout.nameLines.length).toBe(2)
    expect(layout.lastNameY).toBe(83.49)
    expect(layout.nameLineYs[1]).toBe(83.49)
    expect(layout.nameLineYs[0]).toBe(83.49 + L.nameLineHeight)
    expect(layout.nameLineYs[0]).toBeLessThan(L.lockupY)
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

  it('treats exactly 130pt as valid and just over as invalid', function () {
    var exact = padToWidth(fonts.font, L.bodySize, L.identityWidth, 'ada@')
    expect(fitsLine(fonts.font, exact, L.bodySize, L.identityWidth)).toBe(true)
    var ok = plan({ email: exact })
    expect(ok.valid).toBe(true)

    var over = exact + 'x'
    expect(fitsLine(fonts.font, over, L.bodySize, L.identityWidth)).toBe(false)
    var bad = plan({ email: over })
    expect(bad.valid).toBe(false)
    expect(bad.errors).toContain(LAYOUT_ERROR.email)
  })

  it('rejects two very long degrees even when count is below 3', function () {
    var longA = padToWidth(fonts.fontBold, L.credentialSize, L.identityWidth + 20, 'Dipl. Architectural ')
    var layout = plan(
      { degree: [longA, longA] },
      'English',
      2,
    )
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.credentials)
  })

  it('rejects four tiny degrees because of the selection cap', function () {
    var layout = plan({ degree: ['A', 'B', 'C', 'D'] }, 'English', 4)
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.degrees)
  })

  it('rejects overflowing title, team, and email instead of wrapping', function () {
    var over = padToWidth(fonts.font, L.bodySize, L.identityWidth, 'Long ') + ' overflow'
    expect(plan({ title: over, region: '' }).errors).toContain(LAYOUT_ERROR.title)
    expect(plan({ specializedTeam: over }).errors).toContain(LAYOUT_ERROR.team)
    expect(plan({ email: over }).errors).toContain(LAYOUT_ERROR.email)
  })

  it('allows 5 address lines and rejects 6', function () {
    var five = 'One\nTwo\nThree\nFour\nFive'
    var six = five + '\nSix'
    var ok = plan({ address: five })
    expect(ok.valid).toBe(true)
    expect(ok.address.lines.length).toBe(5)
    expect(ok.address.bottomY).toBe(27)
    expect(plan({ address: six }).errors).toContain(LAYOUT_ERROR.address)
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
