<template>
  <colliers-page-shell>
    <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
      <span aria-hidden="true">‹</span> {{ t('back') }}
    </button>

    <div class="colliers-page-header">
      <h1 class="colliers-page-title">{{ t('shipping') }}</h1>
      <div class="colliers-page-header__actions">
        <span class="text-sm text-gray-500">{{ t('total') }} {{ cardsQty(count) }} {{ t('items') }}</span>
        <app-button class="inline-flex items-center gap-2" @click="checkout">
          <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {{ t('reviewCheckout') }}
        </app-button>
      </div>
    </div>

    <div class="space-y-6">
      <div
        v-for="(split, splitIndex) in store.order.splits"
        :key="split.id"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div class="grid grid-cols-1 divide-y divide-gray-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
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
                class="js-cart-sortable relative z-10 min-h-[8rem] space-y-3"
                :data-split-id="split.id"
              >
              <li
                v-for="line in linesInSplit(split)"
                :key="line.id"
                class="flex items-start gap-3 rounded-md py-1 outline-none"
              >
                <div
                  class="drag-handle mt-2 flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
                  role="button"
                  tabindex="0"
                  :aria-label="t('reorderItem')"
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
                <div class="card-preview-frame w-[7.5rem] max-w-[7.5rem] shrink-0 sm:w-[8.5rem] sm:max-w-[8.5rem]">
                  <card-preview :details="line.details || {}" :language="line.language"></card-preview>
                </div>
                <div class="min-w-0 flex-1 pt-0.5">
                  <div class="text-[15px] font-semibold leading-snug text-gray-900">{{ lineName(line) }}</div>
                  <div v-if="personName(line)" class="mt-0.5 text-[14px] leading-snug text-gray-900">{{ personName(line) }}</div>
                  <label class="mt-1.5 inline-flex items-center gap-1 text-[13px] leading-snug text-gray-500">
                    <span>{{ t('qty') }}:</span>
                    <input
                      type="number"
                      min="250"
                      step="250"
                      class="w-14 border-0 bg-transparent p-0 text-[13px] text-gray-500 focus:outline-none focus:ring-0"
                      :value="cardsQty(line.quantity)"
                      @change="onLineCardsQty(line.id, $event.target.value)"
                    />
                  </label>
                  <label
                    v-if="store.order.splits.length > 1"
                    class="mt-2 flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span>{{ t('moveToGroup') }}</span>
                    <select
                      class="rounded border border-gray-200 bg-white px-1.5 py-1 text-xs text-gray-900"
                      :value="String(split.id)"
                      @change="onMoveLine(line.id, $event.target.value)"
                    >
                      <option
                        v-for="(group, groupIndex) in store.order.splits"
                        :key="group.id"
                        :value="String(group.id)"
                      >
                        {{ t('shippingGroup') }} {{ groupIndex + 1 }}
                      </option>
                    </select>
                  </label>
                </div>
                <div class="flex shrink-0 items-center gap-2 pt-1">
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
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-600"
                    :aria-label="t('removeItem')"
                    @click="removeLine(line.id)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M8 6V4h8v2"></path>
                      <path d="M19 6l-1 14H6L5 6"></path>
                    </svg>
                  </button>
                </div>
              </li>
              </ul>
            </div>
            <div class="relative mt-4 flex justify-end">
              <div
                v-if="addItemMenuIndex === splitIndex && cartLinesOutsideSplit(split).length"
                class="absolute bottom-full right-0 z-20 mb-2 w-[min(100%,22rem)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              >
                <ul class="max-h-64 overflow-y-auto py-1">
                  <li v-for="line in cartLinesOutsideSplit(split)" :key="line.id">
                    <button
                      type="button"
                      class="block w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                      @click="onAddCartLine(split, line.id)"
                    >
                      <span class="block font-medium">{{ lineName(line) }}</span>
                      <span class="block truncate text-gray-500">{{ personName(line) || t('qty') + ' ' + cardsQty(line.quantity) }}</span>
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
            <div class="mt-auto flex flex-wrap items-center gap-3 pt-6">
              <button type="button" class="btn-split" @click="onSplitOrder(splitIndex)">
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
          </section>

          <section class="flex min-h-[300px] flex-col p-5 sm:p-6">
            <h2 class="mb-4 text-lg font-semibold text-gray-900">{{ t('shipToAddress') }}</h2>
            <p
              v-if="!split.locations.length"
              class="flex flex-1 items-center justify-center py-10 text-center text-sm text-gray-400"
            >
              {{ t('noShipToAddresses') }}
            </p>
            <ul
              v-else
              class="js-loc-sortable flex-1 space-y-2.5"
              :data-split-index="splitIndex"
            >
              <li
                v-for="(loc, locIndex) in split.locations"
                :key="loc.id"
                class="flex items-center gap-2"
              >
                <div
                  class="drag-handle flex shrink-0 cursor-grab touch-none items-center justify-center rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:cursor-grabbing"
                  role="button"
                  tabindex="0"
                  :aria-label="t('reorderAddress')"
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
                <input
                  type="text"
                  class="field-input min-w-0 flex-1 truncate py-2 text-sm"
                  :value="loc.address"
                  :placeholder="t('selectShipToAddress')"
                  readonly
                />
                <label class="shipping-qty-field shrink-0">
                  <span>{{ t('qty') }}:</span>
                  <input
                    type="number"
                    min="250"
                    step="250"
                    :value="cardsQty(loc.qty)"
                    @input="onLocCardsQty(split, loc, $event.target.value)"
                    @change="onLocCardsQty(split, loc, $event.target.value)"
                  />
                </label>
                <button
                  type="button"
                  class="shrink-0 rounded border border-gray-200 p-2 text-gray-500 hover:text-red-600"
                  :aria-label="t('removeItem')"
                  @click="removeShipLocation(split, locIndex)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M8 6V4h8v2"></path>
                    <path d="M19 6l-1 14H6L5 6"></path>
                  </svg>
                </button>
              </li>
            </ul>

            <div class="relative mt-auto border-t border-gray-200 pt-4">
              <div
                v-if="selectMenuIndex === splitIndex"
                class="absolute bottom-full right-0 z-20 mb-2 w-[min(100%,22rem)] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
              >
                <ul class="max-h-64 overflow-y-auto py-1">
                  <li v-for="opt in optionsForSplit(split)" :key="opt.value">
                    <label
                      class="flex cursor-pointer items-start gap-2.5 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      :class="isSplitAddress(split, opt.value) ? 'bg-gray-50' : ''"
                    >
                      <input
                        type="checkbox"
                        class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        :checked="isSplitAddress(split, opt.value)"
                        @change="toggleSelectAddress(split, opt.value, $event.target.checked)"
                      />
                      <span class="min-w-0 leading-snug">{{ opt.label }}</span>
                    </label>
                  </li>
                </ul>
              </div>
              <div class="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  class="btn-location"
                  @click="openAddModal(splitIndex)"
                >
                  {{ t('addLocation') }} +
                </button>
                <button
                  type="button"
                  class="btn-location"
                  :aria-expanded="selectMenuIndex === splitIndex ? 'true' : 'false'"
                  @click="toggleSelectMenu(splitIndex)"
                >
                  {{ t('selectLocation') }}
                  <svg class="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                  </svg>
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
    ></location-modal>
  </colliers-page-shell>
</template>

<script>
import Sortable from 'sortablejs'
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import CardPreview from '../components/CardPreview.vue'
import LocationModal from '../components/LocationModal.vue'
import { productNameKey } from '../i18n/messages'
import { cardsFromBoxes, boxesFromCards } from '../helpers/cart'
import {
  createLocation,
  nextLocationQty,
} from '../helpers/order'
import {
  store,
  t,
  itemCount,
  linesInSplit,
  splitOrder,
  removeSplit,
  removeLine,
  removeShipLocation,
  syncCartToAssignedForSplit,
  moveLineToSplit,
  cartLinesOutsideSplit,
  addCartItemToSplit,
  updateQty,
  persistOrderNow,
  persistCartNow,
  loadOffices,
  setProof,
  setEditLineId,
} from '../store'
import { formatAddressLine, officeLabel } from '../adapters/api'
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
  components: { ColliersPageShell, AppButton, CardPreview, LocationModal },
  data: function () {
    return {
      store: store,
      sortables: [],
      modalOpen: false,
      modalSplitIndex: null,
      selectMenuIndex: null,
      addItemMenuIndex: null,
    }
  },
  computed: {
    count: function () {
      return itemCount()
    },
    modalSelected: function () {
      var split = store.order.splits[this.modalSplitIndex]
      if (!split) return []
      return (split.locations || [])
        .map(function (row) {
          return String(row.address || '').trim()
        })
        .filter(Boolean)
    },
    selectOptions: function () {
      var seen = {}
      var list = []
      function push(value, label) {
        var key = String(value || '').trim()
        if (!key || seen[key]) return
        seen[key] = true
        list.push({ value: key, label: label || key })
      }
      ;(store.personalAddresses || []).forEach(function (row) {
        push(formatAddressLine(row), officeLabel(row))
      })
      ;(store.offices || []).forEach(function (row) {
        push(formatAddressLine(row), officeLabel(row))
      })
      store.order.splits.forEach(function (split) {
        ;(split.locations || []).forEach(function (loc) {
          push(loc.address, loc.address)
        })
      })
      return list
    },
  },
  mounted: function () {
    loadOffices()
    this.bindSortables()
    document.addEventListener('click', this.onDocClick, true)
  },
  updated: function () {
    this.bindSortables()
  },
  beforeDestroy: function () {
    this.destroySortables()
    document.removeEventListener('click', this.onDocClick, true)
  },
  methods: {
    t: t,
    productNameKey: productNameKey,
    linesInSplit: linesInSplit,
    splitOrder: splitOrder,
    removeSplit: removeSplit,
    removeLine: removeLine,
    cartLinesOutsideSplit: cartLinesOutsideSplit,
    removeShipLocation: removeShipLocation,
    cardsQty: cardsFromBoxes,
    lineName: function (line) {
      var name = t(productNameKey(line.code))
      var language = String(line.language || '').trim()
      return language ? name + ' - ' + language : name
    },
    personName: function (line) {
      return String((line.details && line.details.name) || '').trim()
    },
    onLineCardsQty: function (id, cards) {
      updateQty(id, boxesFromCards(cards))
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
    onSplitOrder: function () {
      splitOrder()
      this.addItemMenuIndex = null
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
    onAddCartLine: function (split, lineId) {
      moveLineToSplit(lineId, split.id)
      this.addItemMenuIndex = null
    },
    onAddItem: function (split, splitIndex) {
      this.selectMenuIndex = null
      if (cartLinesOutsideSplit(split).length) {
        this.addItemMenuIndex = this.addItemMenuIndex === splitIndex ? null : splitIndex
        return
      }
      this.addItemMenuIndex = null
      addCartItemToSplit(split)
    },
    toggleAddItemMenu: function (splitIndex) {
      this.selectMenuIndex = null
      this.addItemMenuIndex = this.addItemMenuIndex === splitIndex ? null : splitIndex
    },
    onLocCardsQty: function (split, loc, cards) {
      loc.qty = boxesFromCards(cards)
      // Arrows / typed qty: Selected Items follows ship-to sum (up or down).
      syncCartToAssignedForSplit(split)
      persistOrderNow()
    },
    defaultLocQty: function (split) {
      return nextLocationQty(split, store.cart)
    },
    isSplitAddress: function (split, address) {
      return (split.locations || []).some(function (row) {
        return row.address === address
      })
    },
    optionsForSplit: function (split) {
      var self = this
      var list = this.selectOptions.slice()
      list.sort(function (a, b) {
        var aSel = self.isSplitAddress(split, a.value) ? 0 : 1
        var bSel = self.isSplitAddress(split, b.value) ? 0 : 1
        if (aSel !== bSel) return aSel - bSel
        return String(a.label).localeCompare(String(b.label), undefined, { sensitivity: 'base' })
      })
      return list
    },
    syncSplitAddresses: function (split, addresses) {
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
          next.push(existing[addr])
          return
        }
        var draft = { itemIds: split.itemIds, locations: next }
        next.push(createLocation(addr, nextLocationQty(draft, store.cart)))
      })
      split.locations.splice(0, split.locations.length)
      next.forEach(function (loc) {
        split.locations.push(loc)
      })
      // Drop any cart boxes no longer covered by ship-to rows (empty → clear line).
      syncCartToAssignedForSplit(split)
      persistOrderNow()
      persistCartNow()
      this.$nextTick(function () {
        self.destroySortables()
        self.bindSortables()
      })
    },
    toggleSelectAddress: function (split, address, checked) {
      if (checked) {
        if (!this.isSplitAddress(split, address)) {
          split.locations.push(createLocation(address, this.defaultLocQty(split)))
          persistOrderNow()
        }
        return
      }
      var index = (split.locations || []).findIndex(function (row) {
        return row.address === address
      })
      if (index >= 0) this.removeShipLocation(split, index)
    },
    openAddModal: function (splitIndex) {
      this.selectMenuIndex = null
      this.modalSplitIndex = splitIndex
      this.modalOpen = true
    },
    closeAddModal: function () {
      this.modalOpen = false
      this.modalSplitIndex = null
    },
    onModalDone: function (addresses) {
      var index = this.modalSplitIndex
      var split = store.order.splits[index]
      this.closeAddModal()
      if (!split) return
      this.syncSplitAddresses(split, addresses)
    },
    toggleSelectMenu: function (splitIndex) {
      this.addItemMenuIndex = null
      this.selectMenuIndex = this.selectMenuIndex === splitIndex ? null : splitIndex
    },
    onDocClick: function (event) {
      if (this.selectMenuIndex == null && this.addItemMenuIndex == null) return
      var root = this.$el
      if (!root) return
      var menus = root.querySelectorAll('.relative.mt-auto, .relative.mt-4')
      var inside = false
      menus.forEach(function (el) {
        if (el.contains(event.target)) inside = true
      })
      if (!inside) {
        this.selectMenuIndex = null
        this.addItemMenuIndex = null
      }
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
        var instance = Sortable.create(el, Object.assign({}, SORTABLE_OPTIONS, {
          group: 'split-cart-lines',
          onEnd: function (evt) {
            var fromId = evt.from.getAttribute('data-split-id')
            var toId = evt.to.getAttribute('data-split-id')
            var fromSplit = store.order.splits.find(function (row) {
              return String(row.id) === String(fromId)
            })
            var toSplit = store.order.splits.find(function (row) {
              return String(row.id) === String(toId)
            })
            if (!fromSplit || !toSplit) return
            var oldIndex = evt.oldIndex
            var newIndex = evt.newIndex
            if (oldIndex == null || newIndex == null) return
            if (String(fromId) === String(toId)) {
              if (oldIndex === newIndex) return
              var reordered = fromSplit.itemIds.splice(oldIndex, 1)[0]
              fromSplit.itemIds.splice(newIndex, 0, reordered)
            } else {
              var moved = fromSplit.itemIds.splice(oldIndex, 1)[0]
              toSplit.itemIds.splice(newIndex, 0, moved)
            }
            persistOrderNow()
          },
        }))
        el.__sortable = instance
        self.sortables.push(instance)
      })
      this.$el.querySelectorAll('.js-loc-sortable').forEach(function (el) {
        if (el.__sortable) return
        var splitIndex = Number(el.getAttribute('data-split-index'))
        var instance = Sortable.create(el, Object.assign({}, SORTABLE_OPTIONS, {
          onEnd: function (evt) {
            var locations = store.order.splits[splitIndex] && store.order.splits[splitIndex].locations
            if (!locations) return
            var oldIndex = evt.oldIndex
            var newIndex = evt.newIndex
            if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
            var moved = locations.splice(oldIndex, 1)[0]
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
