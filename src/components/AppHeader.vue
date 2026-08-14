<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { useCart } from '../composables/useCart'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { locale, setLocale, t } = useLocale()
const { count, openCart } = useCart()
const { userEmail, logout } = useAuth()
const menuOpen = ref(false)

const badge = computed(() => (count.value > 0 ? String(count.value) : ''))

function goCatalog() {
  router.push({ name: 'catalog' })
}

function goWebDev() {
  menuOpen.value = false
  router.push({ name: 'rc-web-dev-board' })
}

function onLogout() {
  menuOpen.value = false
  logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="colliers-site-header">
    <div class="mx-auto flex h-[64px] w-full max-w-6xl items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8">
      <div class="flex min-w-0 items-center gap-4 sm:gap-8">
        <button
          type="button"
          class="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-colliers-primary"
          aria-label="Colliers"
          @click="goCatalog"
        >
          <span
            class="inline-flex h-8 w-[58px] flex-col overflow-hidden rounded-[2.5px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.1)] sm:h-10 sm:w-[72px]"
            aria-hidden="true"
          >
            <span class="flex flex-1 items-center justify-center bg-[#24418A] px-[10%]">
              <span class="w-full text-center font-serif leading-none tracking-normal text-white text-[11px] sm:text-[13px]">
                Colliers
              </span>
            </span>
            <span class="block h-[2px] w-full bg-[#00A9E0]" />
            <span class="block h-[2px] w-full bg-[#FFD100]" />
            <span class="block h-[2px] w-full bg-[#E31837]" />
          </span>
        </button>
        <nav class="hidden h-full sm:flex">
          <button
            type="button"
            class="flex h-[64px] items-center border-b-[3px] border-colliers-primary px-3 text-sm font-medium text-gray-900 sm:h-[72px] sm:px-4 sm:text-base"
            @click="goCatalog"
          >
            {{ t('catalog') }}
          </button>
        </nav>
      </div>

      <div class="flex items-center gap-3 sm:gap-6">
        <div class="flex items-center text-[14px] font-medium sm:text-[15px]">
          <button
            type="button"
            class="transition-colors focus:outline-none"
            :class="locale === 'EN' ? 'font-bold text-colliers-primary' : 'text-gray-500 hover:text-gray-900'"
            @click="setLocale('EN')"
          >
            EN
          </button>
          <span class="mx-1.5 text-gray-400 sm:mx-2">/</span>
          <button
            type="button"
            class="transition-colors focus:outline-none"
            :class="locale === 'FR' ? 'font-bold text-colliers-primary' : 'text-gray-500 hover:text-gray-900'"
            @click="setLocale('FR')"
          >
            FR
          </button>
        </div>

        <button
          type="button"
          class="relative rounded-sm text-colliers-primary transition-colors hover:text-colliers-primary-hover focus:outline-none focus:ring-2 focus:ring-colliers-primary"
          :aria-label="t('shoppingCart')"
          @click="openCart"
        >
          <svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <span
            v-if="badge"
            class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
          >
            {{ badge }}
          </span>
        </button>

        <div class="relative">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-colliers-primary text-white hover:bg-colliers-primary-hover sm:h-11 sm:w-11"
            :aria-label="t('profileMenu')"
            @click="menuOpen = !menuOpen"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2h19.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-md border border-gray-200 bg-white py-2 shadow-lg"
          >
            <div class="border-b border-gray-100 px-3 pb-2 text-sm text-gray-600">{{ userEmail || 'demo' }}</div>
            <button
              type="button"
              class="web-dev-menu mx-2 mt-2 w-[calc(100%-1rem)] rounded-md px-3 py-2 text-left text-sm font-semibold text-gray-900"
              @click="goWebDev"
            >
              RC Web Dev
            </button>
            <button
              type="button"
              class="mt-1 w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
              @click="onLogout"
            >
              {{ t('logOut') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Vue prototype only — strip this menu item before the Klai port. */
.web-dev-menu {
  background: linear-gradient(
    90deg,
    #fecaca 0%,
    #fed7aa 16%,
    #fef08a 33%,
    #bbf7d0 50%,
    #bfdbfe 66%,
    #ddd6fe 83%,
    #fbcfe8 100%
  );
}
</style>
