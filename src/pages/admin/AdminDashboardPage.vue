<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <div class="colliers-page-intro">
        <h1 class="colliers-page-title">{{ t('adminDashboard') }}</h1>
      </div>
      <h2 class="mb-5 text-xl font-bold text-colliers-primary sm:text-2xl">{{ t('systemOptions') }}</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="tile in tiles"
          :key="tile.to"
          type="button"
          class="rounded-lg border border-gray-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-colliers-primary"
          @click="go(tile.to)"
        >
          <h3 class="text-lg font-semibold text-gray-900">{{ t(tile.titleKey) }}</h3>
          <p class="mt-1 text-sm font-medium text-colliers-primary">
            {{ tile.subtitleKey ? t(tile.subtitleKey) : tile.count }}
          </p>
        </button>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import { t, store, loadOffices, loadTitles, loadDegrees } from '../../store'
import { go } from '../../adapters/nav'

export default {
  name: 'AdminDashboardPage',
  components: { ColliersPageShell },
  mounted: function () {
    loadOffices()
    loadTitles()
    loadDegrees()
  },
  computed: {
    tiles: function () {
      const addressCount = this.store.offices.length
      const titleCount = this.store.titles.length
      const degreeCount = this.store.degrees.length
      return [
        { titleKey: 'orderHistory', subtitleKey: 'viewPastOrders', to: 'admin-orders' },
        { titleKey: 'invoiceHistory', subtitleKey: 'manageBilling', to: 'admin-invoices' },
        { titleKey: 'reporting', subtitleKey: 'viewAnalytics', to: 'admin-reporting' },
        { titleKey: 'manageAddresses', count: addressCount, to: 'admin-addresses' },
        { titleKey: 'manageDesignations', count: titleCount, to: 'admin-titles' },
        { titleKey: 'manageDegrees', count: degreeCount, to: 'admin-degrees' },
      ]
    },
    store: function () {
      return store
    },
  },
  methods: {
    t: t,
    go: go,
  },
}
</script>
