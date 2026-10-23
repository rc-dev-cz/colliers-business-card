import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import { configDefaults } from 'vitest/config'

// Local: `/` — GitHub Pages production: `/colliers-business-card/`
// Override anytime with VITE_BASE=...
const base =
  process.env.VITE_BASE ||
  (process.env.NODE_ENV === 'production' ? '/colliers-business-card/' : '/')

// These specs write PDFs (docs/samples/print-pdf, and the local-only orders/ spec). They run
// only with EXPORT_PDFS=1 (the export:* scripts), never in a plain `npm test`.
const pdfExportSpecs = [
  'src/helpers/printPdf.samples.spec.js',
  'src/helpers/printPdf.shortLong.spec.js',
  'src/helpers/printPdf.order.spec.js',
]

// Claude Code session worktrees live in .claude/worktrees (full copies of the repo).
// Their specs are not this checkout's tests.
const testExclude = configDefaults.exclude.concat(['**/.claude/**'])

export default defineConfig({
  base,
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: false,
    exclude: process.env.EXPORT_PDFS ? testExclude : testExclude.concat(pdfExportSpecs),
  },
  server: {
    port: 5173,
  },
})
