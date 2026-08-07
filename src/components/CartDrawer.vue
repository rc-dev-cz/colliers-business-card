<script setup>
import { watch, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { useCart } from '../composables/useCart'
import { getProduct } from '../data/products'
import { productNameKey } from '../i18n/messages'

const router = useRouter()
const { t } = useLocale()
const { cart, cartOpen, closeCart, clearCart, subtotal } = useCart()
const drawer = ref(null)

watch(cartOpen, async (open) => {
  await customElements.whenDefined('sl-drawer')
  const el = drawer.value
  if (!el) return
  if (open) el.show()
  else el.hide()
})

function onAfterHide() {
  closeCart()
}

function goShipping() {
  closeCart()
  router.push({ name: 'shipping' })
}

function lineName(line) {
  return t(productNameKey(line.code))
}

function lineImage(line) {
  return getProduct(line.code)?.image || ''
}

function lineTotal(line) {
  const product = getProduct(line.code)
  const price = product?.price ?? line.price ?? 0
  return (price * line.quantity).toFixed(2)
}
</script>

<template>
  <sl-drawer
    ref="drawer"
    placement="end"
    style="--size: min(400px, 100vw)"
    @sl-after-hide="onAfterHide"
  >
    <div slot="label" class="text-lg font-semibold text-gray-900">{{ t('shoppingCart') }}</div>

    <div v-if="!cart.length" class="py-10 text-center text-gray-500">
      {{ t('cartEmpty') }}
    </div>

    <template v-else>
      <ul class="space-y-4">
        <li
          v-for="line in cart"
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
              <div class="shrink-0 font-semibold text-gray-900">${{ lineTotal(line) }}</div>
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
    </template>

    <div slot="footer" class="space-y-3">
      <div class="space-y-2 border-t border-gray-200 pt-3">
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('subtotal') }}</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('shippingHandling') }}</span>
          <span>$0.00</span>
        </div>
        <div class="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900">
          <span>{{ t('total') }}</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>
      </div>
      <button
        type="button"
        class="btn-primary w-full"
        :disabled="!cart.length"
        @click="goShipping"
      >
        {{ t('continueToShippingCart') }}
      </button>
    </div>
  </sl-drawer>
</template>
