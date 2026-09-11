<template>
  <colliers-page-shell>
    <h1 class="colliers-page-title colliers-page-title--center mb-12 text-[32px] font-medium tracking-tight text-black sm:mb-16 sm:text-[40px]">
      {{ t('exploreCatalog') }}
    </h1>
    <h2 class="mb-6 text-2xl font-medium text-colliers-primary sm:text-3xl">
      {{ t('businessCards') }}
    </h2>
    <div class="catalog-product-grid">
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
