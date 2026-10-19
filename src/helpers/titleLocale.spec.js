import { beforeAll, describe, expect, it } from 'vitest'
import { loadLayoutFonts } from './cardFonts.js'
import {
  CARD_LAYOUT,
  applyEmptyTeamIdentityLayout,
  applyPreviewTitleRegionSplit,
  fitsLine,
  planCardLayout,
  resolveCardFields,
} from './cardLayout.js'
import { TITLE_TODO, bilingualFrenchPreviewDetails } from './titleLocale.js'
import { WEBSITE_FR } from './formatCardIdentity.js'

var fonts

beforeAll(async function () {
  fonts = await loadLayoutFonts()
})

describe('TITLE_TODO geometry fixture', function () {
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
})

describe('bilingualFrenchPreviewDetails', function () {
  it('uses the picked French title', function () {
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

  it('leaves the French face title empty until one is picked', function () {
    var next = bilingualFrenchPreviewDetails({
      title: 'Director',
      titleFr: '',
      website: 'colliersprojectleaders.com',
    })
    expect(next.title).toBe('')
    expect(next.website).toBe(WEBSITE_FR)
  })

  it('does not mutate the source details object', function () {
    var src = { title: 'Director', titleFr: '' }
    bilingualFrenchPreviewDetails(src)
    expect(src.title).toBe('Director')
    expect(src.titleFr).toBe('')
  })
})
