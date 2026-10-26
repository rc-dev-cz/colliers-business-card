<template>
  <colliers-page-shell>
    <div class="colliers-page-header mb-5">
      <div class="min-w-0">
        <button
          type="button"
          class="mb-1 inline-flex items-center gap-1 text-xs leading-none text-gray-500 hover:text-gray-800"
          @click="back"
        >
          <span aria-hidden="true">‹</span> {{ t('back') }}
        </button>
        <h1 class="colliers-page-title">{{ t('shipping') }}</h1>
      </div>
      <div class="colliers-page-header__actions">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
          <span v-if="selectedItemCount"
            >{{ t('total') }} {{ selectedItemCount }}
            {{ t(selectedItemCount === 1 ? 'itemOne' : 'items') }}</span
          >
          <template v-if="hasAssignedBoxes">
            <span class="hidden h-3 w-px bg-gray-300 sm:inline-block" aria-hidden="true"></span>
            <span>{{ orderCards() }} {{ t('cards') }} · {{ boxLabel(orderBoxes()) }}</span>
          </template>
        </div>
        <app-button
          class="inline-flex items-center gap-2"
          :disabled="!canCheckout"
          @click="checkout"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.75"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
          {{ t('reviewCheckout') }}
        </app-button>
      </div>
    </div>

    <p v-if="emptySplit" class="mb-4 text-sm text-red-600">{{ t('emptyShipment') }}</p>

    <div class="space-y-6">
      <div
        v-for="(split, splitIndex) in store.order.splits"
        :key="split.id"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div
          class="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0"
        >
          <section class="flex min-h-[300px] flex-col p-5 sm:p-6">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">{{ t('selectedItems') }}</h2>
            <div class="relative flex-1">
              <div
                v-if="!linesInSplit(split).length"
                class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center py-10 text-center text-sm text-gray-400"
              >
                {{ t('noItemsSelected') }}
              </div>
              <ul
                class="js-cart-sortable relative z-10 min-h-[8rem] space-y-4"
                :data-split-id="split.id"
              >
                <li
                  v-for="line in linesInSplit(split)"
                  :key="line.id"
                  :data-line-id="line.id"
                  class="flex items-center gap-4 rounded-md outline-none"
                >
                  <div
                    class="drag-handle flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
                    role="button"
                    tabindex="0"
                    :aria-label="t('reorderItem')"
                  >
                    <svg
                      width="10"
                      height="16"
                      viewBox="0 0 10 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="8" cy="2" r="1.5" />
                      <circle cx="2" cy="8" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="2" cy="14" r="1.5" />
                      <circle cx="8" cy="14" r="1.5" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    class="card-preview-frame w-[6rem] max-w-[6rem] shrink-0 cursor-pointer overflow-hidden rounded-md border-0 bg-transparent p-0 text-left transition hover:shadow-[0_0_0_2px_rgba(37,64,143,0.4)] focus:outline-none focus-visible:shadow-[0_0_0_2px_rgba(37,64,143,0.4)] sm:w-[8.5rem] sm:max-w-[8.5rem] [&_*]:pointer-events-none"
                    :aria-label="t('previewCard')"
                    @click="openPreview(line)"
                  >
                    <card-preview
                      :details="line.details || {}"
                      :language="line.language"
                    ></card-preview>
                  </button>
                  <div class="min-w-0 flex-1">
                    <!-- Phones: boxes go under the name so the name gets the full width -->
                    <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-3">
                      <div class="min-w-0 flex-1">
                        <!-- Phones wrap instead of "Test P…" so two cards can be told apart (BUG-23) -->
                        <div
                          v-if="personName(line)"
                          class="break-words text-[15px] font-semibold leading-snug text-gray-900 sm:truncate"
                        >
                          {{ personName(line) }}
                        </div>
                        <div
                          class="mt-0.5 break-words text-[14px] leading-snug text-gray-900 sm:truncate"
                        >
                          {{ lineName(line) }}
                        </div>
                      </div>
                      <div class="flex shrink-0 items-baseline gap-2 pt-0.5 sm:block sm:text-right">
                        <div
                          class="text-sm font-medium tabular-nums"
                          :class="
                            (split.locations || []).length ? 'text-gray-900' : 'text-gray-400'
                          "
                        >
                          {{ boxLabel(assignedLineQty(split, line)) }}
                        </div>
                        <div class="mt-0.5 text-xs tabular-nums text-gray-500">
                          {{ lineCards(split, line) }} {{ t('cards') }}
                        </div>
                      </div>
                    </div>
                    <div class="mt-2 flex items-center gap-1">
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
                      <span class="group relative inline-flex">
                        <button
                          type="button"
                          class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-600"
                          :aria-label="t('removeFromShipment')"
                          :aria-describedby="'ship-trash-tip-' + split.id + '-' + line.id"
                          @click.stop="removeLineFromSplit(split, line.id)"
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
                        <span
                          :id="'ship-trash-tip-' + split.id + '-' + line.id"
                          role="tooltip"
                          class="pointer-events-none absolute left-0 top-full z-20 mt-1.5 hidden w-max max-w-[240px] rounded bg-gray-900 px-2.5 py-1.5 text-xs leading-snug text-white shadow-lg group-focus-within:block group-hover:block"
                        >
                          {{ t('removeFromShipmentHint') }}
                        </span>
                      </span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            <div class="relative mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="btn-split"
                  :disabled="!splitHasCards(split)"
                  @click="onSplitOrder(splitIndex)"
                >
                  {{ t('splitOrder') }}
                </button>
                <button
                  v-if="store.order.splits.length > 1"
                  type="button"
                  class="btn-remove-split"
                  @click="removeSplit(splitIndex)"
                >
                  {{ t('removeSplit') }}
                </button>
              </div>
              <div class="js-add-item-menu relative">
                <div
                  v-if="addItemMenuIndex === splitIndex"
                  class="absolute bottom-full right-0 z-20 mb-2 w-[22rem] max-w-[calc(100vw-3rem)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  <ul class="max-h-64 overflow-y-auto py-1">
                    <li>
                      <button
                        type="button"
                        class="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm font-medium text-colliers-primary hover:bg-gray-100"
                        @click="onAddNewCard(split)"
                      >
                        {{ t('addNewCard') }}
                      </button>
                    </li>
                    <li v-for="line in cartLinesOutsideSplit(split)" :key="line.id">
                      <button
                        type="button"
                        class="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                        @click="onAddCartLine(split, line.id)"
                      >
                        <span class="block truncate font-medium">{{
                          personName(line) || lineName(line)
                        }}</span>
                        <span v-if="personName(line)" class="block truncate text-gray-500">{{
                          addItemDetail(line)
                        }}</span>
                      </button>
                    </li>
                  </ul>
                </div>
                <button
                  type="button"
                  class="text-sm font-medium text-colliers-primary hover:underline"
                  :aria-expanded="addItemMenuIndex === splitIndex ? 'true' : 'false'"
                  @click="onAddItem(split, splitIndex)"
                >
                  {{ t('addItem') }} +
                </button>
              </div>
            </div>
          </section>

          <section class="flex min-h-[300px] flex-col p-5 sm:p-6">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">{{ t('shipToAddress') }}</h2>
            <div class="relative flex-1">
              <p
                v-if="!split.locations.length"
                class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center py-10 text-center text-sm text-gray-400"
              >
                {{ t('noShipToAddresses') }}
              </p>
              <ul
                class="js-loc-sortable relative z-10 min-h-[8rem] space-y-3 pb-5"
                :data-split-id="split.id"
                :data-has-items="splitHasCards(split) ? '1' : '0'"
              >
                <li
                  v-for="(loc, locIndex) in split.locations"
                  :key="loc.id"
                  :data-loc-id="loc.id"
                  class="flex flex-wrap items-center gap-2 sm:flex-nowrap"
                >
                  <div
                    class="drag-handle flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
                    :class="{
                      'pointer-events-none cursor-not-allowed opacity-40': !splitHasCards(split),
                    }"
                    role="button"
                    tabindex="0"
                    :aria-label="t('reorderAddress')"
                  >
                    <svg
                      width="10"
                      height="16"
                      viewBox="0 0 10 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle cx="2" cy="2" r="1.5" />
                      <circle cx="8" cy="2" r="1.5" />
                      <circle cx="2" cy="8" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="2" cy="14" r="1.5" />
                      <circle cx="8" cy="14" r="1.5" />
                    </svg>
                  </div>
                  <!-- Phones: the full address on its own line, boxes and delete below (BUG-23) -->
                  <div
                    class="min-w-0 flex-1 basis-[calc(100%-2.25rem)] break-words rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 sm:basis-auto sm:truncate"
                    :title="loc.address"
                  >
                    {{ loc.address || t('selectShipToAddress') }}
                  </div>
                  <span class="relative ml-[1.625rem] inline-flex min-w-[7.25rem] shrink-0 sm:ml-0">
                    <select
                      class="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-8 text-sm text-gray-800"
                      :value="String(locationBoxes(split, loc))"
                      :disabled="!splitHasCards(split)"
                      @change="onLocationQty(split, locIndex, $event.target.value)"
                    >
                      <option
                        v-for="n in boxOptions(split, loc)"
                        :key="'box-' + loc.id + '-' + n"
                        :value="String(n)"
                      >
                        {{ boxLabel(n) }}
                      </option>
                    </select>
                    <svg
                      class="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  <span
                    class="min-w-[4.5rem] shrink-0 text-xs tabular-nums text-gray-500 sm:text-right"
                    >{{ locationCards(split, loc) }} {{ t('cards') }}</span
                  >
                  <button
                    type="button"
                    class="ml-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400 sm:ml-0"
                    :aria-label="t('removeItem')"
                    :disabled="!splitHasCards(split)"
                    @click="removeShipLocation(split, locIndex)"
                  >
                    <svg
                      width="16"
                      height="16"
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
                </li>
              </ul>
            </div>
            <p
              v-if="String(mergedSplitId) === String(split.id)"
              class="mt-3 text-sm text-gray-600"
              role="status"
            >
              {{ t('addressMerged') }}
            </p>

            <div class="relative mt-auto border-t border-gray-200 pt-4">
              <div class="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  class="btn-location"
                  :disabled="!splitHasCards(split)"
                  @click="openAddModal(splitIndex)"
                >
                  {{ t('addLocation') }} +
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <location-modal
      :open="modalOpen"
      :selected-addresses="modalSelected"
      :personal-addresses="store.personalAddresses"
      :offices="store.offices"
      @close="closeAddModal"
      @done="onModalDone"
      @add-new-address="onAddNewAddress"
    ></location-modal>
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
            class="card-preview-frame mx-auto"
            :style="previewFrameStyle(previewSlots(previewLine).length)"
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
  </colliers-page-shell>
</template>

<script>
import Vue from 'vue'
import { cardPreviewSlots, previewFrameStyle } from '../helpers/previewModal'
import Sortable from 'sortablejs'
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import CardPreview from '../components/CardPreview.vue'
import AppModal from '../components/AppModal.vue'
import LocationModal from '../components/LocationModal.vue'
import { productNameKey } from '../i18n/messages'
import { catalogCodeFromLine } from '../data/products'
import {
  createLocation,
  boxesPerAddressForSplit,
  billedBoxesCart,
  fitGroupToLimit,
  maxItemQty,
  locationQtyFloor,
  readSplitQty,
} from '../helpers/order'
import { cardsFromBoxes } from '../helpers/cart'
import {
  store,
  t,
  selectedShippingItemCount,
  shippedLines,
  linesInSplit,
  splitOrder,
  removeSplit,
  removeLineFromSplit,
  removeShipLocation,
  moveLineToSplit,
  moveLocationToSplit,
  cartLinesOutsideSplit,
  addCartItemToSplit,
  addCartLineToSplit,
  setGroupLocationQty,
  updateQty,
  loadOffices,
  setProof,
  setEditLineId,
  ensureSampleShippingDraft,
  ensureCartAssignedToShipping,
  syncShippingQuantities,
  shippingReady,
  hasEmptySplit,
  removeEmptySplits,
  startNewAddressForShipping,
} from '../store'
import { go } from '../adapters/nav'

var SORTABLE_OPTIONS = {
  handle: '.drag-handle',
  animation: 180,
  easing: 'cubic-bezier(0.2, 0, 0, 1)',
  forceFallback: true,
  fallbackOnBody: true,
  fallbackTolerance: 4,
  ghostClass: 'sortable-ghost',
  chosenClass: 'sortable-chosen',
  dragClass: 'sortable-drag',
  fallbackClass: 'sortable-fallback',
}

export default {
  name: 'ShippingPage',
  components: { ColliersPageShell, AppButton, CardPreview, AppModal, LocationModal },
  data: function () {
    return {
      store: store,
      sortables: [],
      modalOpen: false,
      modalSplitIndex: null,
      addItemMenuIndex: null,
      previewLine: null,
      mergedSplitId: null,
      mergedTimer: null,
    }
  },
  computed: {
    modalSelected: function () {
      var split = store.order.splits[this.modalSplitIndex]
      if (!split) return []
      return (split.locations || [])
        .map(function (row) {
          return String(row.address || '').trim()
        })
        .filter(Boolean)
    },
    selectedItemCount: function () {
      return selectedShippingItemCount()
    },
    hasAssignedBoxes: function () {
      var splits = (store.order && store.order.splits) || []
      return splits.some(function (split) {
        return linesInSplit(split).length && (split.locations || []).length
      })
    },
    canCheckout: function () {
      return shippingReady()
    },
    emptySplit: function () {
      return hasEmptySplit()
    },
  },
  mounted: function () {
    ensureSampleShippingDraft()
    ensureCartAssignedToShipping()
    removeEmptySplits()
    syncShippingQuantities()
    loadOffices(true)
    this.bindSortables()
    document.addEventListener('click', this.onDocClick, true)
    if (this.$refs.previewHost) document.body.appendChild(this.$refs.previewHost)
  },
  updated: function () {
    this.bindSortables()
  },
  beforeDestroy: function () {
    if (this.mergedTimer) clearTimeout(this.mergedTimer)
    this.destroySortables()
    document.removeEventListener('click', this.onDocClick, true)
    var host = this.$refs.previewHost
    if (host && host.parentNode) host.parentNode.removeChild(host)
  },
  methods: {
    t: t,
    productNameKey: productNameKey,
    linesInSplit: linesInSplit,
    splitHasCards: function (split) {
      return linesInSplit(split).length > 0
    },
    splitOrder: splitOrder,
    removeSplit: removeSplit,
    removeLineFromSplit: removeLineFromSplit,
    cartLinesOutsideSplit: cartLinesOutsideSplit,
    removeShipLocation: removeShipLocation,
    selectedShippingItemCount: selectedShippingItemCount,
    updateQty: updateQty,
    lineName: function (line) {
      var name = t(productNameKey(catalogCodeFromLine(line)))
      var language = String(line.language || '').trim()
      var key = language.toLowerCase()
      var label = ['english', 'french', 'bilingual'].indexOf(key) >= 0 ? t(key) : language
      return label ? name + ' - ' + label : name
    },
    /** Add item menu: product plus title, so two cards for one person can be told apart. */
    addItemDetail: function (line) {
      var title = String((line && line.details && line.details.title) || '').trim()
      return [this.lineName(line), title].filter(Boolean).join(' · ')
    },
    personName: function (line) {
      var details = (line && line.details) || {}
      return String(
        details.name || details.nameWrapped || line.personName || line.name || ''
      ).trim()
    },
    boxesPerAddress: function (split) {
      return boxesPerAddressForSplit(split, store.cart)
    },
    locationBoxes: function (split, loc) {
      var qty = Number(loc && loc.qty)
      if (qty > 0) return qty
      return this.boxesPerAddress(split)
    },
    splitLineQty: function (split, line) {
      return readSplitQty(split, line)
    },
    // Nothing ships until the split has an address, so show 0 instead of the stored qty.
    assignedLineQty: function (split, line) {
      return (split.locations || []).length ? this.splitLineQty(split, line) : 0
    },
    maxQty: function (split, line) {
      return maxItemQty(split, store.cart, line && line.id)
    },
    boxOptions: function (split, loc) {
      var current = this.locationBoxes(split, loc)
      var locIndex = (split.locations || []).indexOf(loc)
      var min = locationQtyFloor(split, store.cart, locIndex)
      var max = Math.max(12, current, min)
      var n
      var out = []
      for (n = min; n <= max; n += 1) out.push(n)
      return out
    },
    onLocationQty: function (split, locIndex, qty) {
      setGroupLocationQty(split, locIndex, qty)
      this.$forceUpdate()
    },
    boxLabel: function (boxes) {
      var n = Number(boxes) || 0
      return n + ' ' + (n === 1 ? t('box') : t('boxes'))
    },
    lineCards: function (split, line) {
      return cardsFromBoxes(this.assignedLineQty(split, line))
    },
    locationCards: function (split, loc) {
      return cardsFromBoxes(this.locationBoxes(split, loc))
    },
    orderBoxes: function () {
      return billedBoxesCart(shippedLines(), store.order)
    },
    orderCards: function () {
      return cardsFromBoxes(this.orderBoxes())
    },
    previewFrameStyle: previewFrameStyle,
    previewSlots: cardPreviewSlots,
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
      go('customize', { code: line.code, lineId: line.id })
    },
    onSplitOrder: function (splitIndex) {
      var split = store.order.splits[splitIndex]
      if (!this.splitHasCards(split)) return
      splitOrder(splitIndex)
      this.addItemMenuIndex = null
    },
    back: function () {
      go('catalog')
    },
    checkout: function () {
      if (!this.canCheckout) return
      go('review')
    },
    onAddCartLine: function (split, lineId) {
      addCartLineToSplit(split, lineId)
      this.addItemMenuIndex = null
    },
    onAddItem: function (split, splitIndex) {
      this.addItemMenuIndex = this.addItemMenuIndex === splitIndex ? null : splitIndex
    },
    onAddNewCard: function (split) {
      this.addItemMenuIndex = null
      addCartItemToSplit(split)
    },
    toggleAddItemMenu: function (splitIndex) {
      this.addItemMenuIndex = this.addItemMenuIndex === splitIndex ? null : splitIndex
    },
    /** refs: { address: { addressId, addressType } } from the picker, kept on each location. */
    syncSplitAddresses: function (split, addresses, refs) {
      var ids = refs || {}
      var wanted = (addresses || [])
        .map(function (row) {
          return String(row || '').trim()
        })
        .filter(Boolean)
      var existing = {}
      ;(split.locations || []).forEach(function (loc) {
        if (loc.address) existing[loc.address] = loc
      })
      var next = []
      var self = this
      wanted.forEach(function (addr) {
        if (existing[addr]) {
          // Ship-tos picked before ids were kept get theirs now.
          var ref = ids[addr]
          if (ref && !existing[addr].addressId) {
            Vue.set(existing[addr], 'addressId', String(ref.addressId))
            Vue.set(existing[addr], 'addressType', ref.addressType || '')
          }
          next.push(existing[addr])
          return
        }
        var draft = { itemIds: split.itemIds, qtys: split.qtys, locations: next }
        next.push(createLocation(addr, boxesPerAddressForSplit(draft, store.cart), ids[addr]))
      })
      split.locations.splice(0, split.locations.length)
      next.forEach(function (loc) {
        split.locations.push(loc)
      })
      fitGroupToLimit(split, store.cart)
      var last = split.locations.length - 1
      // Every address unticked: nothing to re-fit, but the empty list still has to be saved.
      if (last >= 0) setGroupLocationQty(split, last, split.locations[last].qty)
      else syncShippingQuantities()
      this.$nextTick(function () {
        self.destroySortables()
        self.bindSortables()
      })
    },
    openAddModal: function (splitIndex) {
      var split = store.order.splits[splitIndex]
      if (!this.splitHasCards(split)) return
      this.modalSplitIndex = splitIndex
      this.modalOpen = true
    },
    closeAddModal: function () {
      this.modalOpen = false
      this.modalSplitIndex = null
    },
    /** Open Address Book's form; the saved address comes back to this shipment. */
    onAddNewAddress: function () {
      var split = store.order.splits[this.modalSplitIndex]
      this.closeAddModal()
      startNewAddressForShipping(split ? split.id : null)
    },
    onModalDone: function (addresses, refs) {
      var index = this.modalSplitIndex
      var split = store.order.splits[index]
      this.closeAddModal()
      if (!split) return
      this.syncSplitAddresses(split, addresses, refs)
    },
    onDocClick: function (event) {
      if (this.addItemMenuIndex == null) return
      var root = this.$el
      if (!root) return
      var menus = root.querySelectorAll('.js-add-item-menu')
      var inside = false
      menus.forEach(function (el) {
        if (el.contains(event.target)) inside = true
      })
      if (!inside) {
        this.addItemMenuIndex = null
      }
    },
    flashAddressMerged: function (splitId) {
      var self = this
      if (this.mergedTimer) clearTimeout(this.mergedTimer)
      this.mergedSplitId = splitId
      this.mergedTimer = setTimeout(function () {
        self.mergedSplitId = null
        self.mergedTimer = null
      }, 5000)
    },
    destroySortables: function () {
      this.sortables.forEach(function (instance) {
        instance.destroy()
      })
      this.sortables = []
      if (!this.$el) return
      this.$el.querySelectorAll('.js-cart-sortable, .js-loc-sortable').forEach(function (el) {
        el.__sortable = null
      })
    },
    bindSortables: function () {
      var self = this
      if (!this.$el) return
      this.$el.querySelectorAll('.js-cart-sortable').forEach(function (el) {
        if (el.__sortable) return
        var instance = Sortable.create(
          el,
          Object.assign({}, SORTABLE_OPTIONS, {
            group: 'split-cart-lines',
            onEnd: function (evt) {
              var lineId = evt.item && evt.item.getAttribute('data-line-id')
              var toId = evt.to && evt.to.getAttribute('data-split-id')
              var fromId = evt.from && evt.from.getAttribute('data-split-id')
              if (!lineId || !toId) return
              if (String(fromId) === String(toId) && evt.oldIndex === evt.newIndex) return
              moveLineToSplit(lineId, toId, evt.newIndex, fromId)
            },
          })
        )
        el.__sortable = instance
        self.sortables.push(instance)
      })
      this.$el.querySelectorAll('.js-loc-sortable').forEach(function (el) {
        var locDisabled = el.getAttribute('data-has-items') !== '1'
        if (el.__sortable) {
          el.__sortable.option('disabled', locDisabled)
          return
        }
        var instance = Sortable.create(
          el,
          Object.assign({}, SORTABLE_OPTIONS, {
            group: 'split-locations',
            disabled: locDisabled,
            onEnd: function (evt) {
              var locId = evt.item && evt.item.getAttribute('data-loc-id')
              var toId = evt.to && evt.to.getAttribute('data-split-id')
              var fromId = evt.from && evt.from.getAttribute('data-split-id')
              if (!locId || !toId) return
              if (String(fromId) === String(toId) && evt.oldIndex === evt.newIndex) return
              if (moveLocationToSplit(locId, toId, evt.newIndex)) self.flashAddressMerged(toId)
            },
          })
        )
        el.__sortable = instance
        self.sortables.push(instance)
      })
    },
  },
}
</script>
