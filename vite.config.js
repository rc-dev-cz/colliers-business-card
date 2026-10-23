import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { configDefaults } from 'vitest/config'

// Local: `/` — GitHub Pages production: `/colliers-business-card/`
// Override anytime with VITE_BASE=...
const base =
  process.env.VITE_BASE ||
  (process.env.NODE_ENV === 'production' ? '/colliers-business-card/' : '/')

// These specs write sample PDFs into docs/samples/print-pdf. They run only through the
// export:* scripts (EXPORT_PDFS=1), never in a plain `yarn test`.
const pdfExportSpecs = [
  'src/helpers/printPdf.samples.spec.js',
  'src/helpers/printPdf.shortLong.spec.js',
]

export default defineConfig({
  base,
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: false,
    exclude: process.env.EXPORT_PDFS
      ? configDefaults.exclude
      : configDefaults.exclude.concat(pdfExportSpecs),
  },
  server: {
    port: 5173,
  },
})
