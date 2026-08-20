<template>
  <colliers-page-shell>
    <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
      <span aria-hidden="true">‹</span> {{ t('back') }}
    </button>

    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-baseline gap-3">
        <h1 class="text-3xl font-bold text-gray-900">{{ t('shipping') }}</h1>
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
                class="flex flex-wrap items-center gap-2 rounded-md border border-gray-100 bg-white p-2"
              >
                <div
                  class="drag-handle -ml-0.5 flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
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
                <img
                  :src="productImage(line.code)"
                  alt=""
                  class="h-12 w-12 rounded object-cover"
                />
                <qty-stepper compact :value="line.quantity" @input="setQty(line.id, $event)"></qty-stepper>
                <select
                  class="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-sm"
                  :value="line.code"
                  @change="changeProduct(line, $event.target.value)"
                >
                  <option v-for="p in products" :key="p.code" :value="p.code">
                    {{ t(productNameKey(p.code)) }} - {{ p.language }}
                  </option>
                </select>
                <select
                  v-if="store.order.splits.length > 1"
                  class="rounded border border-gray-300 px-2 py-1 text-sm"
                  :value="split.id"
                  @change="onMoveLine(line.id, $event.target.value)"
                >
                  <option
                    v-for="(group, groupIndex) in store.order.splits"
                    :key="group.id"
                    :value="group.id"
                  >
                    {{ splitLabel(groupIndex) }}
                  </option>
                </select>
                <button
                  type="button"
                  class="rounded border border-gray-200 p-2 text-gray-500 hover:text-red-600"
                  @click="removeLine(line.id)"
                >
                  🗑
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
                <qty-stepper :value="loc.qty" @input="onQty(loc, $event)"></qty-stepper>
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
import QtyStepper from '../components/QtyStepper.vue'
import LocationDrawer from '../components/LocationDrawer.vue'
import { products, getProduct } from '../data/products'
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
  persistCartNow,
  persistOrderNow,
  openLocationPicker,
  loadOffices,
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
  components: { ColliersPageShell, AppButton, QtyStepper, LocationDrawer },
  data: function () {
    return {
      store: store,
      products: products,
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
    productImage: function (code) {
      const product = getProduct(code)
      return (product && product.image) || ''
    },
    splitLabel: function (index) {
      return t('shippingGroup') + ' ' + (index + 1)
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
    setQty: function (id, quantity) {
      updateQty(id, quantity)
    },
    changeProduct: function (line, code) {
      const product = getProduct(code)
      if (!product) return
      line.code = product.code
      line.language = product.language
      line.price = product.price
      persistCartNow()
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
