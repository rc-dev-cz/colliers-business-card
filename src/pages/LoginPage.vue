<template>
  <div class="flex min-h-full flex-col items-center justify-center bg-colliers-app p-4">
    <div class="w-full max-w-[440px] rounded-lg bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-10">
      <div class="mb-8 flex justify-center">
        <img
          src="https://www.collierscanada.com/-/media/images/colliers/unitedstates/national/footer/logofooter.ashx?bid=19443a8c23424c689d86c4d1320eac0f"
          alt="Colliers"
          class="h-14 object-contain"
        />
      </div>

      <loading-state v-if="loading" :message="t('loading')"></loading-state>
      <div v-else>
        <h1 class="mb-2 text-xl font-semibold text-gray-900">{{ t('login') }}</h1>
        <p class="mb-6 text-sm leading-relaxed text-gray-500">{{ t('loginWelcome') }}</p>
        <form class="space-y-5" @submit.prevent="submit">
          <text-field :label="t('email')" :value="email" @input="email = $event"></text-field>
          <text-field :label="t('password')" type="password" :value="password" @input="password = $event"></text-field>
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
import { t, login } from '../store'
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
    }
  },
  methods: {
    t: t,
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
