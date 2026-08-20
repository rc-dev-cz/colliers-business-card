<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">{{ t(titleKey) }}</h1>
      <p class="mt-3 text-sm text-gray-500">{{ t('adminStubHint') }} {{ ticket }}.</p>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import { t } from '../../store'

export default {
  name: 'AdminStubPage',
  components: { ColliersPageShell },
  computed: {
    titleKey: function () {
      return (this.$route.meta && this.$route.meta.titleKey) || 'adminDashboard'
    },
    ticket: function () {
      return (this.$route.meta && this.$route.meta.ticket) || ''
    },
  },
  methods: {
    t: t,
  },
}
</script>
