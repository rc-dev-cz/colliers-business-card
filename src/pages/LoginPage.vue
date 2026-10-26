<template>
  <div class="flex min-h-full flex-col items-center justify-center bg-colliers-app p-4">
    <div
      class="relative w-full max-w-[440px] rounded-lg bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-10"
    >
      <!-- EN / FR on every page, login included (BUG-14). Same switch as the header. -->
      <div class="absolute right-5 top-4 flex items-center text-[14px] font-medium">
        <button
          type="button"
          class="transition-colors focus:outline-none"
          :class="localeClass('EN')"
          :aria-pressed="store.locale === 'EN' ? 'true' : 'false'"
          @click="setLocale('EN')"
        >
          EN
        </button>
        <span class="mx-1.5 text-gray-400">/</span>
        <button
          type="button"
          class="transition-colors focus:outline-none"
          :class="localeClass('FR')"
          :aria-pressed="store.locale === 'FR' ? 'true' : 'false'"
          @click="setLocale('FR')"
        >
          FR
        </button>
      </div>
      <div class="mb-8 flex justify-center">
        <img :src="lockupSrc" :alt="lockupAlt" class="h-14 w-auto max-w-full object-contain" />
      </div>

      <loading-state v-if="loading" :message="t('loading')"></loading-state>
      <div v-else>
        <h1 class="colliers-page-title colliers-page-title--compact mb-2">{{ t('login') }}</h1>
        <p class="colliers-page-subtitle mb-6">{{ t('loginWelcome') }}</p>
        <form class="space-y-5" @submit.prevent="submit">
          <text-field :label="t('email')" :value="email" @input="email = $event"></text-field>
          <text-field
            :label="t('password')"
            type="password"
            :value="password"
            @input="password = $event"
          ></text-field>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <app-button html-type="submit" block>{{ t('login') }}</app-button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import TextField from '../components/TextField.vue'
import AppButton from '../components/AppButton.vue'
import LoadingState from '../components/LoadingState.vue'
import { brandLockupAlt, brandLockupUrl } from '../helpers/brandLockup'
import { store, t, login, setLocale } from '../store'
import { go } from '../adapters/nav'

export default {
  name: 'LoginPage',
  components: { TextField, AppButton, LoadingState },
  data: function () {
    return {
      email: 'demo',
      password: '123',
      loading: false,
      error: '',
      store: store,
    }
  },
  computed: {
    lockupSrc: function () {
      return brandLockupUrl(this.store.locale)
    },
    lockupAlt: function () {
      return brandLockupAlt(this.store.locale)
    },
  },
  methods: {
    t: t,
    setLocale: setLocale,
    localeClass: function (code) {
      return this.store.locale === code
        ? 'font-bold text-colliers-primary'
        : 'text-gray-500 hover:text-gray-900'
    },
    submit: function () {
      const self = this
      if (String(this.password) !== '123') {
        this.error = t('loginInvalid')
        return
      }
      this.error = ''
      this.loading = true
      setTimeout(function () {
        login(self.email)
        self.loading = false
        go('catalog')
      }, 600)
    },
  },
}
</script>
