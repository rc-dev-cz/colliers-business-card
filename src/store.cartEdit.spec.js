import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  addProofToCart,
  logout,
  setEditLineId,
  setProof,
  startNewCustomize,
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

  it('catalog customize clears edit so add to cart does not overwrite the line', function () {
    setEditLineId('line-1')
    setProof({
      code: 'BCAD-PL-FR',
      language: 'French',
      details: store.cart[0].details,
    })
    startNewCustomize()
    expect(store.editLineId).toBe(null)
    expect(store.proof).toBe(null)

    setProof({
      code: 'BCAD-PL-FR',
      language: 'French',
      details: {
        name: 'Firstname Lastname',
        title: 'Director',
        region: '',
        degree: [],
        additionalCredentials: '',
        email: 'first.lastname@colliersprojectleaders.com',
        phone: '416 555-1234',
        address: '300-5515 North Service Road',
      },
    })
    addProofToCart()

    expect(store.cart.length).toBe(2)
    expect(store.cart[0].id).toBe('line-1')
    expect(store.cart[0].details.name).toBe('Carlos Zabaleta Copa')
    expect(store.cart[1].details.name).toBe('Firstname Lastname')
  })

  it('remembers the added line so Back to Edit updates it instead of adding another', function () {
    setProof({
      code: 'BCAD-PL-BIL',
      language: 'Bilingual',
      details: { name: 'Firstname', title: 'Associate' },
    })
    addProofToCart()
    expect(store.cart.length).toBe(2)
    var addedId = store.proof.cartLineId
    expect(addedId).toBe(store.cart[1].id)

    // Back to Edit: Customize picks up proof.cartLineId as the edit target
    setEditLineId(store.proof.cartLineId)
    setProof({
      code: 'BCAD-PL-BIL',
      language: 'Bilingual',
      details: { name: 'Firstname Lastname', title: 'Associate' },
    })
    addProofToCart()
    expect(store.cart.length).toBe(2)
    expect(store.cart[1].id).toBe(addedId)
    expect(store.cart[1].details.name).toBe('Firstname Lastname')
    expect(store.proof.cartLineId).toBe(addedId)
  })

  it('does not add a line when editLineId is set but missing from cart', function () {
    setEditLineId('missing-line')
    setProof({
      code: 'BCAD-PL-ENG',
      language: 'English',
      details: { name: 'Pepe', title: 'Associate' },
    })
    addProofToCart()
    expect(store.cart.length).toBe(1)
    expect(store.cart[0].id).toBe('line-1')
  })
})

describe('logout', function () {
  it('clears the cart and shipping draft so the next login starts empty', function () {
    store.cart = [makeLine({ id: 'line-x', code: 'BCAD-PL-ENG', quantity: 2, details: {} })]
    store.order.splits[0].itemIds = ['line-x']
    store.order.splits[0].locations = [{ id: 'loc-1', address: '1 Test Road', qty: 2 }]
    logout()
    expect(store.cart).toEqual([])
    expect(store.order.splits.length).toBe(1)
    expect(store.order.splits[0].itemIds).toEqual([])
    expect(store.order.splits[0].locations).toEqual([])
  })
})
