<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <div class="mb-6 flex flex-col gap-1 sm:mb-8 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 class="colliers-page-title">{{ t('adminDashboard') }}</h1>
        <p class="text-sm font-normal text-gray-400">{{ t('lastUpdatedJustNow') }}</p>
      </div>

      <h2 class="colliers-admin-section-title">{{ t('systemOptions') }}</h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="tile in tiles"
          :key="tile.to"
          type="button"
          class="colliers-admin-tile"
          @click="go(tile.to)"
        >
          <span class="colliers-admin-tile__header">
            <span class="colliers-admin-tile__icon" aria-hidden="true">
              <svg
                v-if="tile.icon === 'cart'"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
              <svg
                v-else-if="tile.icon === 'document'"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <svg
                v-else-if="tile.icon === 'chart'"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                />
              </svg>
              <svg
                v-else-if="tile.icon === 'gear'"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.174.1.331.226.463.38.378.443.445.97.225 1.43l-.64 1.328a1.125 1.125 0 0 0-.225.868c.02.2.02.404 0 .604a1.125 1.125 0 0 0 .225.868l.64 1.328c.22.46.153.987-.225 1.43a1.874 1.874 0 0 1-.463.38c-.332.184-.582.496-.645.87l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a1.875 1.875 0 0 1-.463-.38c-.378-.443-.445-.97-.225-1.43l.64-1.328a1.125 1.125 0 0 0 .225-.868 2.97 2.97 0 0 1 0-.604 1.125 1.125 0 0 0-.225-.868l-.64-1.328c-.22-.46-.153-.987.225-1.43.132-.154.289-.28.463-.38.332-.184.582-.496.645-.87l.213-1.28ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              <svg
                v-else-if="tile.icon === 'user'"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <svg
                v-else-if="tile.icon === 'grad'"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                />
              </svg>
            </span>
            <span class="colliers-admin-tile__heading">
              <span class="colliers-admin-tile__title">{{ t(tile.titleKey) }}</span>
              <span class="colliers-admin-tile__subtitle">{{ tile.subtitle }}</span>
            </span>
          </span>
          <span class="colliers-admin-tile__desc">{{ t(tile.descKey) }}</span>
        </button>
      </div>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import { t, store, loadOffices, loadTitles, loadDegrees } from '../../store'
import { go } from '../../adapters/nav'

function withCount(key, n) {
  return t(key).replace('{n}', String(n))
}

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
      void this.store.locale
      const addressCount = this.store.offices.length
      const titleCount = this.store.titles.length
      const degreeCount = this.store.degrees.length
      return [
        {
          titleKey: 'orderHistory',
          subtitle: t('viewPastOrders'),
          descKey: 'orderHistoryTileDesc',
          icon: 'cart',
          to: 'admin-orders',
        },
        {
          titleKey: 'invoiceHistory',
          subtitle: t('manageBilling'),
          descKey: 'invoiceHistoryTileDesc',
          icon: 'document',
          to: 'admin-invoices',
        },
        {
          titleKey: 'reporting',
          subtitle: t('viewAnalytics'),
          descKey: 'reportingTileDesc',
          icon: 'chart',
          to: 'admin-reporting',
        },
        {
          titleKey: 'manageAddresses',
          subtitle: withCount('addressesConfigured', addressCount),
          descKey: 'manageAddressesTileDesc',
          icon: 'gear',
          to: 'admin-addresses',
        },
        {
          titleKey: 'manageDesignations',
          subtitle: withCount('designationsConfigured', titleCount),
          descKey: 'manageDesignationsTileDesc',
          icon: 'user',
          to: 'admin-titles',
        },
        {
          titleKey: 'manageDegrees',
          subtitle: withCount('degreesConfigured', degreeCount),
          descKey: 'manageDegreesTileDesc',
          icon: 'grad',
          to: 'admin-degrees',
        },
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
