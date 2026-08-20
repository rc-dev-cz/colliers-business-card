<template>
  <colliers-page-shell>
    <div class="mx-auto flex max-w-xl flex-col items-center py-16 text-center sm:py-24">
      <div class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="mb-4 text-3xl font-bold text-gray-900">{{ t('orderConfirmed') }}</h1>
      <p class="mb-8 text-gray-600">{{ t('thankYou') }}</p>
      <app-button @click="backToCatalog">{{ t('returnToCatalog') }}</app-button>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import { t, clearCart, clearOrder } from '../store'
import { go } from '../adapters/nav'

export default {
  name: 'ConfirmedPage',
  components: { ColliersPageShell, AppButton },
  mounted: function () {
    clearCart()
    clearOrder()
  },
  methods: {
    t: t,
    backToCatalog: function () {
      go('catalog')
    },
  },
}
</script>
