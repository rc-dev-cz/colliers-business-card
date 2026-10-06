<template>
  <div>
  <drawer :open="store.cartOpen" :close-label="t('close')" @close="closeCart">
    <span slot="label">{{ t('shoppingCart') }}</span>

    <empty-state v-if="!store.cart.length" :message="t('cartEmpty')"></empty-state>
    <div v-else>
      <ul class="space-y-6">
        <li
          v-for="line in store.cart"
          :key="line.id"
          class="flex items-start gap-4"
        >
          <div class="card-preview-frame w-[148px] max-w-[148px] shrink-0">
            <card-preview :details="line.details || {}" :language="line.language"></card-preview>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <div v-if="personName(line)" class="text-[15px] font-semibold leading-snug text-gray-900">{{ personName(line) }}</div>
                <div class="mt-0.5 text-[14px] leading-snug text-gray-900">{{ lineName(line) }}</div>
                <div class="mt-1.5 text-[13px] leading-snug text-gray-500">{{ t('language') }}: {{ line.language }}</div>
                <div class="mt-0.5 text-[13px] leading-snug text-gray-500">{{ t('qty') }}: {{ cardsQty(billedBoxes(line)) }}</div>
              </div>
              <div class="flex shrink-0 flex-col items-end gap-2">
                <div class="text-[15px] font-semibold text-gray-900">${{ lineAmount(line) }}</div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-colliers-primary"
                    :aria-label="t('previewCard')"
                    @click="openPreview(line)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <circle cx="11" cy="11" r="7"></circle>
                      <path d="M20 20l-3.5-3.5"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-colliers-primary"
                    :aria-label="t('editItem')"
                    @click="editLine(line)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div class="mt-6 border-t border-gray-200 pt-4">
        <button
          type="button"
          class="text-[14px] font-medium text-colliers-primary hover:underline"
          @click="clearCart"
        >
          {{ t('clearCart') }}
        </button>
      </div>
    </div>

    <div slot="footer" class="space-y-3">
      <div class="space-y-2">
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('subtotal') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm text-gray-700">
          <span>{{ t('shippingHandling') }}</span>
          <span>$0.00</span>
        </div>
        <div class="flex justify-between border-t border-gray-200 pt-2 text-[15px] font-semibold text-gray-900">
          <span>{{ t('total') }}</span>
          <span>${{ cartTotal.toFixed(2) }}</span>
        </div>
      </div>
      <app-button block :disabled="!store.cart.length" @click="goShipping">
        {{ t('continueToShippingCart') }}
      </app-button>
    </div>
  </drawer>
  <app-modal
    :open="Boolean(previewLine)"
    :title="t('businessCardPreview')"
    size="xl"
    @close="previewLine = null"
  >
    <div v-if="previewLine" class="space-y-4 px-5 py-5 sm:px-6">
      <div
        v-for="slot in previewSlots(previewLine)"
        :key="slot.language"
        class="card-preview-frame mx-auto max-w-[480px]"
      >
        <card-preview :details="slot.details" :language="slot.language"></card-preview>
      </div>
    </div>
  </app-modal>
  </div>
</template>

<script>
import Drawer from './Drawer.vue'
import EmptyState from './EmptyState.vue'
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'
import CardPreview from './CardPreview.vue'
import { store, t, closeCart, clearCart, subtotal, setProof, setEditLineId } from '../store'
import { productNameKey } from '../i18n/messages'
import { cardsFromBoxes, lineTotal } from '../helpers/cart'
import { billedBoxesForLine } from '../helpers/order'
import { isBilingualLanguage, WEBSITE_FR } from '../helpers/formatCardIdentity'
import { go } from '../adapters/nav'

export default {
  name: 'CartDrawer',
  components: { Drawer, EmptyState, AppButton, AppModal, CardPreview },
  data: function () {
    return { store: store, previewLine: null }
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
    cardsQty: cardsFromBoxes,
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    personName: function (line) {
      return String((line.details && line.details.name) || '').trim()
    },
    billedBoxes: function (line) {
      return billedBoxesForLine(line, store.order)
    },
    lineAmount: function (line) {
      return lineTotal(line, billedBoxesForLine(line, store.order)).toFixed(2)
    },
    previewSlots: function (line) {
      var details = line.details || {}
      if (isBilingualLanguage(line.language)) {
        return [
          { language: 'English', details: details },
          { language: 'French', details: Object.assign({}, details, { website: WEBSITE_FR }) },
        ]
      }
      return [{ language: line.language, details: details }]
    },
    openPreview: function (line) {
      this.previewLine = line
    },
    editLine: function (line) {
      this.previewLine = null
      setEditLineId(line.id)
      setProof({
        code: line.code,
        language: line.language,
        details: line.details,
      })
      closeCart()
      go('customize', { code: line.code })
    },
    goShipping: function () {
      this.previewLine = null
      closeCart()
      go('shipping')
    },
  },
}
</script>
