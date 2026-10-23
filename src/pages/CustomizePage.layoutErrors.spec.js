import { describe, expect, it } from 'vitest'
import CustomizePage from './CustomizePage.vue'
import { LAYOUT_ERROR } from '../helpers/cardLayout.js'

function page(region, pages, isBilingual) {
  var ctx = {
    details: { region: region },
    isBilingual: Boolean(isBilingual),
    productPlan: { valid: false, errors: [LAYOUT_ERROR.title], pages: pages },
    layoutErrorCode: LAYOUT_ERROR.title,
  }
  ctx.layoutErrors = CustomizePage.computed.layoutErrors.call(ctx)
  ctx.hasLayoutError = CustomizePage.methods.hasLayoutError.bind(ctx)
  ctx.layoutMessage = CustomizePage.methods.layoutMessage.bind(ctx)
  return ctx
}

function face(language, errors) {
  return { language: language, layout: { errors: errors } }
}

describe('title too long (BUG-12)', function () {
  it('leaves region out of the message when no region is chosen', function () {
    var ctx = page('', [face('English', [LAYOUT_ERROR.title])])
    expect(CustomizePage.computed.titleFieldError.call(ctx)).toBe(
      'This title is too long for the card.'
    )
    ctx.details.region = 'Ontario'
    expect(CustomizePage.computed.titleFieldError.call(ctx)).toBe(
      'This title and region are too long for the card.'
    )
  })

  it('shows the title message under the field only, not again under the preview', function () {
    var ctx = page('', [face('English', [LAYOUT_ERROR.title])])
    expect(CustomizePage.computed.previewLayoutError.call(ctx)).toBe('')
  })

  it('still shows errors with no field of their own under the preview', function () {
    var ctx = page('', [face('English', [LAYOUT_ERROR.address])])
    ctx.productPlan.errors = [LAYOUT_ERROR.address]
    ctx.layoutErrors = CustomizePage.computed.layoutErrors.call(ctx)
    expect(CustomizePage.computed.previewLayoutError.call(ctx)).toBe(
      'This office address is too long for the card.'
    )
  })

  it('bilingual: only the face whose title is too long gets the message', function () {
    var ctx = page('', [face('English', []), face('French', [LAYOUT_ERROR.title])], true)
    expect(CustomizePage.computed.titleFieldError.call(ctx)).toBe('')
    expect(CustomizePage.computed.titleFrFieldError.call(ctx)).toBe(
      'This title is too long for the card.'
    )
  })
})

describe('Mobile error (BUG-26)', function () {
  function phoneError(phone) {
    return CustomizePage.computed.phoneError.call({ details: { phone: phone } })
  }

  it('says incomplete for too few digits and invalid for too many or a non-Canadian number', function () {
    expect(phoneError('416 555 01')).toBe('Enter all 10 digits of the mobile number.')
    expect(phoneError('416 555 50199')).toBe('Enter a valid 10-digit Canadian number.')
    expect(phoneError('442 079 460958')).toBe('Enter a valid 10-digit Canadian number.')
    expect(phoneError('000 000 0000')).toBe('Enter a valid 10-digit Canadian number.')
    expect(phoneError('416 555 0199')).toBe('')
    expect(phoneError('')).toBe('')
  })
})
