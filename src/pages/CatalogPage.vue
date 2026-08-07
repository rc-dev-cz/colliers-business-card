<script setup>
import { products } from '../data/products'
import { useLocale } from '../composables/useLocale'
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import ProductCard from '../components/ProductCard.vue'

const { t } = useLocale()
</script>

<template>
  <ColliersPageShell>
    <h1 class="mb-8 text-center text-3xl font-bold text-gray-900 sm:mb-10 sm:text-4xl">
      {{ t('exploreCatalog') }}
    </h1>
    <h2 class="mb-5 text-xl font-bold text-colliers-primary sm:text-2xl">
      {{ t('businessCards') }}
    </h2>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="product in products" :key="product.code" :product="product" />
    </div>
  </ColliersPageShell>
</template>
