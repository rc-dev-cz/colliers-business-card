<template>
  <footer class="colliers-site-footer border-t border-gray-200 bg-white">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-[13px] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10"
    >
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" class="hover:text-gray-800">{{ t('contactUs') }}</button>
        <button type="button" class="hover:text-gray-800">{{ t('securityPrivacy') }}</button>
        <button type="button" class="hover:text-gray-800">{{ t('terms') }}</button>
      </div>
      <div class="text-gray-400">© 2026 DCM {{ t('allRights') }}</div>
    </div>
  </footer>
</template>

<script>
import { t } from '../store'

export default {
  name: 'AppFooter',
  methods: {
    t: t,
  },
}
</script>
