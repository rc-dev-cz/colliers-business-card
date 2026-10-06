import { describe, expect, it, vi } from 'vitest'
import CustomizePage from './CustomizePage.vue'

describe('CustomizePage credential space guards', function () {
  it('keeps the prior degree selection when an added degree does not fit', function () {
    var ctx = {
      details: { degree: ['PMP'], additionalCredentials: '' },
      credentialSpaceRejected: false,
      credentialsFit: vi.fn(function () {
        return false
      }),
    }

    CustomizePage.methods.onDegrees.call(ctx, ['PMP', 'BSc Civil Engineering'])

    expect(ctx.details.degree).toEqual(['PMP'])
    expect(ctx.credentialSpaceRejected).toBe(true)
  })

  it('allows degree removal even while the remaining credentials are still too long', function () {
    var ctx = {
      details: { degree: ['PMP', 'BSc Civil Engineering'], additionalCredentials: 'EIT' },
      credentialSpaceRejected: false,
      credentialsFit: vi.fn(function () {
        return false
      }),
    }

    CustomizePage.methods.onDegrees.call(ctx, ['PMP'])

    expect(ctx.details.degree).toEqual(['PMP'])
    expect(ctx.credentialSpaceRejected).toBe(true)
  })

  it('rejects additional credential growth and restores the controlled input value', function () {
    var input = { value: 'PMP, EIT' }
    var ctx = {
      details: { degree: ['BSc Civil Engineering'], additionalCredentials: 'PMP' },
      credentialSpaceRejected: false,
      credentialsFit: vi.fn(function () {
        return false
      }),
    }

    CustomizePage.methods.onAdditionalCredentials.call(ctx, 'PMP, EIT', { target: input })

    expect(ctx.details.additionalCredentials).toBe('PMP')
    expect(input.value).toBe('PMP')
    expect(ctx.credentialSpaceRejected).toBe(true)
  })
})
