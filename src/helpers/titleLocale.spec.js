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
} from './titleLocale.js'
import { WEBSITE_FR } from './formatCardIdentity.js'

var fonts

beforeAll(async function () {
  fonts = await loadLayoutFonts()
})

afterEach(function () {
  Object.keys(TITLE_EN_TO_FR).forEach(function (key) {
    delete TITLE_EN_TO_FR[key]
  })
})

describe('resolveBilingualFrenchTitle', function () {
  it('returns the long French placeholder when the English title has no pair', function () {
    expect(resolveBilingualFrenchTitle('Managing Director')).toBe(TITLE_TODO)
    expect(TITLE_TODO.length).toBeGreaterThan(40)
  })

  it('is long enough that Title | Region splits with no pipe on preview', function () {
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

  it('returns the mapped French title when a pair exists', function () {
    TITLE_EN_TO_FR['Managing Director'] = 'Directeur général'
    expect(resolveBilingualFrenchTitle('Managing Director')).toBe('Directeur général')
  })

  it('keeps a title that is already a French map value', function () {
    TITLE_EN_TO_FR['Managing Director'] = 'Directeur général'
    expect(resolveBilingualFrenchTitle('Directeur général')).toBe('Directeur général')
  })

  it('leaves an empty title empty for Titre placeholders', function () {
    expect(resolveBilingualFrenchTitle('')).toBe('')
    expect(resolveBilingualFrenchTitle('   ')).toBe('')
  })
})

describe('resolveTitleForLanguage', function () {
  it('returns the selected title for English', function () {
    expect(resolveTitleForLanguage('Managing Director', 'English')).toBe('Managing Director')
  })

  it('returns the French placeholder for a French face when unmapped', function () {
    expect(resolveTitleForLanguage('Managing Director', 'French')).toBe(TITLE_TODO)
  })
})

describe('bilingualFrenchPreviewDetails', function () {
  it('sets the French website and resolves the title', function () {
    var next = bilingualFrenchPreviewDetails({
      title: 'Associate',
      region: 'Ontario',
      website: 'colliersprojectleaders.com',
    })
    expect(next.website).toBe(WEBSITE_FR)
    expect(next.title).toBe(TITLE_TODO)
    expect(next.region).toBe('Ontario')
  })

  it('does not mutate the source details object', function () {
    var src = { title: 'Associate' }
    bilingualFrenchPreviewDetails(src)
    expect(src.title).toBe('Associate')
  })
})
