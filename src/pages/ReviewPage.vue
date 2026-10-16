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
        <svg
          class="mr-2 h-4 w-4 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M6 9V2h12v7"></path>
          <path
            d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"
          ></path>
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
          <table class="w-full min-w-[36rem] text-left text-sm">
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
                <td class="py-4 pr-4 align-middle">
                  <div class="flex items-center gap-4">
                    <div class="card-preview-frame card-preview-frame--thumb shrink-0">
                      <card-preview
                        :details="line.details || {}"
                        :language="previewLanguage(line)"
                        placeholders
                      ></card-preview>
                    </div>
                    <div class="min-w-0">
                      <div class="font-medium text-gray-900">
                        {{ personName(line) || lineName(line) }}
                      </div>
                      <div v-if="personName(line)" class="mt-0.5 text-sm text-gray-500">
                        {{ lineName(line) }}
                      </div>
                      <div v-if="line.language" class="mt-1 text-[13px] text-gray-500">
                        {{ t('language') }}: {{ line.language }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-2 py-4 text-right align-middle text-gray-700">
                  {{ splitLineQty(split, line) }}
                </td>
                <td class="px-2 py-4 text-right align-middle text-gray-700">
                  ${{ unitPrice(line) }}
                </td>
                <td class="py-4 pl-2 text-right align-middle font-medium text-gray-900">
                  ${{ lineAmount(split, line) }}
                </td>
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
          <ul
            v-if="split.locations && split.locations.length"
            class="divide-y divide-gray-100 rounded-lg border border-gray-100"
          >
            <li
              v-for="loc in split.locations"
              :key="loc.id"
              class="flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <span class="min-w-0 text-gray-700">{{ loc.address || t('enterAddress') }}</span>
              <span class="shrink-0 text-right tabular-nums">
                <span class="block font-medium text-gray-900">{{
                  boxLabel(locationBoxes(split, loc))
                }}</span>
                <span class="block text-xs text-gray-500"
                  >{{ cardsFromBoxes(locationBoxes(split, loc)) }} {{ t('cards') }}</span
                >
              </span>
            </li>
          </ul>
          <p v-else class="text-sm text-gray-500">{{ t('noShipToAddresses') }}</p>
        </div>
      </section>

      <aside
        class="ml-auto w-full max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm print:hidden"
      >
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('subtotal') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="mt-2 flex justify-between text-sm text-gray-700">
          <span>{{ t('shipping') }}</span>
          <span>{{ t('shippingTbd') }}</span>
        </div>
        <div
          class="mt-4 flex justify-between border-t border-gray-200 pt-4 text-base font-semibold text-colliers-primary"
        >
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
import CardPreview from '../components/CardPreview.vue'
import { store, t, linesInSplit, subtotal, confirmSubmit } from '../store'
import { productNameKey } from '../i18n/messages'
import { boxesPerAddressForSplit, readSplitQty } from '../helpers/order'
import { getProduct } from '../data/products'
import { cardsFromBoxes } from '../helpers/cart'
import { go } from '../adapters/nav'

export default {
  name: 'ReviewPage',
  components: { ColliersPageShell, AppButton, EmptyState, ErrorState, CardPreview },
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
    locationBoxes: function (split, loc) {
      return Number(loc.qty) > 0 ? Number(loc.qty) : boxesPerAddressForSplit(split, store.cart)
    },
    boxLabel: function (boxes) {
      var n = Number(boxes) || 0
      return n + ' ' + (n === 1 ? t('box') : t('boxes'))
    },
    cardsFromBoxes: cardsFromBoxes,
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    personName: function (line) {
      return String((line.details && line.details.name) || '').trim()
    },
    /** Same face as the cart drawer thumbnail (bilingual shows the English side). */
    previewLanguage: function (line) {
      return (
        line.language ||
        (line.details && line.details.language) ||
        (/PL-FR|-FR/i.test(String(line.code || '')) ? 'French' : '')
      )
    },
    unitPrice: function (line) {
      var product = getProduct(line.code)
      var price = (product && product.price) || line.price || 0
      return Number(price).toFixed(2)
    },
    splitLineQty: function (split, line) {
      return readSplitQty(split, line)
    },
    lineAmount: function (split, line) {
      var product = getProduct(line.code)
      var price = (product && product.price) || line.price || 0
      return (Number(price) * readSplitQty(split, line)).toFixed(2)
    },
    splitSubtotal: function (split) {
      var self = this
      return linesInSplit(split).reduce(function (sum, line) {
        return sum + Number(self.lineAmount(split, line))
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
