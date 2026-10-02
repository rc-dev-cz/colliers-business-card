<template>
  <colliers-page-shell>
    <div class="mx-auto flex max-w-xl flex-col items-center py-10 sm:py-16">
      <div
        class="w-full rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10 sm:py-14"
      >
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-colliers-primary text-white"
        >
          <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="colliers-page-title mb-4">{{ t('orderConfirmed') }}</h1>
        <p class="mx-auto mb-8 max-w-md text-gray-600">{{ t('thankYou') }}</p>
        <app-button @click="backToCatalog">{{ t('returnToCatalog') }}</app-button>
      </div>
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
