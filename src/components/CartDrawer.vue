<template>
  <drawer :open="store.cartOpen" :close-label="t('close')" @close="closeCart">
    <span slot="label">{{ t('shoppingCart') }}</span>

    <empty-state v-if="!store.cart.length" :message="t('cartEmpty')"></empty-state>
    <div v-else>
      <ul class="space-y-4">
        <li
          v-for="line in store.cart"
          :key="line.id"
          class="flex items-start gap-3 border-b border-gray-100 pb-4"
        >
          <img
            :src="lineImage(line)"
            :alt="lineName(line)"
            class="h-14 w-14 shrink-0 rounded object-cover"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-3">
              <div class="font-medium text-gray-900">{{ lineName(line) }}</div>
              <div class="shrink-0 font-semibold text-gray-900">${{ lineAmount(line) }}</div>
            </div>
            <div class="mt-1 text-sm text-gray-500">{{ t('language') }}: {{ line.language }}</div>
            <div class="mt-0.5 text-sm text-gray-500">{{ t('qty') }}: {{ line.quantity }}</div>
          </div>
        </li>
      </ul>
      <button
        type="button"
        class="mt-4 text-sm font-medium text-colliers-primary hover:text-colliers-primary-hover hover:underline"
        @click="clearCart"
      >
        {{ t('clearCart') }}
      </button>
    </div>

    <div slot="footer" class="space-y-3">
      <div class="space-y-2 border-t border-gray-200 pt-3">
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('subtotal') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('shippingHandling') }}</span>
          <span>$0.00</span>
        </div>
        <div class="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
          <span>{{ t('total') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
      </div>
      <app-button block :disabled="!store.cart.length" @click="goShipping">
        {{ t('continueToShippingCart') }}
      </app-button>
    </div>
  </drawer>
</template>

<script>
import Drawer from './Drawer.vue'
import EmptyState from './EmptyState.vue'
import AppButton from './AppButton.vue'
import { store, t, closeCart, clearCart, subtotal } from '../store'
import { getProduct } from '../data/products'
import { productNameKey } from '../i18n/messages'
import { lineTotal } from '../helpers/cart'
import { go } from '../adapters/nav'

export default {
  name: 'CartDrawer',
  components: { Drawer, EmptyState, AppButton },
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
    closeCart: closeCart,
    clearCart: clearCart,
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    lineImage: function (line) {
      const product = getProduct(line.code)
      return (product && product.image) || ''
    },
    lineAmount: function (line) {
      return lineTotal(line).toFixed(2)
    },
    goShipping: function () {
      closeCart()
      go('shipping')
    },
  },
}
</script>
