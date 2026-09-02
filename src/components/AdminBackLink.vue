<template>
  <button type="button" class="colliers-back-link" @click="onClick">
    <svg class="colliers-back-link__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
    {{ t('backToDashboard') }}
  </button>
</template>

<script>
import { t } from '../store'
import { go } from '../adapters/nav'

export default {
  name: 'AdminBackLink',
  methods: {
    t: t,
    onClick: function () {
      go('admin')
    },
  },
}
</script>
