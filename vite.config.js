import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Local: `/` — GitHub Pages production: `/colliers-business-card-portal/`
// Override anytime with VITE_BASE=...
const base =
  process.env.VITE_BASE ||
  (process.env.NODE_ENV === 'production' ? '/colliers-business-card-portal/' : '/')

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
})
