<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <admin-page-header :title="t('invoiceHistory')"></admin-page-header>

      <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table class="min-w-full text-left text-sm">
          <thead class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-4 py-3">{{ t('invoiceId') }}</th>
              <th class="px-4 py-3">{{ t('date') }}</th>
              <th class="px-4 py-3">{{ t('department') }}</th>
              <th class="px-4 py-3">{{ t('amount') }}</th>
              <th class="px-4 py-3">{{ t('status') }}</th>
              <th class="px-4 py-3 text-right">{{ t('action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in invoices" :key="row.id" class="border-b border-gray-100 last:border-0">
              <td class="px-4 py-3 font-medium text-colliers-primary">{{ row.id }}</td>
              <td class="px-4 py-3 text-gray-700">{{ formatInvoiceDate(row.date) }}</td>
              <td class="px-4 py-3 text-gray-700">{{ row.department }}</td>
              <td class="px-4 py-3 tabular-nums text-gray-700">${{ formatAmount(row.amount) }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex rounded-md px-2.5 py-1 text-xs font-medium"
                  :class="statusClass(row.status)"
                >
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <button type="button" class="text-colliers-primary hover:underline" @click="download(row)">
                  {{ t('download') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AdminPageHeader from '../../components/AdminPageHeader.vue'
import { t, store } from '../../store'
import { MOCK_INVOICES } from '../../helpers/adminData'

export default {
  name: 'AdminInvoicesPage',
  components: { ColliersPageShell, AdminPageHeader },
  data: function () {
    return {
      invoices: MOCK_INVOICES,
    }
  },
  methods: {
    t: t,
    formatAmount: function (n) {
      return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    formatInvoiceDate: function (iso) {
      const parts = String(iso || '').split('-')
      if (parts.length !== 3) return iso
      const year = Number(parts[0])
      const month = Number(parts[1]) - 1
      const day = Number(parts[2])
      const d = new Date(year, month, day)
      const locale = store.locale === 'FR' ? 'fr-CA' : 'en-US'
      return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
    },
    statusLabel: function (status) {
      if (status === 'Paid') return t('statusPaid')
      if (status === 'Pending') return t('statusPending')
      if (status === 'Overdue') return t('statusOverdue')
      return status
    },
    statusClass: function (status) {
      if (status === 'Paid') return 'bg-green-100 text-green-800'
      if (status === 'Pending') return 'bg-amber-100 text-amber-800'
      if (status === 'Overdue') return 'bg-red-100 text-red-800'
      return 'bg-gray-100 text-gray-700'
    },
    download: function (row) {
      window.alert(t('invoiceDownloadMock') + ' ' + row.id)
    },
  },
}
</script>
