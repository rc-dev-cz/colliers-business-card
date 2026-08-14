<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { userEmail, logout } = useAuth()
const menuOpen = ref(false)

function goPortal() {
  menuOpen.value = false
  router.push({ name: 'catalog' })
}

function onLogout() {
  menuOpen.value = false
  logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="rc-web-dev-header">
    <div class="mx-auto flex h-14 w-full items-center justify-between px-4 sm:h-16 sm:px-6">
      <p class="text-sm font-semibold tracking-wide text-gray-900 sm:text-base">RC Web Dev</p>
      <div class="relative">
        <span class="web-dev-ring">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 sm:h-10 sm:w-10"
            aria-label="RC Web Dev menu"
            @click="menuOpen = !menuOpen"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v1.2h19.2v-1.2c0-3.2-6.4-4.8-9.6-4.8z" />
            </svg>
          </button>
        </span>
        <div
          v-if="menuOpen"
          class="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-md border border-gray-200 bg-white py-2 shadow-lg"
        >
          <div class="border-b border-gray-100 px-3 pb-2 text-sm text-gray-600">{{ userEmail || 'demo' }}</div>
          <button
            type="button"
            class="mt-1 w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
            @click="goPortal"
          >
            Open portal
          </button>
          <button
            type="button"
            class="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
            @click="onLogout"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
