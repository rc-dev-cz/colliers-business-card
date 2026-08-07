<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useLocale } from '../composables/useLocale'

const { locale, setLocale, t } = useLocale()
const langOpen = ref(false)

function pickLang(next) {
  setLocale(next)
  langOpen.value = false
}

function onDocClick(event) {
  const root = event.target?.closest?.('[data-footer-lang]')
  if (!root) langOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <footer class="colliers-site-footer border-t border-gray-200 bg-white">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-[13px] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-10"
    >
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="button" class="hover:text-gray-800">{{ t('contactUs') }}</button>

        <div class="relative" data-footer-lang>
          <button
            type="button"
            class="inline-flex items-center gap-1 hover:text-gray-800"
            :aria-expanded="langOpen"
            @click.stop="langOpen = !langOpen"
          >
            {{ locale === 'EN' ? 'English' : 'Français' }}
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            v-if="langOpen"
            class="absolute bottom-full left-0 z-20 mb-2 min-w-[7.5rem] rounded border border-gray-200 bg-white py-1 shadow-md"
          >
            <button
              type="button"
              class="block w-full px-3 py-1.5 text-left hover:bg-gray-50"
              :class="locale === 'EN' ? 'font-medium text-gray-900' : 'text-gray-600'"
              @click="pickLang('EN')"
            >
              English
            </button>
            <button
              type="button"
              class="block w-full px-3 py-1.5 text-left hover:bg-gray-50"
              :class="locale === 'FR' ? 'font-medium text-gray-900' : 'text-gray-600'"
              @click="pickLang('FR')"
            >
              Français
            </button>
          </div>
        </div>

        <button type="button" class="hover:text-gray-800">{{ t('securityPrivacy') }}</button>
        <button type="button" class="hover:text-gray-800">{{ t('terms') }}</button>
      </div>
      <div class="text-gray-400">© 2026 DCM {{ t('allRights') }}</div>
    </div>
  </footer>
</template>
