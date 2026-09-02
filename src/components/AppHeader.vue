<template>
  <header :class="['colliers-site-header', { 'colliers-site-header--admin': admin }]">
    <div
      class="colliers-header-inner mx-auto flex h-[64px] w-full items-stretch justify-between sm:h-[72px]"
      :class="admin ? 'px-6 lg:px-12' : 'max-w-6xl items-center px-4 sm:px-6 lg:px-8'"
    >
      <div
        class="flex min-w-0"
        :class="admin ? 'h-full flex-1 items-stretch' : 'items-center gap-4 sm:gap-8'"
      >
        <button
          type="button"
          class="shrink-0 focus:outline-none"
          :class="[
            admin ? 'mr-4 flex items-center self-center focus-visible:ring-2 focus-visible:ring-white sm:mr-6 lg:mr-12' : 'focus-visible:ring-2 focus-visible:ring-colliers-primary',
          ]"
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

        <button
          v-if="admin"
          type="button"
          class="colliers-admin-menu-btn"
          :aria-label="t('openMenu')"
          :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
          @click="openMobileMenu"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <nav
          v-if="admin"
          class="colliers-admin-nav h-full min-w-0 flex-1 items-stretch pr-2 lg:pr-8"
        >
          <div class="colliers-admin-nav-links flex h-full min-w-0 flex-1 flex-wrap items-stretch">
            <button
              type="button"
              class="colliers-admin-nav-link"
              :class="navClass('catalog')"
              @click="goCatalog"
            >
              {{ t('catalogue') }}
            </button>
            <button
              type="button"
              class="colliers-admin-nav-link"
              :class="navClass('admin-addresses')"
              @click="goNamed('admin-addresses')"
            >
              {{ t('manageAddresses') }}
            </button>
            <button
              type="button"
              class="colliers-admin-nav-link"
              :class="navClass('admin-titles')"
              @click="goNamed('admin-titles')"
            >
              {{ t('manageDesignations') }}
            </button>
            <button
              type="button"
              class="colliers-admin-nav-link"
              :class="navClass('admin-degrees')"
              @click="goNamed('admin-degrees')"
            >
              {{ t('manageDegrees') }}
            </button>
          </div>
        </nav>

        <nav v-else class="hidden h-full min-w-0 sm:flex">
          <button
            type="button"
            class="colliers-user-nav-link"
            :class="navClass('catalog')"
            @click="goCatalog"
          >
            {{ t('catalog') }}
          </button>
        </nav>
      </div>

      <div class="flex shrink-0 items-center gap-3 self-center sm:gap-6">
        <div class="flex items-center text-[14px] font-medium sm:text-[15px]">
          <button
            type="button"
            class="transition-colors focus:outline-none"
            :class="localeClass('EN')"
            @click="setLocale('EN')"
          >
            EN
          </button>
          <span class="mx-1.5 sm:mx-2" :class="admin ? 'text-white/50' : 'text-gray-400'">/</span>
          <button
            type="button"
            class="transition-colors focus:outline-none"
            :class="localeClass('FR')"
            @click="setLocale('FR')"
          >
            FR
          </button>
        </div>

        <button
          type="button"
          class="relative rounded-sm transition-colors focus:outline-none focus:ring-2"
          :class="admin
            ? 'text-white/90 hover:text-white focus:ring-white'
            : 'text-colliers-primary hover:text-colliers-primary-hover focus:ring-colliers-primary'"
          :aria-label="t('shoppingCart')"
          @click="openCart"
        >
          <svg class="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          <span
            v-if="badge"
            class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
            :class="admin ? 'bg-white text-colliers-primary' : 'bg-red-500 text-white'"
          >
            {{ badge }}
          </span>
        </button>

        <div ref="profileMenu" class="relative">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 sm:h-11 sm:w-11"
            :class="admin
              ? 'bg-white text-colliers-primary hover:bg-gray-100 focus:ring-white'
              : 'bg-colliers-primary text-white hover:bg-colliers-primary-hover focus:ring-colliers-primary'"
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
            <div class="border-b border-gray-100 px-3 pb-2 text-sm text-gray-600">{{ displayName }}</div>
            <button
              v-if="admin"
              type="button"
              class="w-full px-3 py-2 text-left text-sm"
              :class="profileMenuClass('admin')"
              :aria-current="routeName === 'admin' ? 'page' : null"
              @click="goNamed('admin')"
            >
              {{ t('adminDashboard') }}
            </button>
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm"
              :class="profileMenuClass('addresses')"
              :aria-current="routeName === 'addresses' ? 'page' : null"
              @click="goAddressBook"
            >
              {{ t('addressBook') }}
            </button>
            <button
              type="button"
              class="w-full px-3 py-2 text-left text-sm"
              :class="profileMenuClass('history')"
              :aria-current="routeName === 'history' ? 'page' : null"
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
            <template v-if="admin">
              <div class="mx-3 my-2 h-px bg-gray-200" role="separator"></div>
              <button
                type="button"
                class="web-dev-menu w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-50"
                @click="goWebDev"
              >
                RC Web Dev
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="admin && mobileMenuOpen"
      class="colliers-admin-mobile-drawer"
      role="dialog"
      aria-modal="true"
      :aria-label="t('adminDashboard')"
    >
      <button
        type="button"
        class="fixed inset-0 bg-black/50"
        :aria-label="t('closeMenu')"
        @click="closeMobileMenu"
      ></button>
      <div class="relative flex h-full w-64 flex-col bg-colliers-primary px-4 pb-6 pt-6 text-white shadow-xl">
        <button
          type="button"
          class="absolute right-4 top-4 text-white hover:text-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          :aria-label="t('closeMenu')"
          @click="closeMobileMenu"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <nav class="mt-8 flex flex-col">
          <button
            type="button"
            class="colliers-mobile-nav-link"
            :class="mobileNavClass('catalog')"
            @click="onMobileNav('catalog')"
          >
            {{ t('catalogue') }}
          </button>
          <button
            type="button"
            class="colliers-mobile-nav-link"
            :class="mobileNavClass('admin-addresses')"
            @click="onMobileNav('admin-addresses')"
          >
            {{ t('manageAddresses') }}
          </button>
          <button
            type="button"
            class="colliers-mobile-nav-link"
            :class="mobileNavClass('admin-titles')"
            @click="onMobileNav('admin-titles')"
          >
            {{ t('manageDesignations') }}
          </button>
          <button
            type="button"
            class="colliers-mobile-nav-link"
            :class="mobileNavClass('admin-degrees')"
            @click="onMobileNav('admin-degrees')"
          >
            {{ t('manageDegrees') }}
          </button>
          <button
            type="button"
            class="colliers-mobile-nav-link"
            :class="mobileNavClass('admin')"
            @click="onMobileNav('admin')"
          >
            {{ t('adminDashboard') }}
          </button>
          <button
            type="button"
            class="colliers-mobile-nav-link"
            :class="mobileNavClass('addresses')"
            @click="onMobileNav('addresses')"
          >
            {{ t('addressBook') }}
          </button>
          <button
            type="button"
            class="colliers-mobile-nav-link"
            :class="mobileNavClass('history')"
            @click="onMobileNav('history')"
          >
            {{ t('orderHistory') }}
          </button>
        </nav>
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
      mobileMenuOpen: false,
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
    displayName: function () {
      const email = this.email || 'demo'
      if (email.indexOf('@') !== -1) return email
      return email.charAt(0).toUpperCase() + email.slice(1)
    },
    admin: function () {
      return isAdmin()
    },
    routeName: function () {
      return this.$route && this.$route.name ? this.$route.name : currentRouteName()
    },
  },
  watch: {
    mobileMenuOpen: function (open) {
      document.body.classList.toggle('colliers-mobile-menu-open', !!open)
    },
  },
  mounted: function () {
    document.addEventListener('click', this.onDocumentClick)
    document.addEventListener('keydown', this.onDocumentKey)
    if (typeof window !== 'undefined' && window.matchMedia) {
      this.adminNavMedia = window.matchMedia('(min-width: 1024px)')
      if (this.adminNavMedia.addEventListener) {
        this.adminNavMedia.addEventListener('change', this.onAdminNavBreakpoint)
      } else {
        this.adminNavMedia.addListener(this.onAdminNavBreakpoint)
      }
    }
  },
  beforeDestroy: function () {
    document.body.classList.remove('colliers-mobile-menu-open')
    document.removeEventListener('click', this.onDocumentClick)
    document.removeEventListener('keydown', this.onDocumentKey)
    if (this.adminNavMedia) {
      if (this.adminNavMedia.removeEventListener) {
        this.adminNavMedia.removeEventListener('change', this.onAdminNavBreakpoint)
      } else {
        this.adminNavMedia.removeListener(this.onAdminNavBreakpoint)
      }
    }
  },
  methods: {
    t: t,
    setLocale: setLocale,
    openCart: openCart,
    navClass: function (name) {
      const active = this.routeName === name
      if (this.admin) {
        return active
          ? 'border-white text-white'
          : 'border-transparent text-white/70 hover:text-white'
      }
      return active
        ? 'border-colliers-primary text-gray-900'
        : 'border-transparent text-gray-600 hover:text-gray-900'
    },
    localeClass: function (code) {
      const active = this.store.locale === code
      if (this.admin) {
        return active ? 'font-bold text-white' : 'text-white/70 hover:text-white'
      }
      return active ? 'font-bold text-colliers-primary' : 'text-gray-500 hover:text-gray-900'
    },
    profileMenuClass: function (name) {
      const active = this.routeName === name
      return active
        ? 'bg-blue-50 font-medium text-colliers-primary'
        : 'text-gray-800 hover:bg-gray-50'
    },
    onAdminNavBreakpoint: function () {
      if (this.adminNavMedia && this.adminNavMedia.matches) {
        this.closeMobileMenu()
      }
    },
    onDocumentClick: function (event) {
      if (!this.menuOpen) return
      const root = this.$refs.profileMenu
      if (root && root.contains(event.target)) return
      this.menuOpen = false
    },
    onDocumentKey: function (event) {
      if (event.key !== 'Escape') return
      this.menuOpen = false
      this.closeMobileMenu()
    },
    mobileNavClass: function (name) {
      const active = this.routeName === name
      return active ? 'text-white font-medium' : 'text-white/80'
    },
    openMobileMenu: function () {
      this.menuOpen = false
      this.mobileMenuOpen = true
    },
    closeMobileMenu: function () {
      this.mobileMenuOpen = false
    },
    onMobileNav: function (name) {
      this.closeMobileMenu()
      this.menuOpen = false
      go(name)
    },
    goCatalog: function () {
      this.menuOpen = false
      this.closeMobileMenu()
      go('catalog')
    },
    goNamed: function (name) {
      this.menuOpen = false
      this.closeMobileMenu()
      go(name)
    },
    goAddressBook: function () {
      this.menuOpen = false
      go('addresses')
    },
    goOrderHistory: function () {
      this.menuOpen = false
      go('history')
    },
    goWebDev: function () {
      this.menuOpen = false
      go('rc-web-dev-board')
    },
    onLogout: function () {
      this.menuOpen = false
      logout()
      go('login')
    },
  },
}
</script>

<style scoped>
/*
  Admin nav uses viewport width, not page content width.
  Breakpoint matches Tailwind lg (1024px) — see --colliers-admin-nav-min-width.
  Below 1024px: hamburger. At 1024px+: inline nav (blue bar indicates admin).
*/
.colliers-admin-menu-btn {
  display: flex;
  align-items: center;
  align-self: center;
  color: #fff;
}

.colliers-admin-menu-btn:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.colliers-admin-menu-btn:focus-visible {
  box-shadow: 0 0 0 2px #fff;
}

.colliers-admin-nav {
  display: none;
}

.colliers-admin-mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
}

@media (min-width: 1024px) {
  .colliers-admin-menu-btn {
    display: none;
  }

  .colliers-admin-nav {
    display: flex;
  }
}

.colliers-admin-nav-link {
  display: flex;
  height: 100%;
  align-items: center;
  border-bottom: 3px solid transparent;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.25;
  white-space: nowrap;
}

@media (min-width: 1024px) {
  .colliers-admin-nav-link {
    padding-left: 0.875rem;
    padding-right: 0.875rem;
    font-size: 0.875rem;
  }
}

@media (min-width: 1536px) {
  .colliers-admin-nav-link {
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 0.9375rem;
  }
}

.colliers-admin-nav-links {
  row-gap: 0;
}

@media (min-width: 1024px) and (max-width: 1279px) {
  .colliers-site-header--admin .colliers-header-inner {
    min-height: 72px;
    height: auto;
    align-items: stretch;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

  .colliers-admin-nav {
    align-items: center;
    min-height: 64px;
  }

  .colliers-admin-nav-links {
    align-content: center;
    align-items: center;
    height: auto;
    min-height: 64px;
  }

  .colliers-admin-nav-link {
    height: auto;
    min-height: 2.5rem;
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
  }
}

.colliers-mobile-nav-link {
  width: 100%;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 0.875rem;
  padding-bottom: 0.875rem;
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 500;
  line-height: 1.4;
}

.colliers-mobile-nav-link:hover {
  color: #fff;
}

.colliers-user-nav-link {
  display: flex;
  height: 64px;
  align-items: center;
  border-bottom: 3px solid transparent;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

@media (min-width: 640px) {
  .colliers-user-nav-link {
    height: 72px;
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 1rem;
  }
}

/* Internal board entry — exclude when copying product UI into Clay/Klai. */
.web-dev-menu {
  background-image: linear-gradient(
    90deg,
    #25408f,
    #00a9e0,
    #ffd100,
    #e31837,
    #25408f
  );
  background-size: 220% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  animation: web-dev-menu-shine 6s ease-in-out infinite;
}

@keyframes web-dev-menu-shine {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .web-dev-menu {
    animation: none;
    background: none;
    color: #25408f;
  }
}
</style>
