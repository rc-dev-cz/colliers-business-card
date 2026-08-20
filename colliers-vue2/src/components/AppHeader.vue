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
            <span class="block h-[2px] w-full bg-[#00A9E0]"></span>
            <span class="block h-[2px] w-full bg-[#FFD100]"></span>
            <span class="block h-[2px] w-full bg-[#E31837]"></span>
          </span>
        </button>
        <span
          v-if="admin"
          class="hidden text-xs font-semibold tracking-wide text-gray-500 sm:inline"
        >
          {{ t('adminLabel') }}
        </span>
        <nav class="hidden h-full min-w-0 sm:flex">
          <button
            type="button"
            class="flex h-[64px] items-center border-b-[3px] px-3 text-sm font-medium sm:h-[72px] sm:px-4 sm:text-base"
            :class="navClass('catalog')"
            @click="goCatalog"
          >
            {{ admin ? t('catalogue') : t('catalog') }}
          </button>
          <button
            v-if="admin"
            type="button"
            class="flex h-[64px] items-center border-b-[3px] px-3 text-sm font-medium sm:h-[72px] sm:px-4 sm:text-base"
            :class="navClass('admin-addresses')"
            @click="goNamed('admin-addresses')"
          >
            {{ t('manageAddresses') }}
          </button>
          <button
            v-if="admin"
            type="button"
            class="flex h-[64px] items-center border-b-[3px] px-3 text-sm font-medium sm:h-[72px] sm:px-4 sm:text-base"
            :class="navClass('admin-titles')"
            @click="goNamed('admin-titles')"
          >
            {{ t('manageTitles') }}
          </button>
        </nav>
      </div>

      <div class="flex items-center gap-3 sm:gap-6">
        <div class="flex items-center text-[14px] font-medium sm:text-[15px]">
          <button
            type="button"
            class="transition-colors focus:outline-none"
            :class="store.locale === 'EN' ? 'font-bold text-colliers-primary' : 'text-gray-500 hover:text-gray-900'"
            @click="setLocale('EN')"
          >
            EN
          </button>
          <span class="mx-1.5 text-gray-400 sm:mx-2">/</span>
          <button
            type="button"
            class="transition-colors focus:outline-none"
            :class="store.locale === 'FR' ? 'font-bold text-colliers-primary' : 'text-gray-500 hover:text-gray-900'"
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

        <div ref="profileMenu" class="relative">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-colliers-primary text-white hover:bg-colliers-primary-hover sm:h-11 sm:w-11"
            :aria-label="t('profileMenu')"
            :aria-expanded="menuOpen ? 'true' : 'false'"
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
            <div class="border-b border-gray-100 px-3 pb-2 text-sm text-gray-600">{{ email || 'demo' }}</div>
            <button
              v-if="admin"
              type="button"
              class="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
              @click="goNamed('admin')"
            >
              {{ t('adminPanel') }}
            </button>
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
              @click="goAddressBook"
            >
              {{ t('addressBook') }}
            </button>
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
              @click="goOrderHistory"
            >
              {{ t('orderHistory') }}
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

<script>
import { store, t, setLocale, openCart, logout, userEmail, isAdmin } from '../store'
import { cartCount } from '../helpers/cart'
import { go, currentRouteName } from '../adapters/nav'

export default {
  name: 'AppHeader',
  data: function () {
    return {
      store: store,
      menuOpen: false,
    }
  },
  computed: {
    badge: function () {
      const count = cartCount(this.store.cart)
      return count > 0 ? String(count) : ''
    },
    email: function () {
      return userEmail()
    },
    admin: function () {
      return isAdmin()
    },
    routeName: function () {
      return this.$route && this.$route.name ? this.$route.name : currentRouteName()
    },
  },
  mounted: function () {
    document.addEventListener('click', this.onDocumentClick)
    document.addEventListener('keydown', this.onDocumentKey)
  },
  beforeDestroy: function () {
    document.removeEventListener('click', this.onDocumentClick)
    document.removeEventListener('keydown', this.onDocumentKey)
  },
  methods: {
    t: t,
    setLocale: setLocale,
    openCart: openCart,
    navClass: function (name) {
      return this.routeName === name
        ? 'border-colliers-primary text-gray-900'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    },
    onDocumentClick: function (event) {
      if (!this.menuOpen) return
      const root = this.$refs.profileMenu
      if (root && root.contains(event.target)) return
      this.menuOpen = false
    },
    onDocumentKey: function (event) {
      if (event.key === 'Escape') this.menuOpen = false
    },
    goCatalog: function () {
      this.menuOpen = false
      go('catalog')
    },
    goNamed: function (name) {
      this.menuOpen = false
      go(name)
    },
    goAddressBook: function () {
      this.menuOpen = false
      go('addresses')
    },
    goOrderHistory: function () {
      this.menuOpen = false
      go(this.admin ? 'admin-orders' : 'history')
    },
    onLogout: function () {
      this.menuOpen = false
      logout()
      go('login')
    },
  },
}
</script>
