<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <admin-page-header :title="t('reporting')"></admin-page-header>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="flex flex-col gap-6 lg:col-span-2">
          <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="mb-4 text-base font-semibold text-gray-900">{{ t('monthlySpendOverview') }}</h2>
            <div class="flex h-48 items-end gap-2 border-b border-gray-100 px-1 sm:h-56 sm:gap-3">
              <div
                v-for="row in reporting.monthlySpend"
                :key="row.month"
                class="flex flex-1 flex-col items-center justify-end gap-2"
              >
                <div
                  class="w-full max-w-[2.5rem] rounded-t bg-colliers-primary/80"
                  :style="{ height: barHeight(row.amount) }"
                  :title="'$' + formatAmount(row.amount)"
                ></div>
              </div>
            </div>
            <div class="mt-2 flex gap-2 px-1 sm:gap-3">
              <div
                v-for="row in reporting.monthlySpend"
                :key="'label-' + row.month"
                class="flex-1 text-center text-xs text-gray-500"
              >
                {{ row.month }}
              </div>
            </div>
          </section>

          <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="mb-4 text-base font-semibold text-gray-900">{{ t('recentActivity') }}</h2>
            <ul class="divide-y divide-gray-100">
              <li
                v-for="(row, index) in reporting.recentActivity"
                :key="index"
                class="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-gray-900">{{ row.name }}</div>
                  <div class="text-sm text-gray-500">{{ row.action }}</div>
                </div>
                <div class="shrink-0 text-right">
                  <span
                    class="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                  >
                    {{ row.department }}
                  </span>
                  <div class="mt-1 text-xs text-gray-400">{{ row.when }}</div>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <div class="flex flex-col gap-6">
          <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 class="mb-4 text-base font-semibold text-gray-900">{{ t('spendByDepartment') }}</h2>
            <ul class="space-y-4">
              <li v-for="row in reporting.spendByDepartment" :key="row.department">
                <div class="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span class="font-medium text-gray-900">{{ row.department }}</span>
                  <span class="tabular-nums text-gray-700">${{ formatAmount(row.amount) }}</span>
                </div>
                <div class="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-colliers-primary"
                    :style="{ width: spendPercent(row.amount) }"
                  ></div>
                </div>
              </li>
            </ul>
          </section>

          <section class="rounded-lg bg-colliers-primary p-5 text-white shadow-sm sm:p-6">
            <h2 class="text-base font-semibold">{{ t('generateCustomReport') }}</h2>
            <p class="mt-2 text-sm text-white/85">{{ t('generateCustomReportHint') }}</p>
            <button
              type="button"
              class="mt-5 w-full rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-colliers-primary transition-colors hover:bg-gray-50"
              @click="exportData"
            >
              {{ t('exportData') }}
            </button>
          </section>
        </div>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AdminPageHeader from '../../components/AdminPageHeader.vue'
import { t } from '../../store'
import { MOCK_REPORTING } from '../../helpers/adminData'

export default {
  name: 'AdminReportingPage',
  components: { ColliersPageShell, AdminPageHeader },
  data: function () {
    return {
      reporting: MOCK_REPORTING,
    }
  },
  computed: {
    maxMonthly: function () {
      let max = 0
      this.reporting.monthlySpend.forEach(function (row) {
        if (row.amount > max) max = row.amount
      })
      return max || 1
    },
    maxSpend: function () {
      let max = 0
      this.reporting.spendByDepartment.forEach(function (row) {
        if (row.amount > max) max = row.amount
      })
      return max || 1
    },
  },
  methods: {
    t: t,
    formatAmount: function (n) {
      return Number(n).toLocaleString('en-US')
    },
    barHeight: function (amount) {
      const pct = Math.max(8, Math.round((amount / this.maxMonthly) * 100))
      return pct + '%'
    },
    spendPercent: function (amount) {
      return Math.round((amount / this.maxSpend) * 100) + '%'
    },
    exportData: function () {
      window.alert(t('exportDataMock'))
    },
  },
}
</script>
