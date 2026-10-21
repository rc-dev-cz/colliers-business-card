<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <admin-page-header :title="t('reporting')"></admin-page-header>

      <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <empty-state :message="t('reportingEmpty')"></empty-state>
      </section>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AdminPageHeader from '../../components/AdminPageHeader.vue'
import EmptyState from '../../components/EmptyState.vue'
import { t } from '../../store'

export default {
  name: 'AdminReportingPage',
  components: { ColliersPageShell, AdminPageHeader, EmptyState },
  methods: {
    t: t,
  },
}
</script>
