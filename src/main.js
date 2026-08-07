import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// Shoelace components used in drawers
import '@shoelace-style/shoelace/dist/themes/light.css'
import '@shoelace-style/shoelace/dist/components/drawer/drawer.js'

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/')

createApp(App).use(router).mount('#app')
