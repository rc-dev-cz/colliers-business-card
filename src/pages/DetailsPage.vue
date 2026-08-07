<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProduct, defaultCardDetails } from '../data/products'
import { useLocale } from '../composables/useLocale'
import { productNameKey } from '../i18n/messages'
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import CardPreview from '../components/CardPreview.vue'

const props = defineProps({
  code: { type: String, required: true },
})

const router = useRouter()
const { t } = useLocale()
const product = computed(() => getProduct(props.code))
const name = computed(() => (product.value ? t(productNameKey(product.value.code)) : ''))

function back() {
  router.push({ name: 'catalog' })
}

function customize() {
  router.push({ name: 'customize', params: { code: props.code } })
}
</script>

<template>
  <ColliersPageShell>
    <div v-if="!product" class="py-20 text-center text-gray-500">Product not found</div>
    <template v-else>
      <button type="button" class="mb-6 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900" @click="back">
        <span aria-hidden="true">‹</span> {{ t('back') }}
      </button>

      <div class="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <div class="w-full lg:max-w-[480px]">
          <div class="rounded-lg bg-gray-100 p-4 sm:p-6">
            <CardPreview :details="defaultCardDetails" />
          </div>
          <div class="mt-6 space-y-4 text-[15px]">
            <div>
              <h3 class="mb-2 font-semibold text-gray-900">{{ t('itemsIncluded') }}</h3>
              <div class="mb-2 italic text-gray-700">{{ t('materials') }}</div>
              <ul class="list-disc space-y-1 pl-5 text-gray-700">
                <li>{{ t('premiumStock') }}</li>
                <li>{{ t('finishOptions') }}</li>
              </ul>
            </div>
            <div>
              <div class="mb-2 italic text-gray-700">{{ t('trainings') }}</div>
              <ul class="list-disc space-y-1 pl-5 text-gray-700">
                <li>{{ t('brandCompliance') }}</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <h1 class="mb-6 text-2xl font-semibold text-gray-900 sm:text-3xl">{{ name }}</h1>

          <div class="space-y-0 text-[14px]">
            <div class="flex flex-col border-b border-gray-200 py-2 sm:flex-row sm:justify-between">
              <span class="w-[200px] shrink-0 font-semibold text-gray-700">{{ t('itemNumber') }}</span>
              <div class="mt-1 flex-1 text-gray-600 sm:mt-0 sm:text-right">
                {{ product.code }}<br />{{ name }}
              </div>
            </div>

            <div class="border-b border-gray-200 py-4">
              <span class="mb-3 block font-semibold text-gray-700">{{ t('price') }}</span>
              <div class="overflow-x-auto">
                <table class="min-w-full text-left text-sm">
                  <thead class="bg-colliers-primary text-white">
                    <tr>
                      <th class="px-3 py-2 font-medium">{{ t('qtyFrom') }}</th>
                      <th class="px-3 py-2 font-medium">{{ t('to') }}</th>
                      <th class="px-3 py-2 font-medium">{{ t('pricePer') }}</th>
                      <th class="px-3 py-2 font-medium">{{ t('unitTotal') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(tier, i) in product.priceTiers" :key="i" class="border-b border-gray-200">
                      <td class="px-3 py-2">{{ tier.from }} BX</td>
                      <td class="px-3 py-2">{{ tier.to }}</td>
                      <td class="px-3 py-2">${{ tier.pricePer.toFixed(2) }} / BX</td>
                      <td class="px-3 py-2">${{ tier.unitTotal.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div
              v-for="row in [
                { label: t('language'), value: t(product.languageKey) },
                { label: t('packaging'), value: product.packaging },
                { label: t('productType'), value: t('printOnDemand') },
                { label: t('minOrderQty'), value: product.minQty },
                { label: t('status'), value: t('active') },
                { label: t('longDescription'), value: product.longDescription || '—' },
                { label: t('dateAdded'), value: product.dateAdded },
              ]"
              :key="row.label"
              class="flex flex-col border-b border-gray-200 py-2 sm:flex-row sm:justify-between"
            >
              <span class="w-[200px] shrink-0 font-semibold text-gray-700">{{ row.label }}</span>
              <div class="mt-1 flex-1 text-gray-600 sm:mt-0 sm:text-right">{{ row.value }}</div>
            </div>
          </div>

          <button type="button" class="btn-primary mt-8 w-full sm:w-auto sm:min-w-[240px]" @click="customize">
            {{ t('customize') }}
          </button>

          <p class="mt-6 text-xs italic leading-relaxed text-gray-500">{{ t('salesFinal') }}</p>
          <p class="mt-2 text-xs italic leading-relaxed text-gray-500">{{ t('salesDigital') }}</p>
        </div>
      </div>
    </template>
  </ColliersPageShell>
</template>
