import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { loadLayoutFonts } from './cardFonts.js'
import {
  CARD_LAYOUT,
  applyEmptyTeamIdentityLayout,
  applyPreviewTitleRegionSplit,
  fitsLine,
  planCardLayout,
  resolveCardFields,
} from './cardLayout.js'
import {
  TITLE_EN_TO_FR,
  TITLE_TODO,
  bilingualFrenchPreviewDetails,
  resolveBilingualFrenchTitle,
  resolveTitleForLanguage,
  suggestFrenchTitle,
} from './titleLocale.js'
import { WEBSITE_FR } from './formatCardIdentity.js'

var fonts
var seededPairs = Object.assign({}, TITLE_EN_TO_FR)

beforeAll(async function () {
  fonts = await loadLayoutFonts()
})

afterEach(function () {
  Object.keys(TITLE_EN_TO_FR).forEach(function (key) {
    delete TITLE_EN_TO_FR[key]
  })
  Object.keys(seededPairs).forEach(function (key) {
    TITLE_EN_TO_FR[key] = seededPairs[key]
  })
})

describe('suggestFrenchTitle', function () {
  it('returns Cynthia mapped French titles', function () {
    expect(suggestFrenchTitle('Director')).toBe('Directrice')
    expect(suggestFrenchTitle('Project Manager')).toBe('Gestionnaire de Projet')
    expect(suggestFrenchTitle('Team Lead')).toBe("Chef d'équipe")
    expect(suggestFrenchTitle('Talent Acquisition Business Partner')).toBe(
      "Partenaire d'affaires sénior en acquisition de talent"
    )
  })

  it('falls back to the English title when no pair exists', function () {
    expect(suggestFrenchTitle('Managing Director')).toBe('Managing Director')
  })

  it('keeps a title that is already a French map value', function () {
    expect(suggestFrenchTitle('Directrice')).toBe('Directrice')
  })

  it('leaves an empty title empty for Titre placeholders', function () {
    expect(suggestFrenchTitle('')).toBe('')
    expect(suggestFrenchTitle('   ')).toBe('')
  })
})

describe('resolveBilingualFrenchTitle', function () {
  it('uses the seeded map instead of TITLE_TODO', function () {
    expect(resolveBilingualFrenchTitle('Director')).toBe('Directrice')
    expect(resolveBilingualFrenchTitle('Director')).not.toBe(TITLE_TODO)
  })

  it('TITLE_TODO is long enough that Title | Region splits with no pipe on preview', function () {
    var joined = TITLE_TODO + ' | Ontario'
    expect(fitsLine(fonts.font, joined, CARD_LAYOUT.bodySize, CARD_LAYOUT.titleMaxWidth)).toBe(
      false
    )
    var layout = applyEmptyTeamIdentityLayout(
      planCardLayout(
        resolveCardFields(
          {
            name: 'Prénom Nom',
            title: TITLE_TODO,
            region: 'Ontario',
            email: 'prenom.nom@colliersprojectleaders.com',
            phone: '4165550100',
          },
          'French'
        ),
        fonts
      )
    )
    var preview = applyPreviewTitleRegionSplit(layout, fonts)
    expect(preview.title).toBe(TITLE_TODO)
    expect(preview.regionLine).toBe('Ontario')
    expect(preview.title).not.toContain('|')
    expect(String(preview.regionLine)).not.toContain('|')
  })

  it('returns a custom mapped French title when a pair is added', function () {
    TITLE_EN_TO_FR['Managing Director'] = 'Directeur général'
    expect(resolveBilingualFrenchTitle('Managing Director')).toBe('Directeur général')
  })
})

describe('resolveTitleForLanguage', function () {
  it('returns the selected title for English', function () {
    expect(resolveTitleForLanguage('Director', 'English')).toBe('Director')
  })

  it('returns the mapped French title for a French-only face', function () {
    expect(resolveTitleForLanguage('Director', 'French')).toBe('Directrice')
  })
})

describe('bilingualFrenchPreviewDetails', function () {
  it('prefers titleFr over the English map', function () {
    var next = bilingualFrenchPreviewDetails({
      title: 'Director',
      titleFr: 'Directeur',
      region: 'Ontario',
      website: 'colliersprojectleaders.com',
    })
    expect(next.website).toBe(WEBSITE_FR)
    expect(next.title).toBe('Directeur')
    expect(next.region).toBe('Ontario')
  })

  it('maps the English title when titleFr is empty', function () {
    var next = bilingualFrenchPreviewDetails({
      title: 'Director',
      titleFr: '',
      website: 'colliersprojectleaders.com',
    })
    expect(next.title).toBe('Directrice')
    expect(next.website).toBe(WEBSITE_FR)
  })

  it('does not mutate the source details object', function () {
    var src = { title: 'Director', titleFr: '' }
    bilingualFrenchPreviewDetails(src)
    expect(src.title).toBe('Director')
    expect(src.titleFr).toBe('')
  })
})
