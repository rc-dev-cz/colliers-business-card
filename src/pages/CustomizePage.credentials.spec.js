import { afterEach, describe, expect, it, vi } from 'vitest'
import CustomizePage from './CustomizePage.vue'

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

  it('rejects additional credential growth and restores the controlled input value', function () {
    var input = { value: 'PMP, EIT' }
    var ctx = {
      details: { degree: ['BSc Civil Engineering'], additionalCredentials: 'PMP' },
      credentialSpaceRejected: false,
      flashCredentialNotice: vi.fn(),
      credentialsFit: vi.fn(function () {
        return false
      }),
    }

    CustomizePage.methods.onAdditionalCredentials.call(ctx, 'PMP, EIT', { target: input })

    expect(ctx.details.additionalCredentials).toBe('PMP')
    expect(input.value).toBe('PMP')
    expect(ctx.flashCredentialNotice).toHaveBeenCalledWith('additional')
  })

  it('shows the no-space notice only on the field that was just limited', function () {
    var ctx = {
      credentialSpaceRejected: true,
      credentialNoticeField: 'additional',
    }
    expect(CustomizePage.computed.degreeSpaceNotice.call(ctx)).toBe('')
    expect(CustomizePage.computed.additionalSpaceNotice.call(ctx)).toBe(
      'No more space for credentials on the card.'
    )
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
