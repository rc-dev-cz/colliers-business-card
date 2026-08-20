import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [vue()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://colliers-dev-rc.clientportal.cloud',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
