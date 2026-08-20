<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import Sortable from 'sortablejs'
import { products, getProduct } from '../data/products'
import { useLocale } from '../composables/useLocale'
import { useCart } from '../composables/useCart'
import { useOrder } from '../composables/useOrder'
import { useAddressBook } from '../composables/useAddressBook'
import { productNameKey } from '../i18n/messages'
import { buildAddressOptionGroups, isKnownAddress } from '../helpers/shippingAddressOptions'
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import LocationDrawer from '../components/LocationDrawer.vue'

const router = useRouter()
const { t } = useLocale()
const { cart, openLocationPicker, locationTarget, removeLine: removeCartLine, cloneLine } = useCart()
const {
  order,
  syncCartAssignments,
  linesForSplit,
  splitOrder,
  removeSplit,
  assignItem,
  unassignItem,
  moveItem,
  addLocation,
  removeLocation,
} = useOrder()
const { personalAddresses, offices, loadOffices, formatAddressLine, officeLabel } = useAddressBook()

const addressGroups = computed(() =>
  buildAddressOptionGroups(
    personalAddresses.value,
    offices.value,
    formatAddressLine,
    officeLabel,
  ),
)

onMounted(() => {
  loadOffices()
})

function addressIsKnown(address) {
  return isKnownAddress(address, addressGroups.value)
}

const sortableInstances = new Set()

const sortableOptions = {
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

const itemCount = computed(() => cart.value.reduce((s, l) => s + l.quantity, 0))

watch(
  cart,
  (lines) => syncCartAssignments(lines.map((line) => line.id)),
  { deep: true, immediate: true },
)

function setupCartSortable(el, split) {
  if (!el || el.__sortable) return
  const instance = Sortable.create(el, {
    ...sortableOptions,
    onEnd(evt) {
      const { oldIndex, newIndex } = evt
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
      const [itemId] = split.itemIds.splice(oldIndex, 1)
      split.itemIds.splice(newIndex, 0, itemId)
    },
  })
  el.__sortable = instance
  sortableInstances.add(instance)
}

function setupLocationSortable(el, splitIndex) {
  if (!el || el.__sortable) return
  const instance = Sortable.create(el, {
    ...sortableOptions,
    onEnd(evt) {
      const locations = order.splits[splitIndex]?.locations
      if (!locations) return
      const { oldIndex, newIndex } = evt
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
      const [item] = locations.splice(oldIndex, 1)
      locations.splice(newIndex, 0, item)
    },
  })
  el.__sortable = instance
  sortableInstances.add(instance)
}

onBeforeUnmount(() => {
  sortableInstances.forEach((instance) => instance.destroy())
  sortableInstances.clear()
})

function back() {
  router.push({ name: 'catalog' })
}

function checkout() {
  router.push({ name: 'confirmed' })
}

function addItem(split) {
  const first = products[0]
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  cart.value.push({
    id,
    code: first.code,
    language: first.language,
    quantity: 1,
    price: first.price,
    details: {},
  })
  assignItem(split, id)
}

function removeLine(id) {
  removeCartLine(id)
  unassignItem(id)
}

function pickLocation(splitIndex) {
  openLocationPicker({ splitIndex })
}

function onLocationSelect(addresses) {
  if (!locationTarget.value) return
  const split = order.splits[locationTarget.value.splitIndex]
  if (!split) return
  addresses.forEach((address) => {
    if (!split.locations.some((l) => l.address === address)) {
      addLocation(split, address, 1)
    }
  })
}

function onAddLocation(splitIndex) {
  pickLocation(splitIndex)
}

function changeProduct(line, code) {
  const product = getProduct(code)
  if (!product) return
  line.code = product.code
  line.language = product.language
  line.price = product.price
}

function onSplitOrder(splitIndex) {
  const source = order.splits[splitIndex]
  const newItemIds = (source?.itemIds || [])
    .map((id) => cloneLine(id))
    .filter(Boolean)
  splitOrder(newItemIds)
}

function onRemoveSplit(splitIndex) {
  const ids = removeSplit(splitIndex)
  ids.forEach((id) => removeCartLine(id))
}

function onMoveLine(lineId, splitId) {
  moveItem(lineId, splitId)
}

function splitLabel(index) {
  return `${t('shippingGroup')} ${index + 1}`
}
</script>

<template>
  <ColliersPageShell>
    <button type="button" class="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
      <span aria-hidden="true">‹</span> {{ t('back') }}
    </button>

    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-wrap items-baseline gap-3">
        <h1 class="text-3xl font-bold text-gray-900">{{ t('shipping') }}</h1>
        <span class="text-sm text-gray-500">{{ t('total') }} {{ itemCount }} {{ t('items') }}</span>
      </div>
      <button type="button" class="btn-primary" @click="checkout">
        {{ t('reviewCheckout') }}
      </button>
    </div>

    <div class="space-y-6">
      <div
        v-for="(split, splitIndex) in order.splits"
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
              v-if="!linesForSplit(split, cart).length"
              class="py-8 text-center text-sm text-gray-400"
            >
              {{ t('noItemsSelected') }}
            </div>
            <ul
              v-else
              :ref="(el) => setupCartSortable(el, split)"
              class="space-y-3"
            >
              <li
                v-for="line in linesForSplit(split, cart)"
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
                  :src="getProduct(line.code)?.image"
                  alt=""
                  class="h-12 w-12 rounded object-cover"
                />
                <input
                  v-model.number="line.quantity"
                  type="number"
                  min="1"
                  class="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                />
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
                  v-if="order.splits.length > 1"
                  class="rounded border border-gray-300 px-2 py-1 text-sm"
                  :value="split.id"
                  @change="onMoveLine(line.id, $event.target.value)"
                >
                  <option
                    v-for="(group, groupIndex) in order.splits"
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
                @click="addItem(split)"
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
              :ref="(el) => setupLocationSortable(el, splitIndex)"
              class="space-y-3"
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
                  v-model="loc.address"
                  class="field-input min-w-0 flex-1"
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
                <input
                  v-model.number="loc.qty"
                  type="number"
                  min="1"
                  class="w-20 rounded border border-gray-300 px-2 py-2 text-sm"
                />
                <button
                  type="button"
                  class="rounded border border-gray-200 p-2 text-gray-500 hover:text-red-600"
                  @click="removeLocation(split, locIndex)"
                >
                  🗑
                </button>
              </li>
            </ul>
            <div class="mt-4">
              <button
                type="button"
                class="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50"
                @click="onAddLocation(splitIndex)"
              >
                + {{ t('addLocation') }}
              </button>
            </div>
          </section>
        </div>
        <div
          class="flex flex-wrap items-center gap-3 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:px-6"
        >
          <button type="button" class="btn-primary text-sm" @click="onSplitOrder(splitIndex)">
            {{ t('splitOrder') }}
          </button>
          <button
            v-if="order.splits.length > 1"
            type="button"
            class="text-sm text-gray-500 hover:text-red-600"
            @click="onRemoveSplit(splitIndex)"
          >
            {{ t('removeSplit') }}
          </button>
        </div>
      </div>
    </div>

    <LocationDrawer @select="onLocationSelect" />
  </ColliersPageShell>
</template>
