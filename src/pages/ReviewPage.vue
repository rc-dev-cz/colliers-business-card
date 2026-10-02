<template>
  <colliers-page-shell>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        @click="back"
      >
        <span aria-hidden="true">‹</span> {{ t('backToShipping') }}
      </button>
      <button type="button" class="btn-secondary print:hidden" @click="printOrder">
        <svg class="mr-2 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 9V2h12v7"></path>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
          <path d="M6 14h12v8H6z"></path>
        </svg>
        {{ t('printOrder') }}
      </button>
    </div>

    <div class="colliers-page-header">
      <h1 class="colliers-page-title">{{ t('reviewOrder') }}</h1>
    </div>

    <error-state v-if="store.submitError" class="mb-4" :message="store.submitError"></error-state>

    <empty-state v-if="!store.cart.length" :message="t('cartEmpty')"></empty-state>

    <div v-else class="space-y-6">
      <section
        v-for="(split, splitIndex) in store.order.splits"
        :key="split.id"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 class="mb-4 border-b border-gray-200 pb-3 text-base font-semibold text-gray-900">
          {{ t('shipment') }} {{ splitIndex + 1 }}
        </h2>

        <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ t('itemsHeading') }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr class="border-b border-gray-100 text-gray-400">
                <th class="pb-2 pr-4 font-medium">{{ t('item') }}</th>
                <th class="pb-2 px-2 text-right font-medium">{{ t('qty') }}</th>
                <th class="pb-2 px-2 text-right font-medium">{{ t('price') }}</th>
                <th class="pb-2 pl-2 text-right font-medium">{{ t('total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="line in linesInSplit(split)"
                :key="line.id"
                class="border-b border-gray-50"
              >
                <td class="py-3 pr-4 align-top">
                  <div class="font-medium text-gray-900">{{ lineName(line) }}</div>
                  <div v-if="personName(line)" class="mt-0.5 text-sm text-gray-500">{{ personName(line) }}</div>
                </td>
                <td class="px-2 py-3 text-right align-top text-gray-700">{{ cardsQty(line.quantity) }}</td>
                <td class="px-2 py-3 text-right align-top text-gray-700">${{ unitPrice(line) }}</td>
                <td class="py-3 pl-2 text-right align-top font-medium text-gray-900">${{ lineAmount(line) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end gap-6 text-sm font-semibold text-gray-900">
          <span>{{ t('subtotal') }}</span>
          <span>${{ splitSubtotal(split).toFixed(2) }}</span>
        </div>

        <div class="mt-6 border-t border-gray-100 pt-5">
          <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ t('shippingTo') }}</h3>
          <ul v-if="split.locations && split.locations.length" class="space-y-2">
            <li
              v-for="loc in split.locations"
              :key="loc.id"
              class="grid grid-cols-[1fr_auto] gap-4 text-sm text-gray-700"
            >
              <span>{{ loc.address || t('enterAddress') }}</span>
              <span class="min-w-[3rem] text-right tabular-nums">{{ cardsQty(loc.qty) }}</span>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-500">{{ t('noShipToAddresses') }}</p>
        </div>
      </section>

      <aside class="ml-auto w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:hidden">
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('subtotal') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="mt-2 flex justify-between text-sm text-gray-700">
          <span>{{ t('shipping') }}</span>
          <span>{{ t('shippingTbd') }}</span>
        </div>
        <div class="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-semibold text-colliers-primary">
          <span>{{ t('total') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
        <app-button
          block
          class="mt-5"
          :disabled="!store.cart.length || store.submitting"
          @click="confirm"
        >
          {{ t('placeOrder') }}
        </app-button>
      </aside>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import { store, t, linesInSplit, subtotal, confirmSubmit } from '../store'
import { productNameKey } from '../i18n/messages'
import { cardsFromBoxes, lineTotal } from '../helpers/cart'
import { getProduct } from '../data/products'
import { go } from '../adapters/nav'

export default {
  name: 'ReviewPage',
  components: { ColliersPageShell, AppButton, EmptyState, ErrorState },
  data: function () {
    return { store: store }
  },
  computed: {
    cartTotal: function () {
      return subtotal()
    },
  },
  methods: {
    t: t,
    linesInSplit: linesInSplit,
    cardsQty: cardsFromBoxes,
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    personName: function (line) {
      return String((line.details && line.details.name) || '').trim()
    },
    unitPrice: function (line) {
      var product = getProduct(line.code)
      var price = (product && product.price) || line.price || 0
      return Number(price).toFixed(2)
    },
    lineAmount: function (line) {
      return lineTotal(line).toFixed(2)
    },
    splitSubtotal: function (split) {
      return linesInSplit(split).reduce(function (sum, line) {
        return sum + lineTotal(line)
      }, 0)
    },
    back: function () {
      go('shipping')
    },
    printOrder: function () {
      window.print()
    },
    confirm: function () {
      confirmSubmit().then(function (ok) {
        if (ok) go('confirmed')
      })
    },
  },
}
</script>
