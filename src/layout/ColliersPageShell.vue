<script setup>
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import CartDrawer from '../components/CartDrawer.vue'
</script>

<template>
  <div class="colliers-page">
    <div class="colliers-right-column">
      <AppHeader />
      <div class="colliers-right-body">
        <main id="main" class="colliers-main flex flex-col py-6 sm:py-10" tabindex="-1">
          <slot />
        </main>
        <AppFooter />
      </div>
    </div>
    <CartDrawer />
  </div>
</template>
