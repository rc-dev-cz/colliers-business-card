<template>
  <colliers-page-shell>
    <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
      <span aria-hidden="true">‹</span> {{ t('back') }}
    </button>

    <div class="colliers-page-header">
      <div class="flex flex-wrap items-baseline gap-3">
        <h1 class="colliers-page-title">{{ t('shipping') }}</h1>
        <span class="text-sm text-gray-500">{{ t('total') }} {{ count }} {{ t('items') }}</span>
      </div>
      <app-button @click="checkout">{{ t('reviewCheckout') }}</app-button>
    </div>

    <div class="space-y-6">
      <div
        v-for="(split, splitIndex) in store.order.splits"
        :key="split.id"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div class="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          <section class="p-4 sm:p-6">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">
              {{ t('selectedItems') }}
              <span class="ml-2 text-sm font-normal text-gray-500">{{ splitLabel(splitIndex) }}</span>
            </h2>
            <div
              v-if="!linesInSplit(split).length"
              class="py-8 text-center text-sm text-gray-400"
            >
              {{ t('noItemsSelected') }}
            </div>
            <ul
              v-else
              class="js-cart-sortable space-y-3"
              :data-split-id="split.id"
            >
              <li
                v-for="line in linesInSplit(split)"
                :key="line.id"
                class="flex items-start gap-3"
              >
                <div
                  class="drag-handle mt-3 flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
                  role="button"
                  tabindex="0"
                  aria-label="Reorder item"
                >
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
                    <circle cx="2" cy="2" r="1.5" />
                    <circle cx="8" cy="2" r="1.5" />
                    <circle cx="2" cy="8" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="2" cy="14" r="1.5" />
                    <circle cx="8" cy="14" r="1.5" />
                  </svg>
                </div>
                <div class="w-32 shrink-0 overflow-hidden rounded border border-gray-200 bg-white">
                  <card-preview :details="line.details || {}" :language="line.language"></card-preview>
                </div>
                <div class="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-3">
                  <div class="font-medium leading-snug text-gray-900">{{ lineName(line) }}</div>
                  <div v-if="personName(line)" class="mt-0.5 text-sm text-gray-700">{{ personName(line) }}</div>
                  <div class="mt-2">
                    <qty-stepper
                      cards
                      compact
                      :value="line.quantity"
                      @input="setQty(line.id, $event)"
                    ></qty-stepper>
                  </div>
                </div>
                <button
                  type="button"
                  class="mt-2 rounded border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-colliers-primary"
                  :aria-label="t('editItem')"
                  @click="editLine(line)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
                  </svg>
                </button>
                <button
                  type="button"
                  class="mt-2 rounded border border-gray-200 p-2 text-gray-500 hover:text-red-600"
                  :aria-label="t('removeItem')"
                  @click="removeLine(line.id)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M8 6V4h8v2"></path>
                    <path d="M19 6l-1 14H6L5 6"></path>
                  </svg>
                </button>
              </li>
            </ul>
            <div class="mt-4">
              <button
                type="button"
                class="text-sm text-colliers-primary hover:underline"
                @click="addCartItemToSplit(split)"
              >
                + {{ t('addItem') }}
              </button>
            </div>
          </section>

          <section class="p-4 sm:p-6">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">{{ t('shipToAddress') }}</h2>
            <p v-if="!split.locations.length" class="py-4 text-sm text-gray-500">
              {{ t('noShipToAddresses') }}
            </p>
            <ul
              v-else
              class="js-loc-sortable space-y-3"
              :data-split-index="splitIndex"
            >
              <li
                v-for="(loc, locIndex) in split.locations"
                :key="loc.id"
                class="flex flex-wrap items-center gap-2 rounded-md border border-transparent bg-white p-0.5"
              >
                <div
                  class="drag-handle flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
                  role="button"
                  tabindex="0"
                  aria-label="Reorder address"
                >
                  <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
                    <circle cx="2" cy="2" r="1.5" />
                    <circle cx="8" cy="2" r="1.5" />
                    <circle cx="2" cy="8" r="1.5" />
                    <circle cx="8" cy="8" r="1.5" />
                    <circle cx="2" cy="14" r="1.5" />
                    <circle cx="8" cy="14" r="1.5" />
                  </svg>
                </div>
                <select
                  :value="loc.address"
                  class="field-input min-w-0 flex-1"
                  @change="onAddress(loc, $event.target.value)"
                >
                  <option value="" disabled>{{ t('selectShipToAddress') }}</option>
                  <optgroup v-if="addressGroups.personal.length" :label="t('myAddressBook')">
                    <option
                      v-for="opt in addressGroups.personal"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </optgroup>
                  <optgroup v-if="addressGroups.offices.length" :label="t('officeAddresses')">
                    <option
                      v-for="opt in addressGroups.offices"
                      :key="opt.value"
                      :value="opt.value"
                    >
                      {{ opt.label }}
                    </option>
                  </optgroup>
                  <optgroup
                    v-if="loc.address && !addressIsKnown(loc.address)"
                    :label="t('savedAddress')"
                  >
                    <option :value="loc.address">{{ loc.address }}</option>
                  </optgroup>
                </select>
                <qty-stepper cards :value="loc.qty" @input="onQty(loc, $event)"></qty-stepper>
                <button
                  type="button"
                  class="rounded border border-gray-200 p-2 text-gray-500 hover:text-red-600"
                  @click="removeShipLocation(split, locIndex)"
                >
                  🗑
                </button>
              </li>
            </ul>
            <div class="mt-4">
              <button
                type="button"
                class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                @click="pickLocation(splitIndex)"
              >
                + {{ t('addLocation') }}
              </button>
            </div>
          </section>
        </div>
        <div
          class="flex flex-wrap items-center gap-3 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6"
        >
          <app-button class="text-sm" @click="onSplitOrder(splitIndex)">{{ t('splitOrder') }}</app-button>
          <button
            v-if="store.order.splits.length > 1"
            type="button"
            class="text-sm text-gray-500 hover:text-red-600"
            @click="removeSplit(splitIndex)"
          >
            {{ t('removeSplit') }}
          </button>
        </div>
      </div>
    </div>

    <location-drawer @select="onLocationSelect"></location-drawer>
  </colliers-page-shell>
</template>

<script>
import Sortable from 'sortablejs'
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import CardPreview from '../components/CardPreview.vue'
import QtyStepper from '../components/QtyStepper.vue'
import LocationDrawer from '../components/LocationDrawer.vue'
import { productNameKey } from '../i18n/messages'
import {
  store,
  t,
  itemCount,
  linesInSplit,
  splitOrder,
  removeSplit,
  removeLine,
  addCartItemToSplit,
  addShipLocation,
  removeShipLocation,
  moveLineToSplit,
  updateQty,
  persistOrderNow,
  openLocationPicker,
  loadOffices,
  setProof,
  setEditLineId,
} from '../store'
import { formatAddressLine, officeLabel } from '../adapters/api'
import { buildAddressOptionGroups, isKnownAddress } from '../helpers/shippingAddressOptions'
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
  components: { ColliersPageShell, AppButton, CardPreview, QtyStepper, LocationDrawer },
  data: function () {
    return {
      store: store,
      sortables: [],
    }
  },
  computed: {
    count: function () {
      return itemCount()
    },
    addressGroups: function () {
      return buildAddressOptionGroups(
        this.store.personalAddresses,
        this.store.offices,
        formatAddressLine,
        officeLabel,
      )
    },
  },
  mounted: function () {
    loadOffices()
    this.bindSortables()
  },
  updated: function () {
    this.bindSortables()
  },
  beforeDestroy: function () {
    this.destroySortables()
  },
  methods: {
    t: t,
    productNameKey: productNameKey,
    linesInSplit: linesInSplit,
    splitOrder: splitOrder,
    removeSplit: removeSplit,
    removeLine: removeLine,
    addCartItemToSplit: addCartItemToSplit,
    addShipLocation: addShipLocation,
    removeShipLocation: removeShipLocation,
    splitLabel: function (index) {
      return t('shippingGroup') + ' ' + (index + 1)
    },
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    personName: function (line) {
      return String((line.details && line.details.name) || '').trim()
    },
    setQty: function (id, quantity) {
      updateQty(id, quantity)
    },
    editLine: function (line) {
      setEditLineId(line.id)
      setProof({
        code: line.code,
        language: line.language,
        details: line.details,
      })
      go('customize', { code: line.code })
    },
    onSplitOrder: function (splitIndex) {
      splitOrder(splitIndex)
    },
    back: function () {
      go('catalog')
    },
    checkout: function () {
      go('review')
    },
    onMoveLine: function (lineId, splitId) {
      moveLineToSplit(lineId, splitId)
    },
    onAddress: function (loc, value) {
      loc.address = value
      persistOrderNow()
    },
    addressIsKnown: function (address) {
      return isKnownAddress(address, this.addressGroups)
    },
    onQty: function (loc, value) {
      loc.qty = value
      persistOrderNow()
    },
    pickLocation: function (splitIndex) {
      openLocationPicker({ splitIndex: splitIndex })
    },
    onLocationSelect: function (addresses) {
      if (!store.locationTarget) return
      const split = store.order.splits[store.locationTarget.splitIndex]
      if (!split) return
      const self = this
      addresses.forEach(function (address) {
        const exists = split.locations.some(function (row) {
          return row.address === address
        })
        if (!exists) self.addShipLocation(split, address, 1)
      })
    },
    destroySortables: function () {
      this.sortables.forEach(function (instance) {
        instance.destroy()
      })
      this.sortables = []
      this.$el.querySelectorAll('.js-cart-sortable, .js-loc-sortable').forEach(function (el) {
        el.__sortable = null
      })
    },
    bindSortables: function () {
      const self = this
      this.$el.querySelectorAll('.js-cart-sortable').forEach(function (el) {
        if (el.__sortable) return
        const splitId = el.getAttribute('data-split-id')
        const instance = Sortable.create(el, Object.assign({}, SORTABLE_OPTIONS, {
          onEnd: function (evt) {
            const split = store.order.splits.find(function (row) {
              return String(row.id) === String(splitId)
            })
            if (!split) return
            const oldIndex = evt.oldIndex
            const newIndex = evt.newIndex
            if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
            const moved = split.itemIds.splice(oldIndex, 1)[0]
            split.itemIds.splice(newIndex, 0, moved)
            persistOrderNow()
          },
        }))
        el.__sortable = instance
        self.sortables.push(instance)
      })
      this.$el.querySelectorAll('.js-loc-sortable').forEach(function (el) {
        if (el.__sortable) return
        const splitIndex = Number(el.getAttribute('data-split-index'))
        const instance = Sortable.create(el, Object.assign({}, SORTABLE_OPTIONS, {
          onEnd: function (evt) {
            const locations = store.order.splits[splitIndex] && store.order.splits[splitIndex].locations
            if (!locations) return
            const oldIndex = evt.oldIndex
            const newIndex = evt.newIndex
            if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
            const moved = locations.splice(oldIndex, 1)[0]
            locations.splice(newIndex, 0, moved)
            persistOrderNow()
          },
        }))
        el.__sortable = instance
        self.sortables.push(instance)
      })
    },
  },
}
</script>
