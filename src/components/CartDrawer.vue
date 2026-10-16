<template>
  <div>
    <drawer :open="store.cartOpen" :close-label="t('close')" @close="closeCart">
      <span slot="label">{{ t('shoppingCart') }}</span>

      <empty-state v-if="!store.cart.length" :message="t('cartEmpty')"></empty-state>
      <div v-else>
        <ul class="space-y-6">
          <li v-for="line in store.cart" :key="line.id" class="flex items-start gap-4">
            <button
              type="button"
              class="card-preview-frame w-[148px] max-w-[148px] shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0 text-left transition hover:shadow-[0_0_0_2px_rgba(37,64,143,0.4)] focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(37,64,143,0.4)] [&_*]:pointer-events-none"
              :aria-label="t('previewCard')"
              @click.stop="openPreview(line)"
            >
              <card-preview
                :details="line.details || {}"
                :language="
                  line.language ||
                  (line.details && line.details.language) ||
                  (/PL-FR|-FR/i.test(String(line.code || '')) ? 'French' : '')
                "
                placeholders
              ></card-preview>
            </button>
            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <div
                    v-if="personName(line)"
                    class="text-[15px] font-semibold leading-snug text-gray-900"
                  >
                    {{ personName(line) }}
                  </div>
                  <div class="mt-0.5 text-[14px] leading-snug text-gray-900">
                    {{ lineName(line) }}
                  </div>
                  <div class="mt-1.5 text-[13px] leading-snug text-gray-500">
                    {{ t('language') }}: {{ line.language }}
                  </div>
                  <div class="mt-0.5 text-[13px] leading-snug text-gray-500">
                    {{ t('qty') }}: {{ line.quantity }}
                  </div>
                </div>
                <div class="flex shrink-0 flex-col items-end gap-2">
                  <div class="text-[15px] font-semibold text-gray-900">${{ lineAmount(line) }}</div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-colliers-primary"
                      :aria-label="t('editItem')"
                      @click="editLine(line)"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-600"
                      :aria-label="t('removeFromCart')"
                      @click.stop="removeLine(line.id)"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        aria-hidden="true"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M8 6V4h8v2"></path>
                        <path d="M19 6l-1 14H6L5 6"></path>
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
          <div
            class="flex justify-between border-t border-gray-200 pt-2 text-[15px] font-semibold text-gray-900"
          >
            <span>{{ t('total') }}</span>
            <span>${{ cartTotal.toFixed(2) }}</span>
          </div>
        </div>
        <app-button block :disabled="!store.cart.length" @click="goShipping">
          {{ t('continueToShippingCart') }}
        </app-button>
      </div>
    </drawer>
    <div ref="previewHost" class="pointer-events-none fixed inset-0 z-[80]">
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
            <card-preview
              :details="slot.details"
              :language="slot.language"
              placeholders
            ></card-preview>
          </div>
        </div>
      </app-modal>
    </div>
  </div>
</template>

<script>
import Drawer from './Drawer.vue'
import EmptyState from './EmptyState.vue'
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'
import CardPreview from './CardPreview.vue'
import {
  store,
  t,
  closeCart,
  clearCart,
  removeLine,
  subtotal,
  setProof,
  setEditLineId,
  startShippingFromCart,
} from '../store'
import { productNameKey } from '../i18n/messages'
import { lineTotal } from '../helpers/cart'
import { isBilingualLanguage } from '../helpers/formatCardIdentity'
import { bilingualFrenchPreviewDetails } from '../helpers/titleLocale'
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
  mounted: function () {
    if (this.$refs.previewHost) document.body.appendChild(this.$refs.previewHost)
  },
  beforeDestroy: function () {
    var host = this.$refs.previewHost
    if (host && host.parentNode) host.parentNode.removeChild(host)
  },
  watch: {
    'store.cartOpen': function (open) {
      if (!open) this.previewLine = null
    },
  },
  methods: {
    t: t,
    removeLine: removeLine,
    closeCart: function () {
      if (this.previewLine) {
        this.previewLine = null
        return
      }
      closeCart()
    },
    clearCart: clearCart,
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    personName: function (line) {
      return String((line.details && line.details.name) || '').trim()
    },
    lineAmount: function (line) {
      return lineTotal(line).toFixed(2)
    },
    previewSlots: function (line) {
      var details = line.details || {}
      if (isBilingualLanguage(line.language)) {
        return [
          { language: 'English', details: details },
          { language: 'French', details: bilingualFrenchPreviewDetails(details) },
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
      go('customize', { code: line.code, lineId: line.id })
    },
    goShipping: function () {
      this.previewLine = null
      closeCart()
      startShippingFromCart()
      go('shipping')
    },
  },
}
</script>
