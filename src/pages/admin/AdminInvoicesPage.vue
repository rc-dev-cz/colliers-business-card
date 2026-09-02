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
              <th class="px-4 py-3">{{ t('customer') }}</th>
              <th class="px-4 py-3">{{ t('amount') }}</th>
              <th class="px-4 py-3">{{ t('status') }}</th>
              <th class="px-4 py-3 text-right">{{ t('action') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in invoices" :key="row.id" class="border-b border-gray-100 last:border-0">
              <td class="px-4 py-3 font-medium text-colliers-primary">{{ row.id }}</td>
              <td class="px-4 py-3 text-gray-700">{{ row.date }}</td>
              <td class="px-4 py-3 text-gray-700">{{ row.customer }}</td>
              <td class="px-4 py-3 text-gray-700">${{ row.amount.toFixed(2) }}</td>
              <td class="px-4 py-3 text-gray-700">{{ row.status }}</td>
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
import { t } from '../../store'
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
    download: function (row) {
      window.alert(t('invoiceDownloadMock') + ' ' + row.id)
    },
  },
}
</script>
