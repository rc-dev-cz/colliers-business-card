<template>
  <colliers-page-shell>
    <div class="mx-auto w-full" :class="fromAdmin ? 'max-w-6xl' : 'max-w-5xl'">
      <admin-page-header v-if="fromAdmin" :title="t('orderHistory')"></admin-page-header>
      <div v-else class="colliers-page-intro">
        <h1 class="colliers-page-title">{{ t('orderHistory') }}</h1>
      </div>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div
          class="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:p-5"
          :class="fromAdmin ? 'sm:justify-between' : 'sm:justify-end'"
        >
          <h2 v-if="fromAdmin" class="text-base font-semibold text-gray-900">{{ t('recentOrders') }}</h2>
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
            <thead class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
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
                <td colspan="7" class="px-4 py-10 text-center text-gray-500">{{ t('noOrders') }}</td>
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
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="statusClass(row.status)"
                  >
                    {{ statusLabel(row.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <button type="button" class="text-colliers-primary hover:underline" @click="onRepeat(row.id)">
                    {{ t('repeatOrder') }}
                  </button>
                  <span class="mx-2 text-gray-300">|</span>
                  <button type="button" class="text-colliers-primary hover:underline" @click="openDetails(row)">
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
      <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-white shadow-xl sm:rounded-lg">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ t('orderDetails') }}</h2>
          <button type="button" class="rounded p-1 text-gray-500 hover:bg-gray-100" :aria-label="t('close')" @click="closeDetails">
            ×
          </button>
        </div>
        <div class="space-y-3 px-5 py-5 text-sm">
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('orderId') }}</span>
            <span class="font-medium text-gray-900">{{ details.id }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ detailsDateLabel(details.status) }}</span>
            <span class="text-gray-900">{{ formatOrderDate(details.date) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('status') }}</span>
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
              :class="statusClass(details.status)"
            >
              {{ statusLabel(details.status) }}
            </span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ personColumnLabel }}</span>
            <span class="text-gray-900">{{ cardholderName(details) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('item') }}</span>
            <span class="text-gray-900">{{ itemLabel(details, t) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('quantity') }}</span>
            <span class="text-gray-900">{{ cardCount(details) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('totalCost') }}</span>
            <span class="font-medium text-gray-900">${{ orderTotal(details).toFixed(2) }}</span>
          </div>
          <div>
            <div class="mb-1 text-gray-500">{{ t('shipTo') }}</div>
            <p v-for="line in shipToLines(details)" :key="line" class="text-gray-900">{{ line }}</p>
          </div>
          <div class="flex justify-between gap-4 border-t border-gray-100 pt-3">
            <span class="text-gray-500">{{ t('proof') }}</span>
            <button type="button" class="text-colliers-primary hover:underline" @click="proofOpen = true">
              {{ t('viewBusinessCardProof') }}
            </button>
          </div>
        </div>
        <div class="flex justify-end border-t border-gray-100 px-5 py-4">
          <app-button variant="outline" class="sm:w-auto" @click="closeDetails">{{ t('close') }}</app-button>
        </div>
      </div>
    </div>

    <div
      v-if="details && proofOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      :aria-label="t('cardPreview')"
      @click.self="proofOpen = false"
    >
      <div class="w-full max-w-xl rounded-t-lg bg-white p-5 shadow-xl sm:rounded-lg">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">{{ t('cardPreview') }}</h2>
          <button type="button" class="rounded p-1 text-gray-500 hover:bg-gray-100" :aria-label="t('close')" @click="proofOpen = false">
            ×
          </button>
        </div>
        <card-preview :details="proofDetails(details)"></card-preview>
        <div class="mt-4 flex justify-end">
          <app-button variant="outline" class="sm:w-auto" @click="proofOpen = false">{{ t('close') }}</app-button>
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
import {
  cardCount,
  cardholderName,
  formatOrderDate,
  itemLabel,
  matchesOrderSearch,
  orderTotal,
  proofDetails,
  shipToLines,
} from '../helpers/orderHistory'
import { go } from '../adapters/nav'

export default {
  name: 'OrderHistoryPage',
  components: { ColliersPageShell, AppButton, AdminPageHeader, SearchField, SelectField, CardPreview },
  data: function () {
    return {
      store: store,
      search: '',
      statusFilter: 'all',
      details: null,
      proofOpen: false,
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
    formatOrderDate: formatOrderDate,
    itemLabel: itemLabel,
    orderTotal: orderTotal,
    proofDetails: proofDetails,
    shipToLines: shipToLines,
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
      this.proofOpen = false
    },
    closeDetails: function () {
      this.details = null
      this.proofOpen = false
    },
    onRepeat: function (id) {
      if (repeatOrder(id)) go('shipping')
    },
  },
}
</script>
