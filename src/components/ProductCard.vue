<template>
  <article class="catalog-product-card group flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
    <div class="cursor-pointer bg-white p-1" @click="goDetails">
      <card-preview :details="{}" :language="product.language"></card-preview>
    </div>
    <div class="flex flex-1 flex-col p-6">
      <div
        class="mb-1 cursor-pointer text-[15px] font-bold text-gray-900 transition-colors group-hover:text-colliers-primary"
        @click="goDetails"
      >
        {{ name }}
      </div>
      <div class="mb-8 text-[14px] font-normal text-gray-600">{{ product.code }}</div>
      <div class="mb-6 mt-auto text-[15px] font-bold text-black">{{ price }}</div>
      <app-button variant="outline-soft" @click="goCustomize">{{ t('customize') }}</app-button>
      <div class="mt-3 text-center">
        <button
          type="button"
          class="text-[14px] text-gray-500 transition-colors hover:text-gray-900 focus:underline focus:outline-none"
          @click="goDetails"
        >
          <span class="border-b border-gray-300 pb-0.5 hover:border-gray-900">{{ t('details') }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<script>
import CardPreview from './CardPreview.vue'
import AppButton from './AppButton.vue'
import { productNameKey } from '../i18n/messages'
import { t } from '../store'
import { go } from '../adapters/nav'

export default {
  name: 'ProductCard',
  components: { CardPreview, AppButton },
  props: {
    product: { type: Object, required: true },
  },
  computed: {
    name: function () {
      return t(productNameKey(this.product.code))
    },
    price: function () {
      var amount = Number(this.product.price)
      var priceStr = Number.isFinite(amount) ? String(Math.round(amount)) : String(this.product.price)
      return t('pricePerBox').replace('{price}', priceStr)
    },
  },
  methods: {
    t: t,
    goCustomize: function () {
      go('customize', { code: this.product.code })
    },
    goDetails: function () {
      go('product-detail', { code: this.product.code })
    },
  },
}
</script>
