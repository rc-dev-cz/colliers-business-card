<template>
  <colliers-page-shell>
    <h1 class="colliers-page-title">{{ t('contactUs') }}</h1>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import { t } from '../store'

export default {
  name: 'ContactUsPage',
  components: { ColliersPageShell },
  methods: {
    t: t,
  },
}
</script>
