<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { login } = useAuth()
const { t } = useLocale()
const email = ref('demo')
const password = ref('123')
const loading = ref(false)

async function submit() {
  loading.value = true
  await new Promise((r) => setTimeout(r, 600))
  login(email.value)
  loading.value = false
  router.push({ name: 'catalog' })
}
</script>

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

      <div v-if="loading" class="flex min-h-[250px] flex-col items-center justify-center">
        <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-colliers-primary" />
        <p class="text-sm text-gray-500">{{ t('loading') }}</p>
      </div>

      <template v-else>
        <h1 class="mb-2 text-xl font-semibold text-gray-900">{{ t('login') }}</h1>
        <p class="mb-6 text-sm leading-relaxed text-gray-500">{{ t('loginWelcome') }}</p>
        <form class="space-y-5" @submit.prevent="submit">
          <div>
            <label class="field-label">{{ t('email') }}</label>
            <input v-model="email" type="text" class="field-input" />
          </div>
          <div>
            <label class="field-label">{{ t('password') }}</label>
            <input v-model="password" type="password" class="field-input" />
          </div>
          <button type="submit" class="btn-primary w-full">{{ t('login') }}</button>
        </form>
        <div class="mt-6 text-center text-sm">
          <p class="mb-3 text-gray-600">
            {{ t('noAccount') }}
            <button type="button" class="text-colliers-primary underline" @click="router.push({ name: 'signup' })">
              {{ t('clickHere') }}
            </button>
          </p>
          <button type="button" class="text-colliers-primary underline" @click="router.push({ name: 'forgot' })">
            {{ t('forgotPassword') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
