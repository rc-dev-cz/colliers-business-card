<template>
  <div class="colliers-page-header">
    <div class="colliers-page-header__main min-w-0">
      <h1 class="colliers-page-title">{{ title }}</h1>
      <p v-if="subtitle" class="colliers-page-subtitle">{{ subtitle }}</p>
    </div>
    <div class="colliers-page-header__actions">
      <slot name="actions"></slot>
      <admin-back-link></admin-back-link>
    </div>
  </div>
</template>

<script>
import AdminBackLink from './AdminBackLink.vue'

export default {
  name: 'AdminPageHeader',
  components: { AdminBackLink },
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
  },
}
</script>
