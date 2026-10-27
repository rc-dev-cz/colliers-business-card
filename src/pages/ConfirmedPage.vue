<template>
  <colliers-page-shell>
    <div class="mx-auto flex max-w-xl flex-col items-center py-10 sm:py-16">
      <div
        class="w-full rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10 sm:py-14"
      >
        <div
          class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-colliers-primary text-white"
        >
          <svg
            class="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2.5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="colliers-page-title mb-4">{{ t('orderConfirmed') }}</h1>
        <!-- The order number the backend returns (FileMaker Place Order: $$BF_Model.orderId) -->
        <p v-if="store.lastOrder && store.lastOrder.orderId" class="mb-2 text-sm text-gray-500">
          {{ t('orderId') }}
          <span class="font-semibold text-gray-900">#{{ store.lastOrder.orderId }}</span>
        </p>
        <p class="mx-auto mb-8 max-w-md text-gray-600">{{ t('thankYou') }}</p>
        <app-button @click="backToCatalog">{{ t('returnToCatalog') }}</app-button>
      </div>
    </div>
    <!-- What Place Order sent to FileMaker (memory only, gone after a refresh) -->
    <div v-if="store.lastOrder" class="mx-auto max-w-4xl pb-12">
      <order-payload-panel
        :payload="store.lastOrder.payload"
        :order-id="String(store.lastOrder.orderId)"
      ></order-payload-panel>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import OrderPayloadPanel from '../components/OrderPayloadPanel.vue'
import { store, t } from '../store'
import { go } from '../adapters/nav'

export default {
  name: 'ConfirmedPage',
  components: { ColliersPageShell, AppButton, OrderPayloadPanel },
  data: function () {
    return { store: store }
  },
  methods: {
    t: t,
    backToCatalog: function () {
      go('catalog')
    },
  },
}
</script>
