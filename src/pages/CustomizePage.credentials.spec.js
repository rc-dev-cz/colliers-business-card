import { afterEach, describe, expect, it, vi } from 'vitest'
import CustomizePage from './CustomizePage.vue'
import { store } from '../store.js'
import { loadLayoutFonts } from '../helpers/cardFonts'
import { nameFitsOnCard } from '../helpers/cardLayout'

afterEach(function () {
  vi.useRealTimers()
})

describe('CustomizePage credential space guards', function () {
  it('keeps the prior degree selection when an added degree does not fit', function () {
    var ctx = {
      details: { degree: ['PMP'], additionalCredentials: '' },
      credentialSpaceRejected: false,
      flashCredentialNotice: vi.fn(),
      credentialsFit: vi.fn(function () {
        return false
      }),
    }

    CustomizePage.methods.onDegrees.call(ctx, ['PMP', 'BSc Civil Engineering'])

    expect(ctx.details.degree).toEqual(['PMP'])
    expect(ctx.flashCredentialNotice).toHaveBeenCalledWith('degree')
  })

  it('allows degree removal even while the remaining credentials are still too long', function () {
    var ctx = {
      details: { degree: ['PMP', 'BSc Civil Engineering'], additionalCredentials: 'EIT' },
      credentialSpaceRejected: false,
      clearCredentialNotice: vi.fn(),
      credentialsFit: vi.fn(function () {
        return false
      }),
    }

    CustomizePage.methods.onDegrees.call(ctx, ['PMP'])

    expect(ctx.details.degree).toEqual(['PMP'])
    expect(ctx.clearCredentialNotice).toHaveBeenCalled()
  })

  it('refuses a whole Other credential that does not fit: field keeps it, card shows none (BUG-05)', function () {
    var ctx = {
      details: { degree: ['PMP'], additionalCredentials: 'MB' },
      otherCredentialDraft: 'MB',
      credentialsFit: vi.fn(function (details) {
        return details.additionalCredentials.length < 3
      }),
    }

    CustomizePage.methods.onAdditionalCredentials.call(ctx, 'MBA')

    expect(ctx.otherCredentialDraft).toBe('MBA')
    expect(ctx.details.additionalCredentials).toBe('')
    ctx.otherCredentialRejected = CustomizePage.computed.otherCredentialRejected.call(ctx)
    expect(ctx.otherCredentialRejected).toBe(true)
    expect(CustomizePage.computed.additionalSpaceNotice.call(ctx)).toBe(
      'No more space for credentials on the card.'
    )
  })

  it('keeps an Other credential that fits on the card', function () {
    var ctx = {
      details: { degree: [], additionalCredentials: '' },
      otherCredentialDraft: '',
      credentialsFit: vi.fn(function () {
        return true
      }),
    }

    CustomizePage.methods.onAdditionalCredentials.call(ctx, 'MBA')

    expect(ctx.details.additionalCredentials).toBe('MBA')
    expect(CustomizePage.computed.otherCredentialRejected.call(ctx)).toBe(false)
  })

  it('puts a refused Other credential on the card once a degree is removed', function () {
    var ctx = {
      details: { degree: ['PMP'], additionalCredentials: '' },
      otherCredentialDraft: 'MBA',
      otherCredentialRejected: true,
      credentialsFit: vi.fn(function (details) {
        return details.degree.length === 0
      }),
    }
    CustomizePage.methods.commitOtherCredentialDraft.call(ctx)
    expect(ctx.details.additionalCredentials).toBe('')

    ctx.details.degree = []
    CustomizePage.methods.commitOtherCredentialDraft.call(ctx)
    expect(ctx.details.additionalCredentials).toBe('MBA')
  })

  it('Remove other credential clears the refused text and closes the field', function () {
    var ctx = {
      details: { additionalCredentials: '' },
      otherCredentialDraft: 'MBA, PhD',
      otherCredentialOpen: true,
    }
    CustomizePage.methods.removeOtherCredential.call(ctx)
    expect(ctx.otherCredentialDraft).toBe('')
    expect(ctx.details.additionalCredentials).toBe('')
    expect(ctx.otherCredentialOpen).toBe(false)
  })

  it('blocks Preview Proof while Other credential is refused', function () {
    var ctx = {
      isBilingual: false,
      layoutReady: true,
      otherCredentialRejected: true,
      details: {
        name: 'Firstname Lastname',
        title: 'Director',
        email: 'first.lastname@colliersprojectleaders.com',
        phone: '4165550100',
        address: '1 University Ave',
      },
    }
    expect(CustomizePage.computed.canPreviewProof.call(ctx)).toBe(false)
    ctx.otherCredentialRejected = false
    expect(CustomizePage.computed.canPreviewProof.call(ctx)).toBe(true)
  })

  it('shows the no-space notice when every remaining credential is locked (BUG-09)', function () {
    var ctx = {
      details: { degree: ['PMP'] },
      lockedDegreeValues: ['MSc', 'PgMP'],
      credentialSpaceRejected: false,
      credentialNoticeField: '',
    }
    var prior = store.degrees
    store.degrees = ['PMP', 'MSc', 'PgMP']
    try {
      ctx.degreesFull = CustomizePage.computed.degreesFull.call(ctx)
      expect(ctx.degreesFull).toBe(true)
      ctx.degreeSpaceNotice = CustomizePage.computed.degreeSpaceNotice.call(ctx)
      expect(ctx.degreeSpaceNotice).toBe('No more space for credentials on the card.')
      // Full: red only, no yellow warning on top.
      expect(CustomizePage.computed.degreeSpaceWarning.call(ctx)).toBe('')

      // Some options still fit: yellow warning, no red error.
      ctx.lockedDegreeValues = ['PgMP']
      ctx.degreesFull = CustomizePage.computed.degreesFull.call(ctx)
      expect(ctx.degreesFull).toBe(false)
      ctx.degreeSpaceNotice = CustomizePage.computed.degreeSpaceNotice.call(ctx)
      expect(ctx.degreeSpaceNotice).toBe('')
      expect(CustomizePage.computed.degreeSpaceWarning.call(ctx)).toBe(
        'Little space left: only short credentials still fit on the card.'
      )

      ctx.lockedDegreeValues = []
      ctx.degreesFull = CustomizePage.computed.degreesFull.call(ctx)
      ctx.degreeSpaceNotice = CustomizePage.computed.degreeSpaceNotice.call(ctx)
      expect(ctx.degreeSpaceNotice).toBe('')
      expect(CustomizePage.computed.degreeSpaceWarning.call(ctx)).toBe('')
    } finally {
      store.degrees = prior
    }
  })

  it('clears the no-space notice after three seconds', function () {
    vi.useFakeTimers()
    var ctx = {
      credentialSpaceRejected: false,
      credentialNoticeField: '',
      credentialNoticeTimer: null,
    }
    ctx.flashCredentialNotice = CustomizePage.methods.flashCredentialNotice.bind(ctx)
    ctx.clearCredentialNotice = CustomizePage.methods.clearCredentialNotice.bind(ctx)

    ctx.flashCredentialNotice('degree')
    expect(ctx.credentialSpaceRejected).toBe(true)
    expect(ctx.credentialNoticeField).toBe('degree')

    vi.advanceTimersByTime(3000)
    expect(ctx.credentialSpaceRejected).toBe(false)
    expect(ctx.credentialNoticeField).toBe('')
  })
})

describe('CustomizePage name limit helper', function () {
  function limitReached(name, fonts) {
    return CustomizePage.computed.nameLimitReached.call({
      details: { name: name },
      layoutFonts: fonts || null,
    })
  }

  it('stays hidden for a short name and appears at 49 characters', function () {
    expect(limitReached('')).toBe(false)
    expect(limitReached('i'.repeat(48))).toBe(false)
    expect(limitReached('i'.repeat(49))).toBe(true)
    expect(limitReached('i'.repeat(50))).toBe(true)
  })

  it('appears before 49 characters when one more letter would not fit', async function () {
    var fonts = await loadLayoutFonts()
    // 46 narrow letters still fit on the name block; one more does not.
    var filled = 'i'.repeat(46)
    expect(filled.length).toBeLessThan(49)
    expect(nameFitsOnCard({ name: filled }, fonts)).toBe(true)
    expect(nameFitsOnCard({ name: filled + 'i' }, fonts)).toBe(false)
    expect(limitReached(filled, fonts)).toBe(true)
    expect(limitReached(filled.slice(0, -1), fonts)).toBe(false)
    expect(limitReached('Ada Lovelace', fonts)).toBe(false)
  })

  it('clips a name that does not fit without flashing a temporary error', async function () {
    var fonts = await loadLayoutFonts()
    var current = 'i'.repeat(46)
    var input = { value: current + 'i' }
    var ctx = {
      details: { name: current, degree: [], additionalCredentials: '' },
      layoutFonts: fonts,
      emailEdited: true,
      flashCredentialNotice: vi.fn(),
    }

    CustomizePage.methods.onName.call(ctx, current + 'i', { target: input })

    expect(ctx.details.name).toBe(current)
    expect(input.value).toBe(current)
    expect(ctx.flashCredentialNotice).not.toHaveBeenCalled()
    expect(limitReached(ctx.details.name, fonts)).toBe(true)
  })

  it('shows the helper when a wide letter is refused even though a narrow one would fit (BUG-08)', async function () {
    var fonts = await loadLayoutFonts()
    var ctx = {
      details: { name: '', degree: [], additionalCredentials: '' },
      layoutFonts: fonts,
      emailEdited: true,
      nameRefusedAt: '',
    }
    var typed = ''
    for (var n = 0; n < 50; n += 1) {
      typed = ctx.details.name + 'W'
      CustomizePage.methods.onName.call(ctx, typed, { target: { value: typed } })
    }
    var kept = ctx.details.name
    expect(kept.length).toBeLessThan(50)
    // The narrow-letter probe alone says there is still room…
    expect(nameFitsOnCard({ name: kept + 'i' }, fonts)).toBe(true)
    // …but the W was refused, so the helper shows.
    var shown = CustomizePage.computed.nameLimitReached.call({
      details: { name: kept },
      layoutFonts: fonts,
      nameRefusedAt: ctx.nameRefusedAt,
    })
    expect(shown).toBe(true)
    // Deleting a letter makes room again and hides it.
    var shorter = CustomizePage.computed.nameLimitReached.call({
      details: { name: kept.slice(0, -1) },
      layoutFonts: fonts,
      nameRefusedAt: ctx.nameRefusedAt,
    })
    expect(shorter).toBe(false)
  })
})
