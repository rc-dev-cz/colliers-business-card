<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-6xl">
      <h1 class="mb-6 text-3xl font-bold text-gray-900 sm:mb-8 sm:text-4xl">{{ t('orderHistory') }}</h1>

      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div class="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-end sm:p-5">
          <text-field
            class="w-full sm:max-w-xs"
            :value="search"
            :placeholder="t('searchByName')"
            @input="search = $event"
          ></text-field>
          <select-field
            class="w-full sm:w-48"
            :value="statusFilter"
            :options="statusOptions"
            @input="statusFilter = $event"
          ></select-field>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th class="px-4 py-3">{{ t('orderId') }}</th>
                <th class="px-4 py-3">{{ t('cardholder') }}</th>
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
                :key="row.id + '-' + row.ownerEmail"
                class="border-b border-gray-100 last:border-0"
              >
                <td class="px-4 py-3 font-medium text-colliers-primary">{{ row.id }}</td>
                <td class="px-4 py-3 text-gray-800">{{ cardholderName(row) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ itemLabel(row, t) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ boxCount(row) }}</td>
                <td class="px-4 py-3 text-gray-700">{{ formatOrderDate(row.date) }}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="statusClass(row.status)">
                    {{ statusLabel(row.status) }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 text-right">
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
      @click.self="closeDetails"
    >
      <div class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-white shadow-xl sm:rounded-lg">
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 class="text-lg font-semibold text-gray-900">{{ t('orderDetails') }}</h2>
          <button type="button" class="rounded p-1 text-gray-500 hover:bg-gray-100" @click="closeDetails">×</button>
        </div>
        <div class="space-y-3 px-5 py-5 text-sm">
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('orderId') }}</span>
            <span class="font-medium text-gray-900">{{ details.id }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('cardholder') }}</span>
            <span class="text-gray-900">{{ cardholderName(details) }}</span>
          </div>
          <div class="flex justify-between gap-4">
            <span class="text-gray-500">{{ t('status') }}</span>
            <span class="text-gray-900">{{ statusLabel(details.status) }}</span>
          </div>
          <div class="border-t border-gray-100 pt-3">
            <button type="button" class="text-colliers-primary hover:underline" @click="proofOpen = true">
              {{ t('viewBusinessCardProof') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="details && proofOpen"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      @click.self="proofOpen = false"
    >
      <div class="w-full max-w-xl rounded-t-lg bg-white p-5 shadow-xl sm:rounded-lg">
        <h2 class="mb-4 text-lg font-semibold text-gray-900">{{ t('cardPreview') }}</h2>
        <card-preview :details="proofDetails(details)"></card-preview>
        <div class="mt-4 flex justify-end">
          <app-button variant="outline" @click="proofOpen = false">{{ t('close') }}</app-button>
        </div>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AppButton from '../../components/AppButton.vue'
import TextField from '../../components/TextField.vue'
import SelectField from '../../components/SelectField.vue'
import CardPreview from '../../components/CardPreview.vue'
import { store, t, loadAdminOrders } from '../../store'
import {
  boxCount,
  cardholderName,
  formatOrderDate,
  itemLabel,
  matchesOrderSearch,
  proofDetails,
} from '../../helpers/orderHistory'

export default {
  name: 'AdminOrderHistoryPage',
  components: { ColliersPageShell, AppButton, TextField, SelectField, CardPreview },
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
      return this.store.adminOrders.filter(function (row) {
        if (self.statusFilter !== 'all' && row.status !== self.statusFilter) return false
        return matchesOrderSearch(row, self.search)
      })
    },
  },
  mounted: function () {
    loadAdminOrders()
  },
  methods: {
    t: t,
    boxCount: boxCount,
    cardholderName: cardholderName,
    formatOrderDate: formatOrderDate,
    itemLabel: itemLabel,
    proofDetails: proofDetails,
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
  },
}
</script>
