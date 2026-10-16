import { describe, expect, it, beforeAll } from 'vitest'
import { loadLayoutFonts } from './cardFonts.js'
import {
  CARD_LAYOUT,
  LAYOUT_ERROR,
  credentialsFitOnCard,
  fitsLine,
  planCardLayout,
  planProductLayout,
  previewContactYs,
  applyEmptyTeamIdentityLayout,
  applyPreviewTitleRegionSplit,
  cardFaceTitles,
  emailFitsOnCard,
  nameFitsOnCard,
  withSampleCredential,
  resolveCardFields,
  teamFitsOnCard,
  titleSizeFor,
} from './cardLayout.js'
import { TITLE_FR_TALENT_ACQUISITION } from './titleLocale.js'

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
      overrides || {}
    ),
    language || 'English'
  )
}

function plan(overrides, language) {
  return planCardLayout(fields(overrides, language), fonts)
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
  it('one-line name, no credentials keeps MASTER name/title Ys and bottom-locked contacts', function () {
    var layout = plan({})
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('none')
    expect(layout.lastNameY).toBe(75.49)
    expect(layout.titleY).toBe(66.99)
    expect(layout.teamY).toBe(58.99)
    expect(layout.emailY).toBe(43)
    expect(layout.phoneY).toBe(35)
    expect(layout.websiteY).toBe(27)
    expect(layout.websiteY).toBe(layout.address.bottomY)
    expect(layout.emailY - layout.phoneY).toBeCloseTo(L.bodyLineHeight)
    expect(layout.phoneY - layout.websiteY).toBeCloseTo(L.bodyLineHeight)
  })

  it('approved blank sample card uses the same baselines', function () {
    var layout = planCardLayout(resolveCardFields({}, 'English'), fonts)
    expect(layout.valid).toBe(true)
    expect(layout.nameLines).toEqual(['Firstname Lastname'])
    expect(layout.address.lines).toEqual([
      'Address name',
      'Unit, Street',
      'City, Province',
      'Postal Code, Country',
    ])
    expect(layout.titleY).toBe(66.99)
    expect(layout.lastNameY).toBe(75.49)
    expect(layout.credentialLine).toBe('')
  })

  it('French blank sample uses the four-line address labels', function () {
    var layout = planCardLayout(resolveCardFields({}, 'French'), fonts)
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
    expect(layout.lastNameY).toBe(75.49)
    expect(layout.emailY).toBe(43)
    expect(layout.phoneY).toBe(35)
    expect(layout.websiteY).toBe(27)
  })

  it('draws specialized team at 58.99 when present without moving contacts', function () {
    var layout = plan({ specializedTeam: 'Business Services' })
    expect(layout.valid).toBe(true)
    expect(layout.team).toBe('Business Services')
    expect(layout.teamY).toBe(58.99)
    expect(layout.titleY).toBe(66.99)
    expect(layout.lastNameY).toBe(75.49)
    expect(layout.emailY).toBe(43)
  })

  it('puts shorter credentials after the name and the long remainder on its own row', function () {
    var layout = plan({
      name: 'Connor Gillies',
      degree: ['BSc Civil Engineering'],
      additionalCredentials: 'PMP, EIT',
    })
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('split')
    expect(layout.inlineCredential).toBe(', EIT, PMP')
    expect(layout.credentialLine).toBe('BSc Civil Engineering')
    expect(layout.credentialY).toBe(66.99)
    expect(layout.titleY).toBe(58.99)
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

  it('lifts own-row + team so there is a blank line above email', function () {
    var cred = padToWidth(fonts.fontBold, L.credentialSize, L.identityWidth - 8, 'Arch. Tech ')
    var layout = plan({
      additionalCredentials: cred,
      specializedTeam: 'Business Services',
    })
    expect(layout.valid).toBe(true)
    expect(layout.credMode).toBe('own-row')
    expect(layout.teamY).toBe(L.teamYNoCred)
    expect(layout.titleY).toBeCloseTo(L.titleYNoCred)
    expect(layout.credentialY).toBeCloseTo(L.credentialY + (L.teamYNoCred - L.teamYWithCred))
    expect(layout.teamY - layout.emailY).toBeCloseTo(L.emailGapMin)
    expect(layout.emailY).toBe(43)
    expect(layout.phoneY).toBe(35)
    expect(layout.websiteY).toBe(27)
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
    expect(layout.titleY).toBe(58.99)
    expect(layout.emailY).toBe(43)
    expect(layout.phoneY).toBe(35)
    expect(layout.websiteY).toBe(27)
    expect(layout.websiteY).toBe(layout.address.bottomY)
  })

  it('fits the ICT sample email in the identity lane with ~18 pt remaining to trim', function () {
    var email = 'first.lastname@colliersprojectleaders.com'
    expect(fitsLine(fonts.font, email, L.bodySize, L.emailMaxWidth)).toBe(true)
    var layout = plan({ email: email })
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.email)
    var used = fonts.font.widthOfTextAtSize(email, L.bodySize)
    var remainingToTrim = L.bleed + L.trimW - (L.identityX + used)
    expect(remainingToTrim).toBeGreaterThan(18)
    expect(L.emailMaxWidth).toBe(141.52)
    expect(L.identityWidth).toBe(141.52)
  })

  it('fits hannah.sharpe@colliersprojectleaders.com on one email line', function () {
    var email = 'hannah.sharpe@colliersprojectleaders.com'
    expect(email.length).toBeLessThanOrEqual(50)
    expect(fitsLine(fonts.font, email, L.bodySize, L.emailMaxWidth)).toBe(true)
    var layout = plan({ email: email })
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.email)
    var used = fonts.font.widthOfTextAtSize(email, L.bodySize)
    expect(used).toBeGreaterThan(130)
    expect(used).toBeLessThanOrEqual(L.emailMaxWidth)
  })

  it('rejects an email that is within 50 characters but wider than the email lane', function () {
    var wide = 'WWWWWWWWWW@colliersprojectleaders.comWWWW'
    expect(wide.length).toBeLessThanOrEqual(50)
    expect(fitsLine(fonts.font, wide, L.bodySize, L.emailMaxWidth)).toBe(false)
    var layout = plan({ email: wide })
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.email)
  })

  it('accepts an email of 50 characters when it still fits the email lane, and rejects 51', function () {
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

  it('rejects degrees only when their combined rendered width does not fit', function () {
    var longA = padToWidth(
      fonts.fontBold,
      L.credentialSize,
      L.identityWidth + 20,
      'Dipl. Architectural '
    )
    var layout = plan({ degree: [longA, longA] }, 'English')
    expect(layout.valid).toBe(false)
    expect(layout.errors).toContain(LAYOUT_ERROR.credentials)
  })

  it('accepts more than two short degrees when they fit the available space', function () {
    var details = { name: 'Ada Lovelace', degree: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }
    var layout = plan(details, 'English')
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.credentials)
    expect(credentialsFitOnCard(details, fonts, 'English')).toBe(true)
  })

  it('reports when adding credentials exhausts the shared two-line budget', function () {
    var longA = padToWidth(
      fonts.fontBold,
      L.credentialSize,
      L.identityWidth + 20,
      'Dipl. Architectural '
    )
    expect(
      credentialsFitOnCard(
        { name: 'Ada Lovelace', degree: ['PMP'], additionalCredentials: longA },
        fonts,
        'English'
      )
    ).toBe(false)
  })

  it('returns the formatted number without a Mobile label', function () {
    var layout = plan({ phone: '4165550100' })
    expect(layout.phone).toBe('416 555 0100')
  })

  it('accepts Gestionnaire de projets principal | Nova Scotia as the title width lock', function () {
    var layout = plan({
      title: 'Gestionnaire de projets principal',
      region: 'Nova Scotia',
    })
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.title)
    expect(layout.title).toBe('Gestionnaire de projets principal | Nova Scotia')
    var used = fonts.font.widthOfTextAtSize(layout.title, L.bodySize)
    expect(used).toBeLessThanOrEqual(L.titleMaxWidth)
    expect(L.titleMaxWidth).toBe(141.52)
  })

  it('shrinks the Talent Acquisition French title so it fits the identity lane', function () {
    var layout = plan(
      {
        title: TITLE_FR_TALENT_ACQUISITION,
        region: 'Alberta',
      },
      'French'
    )
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.title)
    expect(layout.titleSize).toBeLessThan(L.bodySize)
    expect(
      fitsLine(fonts.font, TITLE_FR_TALENT_ACQUISITION, layout.titleSize, L.titleMaxWidth)
    ).toBe(true)
    expect(titleSizeFor(fonts.font, 'Directrice')).toBe(L.bodySize)
  })

  it('accepts bilingual Talent Acquisition with Alberta after shrinking the French title', function () {
    var product = planProductLayout(
      {
        name: 'Ada Lovelace',
        title: 'Talent Acquisition Business Partner',
        titleFr: TITLE_FR_TALENT_ACQUISITION,
        region: 'Alberta',
        email: 'ada@example.com',
        phone: '4165550100',
      },
      'Bilingual',
      fonts
    )
    expect(product.valid).toBe(true)
    expect(product.pages[1].layout.titleSize).toBeLessThan(L.bodySize)
    expect(product.pages[0].layout.titleSize).toBe(L.bodySize)
  })

  it('accepts Responsable du développement commercial | Quebec when region can split', function () {
    var layout = plan({
      title: 'Responsable du développement commercial',
      region: 'Quebec',
    })
    expect(layout.valid).toBe(true)
    expect(layout.errors).not.toContain(LAYOUT_ERROR.title)
    expect(layout.title).toBe('Responsable du développement commercial | Quebec')
    var preview = applyPreviewTitleRegionSplit(applyEmptyTeamIdentityLayout(layout), fonts)
    expect(preview.regionLine).toBe('Quebec')
    expect(preview.title).toBe('Responsable du développement commercial')
  })

  it('rejects a specialized team that is wider than the right-column cap', function () {
    var over = padToWidth(fonts.font, L.bodySize, L.identityWidth, 'Long ') + ' overflow'
    var layout = plan({ specializedTeam: over })
    expect(layout.errors).toContain(LAYOUT_ERROR.team)
    expect(layout.valid).toBe(false)
  })

  it('does not block on a long mobile or office', function () {
    var layout = plan({
      email: 'ada@example.com',
      phone: '4165550100',
      address: 'One\nTwo\nThree\nFour\nFive\nSix',
    })
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
      fonts
    )
    expect(product.valid).toBe(true)
    expect(product.pages.length).toBe(2)
    expect(product.pages[0].language).toBe('English')
    expect(product.pages[1].language).toBe('French')
    product.pages.forEach(function (page) {
      expect(page.layout.valid).toBe(true)
    })
  })

  it('uses titleFr on the bilingual French page', function () {
    var product = planProductLayout(
      {
        name: 'Ada Lovelace',
        title: 'Director',
        titleFr: 'Directrice',
        region: 'Ontario',
        email: 'ada@example.com',
        phone: '4165550100',
      },
      'Bilingual',
      fonts
    )
    expect(product.pages[0].fields.title).toContain('Director')
    expect(product.pages[1].fields.title).toContain('Directrice')
    expect(product.pages[1].fields.title).not.toContain('Director |')
  })
})

describe('preview empty-team and title/region split', function () {
  it('closes the unused team row so one gap sits under the title', function () {
    var layout = plan({})
    expect(layout.team).toBe('')
    expect(layout.titleY).toBe(L.titleYNoCred)
    var preview = applyEmptyTeamIdentityLayout(layout)
    expect(preview.titleY).toBeCloseTo(L.teamYNoCred, 2)
    expect(preview.emailY).toBe(43)
  })

  it('splits a wide title and region with no pipe', function () {
    var layout = applyEmptyTeamIdentityLayout(
      plan({
        title: 'Responsable du développement commercial',
        region: 'Quebec',
      })
    )
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.title).toBe('Responsable du développement commercial')
    expect(preview.regionLine).toBe('Quebec')
    expect(String(preview.title)).not.toContain('|')
  })
})

describe('previewContactYs', function () {
  it('leaves one blank line under the title without moving print contacts', function () {
    var layout = plan({})
    expect(layout.team).toBe('')
    expect(layout.emailY).toBe(43)
    var preview = previewContactYs(layout.titleY)
    expect(preview.emailY).toBeCloseTo(layout.titleY - L.bodyLineHeight * 2, 2)
    expect(preview.emailY).toBeCloseTo(50.99, 2)
    expect(preview.phoneY).toBeCloseTo(42.99, 2)
    expect(preview.websiteY).toBeCloseTo(34.99, 2)
  })

  it('does not replace print contacts when the caller still has a team row', function () {
    var layout = plan({ specializedTeam: 'Business Services' })
    expect(layout.team).toBe('Business Services')
    expect(layout.emailY).toBe(43)
    expect(layout.phoneY).toBe(35)
    expect(layout.websiteY).toBe(27)
  })

  it('closes the unused team row so one gap sits under the title', function () {
    var layout = plan({})
    expect(layout.titleY).toBe(L.titleYNoCred)
    var preview = applyEmptyTeamIdentityLayout(layout)
    expect(preview.titleY).toBeCloseTo(L.teamYNoCred, 2)
    expect(preview.lastNameY).toBeCloseTo(L.nameY - (L.titleYNoCred - L.teamYNoCred), 2)
    expect(preview.emailY).toBe(43)
    expect(preview.phoneY).toBe(35)
    expect(preview.websiteY).toBe(27)
    expect(preview.websiteY).toBe(L.addressBottomY)
  })

  it('keeps own-row credentials above the title and website on the address baseline', function () {
    var layout = plan({
      name: 'Carlos Zabaleta Copa',
      title: 'Managing Director',
      degree: ['Arch. Tech'],
      additionalCredentials: 'Additional Credentials',
      email: 'carlos.zabaleta@raymentcollins.com',
      phone: '6479179683',
      address: '202-485 Pinebush Road\nCambridge, ON\nN1T 0A6 Canada',
      website: 'colliersprojectleaders.com',
    })
    expect(layout.team).toBe('')
    expect(layout.credMode).toBe('own-row')
    expect(layout.titleY).toBe(L.titleYWithCred)

    var preview = applyEmptyTeamIdentityLayout(layout)
    expect(preview.titleY).toBeCloseTo(L.teamYNoCred, 2)
    expect(preview.credentialY).toBe(layout.credentialY)
    expect(preview.nameLineYs[0]).toBe(layout.nameLineYs[0])
    expect(preview.emailY).toBe(43)
    expect(preview.phoneY).toBe(35)
    expect(preview.websiteY).toBe(27)
  })
})

describe('applyPreviewTitleRegionSplit', function () {
  it('puts region on its own line even when Title | Region would fit (EN mirrors FR)', function () {
    var layout = applyEmptyTeamIdentityLayout(plan({ title: 'Broker', region: 'Ontario' }))
    expect(fitsLine(fonts.font, layout.title, L.bodySize, L.titleMaxWidth)).toBe(true)
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.title).toBe('Broker')
    expect(preview.regionLine).toBe('Ontario')
    expect(preview.regionY).toBeCloseTo(layout.titleY, 2)
    expect(preview.titleY).toBeCloseTo(layout.titleY + L.bodyLineHeight, 2)
  })

  it('joins region onto a short team line instead of the title', function () {
    var layout = plan({ title: 'Broker', region: 'Ontario', specializedTeam: 'human resources' })
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.title).toBe('Broker')
    expect(preview.team).toBe('human resources | Ontario')
    expect(preview.regionLine).toBeFalsy()
    expect(preview.titleY).toBe(layout.titleY)
    expect(preview.lastNameY).toBe(layout.lastNameY)
  })

  it('keeps Title | Region when team | region is too wide (Maximum stack)', function () {
    var layout = plan({
      title: 'Associate Director',
      region: 'British Columbia',
      specializedTeam: 'Project Management Advisory',
    })
    expect(
      fitsLine(
        fonts.font,
        'Project Management Advisory | British Columbia',
        L.bodySize,
        L.identityWidth
      )
    ).toBe(false)
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.title).toBe('Associate Director | British Columbia')
    expect(preview.team).toBe('Project Management Advisory')
    expect(preview.regionLine).toBeFalsy()
    expect(preview.lastNameY).toBe(layout.lastNameY)
  })

  it('splits before the measuring fonts load', function () {
    var layout = applyEmptyTeamIdentityLayout(plan({ title: 'Broker', region: 'Ontario' }))
    var preview = applyPreviewTitleRegionSplit(layout, null)
    expect(preview.title).toBe('Broker')
    expect(preview.regionLine).toBe('Ontario')
  })

  it('splits a wide French title and lifts identity by one body line', function () {
    var layout = applyEmptyTeamIdentityLayout(
      plan({
        title: 'Responsable du développement commercial',
        region: 'Quebec',
      })
    )
    expect(layout.title).toBe('Responsable du développement commercial | Quebec')
    expect(fitsLine(fonts.font, layout.title, L.bodySize, L.titleMaxWidth)).toBe(false)

    var beforeTitleY = layout.titleY
    var beforeNameY = layout.lastNameY
    var preview = applyPreviewTitleRegionSplit(layout, fonts)

    expect(preview.title).toBe('Responsable du développement commercial')
    expect(preview.regionLine).toBe('Quebec')
    expect(preview.regionY).toBeCloseTo(beforeTitleY, 2)
    expect(preview.titleY).toBeCloseTo(beforeTitleY + L.bodyLineHeight, 2)
    expect(preview.lastNameY).toBeCloseTo(beforeNameY + L.bodyLineHeight, 2)
    expect(preview.emailY).toBe(43)
    expect(preview.phoneY).toBe(35)
    expect(preview.websiteY).toBe(27)
  })

  it('merges overflow region onto the team line when a team is filled', function () {
    var layout = plan({
      title: 'Responsable du développement commercial',
      region: 'Quebec',
      specializedTeam: 'human resources',
    })
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.title).toBe('Responsable du développement commercial')
    expect(preview.team).toBe('human resources | Quebec')
    expect(preview.regionLine).toBeFalsy()
    expect(preview.titleY).toBe(layout.titleY)
    expect(preview.lastNameY).toBe(layout.lastNameY)
  })

  it('keeps region on its own line when overflow has no team', function () {
    var layout = applyEmptyTeamIdentityLayout(
      plan({
        title: 'Responsable du développement commercial',
        region: 'Quebec',
      })
    )
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.regionLine).toBe('Quebec')
    expect(preview.team).toBe('')
  })

  it('does not split when region is empty', function () {
    var layout = applyEmptyTeamIdentityLayout(plan({ title: 'Broker', region: '' }))
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.title).toBe('Broker')
    expect(preview.regionLine).toBeFalsy()
  })

  it('does not split when title alone is still too wide', function () {
    var over = padToWidth(fonts.font, L.bodySize, L.titleMaxWidth, 'Wide ') + ' overflow'
    var layout = applyEmptyTeamIdentityLayout(plan({ title: over, region: 'Ontario' }))
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.regionLine).toBeFalsy()
    expect(preview.title).toBe(layout.title)
  })
})

describe('teamFitsOnCard', function () {
  it('accepts a blank or short team', function () {
    expect(teamFitsOnCard({ specializedTeam: '' }, fonts)).toBe(true)
    expect(teamFitsOnCard({ specializedTeam: 'Healthcare Infrastructure' }, fonts)).toBe(true)
  })

  it('rejects a team wider than the identity column, same as the planner', function () {
    var team = 'Healthcare Infrastructure and Public Private Partnerships Advisory'
    expect(teamFitsOnCard({ specializedTeam: team }, fonts)).toBe(false)
    expect(plan({ specializedTeam: team }).errors).toContain(LAYOUT_ERROR.team)
  })
})

describe('bilingual region fallback', function () {
  it('stacks region on both faces when only the English Title | Region fits', function () {
    var details = {
      name: 'Ada Lovelace',
      title: 'Business Development Manager',
      titleFr: 'Responsable du développement commercial',
      region: 'Ontario',
      specializedTeam: 'Healthcare Infrastructure and Public Partnerships',
      email: 'ada@example.com',
      phone: '4165550100',
    }
    var faces = cardFaceTitles(details, 'Bilingual')
    expect(faces).toEqual([
      'Business Development Manager | Ontario',
      'Responsable du développement commercial | Ontario',
    ])
    var product = planProductLayout(details, 'Bilingual', fonts)
    var views = product.pages.map(function (page) {
      return applyPreviewTitleRegionSplit(page.layout, fonts, { faceTitles: faces })
    })
    expect(views[0].regionLine).toBe('Ontario')
    expect(views[1].regionLine).toBe('Ontario')
  })
})

describe('nameFitsOnCard and emailFitsOnCard', function () {
  it('accepts names up to two lines and rejects a word wider than the column', function () {
    expect(nameFitsOnCard({ name: 'Christopher Harrington-Wellington' }, fonts)).toBe(true)
    expect(
      nameFitsOnCard({ name: 'sdfasdfasdfsadf sadfasdfsadasdfasdfsdfsdadasdasdas' }, fonts)
    ).toBe(false)
  })

  it('moves the C.M. sample to its own row instead of clipping it', function () {
    // Grow the last word until the name alone just fills its line (no room for C.M.).
    var last = 'asdasd'
    while (
      credentialsFitOnCard({ name: 'asdasdasdasdasdasdasd ' + last + 'a' }, fonts, 'English')
    ) {
      last += 'a'
    }
    var name = 'asdasdasdasdasdasdasd ' + last
    expect(nameFitsOnCard({ name: name }, fonts)).toBe(true)
    var layout = plan(withSampleCredential({ name: name }, 'English'))
    expect(layout.inlineCredential).toBe('')
    expect(layout.credentialLine).toBe('C.M.')
    // Short name: the sample stays after the name.
    var short = plan(withSampleCredential({ name: 'Ada Lovelace' }, 'English'))
    expect(short.inlineCredential).toBe(', C.M.')
  })

  it('stops the name when the chosen credentials cannot fit anywhere', function () {
    var wide = 'Registered Professional Planner Certified Management Consultant'
    expect(nameFitsOnCard({ name: 'Ada Lovelace', additionalCredentials: wide }, fonts)).toBe(false)
  })

  it('matches the planner on the email line', function () {
    var long = 'asdasdasdasdasd.asdasd@colliersprojectleaders.com'
    expect(emailFitsOnCard('ada@colliersprojectleaders.com', fonts)).toBe(true)
    expect(emailFitsOnCard(long, fonts)).toBe(false)
    expect(plan({ email: long }).errors).toContain(LAYOUT_ERROR.email)
  })
})
