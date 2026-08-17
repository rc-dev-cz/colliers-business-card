import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Local: `/` — GitHub Pages production: `/colliers-business-card/`
// Override anytime with VITE_BASE=...
const base =
  process.env.VITE_BASE ||
  (process.env.NODE_ENV === 'production' ? '/colliers-business-card/' : '/')

export default defineConfig({
  base,
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('sl-'),
        },
      },
    }),
  ],
  server: {
    // Same-origin proxy so the browser does not hang on cross-origin API calls in local Vite.
    proxy: {
      '/api': {
        target: 'https://colliers-dev-rc.clientportal.cloud',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
