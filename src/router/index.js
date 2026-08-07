import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import CatalogPage from '../pages/CatalogPage.vue'
import DetailsPage from '../pages/DetailsPage.vue'
import CustomizePage from '../pages/CustomizePage.vue'
import ShippingPage from '../pages/ShippingPage.vue'
import ConfirmedPage from '../pages/ConfirmedPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import SignupPage from '../pages/SignupPage.vue'
import ForgotPage from '../pages/ForgotPage.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
    { path: '/signup', name: 'signup', component: SignupPage, meta: { public: true } },
    { path: '/forgot', name: 'forgot', component: ForgotPage, meta: { public: true } },
    { path: '/', name: 'catalog', component: CatalogPage },
    { path: '/details/:code', name: 'details', component: DetailsPage, props: true },
    { path: '/customize/:code', name: 'customize', component: CustomizePage, props: true },
    { path: '/shipping', name: 'shipping', component: ShippingPage },
    { path: '/confirmed', name: 'confirmed', component: ConfirmedPage },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const { isAuthenticated } = useAuth()
  if (!to.meta.public && !isAuthenticated.value) {
    return { name: 'login' }
  }
  if (to.meta.public && isAuthenticated.value && ['login', 'signup', 'forgot'].includes(to.name)) {
    return { name: 'catalog' }
  }
  return true
})

export default router
