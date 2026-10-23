import { afterEach, describe, expect, it, vi } from 'vitest'
import CustomizePage from './CustomizePage.vue'
import { store } from '../store.js'

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
      expect(CustomizePage.computed.degreeSpaceNotice.call(ctx)).toBe(
        'No more space for credentials on the card.'
      )

      // Some options still fit: say why the greyed-out ones are locked.
      ctx.lockedDegreeValues = ['PgMP']
      ctx.degreesFull = CustomizePage.computed.degreesFull.call(ctx)
      expect(ctx.degreesFull).toBe(false)
      expect(CustomizePage.computed.degreeSpaceNotice.call(ctx)).toBe(
        'Greyed-out credentials no longer fit on the card.'
      )

      ctx.lockedDegreeValues = []
      ctx.degreesFull = CustomizePage.computed.degreesFull.call(ctx)
      expect(CustomizePage.computed.degreeSpaceNotice.call(ctx)).toBe('')
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
