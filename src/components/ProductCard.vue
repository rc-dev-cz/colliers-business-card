<template>
  <article class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="bg-gray-100 p-4 sm:p-5">
      <card-preview :details="defaultCardDetails"></card-preview>
    </div>
    <div class="flex flex-1 flex-col gap-3 p-5">
      <div>
        <div class="text-sm font-bold uppercase tracking-wide text-gray-900">{{ product.code }}</div>
        <div class="mt-1 text-[15px] text-gray-800">{{ name }}</div>
        <div class="mt-3 text-xl font-bold text-gray-900">{{ price }}</div>
      </div>
      <app-button variant="outline" @click="goCustomize">{{ t('customize') }}</app-button>
      <button type="button" class="text-center text-sm text-gray-500 hover:text-gray-900" @click="goDetails">
        {{ t('details') }}
      </button>
    </div>
  </article>
</template>

<script>
import CardPreview from './CardPreview.vue'
import AppButton from './AppButton.vue'
import { defaultCardDetails } from '../data/products'
import { productNameKey } from '../i18n/messages'
import { t } from '../store'
import { go } from '../adapters/nav'

export default {
  name: 'ProductCard',
  components: { CardPreview, AppButton },
  props: {
    product: { type: Object, required: true },
  },
  data: function () {
    return { defaultCardDetails: defaultCardDetails }
  },
  computed: {
    name: function () {
      return t(productNameKey(this.product.code))
    },
    price: function () {
      return '$' + Number(this.product.price).toFixed(2)
    },
  },
  methods: {
    t: t,
    goCustomize: function () {
      go('customize', { code: this.product.code })
    },
    goDetails: function () {
      go('details', { code: this.product.code })
    },
  },
}
</script>
