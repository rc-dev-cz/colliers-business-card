import { describe, expect, it } from 'vitest'
import CustomizePage from './CustomizePage.vue'

describe('CustomizePage bilingual French title', function () {
  it('auto-fills titleFr from Cynthia’s map when the English title changes', function () {
    var ctx = {
      details: { title: '', titleFr: '' },
    }

    CustomizePage.methods.onTitle.call(ctx, 'Director')

    expect(ctx.details.title).toBe('Director')
    expect(ctx.details.titleFr).toBe('Directrice')
  })

  it('refreshes titleFr when the English title changes again', function () {
    var ctx = {
      details: { title: 'Director', titleFr: 'Directeur' },
    }

    CustomizePage.methods.onTitle.call(ctx, 'Project Manager')

    expect(ctx.details.titleFr).toBe('Gestionnaire de Projet')
  })

  it('keeps a hand-edited French title until the English title changes', function () {
    var ctx = {
      details: { title: 'Director', titleFr: 'Directrice' },
    }

    CustomizePage.methods.onTitleFr.call(ctx, 'Directeur')

    expect(ctx.details.title).toBe('Director')
    expect(ctx.details.titleFr).toBe('Directeur')
  })

  it('falls back to the English wording when no pair exists', function () {
    var ctx = {
      details: { title: '', titleFr: '' },
    }

    CustomizePage.methods.onTitle.call(ctx, 'Managing Director')

    expect(ctx.details.titleFr).toBe('Managing Director')
  })

  it('requires titleFr only on bilingual Preview Proof', function () {
    var bilingual = {
      isBilingual: true,
      layoutReady: true,
      details: {
        name: 'Firstname Lastname',
        title: 'Director',
        titleFr: '',
        email: 'first.lastname@colliersprojectleaders.com',
        phone: '4165550100',
        address: '1 University Ave',
      },
    }
    expect(CustomizePage.computed.canPreviewProof.call(bilingual)).toBe(false)

    bilingual.details.titleFr = 'Directrice'
    expect(CustomizePage.computed.canPreviewProof.call(bilingual)).toBe(true)

    var english = Object.assign({}, bilingual, { isBilingual: false })
    english.details.titleFr = ''
    expect(CustomizePage.computed.canPreviewProof.call(english)).toBe(true)
  })
})
