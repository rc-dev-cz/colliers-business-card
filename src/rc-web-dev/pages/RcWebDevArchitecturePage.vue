<template>
  <div class="space-y-4 pb-8">
    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h1 class="text-xl font-semibold text-gray-900">Delivery</h1>
      <p class="mt-1 text-sm text-gray-500">Where each page sits, from this repo through QA, approval, and Klai.</p>
    </section>
    <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-lg border bg-white px-4 py-3"><div class="text-2xl font-semibold">{{ pages.length }}</div><div class="text-sm text-gray-500">Pages</div></div>
      <div class="rounded-lg border bg-white px-4 py-3"><div class="text-2xl font-semibold">{{ paths.length }}</div><div class="text-sm text-gray-500">Paths</div></div>
      <div class="rounded-lg border bg-white px-4 py-3"><div class="text-2xl font-semibold">{{ approvedCount }}/{{ pages.length }}</div><div class="text-sm text-gray-500">Approved</div></div>
      <div class="rounded-lg border bg-white px-4 py-3"><div class="text-2xl font-semibold text-colliers-primary">{{ klaiCount }}/{{ pages.length }}</div><div class="text-sm text-gray-500">Klai</div></div>
    </section>
    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div class="flex items-end justify-between"><div><h2 class="text-lg font-semibold">View paths</h2><p class="text-sm text-gray-500">{{ path.note }}</p></div>
        <select v-model="selectedPathId" class="rounded-md border border-gray-200 px-3 py-2 text-sm"><option v-for="item in paths" :key="item.id" :value="item.id">{{ item.label }}</option></select>
      </div>
      <div class="mt-5 flex gap-3 overflow-x-auto">
        <button v-for="(step, index) in path.steps" :key="index" type="button" class="w-52 shrink-0 rounded-lg border bg-white p-4 text-left hover:shadow-md" @click="selectedStep = step">
          <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold">{{ index + 1 }}</span><h3 class="mt-3 font-semibold">{{ step.name }}</h3><p class="mt-1 text-xs text-gray-600">{{ step.summary }}</p>
        </button>
      </div>
    </section>
    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div class="flex justify-between"><div><h2 class="text-lg font-semibold">Pages and FileMaker</h2><p class="text-sm text-gray-500">Track delivery and integration status.</p></div>
        <select v-model="pageFilter" class="rounded-md border px-2 py-1 text-xs"><option value="All">Page: All</option><option v-for="page in pages" :key="page.id" :value="page.id">{{ page.name }}</option></select>
      </div>
      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full text-left text-sm"><thead><tr class="border-b text-xs uppercase text-gray-500"><th class="py-2">Page</th><th>DEV</th><th>QA</th><th>Approved</th><th>Klai</th><th>Status</th></tr></thead>
          <tbody><tr v-for="page in filteredPages" :key="page.id" class="border-b"><td class="py-3 font-medium">{{ page.name }}</td><td><input v-model="page.dev" type="checkbox"></td><td><input v-model="page.qa" type="checkbox"></td><td><input v-model="page.approved" type="checkbox"></td><td><input v-model="page.klai" type="checkbox"></td><td>{{ deliveryStatus(page) }}</td></tr></tbody>
        </table>
      </div>
      <h3 class="mt-8 text-sm font-semibold">FileMaker integration</h3>
      <div class="mt-3 overflow-x-auto"><table class="min-w-full text-left text-sm"><thead><tr class="border-b text-xs uppercase text-gray-500"><th class="py-2">Script</th><th>Method</th><th>Path</th><th>Built</th><th>Reviewed</th></tr></thead>
        <tbody><tr v-for="row in filteredScripts" :key="row.id" class="border-b"><td class="py-3 font-medium">{{ row.script }}</td><td>{{ row.method }}</td><td class="font-mono text-xs">{{ row.path }}</td><td><input v-model="row.built" type="checkbox"></td><td><input v-model="row.reviewed" type="checkbox"></td></tr></tbody>
      </table></div>
    </section>
    <div v-if="selectedStep" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" @click.self="selectedStep = null">
      <div class="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"><button class="float-right" @click="selectedStep = null">×</button><h3 class="text-lg font-semibold">{{ selectedStep.name }}</h3><p class="mt-3 text-sm">{{ selectedStep.summary }}</p><ul class="mt-3 text-sm"><li v-for="detail in selectedStep.details" :key="detail">• {{ detail }}</li></ul></div>
    </div>
  </div>
</template>

<script>
import { readStorage, writeStorage } from '../../helpers/storage'
import { PAGES, PATHS, SCRIPTS } from '../data/architecture'

const STORAGE_KEY = 'rcArchitecture'

export default {
  name: 'RcWebDevArchitecturePage',
  data: function () {
    const stored = readStorage(STORAGE_KEY, {})
    return {
      selectedPathId: 'order', selectedStep: null, pageFilter: 'All', paths: PATHS,
      pages: PAGES.map((page) => Object.assign({}, page, stored.pages && stored.pages[page.id])),
      scripts: SCRIPTS.map((row) => Object.assign({}, row, stored.scripts && stored.scripts[row.id])),
    }
  },
  computed: {
    path: function () { return PATHS.find((item) => item.id === this.selectedPathId) || PATHS[0] },
    approvedCount: function () { return this.pages.filter((page) => page.approved).length },
    klaiCount: function () { return this.pages.filter((page) => page.klai).length },
    filteredPages: function () { return this.pages.filter((page) => this.pageFilter === 'All' || page.id === this.pageFilter) },
    filteredScripts: function () { return this.scripts.filter((row) => this.pageFilter === 'All' || (row.pageIds || []).includes(this.pageFilter)) },
  },
  watch: {
    pages: { deep: true, handler: 'persist' },
    scripts: { deep: true, handler: 'persist' },
  },
  methods: {
    deliveryStatus: function (page) {
      if (page.approved) return 'Approved'
      if (page.qa) return 'Ready for review'
      if (page.dev) return 'In progress'
      return 'Not started'
    },
    persist: function () {
      const pages = {}
      const scripts = {}
      this.pages.forEach((page) => { pages[page.id] = { dev: page.dev, qa: page.qa, approved: page.approved, klai: page.klai } })
      this.scripts.forEach((row) => { scripts[row.id] = { built: row.built, reviewed: row.reviewed } })
      writeStorage(STORAGE_KEY, { pages: pages, scripts: scripts })
    },
  },
}
</script>
