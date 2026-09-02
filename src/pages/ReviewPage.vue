<template>
  <colliers-page-shell>
    <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
      <span aria-hidden="true">‹</span> {{ t('back') }}
    </button>

    <div class="colliers-page-header">
      <h1 class="colliers-page-title">{{ t('reviewOrder') }}</h1>
      <app-button :disabled="!store.cart.length || store.submitting" @click="confirm">
        {{ t('confirmOrder') }}
      </app-button>
    </div>

    <error-state v-if="store.submitError" class="mb-4" :message="store.submitError"></error-state>

    <empty-state v-if="!store.cart.length" :message="t('cartEmpty')"></empty-state>

    <div v-else class="space-y-6">
      <section class="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">{{ t('selectedItems') }}</h2>
        <ul class="space-y-3">
          <li
            v-for="line in store.cart"
            :key="line.id"
            class="flex items-start justify-between gap-3 border-b border-gray-100 pb-3"
          >
            <div>
              <div class="font-medium text-gray-900">{{ lineName(line) }}</div>
              <div class="text-sm text-gray-500">{{ t('qty') }}: {{ line.quantity }} · {{ line.language }}</div>
            </div>
            <div class="font-semibold text-gray-900">${{ lineAmount(line) }}</div>
          </li>
        </ul>
        <div class="mt-4 flex justify-between font-semibold text-gray-900">
          <span>{{ t('total') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="mt-1 flex justify-between text-sm text-gray-500">
          <span>{{ t('shippingHandling') }}</span>
          <span>$0.00</span>
        </div>
      </section>

      <section
        v-for="(split, splitIndex) in store.order.splits"
        :key="split.id"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
      >
        <h2 class="mb-3 text-lg font-semibold text-gray-900">
          {{ t('shipping') }} {{ splitIndex + 1 }}
        </h2>
        <p class="mb-2 text-sm text-gray-500">{{ t('selectedItems') }}</p>
        <ul class="mb-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li v-for="line in linesInSplit(split)" :key="line.id">
            {{ lineName(line) }} × {{ line.quantity }}
          </li>
        </ul>
        <p class="mb-2 text-sm text-gray-500">{{ t('shipToAddress') }}</p>
        <ul class="list-disc space-y-1 pl-5 text-sm text-gray-700">
          <li v-for="loc in split.locations" :key="loc.id">
            {{ loc.address || t('enterAddress') }} · {{ t('qty') }} {{ loc.qty }}
          </li>
        </ul>
      </section>
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
import { lineTotal } from '../helpers/cart'
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
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    lineAmount: function (line) {
      return lineTotal(line).toFixed(2)
    },
    back: function () {
      go('shipping')
    },
    confirm: function () {
      confirmSubmit().then(function (ok) {
        if (ok) go('confirmed')
      })
    },
  },
}
</script>
