<template>
  <colliers-page-shell>
    <div class="mx-auto w-full max-w-5xl">
      <admin-page-header
        :title="t(titleKey)"
        :subtitle="t('adminStubHint') + ' ' + ticket + '.'"
      ></admin-page-header>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../../layout/ColliersPageShell.vue'
import AdminPageHeader from '../../components/AdminPageHeader.vue'
import { t } from '../../store'

export default {
  name: 'AdminStubPage',
  components: { ColliersPageShell, AdminPageHeader },
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
