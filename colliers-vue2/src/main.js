import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { bindRouter } from './adapters/nav'
import './styles/main.css'

bindRouter(router)

new Vue({
  router: router,
  render: function (h) {
    return h(App)
  },
}).$mount('#app')
