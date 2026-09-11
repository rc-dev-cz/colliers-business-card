<template>
  <div class="colliers-page">
    <div class="colliers-page-inner">
      <app-header></app-header>
      <div class="colliers-page-body" :class="{ 'colliers-page-body--viewport-list': viewportList }">
        <main
          id="main"
          class="colliers-main flex flex-col py-6 sm:py-10"
          :class="{ 'colliers-main--viewport-list': viewportList }"
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
  props: {
    viewportList: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
