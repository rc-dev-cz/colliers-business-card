<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <h1 class="mb-8 text-3xl font-bold text-gray-900 sm:text-4xl">{{ t('adminDashboard') }}</h1>
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
          <p class="mt-1 text-sm font-medium text-colliers-primary">{{ tile.subtitle }}</p>
        </button>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import { t, store, loadOffices, loadTitles } from '../../store'
import { go } from '../../adapters/nav'

export default {
  name: 'AdminDashboardPage',
  components: { ColliersPageShell },
  mounted: function () {
    loadOffices()
    loadTitles()
  },
  computed: {
    tiles: function () {
      const addressCount = this.store.offices.length
      const titleCount = this.store.titles.length
      return [
        { titleKey: 'orderHistory', subtitle: t('viewPastOrders'), to: 'admin-orders' },
        { titleKey: 'invoiceHistory', subtitle: t('manageBilling'), to: 'admin-invoices' },
        { titleKey: 'reporting', subtitle: t('viewAnalytics'), to: 'admin-reporting' },
        { titleKey: 'manageAddresses', subtitle: String(addressCount), to: 'admin-addresses' },
        { titleKey: 'manageTitles', subtitle: String(titleCount), to: 'admin-titles' },
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
