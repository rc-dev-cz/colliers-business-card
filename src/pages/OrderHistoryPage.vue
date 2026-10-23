<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <admin-page-header v-if="fromAdmin" :title="t('orderHistory')"></admin-page-header>
      <div v-else class="colliers-page-intro">
        <h1 class="colliers-page-title">{{ t('orderHistory') }}</h1>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div
          class="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5"
          :class="fromAdmin ? 'sm:justify-between' : 'sm:justify-end'"
        >
          <h2 v-if="fromAdmin" class="text-base font-semibold text-gray-900">
            {{ t('recentOrders') }}
          </h2>
          <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <label class="sr-only" for="order-search">{{ t('searchOrders') }}</label>
            <search-field
              id="order-search"
              class="w-full sm:w-64"
              :value="search"
              :placeholder="t('searchByName')"
              @input="search = $event"
            ></search-field>
            <select-field
              class="w-full sm:w-48"
              :value="statusFilter"
              :options="statusOptions"
              @input="statusFilter = $event"
            ></select-field>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead
              class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500"
            >
              <tr>
                <th class="px-4 py-3">{{ t('orderId') }}</th>
                <th class="px-4 py-3">{{ personColumnLabel }}</th>
                <th class="px-4 py-3">{{ t('item') }}</th>
                <th class="px-4 py-3">{{ t('qty') }}</th>
                <th class="px-4 py-3">{{ t('date') }}</th>
                <th class="px-4 py-3">{{ t('status') }}</th>
                <th class="px-4 py-3 text-right">{{ t('action') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredOrders.length">
                <td colspan="7" class="px-4 py-10 text-center text-gray-500">
                  {{ t('noOrders') }}
                </td>
              </tr>
              <tr
                v-for="row in filteredOrders"
                :key="rowKey(row)"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-4 py-3 font-medium text-colliers-primary">{{ row.id }}</td>
                <td class="px-4 py-3 text-gray-800">{{ cardholderName(row) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ itemLabel(row, t) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ cardCount(row) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ formatOrderDate(row.date) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex rounded-md px-2.5 py-1 text-xs font-medium"
                    :class="statusClass(row.status)"
                  >
                    {{ statusLabel(row.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    class="text-colliers-primary hover:underline"
                    @click="onRepeat(row.id)"
                  >
                    {{ t('repeatOrder') }}
                  </button>
                  <span class="mx-2 text-gray-300">|</span>
                  <button
                    type="button"
                    class="text-colliers-primary hover:underline"
                    @click="openDetails(row)"
                  >
                    {{ t('view') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div
      v-if="details"
      class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="t('orderDetails')"
      @click.self="closeDetails"
    >
      <div
        class="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-lg bg-white shadow-xl sm:rounded-lg"
      >
        <div
          class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-3">
              <h2 class="text-lg font-semibold text-gray-900">
                {{ t('orderDetails') }} · {{ details.id }}
              </h2>
              <span
                class="inline-flex rounded-md px-2.5 py-1 text-xs font-medium"
                :class="statusClass(details.status)"
              >
                {{ statusLabel(details.status) }}
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-500">
              {{ detailsDateLabel(details.status) }}: {{ formatOrderDate(details.date) }} ·
              {{ personColumnLabel }}: {{ cardholderName(details) }}
            </p>
          </div>
          <button
            type="button"
            class="rounded p-1 text-xl leading-none text-gray-500 hover:bg-gray-100"
            :aria-label="t('close')"
            @click="closeDetails"
          >
            ×
          </button>
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <section>
            <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ t('itemsHeading') }}</h3>
            <ul class="space-y-4">
              <li
                v-for="line in details.cart || []"
                :key="line.id"
                class="rounded-lg border border-gray-100 p-4"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="font-medium text-gray-900">{{ lineName(line) }}</div>
                    <div class="mt-0.5 text-[13px] text-gray-500">
                      {{ t('language') }}: {{ languageText(line) }}
                    </div>
                  </div>
                  <div class="text-right text-sm tabular-nums">
                    <div class="font-medium text-gray-900">${{ lineCost(details, line) }}</div>
                    <div class="text-xs text-gray-500">
                      {{ boxLabel(lineBoxes(details, line)) }} ·
                      {{ cardsFromBoxes(lineBoxes(details, line)) }} {{ t('cards') }}
                    </div>
                  </div>
                </div>
                <div
                  class="mt-3 grid gap-3"
                  :class="lineSlots(line).length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-sm'"
                >
                  <figure v-for="slot in lineSlots(line)" :key="slot.language" class="m-0">
                    <div class="card-preview-frame card-preview-frame--fill">
                      <card-preview
                        :details="slot.details"
                        :language="slot.language"
                        placeholders
                      ></card-preview>
                    </div>
                    <figcaption
                      v-if="lineSlots(line).length > 1"
                      class="mt-1.5 text-xs font-medium uppercase tracking-wide text-gray-500"
                    >
                      {{ slot.language === 'French' ? 'Français' : 'English' }}
                    </figcaption>
                  </figure>
                </div>
              </li>
            </ul>
          </section>

          <section v-if="shipments(details).length">
            <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ t('shippingTo') }}</h3>
            <div class="space-y-3">
              <div v-for="(split, index) in shipments(details)" :key="split.id">
                <div
                  v-if="shipments(details).length > 1"
                  class="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500"
                >
                  {{ t('shipment') }} {{ index + 1 }}
                </div>
                <ul class="divide-y divide-gray-100 rounded-lg border border-gray-100">
                  <li
                    v-for="loc in split.locations"
                    :key="loc.id"
                    class="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span class="min-w-0 text-gray-700">{{ loc.address }}</span>
                    <span class="shrink-0 text-right tabular-nums">
                      <span class="block font-medium text-gray-900">{{
                        boxLabel(locationBoxes(loc))
                      }}</span>
                      <span class="block text-xs text-gray-500"
                        >{{ cardsFromBoxes(locationBoxes(loc)) }} {{ t('cards') }}</span
                      >
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div
          class="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
        >
          <div class="text-sm text-gray-700">
            {{ t('totalCost') }}:
            <span class="font-semibold text-gray-900">${{ orderTotal(details).toFixed(2) }}</span>
            <span class="text-gray-500">
              · {{ t('quantity') }}: {{ cardCount(details) }} {{ t('cards') }}</span
            >
          </div>
          <div class="flex flex-col-reverse gap-3 sm:flex-row">
            <app-button variant="outline" class="sm:w-auto" @click="closeDetails">{{
              t('close')
            }}</app-button>
            <app-button class="sm:w-auto" @click="onRepeat(details.id)">{{
              t('repeatOrder')
            }}</app-button>
          </div>
        </div>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import AppButton from '../components/AppButton.vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import SearchField from '../components/SearchField.vue'
import SelectField from '../components/SelectField.vue'
import CardPreview from '../components/CardPreview.vue'
import { store, t, isAdmin, loadAdminOrders, repeatOrder } from '../store'
import { languageLabel, productNameKey } from '../i18n/messages'
import { lineTotal, cardsFromBoxes } from '../helpers/cart'
import { billedBoxesForLine } from '../helpers/order'
import {
  cardCount,
  cardholderName,
  formatOrderDate,
  itemLabel,
  matchesOrderSearch,
  orderTotal,
} from '../helpers/orderHistory'
import { isBilingualLanguage } from '../helpers/formatCardIdentity'
import {
  bilingualEnglishPreviewDetails,
  bilingualFrenchPreviewDetails,
} from '../helpers/titleLocale'
import { go } from '../adapters/nav'

export default {
  name: 'OrderHistoryPage',
  components: {
    ColliersPageShell,
    AppButton,
    AdminPageHeader,
    SearchField,
    SelectField,
    CardPreview,
  },
  data: function () {
    return {
      store: store,
      search: '',
      statusFilter: 'all',
      details: null,
    }
  },
  computed: {
    fromAdmin: function () {
      return this.$route.name === 'admin-orders'
    },
    showCompanyOrders: function () {
      return isAdmin()
    },
    personColumnLabel: function () {
      return this.showCompanyOrders ? t('employee') : t('cardholder')
    },
    ordersList: function () {
      return this.showCompanyOrders ? this.store.adminOrders : this.store.orderHistory
    },
    statusOptions: function () {
      return [
        { value: 'all', label: t('allStatuses') },
        { value: 'Delivered', label: t('statusDelivered') },
        { value: 'Shipped', label: t('statusShipped') },
        { value: 'Processing', label: t('statusProcessing') },
      ]
    },
    filteredOrders: function () {
      const self = this
      return this.ordersList.filter(function (row) {
        if (self.statusFilter !== 'all' && row.status !== self.statusFilter) return false
        return matchesOrderSearch(row, self.search)
      })
    },
  },
  mounted: function () {
    if (this.showCompanyOrders) loadAdminOrders()
  },
  methods: {
    t: t,
    cardCount: cardCount,
    cardholderName: cardholderName,
    formatOrderDate: function (value) {
      return formatOrderDate(value, store.locale)
    },
    itemLabel: itemLabel,
    orderTotal: orderTotal,
    cardsFromBoxes: cardsFromBoxes,
    lineName: function (line) {
      return t(productNameKey(line.code))
    },
    languageText: function (line) {
      return languageLabel(line.language, t)
    },
    /** Bilingual orders show both printed faces, EN then FR. */
    lineSlots: function (line) {
      var details = line.details || {}
      var language = line.language || details.language || 'English'
      if (isBilingualLanguage(language)) {
        return [
          { language: 'English', details: bilingualEnglishPreviewDetails(details) },
          { language: 'French', details: bilingualFrenchPreviewDetails(details) },
        ]
      }
      return [{ language: language, details: details }]
    },
    lineBoxes: function (record, line) {
      return billedBoxesForLine(line, record.order, record.cart)
    },
    lineCost: function (record, line) {
      return lineTotal(line, this.lineBoxes(record, line)).toFixed(2)
    },
    shipments: function (record) {
      return ((record.order && record.order.splits) || []).filter(function (split) {
        return (split.locations || []).length
      })
    },
    locationBoxes: function (loc) {
      return Math.max(1, Number(loc && loc.qty) || 1)
    },
    boxLabel: function (boxes) {
      var n = Number(boxes) || 0
      return n + ' ' + (n === 1 ? t('box') : t('boxes'))
    },
    rowKey: function (row) {
      return row.id + (row.ownerEmail ? '-' + row.ownerEmail : '')
    },
    detailsDateLabel: function (status) {
      return status === 'Delivered' ? t('dateDelivered') : t('date')
    },
    statusLabel: function (status) {
      if (status === 'Delivered') return t('statusDelivered')
      if (status === 'Shipped') return t('statusShipped')
      if (status === 'Processing') return t('statusProcessing')
      return status
    },
    statusClass: function (status) {
      if (status === 'Delivered') return 'bg-green-100 text-green-800'
      if (status === 'Shipped') return 'bg-blue-100 text-blue-800'
      return 'bg-amber-100 text-amber-800'
    },
    openDetails: function (row) {
      this.details = row
    },
    closeDetails: function () {
      this.details = null
    },
    onRepeat: function (id) {
      if (repeatOrder(id)) go('shipping')
    },
  },
}
</script>
