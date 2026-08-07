import { computed, ref, watch } from 'vue'
import { readStorage, writeStorage } from './useStorage'
import { messages } from '../i18n/messages'

const locale = ref(readStorage('locale', 'EN') === 'FR' ? 'FR' : 'EN')

watch(locale, (value) => writeStorage('locale', value), { immediate: true })

export function useLocale() {
  function t(key) {
    const entry = messages[key]
    if (!entry) return key
    return entry[locale.value] || entry.EN || key
  }

  function setLocale(next) {
    locale.value = next === 'FR' ? 'FR' : 'EN'
  }

  const isFr = computed(() => locale.value === 'FR')

  return {
    locale,
    isFr,
    t,
    setLocale,
  }
}
