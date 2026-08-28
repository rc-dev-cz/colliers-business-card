import Vue from 'vue'
import VueRouter from 'vue-router'
import { isAdmin, isAuthenticated } from './store'
import LoginPage from './pages/LoginPage.vue'
import CatalogPage from './pages/CatalogPage.vue'
import DetailsPage from './pages/DetailsPage.vue'
import CustomizePage from './pages/CustomizePage.vue'
import ShippingPage from './pages/ShippingPage.vue'
import ReviewPage from './pages/ReviewPage.vue'
import ConfirmedPage from './pages/ConfirmedPage.vue'
import AddressBookPage from './pages/AddressBookPage.vue'
import OrderHistoryPage from './pages/OrderHistoryPage.vue'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.vue'
import ManageAddressesPage from './pages/admin/ManageAddressesPage.vue'
import ManageTitlesPage from './pages/admin/ManageTitlesPage.vue'
import AdminOrderHistoryPage from './pages/admin/AdminOrderHistoryPage.vue'
import AdminInvoicesPage from './pages/admin/AdminInvoicesPage.vue'
import AdminReportingPage from './pages/admin/AdminReportingPage.vue'
import RcWebDevLayout from './rc-web-dev/RcWebDevLayout.vue'
import RcWebDevPage from './rc-web-dev/pages/RcWebDevPage.vue'
import RcWebDevRoadmapPage from './rc-web-dev/pages/RcWebDevRoadmapPage.vue'
import RcWebDevLogsPage from './rc-web-dev/pages/RcWebDevLogsPage.vue'
import RcWebDevArchitecturePage from './rc-web-dev/pages/RcWebDevArchitecturePage.vue'

Vue.use(VueRouter)

const adminMeta = { admin: true }

const router = new VueRouter({
  mode: 'hash',
  routes: [
    { path: '/login', name: 'login', component: LoginPage, meta: { public: true } },
    { path: '/', name: 'catalog', component: CatalogPage },
    { path: '/details/:code', name: 'details', component: DetailsPage, props: true },
    { path: '/customize/:code', name: 'customize', component: CustomizePage, props: true },
    { path: '/shipping', name: 'shipping', component: ShippingPage },
    { path: '/addresses', name: 'addresses', component: AddressBookPage },
    { path: '/history', name: 'history', component: OrderHistoryPage },
    { path: '/review', name: 'review', component: ReviewPage },
    { path: '/confirmed', name: 'confirmed', component: ConfirmedPage },
    { path: '/admin', name: 'admin', component: AdminDashboardPage, meta: adminMeta },
    {
      path: '/admin/addresses',
      name: 'admin-addresses',
      component: ManageAddressesPage,
      meta: adminMeta,
    },
    {
      path: '/admin/titles',
      name: 'admin-titles',
      component: ManageTitlesPage,
      meta: adminMeta,
    },
    {
      path: '/admin/orders',
      name: 'admin-orders',
      component: AdminOrderHistoryPage,
      meta: adminMeta,
    },
    {
      path: '/admin/invoices',
      name: 'admin-invoices',
      component: AdminInvoicesPage,
      meta: adminMeta,
    },
    {
      path: '/admin/reporting',
      name: 'admin-reporting',
      component: AdminReportingPage,
      meta: adminMeta,
    },
    {
      path: '/rc-web-dev',
      component: RcWebDevLayout,
      meta: { webDev: true, admin: true },
      children: [
        { path: '', redirect: { name: 'rc-web-dev-board' } },
        { path: 'board', name: 'rc-web-dev-board', component: RcWebDevPage },
        { path: 'roadmap', name: 'rc-web-dev-roadmap', component: RcWebDevRoadmapPage },
        { path: 'logs', name: 'rc-web-dev-logs', component: RcWebDevLogsPage },
        { path: 'architecture', name: 'rc-web-dev-architecture', component: RcWebDevArchitecturePage },
      ],
    },
    { path: '/admin-work', redirect: { name: 'rc-web-dev-roadmap' } },
    { path: '/user-work', redirect: { name: 'rc-web-dev-roadmap' } },
    { path: '/dev', redirect: { name: 'rc-web-dev-board' } },
    { path: '/gira', redirect: { name: 'rc-web-dev-board' } },
    { path: '*', redirect: '/' },
  ],
  scrollBehavior: function () {
    return { x: 0, y: 0 }
  },
})

router.beforeEach(function (to, from, next) {
  if (!to.meta.public && !isAuthenticated()) {
    next({ name: 'login' })
    return
  }
  if (to.meta.public && isAuthenticated() && to.name === 'login') {
    next({ name: 'catalog' })
    return
  }
  const needsAdmin = to.matched.some(function (record) {
    return record.meta && record.meta.admin
  })
  if (needsAdmin && !isAdmin()) {
    next({ name: 'catalog' })
    return
  }
  next()
})

export default router
