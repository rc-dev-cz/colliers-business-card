<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'

const router = useRouter()
const { t } = useLocale()
const email = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  await new Promise((r) => setTimeout(r, 600))
  loading.value = false
  router.push({ name: 'login' })
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
      <div v-if="loading" class="flex min-h-[200px] flex-col items-center justify-center">
        <div class="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-colliers-primary" />
        <p class="text-sm text-gray-500">{{ t('loading') }}</p>
      </div>
      <template v-else>
        <h1 class="mb-2 text-xl font-semibold text-gray-900">{{ t('passwordRecovery') }}</h1>
        <p class="mb-6 text-sm text-gray-500">{{ t('recoveryHelp') }}</p>
        <form class="space-y-5" @submit.prevent="submit">
          <div>
            <label class="field-label">{{ t('email') }}</label>
            <input v-model="email" type="email" class="field-input" />
          </div>
          <button type="submit" class="btn-primary w-full">{{ t('sendRecovery') }}</button>
        </form>
        <button
          type="button"
          class="mt-6 w-full text-center text-sm text-colliers-primary underline"
          @click="router.push({ name: 'login' })"
        >
          {{ t('returnToLogin') }}
        </button>
      </template>
    </div>
  </div>
</template>
