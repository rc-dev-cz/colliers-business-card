import { describe, expect, it } from 'vitest'
import CustomizePage from './CustomizePage.vue'

describe('CustomizePage bilingual French title', function () {
  it('leaves the French title alone when the English title changes', function () {
    var ctx = {
      details: { title: 'Director', titleFr: 'Directrice' },
    }

    CustomizePage.methods.onTitle.call(ctx, 'Managing Principal')

    expect(ctx.details.title).toBe('Managing Principal')
    expect(ctx.details.titleFr).toBe('Directrice')
  })

  it('does not fill an empty French title from the English one', function () {
    var ctx = {
      details: { title: '', titleFr: '' },
    }

    CustomizePage.methods.onTitle.call(ctx, 'Director')

    expect(ctx.details.titleFr).toBe('')
  })

  it('stores the French title the user picks', function () {
    var ctx = {
      details: { title: 'Director', titleFr: '' },
    }

    CustomizePage.methods.onTitleFr.call(ctx, 'Directrice')

    expect(ctx.details.titleFr).toBe('Directrice')
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
