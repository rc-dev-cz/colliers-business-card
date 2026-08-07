<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLocale } from '../composables/useLocale'
import { productNameKey } from '../i18n/messages'
import CardPreview from './CardPreview.vue'
import { defaultCardDetails } from '../data/products'

const props = defineProps({
  product: { type: Object, required: true },
})

const router = useRouter()
const { t } = useLocale()
const name = computed(() => t(productNameKey(props.product.code)))
const price = computed(() => `$${Number(props.product.price).toFixed(2)}`)

function goCustomize() {
  router.push({ name: 'customize', params: { code: props.product.code } })
}

function goDetails() {
  router.push({ name: 'details', params: { code: props.product.code } })
}
</script>

<template>
  <article class="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div class="bg-gray-100 p-4 sm:p-5">
      <CardPreview :details="defaultCardDetails" />
    </div>
    <div class="flex flex-1 flex-col gap-3 p-5">
      <div>
        <div class="text-sm font-bold uppercase tracking-wide text-gray-900">{{ product.code }}</div>
        <div class="mt-1 text-[15px] text-gray-800">{{ name }}</div>
        <div class="mt-3 text-xl font-bold text-gray-900">{{ price }}</div>
      </div>
      <button type="button" class="btn-outline mt-auto" @click="goCustomize">{{ t('customize') }}</button>
      <button type="button" class="text-center text-sm text-gray-500 hover:text-gray-900" @click="goDetails">
        {{ t('details') }}
      </button>
    </div>
  </article>
</template>
