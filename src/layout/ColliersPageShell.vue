<template>
  <div class="colliers-page">
    <div class="colliers-right-column">
      <app-header></app-header>
      <div class="colliers-right-body">
        <main
          id="main"
          class="colliers-main flex flex-col py-6 sm:py-10"
          tabindex="-1"
        >
          <slot></slot>
        </main>
        <app-footer></app-footer>
      </div>
    </div>
    <cart-drawer></cart-drawer>
  </div>
</template>

<script>
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
import CartDrawer from '../components/CartDrawer.vue'

export default {
  name: 'ColliersPageShell',
  components: { AppHeader, AppFooter, CartDrawer },
}
</script>
