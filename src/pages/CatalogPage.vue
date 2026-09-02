<template>
  <colliers-page-shell>
    <h1 class="colliers-page-title colliers-page-title--center colliers-page-intro">
      {{ t('exploreCatalog') }}
    </h1>
    <h2 class="mb-5 text-xl font-bold text-colliers-primary sm:text-2xl">
      {{ t('businessCards') }}
    </h2>
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <product-card
        v-for="product in products"
        :key="product.code"
        :product="product"
      ></product-card>
    </div>
  </colliers-page-shell>
</template>

<script>
import ColliersPageShell from '../layout/ColliersPageShell.vue'
import ProductCard from '../components/ProductCard.vue'
import { products } from '../data/products'
import { store, t } from '../store'

export default {
  name: 'CatalogPage',
  components: { ColliersPageShell, ProductCard },
  data: function () {
    return { store: store, products: products }
  },
  methods: {
    t: t,
  },
}
</script>
