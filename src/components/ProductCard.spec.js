import { describe, expect, it } from 'vitest'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import ProductCard from './ProductCard.vue'
import { getProduct } from '../data/products.js'

const localVue = createLocalVue()

describe('ProductCard price (BUG-15)', function () {
  it('shows the box price with cents', function () {
    var wrapper = shallowMount(ProductCard, {
      localVue: localVue,
      propsData: { product: getProduct('BCAD-PL-ENG') },
    })
    expect(wrapper.vm.price).toBe('$63.00 / box of 250 cards')
  })
})
