<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <admin-page-header :title="t('reporting')">
        <template #actions>
          <app-button variant="outline" @click="exportData">{{ t('exportData') }}</app-button>
        </template>
      </admin-page-header>

      <section class="mb-8">
        <h2 class="mb-4 text-xl font-bold text-colliers-primary">{{ t('monthlySpendOverview') }}</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="row in reporting.monthlySpend"
            :key="row.month"
            class="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
          >
            <div class="text-xs font-medium uppercase text-gray-500">{{ row.month }}</div>
            <div class="mt-1 text-lg font-semibold text-gray-900">${{ row.amount }}</div>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section>
          <h2 class="mb-4 text-xl font-bold text-colliers-primary">{{ t('recentActivity') }}</h2>
          <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            <li v-for="(row, index) in reporting.recentActivity" :key="index" class="px-4 py-3 text-sm">
              <div class="text-gray-900">{{ row.text }}</div>
              <div class="text-xs text-gray-500">{{ row.when }}</div>
            </li>
          </ul>
        </section>

        <section>
          <h2 class="mb-4 text-xl font-bold text-colliers-primary">{{ t('spendByDepartment') }}</h2>
          <ul class="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            <li
              v-for="row in reporting.spendByDepartment"
              :key="row.department"
              class="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span class="text-gray-900">{{ row.department }}</span>
              <span class="font-medium text-gray-700">${{ row.amount }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AppButton from '../../components/AppButton.vue'
import AdminPageHeader from '../../components/AdminPageHeader.vue'
import { t } from '../../store'
import { MOCK_REPORTING } from '../../helpers/adminData'

export default {
  name: 'AdminReportingPage',
  components: { ColliersPageShell, AppButton, AdminPageHeader },
  data: function () {
    return {
      reporting: MOCK_REPORTING,
    }
  },
  methods: {
    t: t,
    exportData: function () {
      window.alert(t('exportDataMock'))
    },
  },
}
</script>
