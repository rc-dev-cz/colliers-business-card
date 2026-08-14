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
    // RC Web Dev is internal (Cursor + Vue + Supabase). Do not port to Klai.
    { path: '/admin-work', redirect: { name: 'rc-web-dev-roadmap' } },
    { path: '/user-work', redirect: { name: 'rc-web-dev-roadmap' } },
    {
      path: '/rc-web-dev',
      component: () => import('../rc-web-dev/RcWebDevLayout.vue'),
      meta: { webDev: true },
      children: [
        { path: '', redirect: { name: 'rc-web-dev-board' } },
        { path: 'board', name: 'rc-web-dev-board', component: () => import('../rc-web-dev/pages/RcWebDevPage.vue') },
        { path: 'roadmap', name: 'rc-web-dev-roadmap', component: () => import('../rc-web-dev/pages/RcWebDevRoadmapPage.vue') },
        { path: 'logs', name: 'rc-web-dev-logs', component: () => import('../rc-web-dev/pages/RcWebDevLogsPage.vue') },
      ],
    },
    { path: '/dev', redirect: { name: 'rc-web-dev-board' } },
    { path: '/gira', redirect: { name: 'rc-web-dev-board' } },
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
