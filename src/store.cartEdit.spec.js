import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  addProofToCart,
  setEditLineId,
  setProof,
  store,
} from './store.js'
import { makeLine } from './helpers/cart.js'

describe('edit cart line from proof', function () {
  var previousCart
  var previousProof
  var previousEdit

  beforeEach(function () {
    previousCart = store.cart
    previousProof = store.proof
    previousEdit = store.editLineId
    store.cart = [
      makeLine({
        id: 'line-1',
        code: 'BCAD-PL-FR',
        language: 'French',
        quantity: 1,
        details: {
          name: 'Carlos Zabaleta Copa',
          title: 'Associate',
          region: 'Ontario',
          degree: ['Arch. Tech'],
          additionalCredentials: '',
          email: 'carlos.zabaleta@raymentcollins.com',
          phone: '6479179683',
          address: '202-485 Pinebush Road',
        },
      }),
    ]
    store.proof = null
    store.editLineId = null
  })

  afterEach(function () {
    store.cart = previousCart
    store.proof = previousProof
    store.editLineId = previousEdit
  })

  it('updates the existing line instead of adding a duplicate', function () {
    setEditLineId('line-1')
    setProof({
      code: 'BCAD-PL-FR',
      language: 'French',
      details: {
        name: 'Carlos Zabaleta Copa',
        title: 'Associate',
        region: 'Ontario',
        degree: ['Arch. Tech', 'Architect'],
        additionalCredentials: 'Additional Credentials',
        email: 'carlos.zabaleta@raymentcollins.com',
        phone: '6479179683',
        address: '202-485 Pinebush Road',
      },
    })

    addProofToCart()

    expect(store.cart.length).toBe(1)
    expect(store.cart[0].id).toBe('line-1')
    expect(store.cart[0].quantity).toBe(1)
    expect(store.cart[0].details.degree).toEqual(['Arch. Tech', 'Architect'])
    expect(store.cart[0].details.additionalCredentials).toBe('Additional Credentials')
    expect(store.editLineId).toBe(null)
  })

  it('still updates when editLineId lives only on the proof', function () {
    store.editLineId = null
    setProof({
      code: 'BCAD-PL-FR',
      language: 'French',
      editLineId: 'line-1',
      details: {
        name: 'Carlos Zabaleta Copa',
        title: 'Director',
        region: 'Ontario',
        degree: [],
        additionalCredentials: '',
        email: 'carlos.zabaleta@raymentcollins.com',
        phone: '6479179683',
        address: '202-485 Pinebush Road',
      },
    })

    addProofToCart()

    expect(store.cart.length).toBe(1)
    expect(store.cart[0].details.title).toBe('Director')
  })
})
