import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

// Local: `/` — GitHub Pages production: `/colliers-business-card/`
// Override anytime with VITE_BASE=...
const base =
  process.env.VITE_BASE ||
  (process.env.NODE_ENV === 'production' ? '/colliers-business-card/' : '/')

export default defineConfig({
  base,
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://colliers-dev-rc.clientportal.cloud',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
