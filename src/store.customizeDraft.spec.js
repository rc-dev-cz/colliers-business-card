import { afterEach, describe, expect, it } from 'vitest'
import {
  addProofToCart,
  clearCart,
  clearCustomizeDraft,
  logout,
  login,
  readCustomizeDraft,
  saveCustomizeDraft,
  setProof,
  store,
} from './store.js'

var DETAILS = { name: 'Firstname Lastname', title: 'Title', degree: [], email: 'a@b.ca' }

describe('Customize draft survives a refresh', function () {
  afterEach(function () {
    clearCustomizeDraft()
    clearCart()
    store.proof = null
    store.editLineId = null
  })

  it('reads back the draft for the same card only', function () {
    saveCustomizeDraft({ code: 'BCAD-PL-ENG', lineId: null, details: DETAILS, emailEdited: true })
    var draft = readCustomizeDraft('BCAD-PL-ENG', null)
    expect(draft.details.name).toBe('Firstname Lastname')
    expect(draft.emailEdited).toBe(true)
    expect(readCustomizeDraft('BCAD-PL-FR', null)).toBe(null)
    expect(readCustomizeDraft('BCAD-PL-ENG', 'line-9')).toBe(null)
  })

  it('a draft for a cart line is used only when editing that line', function () {
    saveCustomizeDraft({ code: 'BCAD-PL-ENG', lineId: 'line-1', details: DETAILS })
    expect(readCustomizeDraft('BCAD-PL-ENG', 'line-1')).not.toBe(null)
    expect(readCustomizeDraft('BCAD-PL-ENG', null)).toBe(null)
  })

  it('is cleared once the card goes into the cart', function () {
    saveCustomizeDraft({ code: 'BCAD-PL-ENG', lineId: null, details: DETAILS })
    setProof({ code: 'BCAD-PL-ENG', language: 'English', details: DETAILS })
    addProofToCart()
    expect(readCustomizeDraft('BCAD-PL-ENG', null)).toBe(null)
  })

  it('is cleared on logout', function () {
    saveCustomizeDraft({ code: 'BCAD-PL-ENG', lineId: null, details: DETAILS })
    logout()
    expect(readCustomizeDraft('BCAD-PL-ENG', null)).toBe(null)
    login('demo')
  })
})
