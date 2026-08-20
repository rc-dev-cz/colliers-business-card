<template>
  <div class="space-y-4 pb-8">
    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h1 class="text-xl font-semibold text-gray-900">Delivery</h1>
      <p class="mt-1 text-sm text-gray-500">Where each page sits: Developed → QA → Approved → Klai.</p>
    </section>

    <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="rounded-lg border bg-white px-4 py-3">
        <div class="text-2xl font-semibold text-sky-700">{{ builtCount }}/{{ pages.length }}</div>
        <div class="text-sm text-gray-500">Built</div>
      </div>
      <div class="rounded-lg border bg-white px-4 py-3">
        <div class="text-2xl font-semibold text-amber-700">{{ qaCount }}/{{ pages.length }}</div>
        <div class="text-sm text-gray-500">QA</div>
      </div>
      <div class="rounded-lg border bg-white px-4 py-3">
        <div class="text-2xl font-semibold text-gray-700">{{ notStartedCount }}/{{ pages.length }}</div>
        <div class="text-sm text-gray-500">Not started</div>
      </div>
      <div class="rounded-lg border bg-white px-4 py-3">
        <div class="text-2xl font-semibold text-colliers-primary">{{ approvedCount }}/{{ pages.length }}</div>
        <div class="text-sm text-gray-500">Approved</div>
      </div>
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div class="mb-4">
        <h2 class="text-lg font-semibold">Paths</h2>
        <p class="text-sm text-gray-500">Status comes from the linked pages (bottleneck = furthest behind).</p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <button
          v-for="item in pathCards"
          :key="item.id"
          type="button"
          class="rounded-lg border p-4 text-left transition hover:shadow-md"
          :class="selectedPathId === item.id ? 'border-colliers-primary ring-1 ring-colliers-primary' : 'border-gray-200 bg-white'"
          @click="selectedPathId = item.id"
        >
          <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="statusClass(item.status)">{{ item.status }}</span>
          <h3 class="mt-2 text-sm font-semibold text-gray-900">{{ item.label }}</h3>
          <p class="mt-1 text-xs text-gray-500">{{ item.detail }}</p>
        </button>
      </div>
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div class="flex items-end justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">{{ path.label }}</h2>
          <p class="text-sm text-gray-500">{{ path.note }}</p>
        </div>
        <span class="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusClass(selectedPathStatus)">{{ selectedPathStatus }}</span>
      </div>
      <div class="mt-5 flex gap-3 overflow-x-auto">
        <button
          v-for="(step, index) in path.steps"
          :key="index"
          type="button"
          class="w-52 shrink-0 rounded-lg border bg-white p-4 text-left hover:shadow-md"
          @click="selectedStep = step"
        >
          <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold">{{ index + 1 }}</span>
          <h3 class="mt-3 font-semibold">{{ step.name }}</h3>
          <p class="mt-1 text-xs text-gray-600">{{ step.summary }}</p>
        </button>
      </div>
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div class="flex justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">Pages and FileMaker</h2>
          <p class="text-sm text-gray-500">Checkboxes update status. Status label is what Delivery reports.</p>
        </div>
        <select v-model="pageFilter" class="rounded-md border px-2 py-1 text-xs">
          <option value="All">Page: All</option>
          <option v-for="page in pages" :key="page.id" :value="page.id">{{ page.name }}</option>
        </select>
      </div>
      <div class="mt-4 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b text-xs uppercase text-gray-500">
              <th class="py-2">Page</th>
              <th>Section</th>
              <th>DEV</th>
              <th>QA</th>
              <th>Approved</th>
              <th>Klai</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="page in filteredPages" :key="page.id" class="border-b">
              <td class="py-3 font-medium">{{ page.name }}</td>
              <td class="text-xs text-gray-500">{{ page.section }}</td>
              <td><input v-model="page.dev" type="checkbox"></td>
              <td><input v-model="page.qa" type="checkbox"></td>
              <td><input v-model="page.approved" type="checkbox"></td>
              <td><input v-model="page.klai" type="checkbox"></td>
              <td>
                <span class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="statusClass(deliveryStatus(page))">{{ deliveryStatus(page) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="mt-8 text-sm font-semibold">FileMaker integration</h3>
      <div class="mt-3 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b text-xs uppercase text-gray-500">
              <th class="py-2">Script</th>
              <th>Method</th>
              <th>Path</th>
              <th>Built</th>
              <th>Reviewed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredScripts" :key="row.id" class="border-b">
              <td class="py-3 font-medium">{{ row.script }}</td>
              <td>{{ row.method }}</td>
              <td class="font-mono text-xs">{{ row.path }}</td>
              <td><input v-model="row.built" type="checkbox"></td>
              <td><input v-model="row.reviewed" type="checkbox"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div v-if="selectedStep" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" @click.self="selectedStep = null">
      <div class="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <button class="float-right" @click="selectedStep = null">×</button>
        <h3 class="text-lg font-semibold">{{ selectedStep.name }}</h3>
        <p class="mt-3 text-sm">{{ selectedStep.summary }}</p>
        <ul class="mt-3 text-sm">
          <li v-for="detail in selectedStep.details" :key="detail">• {{ detail }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { readStorage, writeStorage } from '../../helpers/storage'
import { PAGES, PATHS, SCRIPTS } from '../data/architecture'

const STORAGE_KEY = 'rcArchitecture'

function pageRank (page) {
  if (page.approved) return 3
  if (page.qa) return 2
  if (page.dev) return 1
  return 0
}

function rankLabel (rank) {
  if (rank >= 3) return 'Approved'
  if (rank >= 2) return 'QA'
  if (rank >= 1) return 'Developed'
  return 'Not started'
}

export default {
  name: 'RcWebDevArchitecturePage',
  data: function () {
    const stored = readStorage(STORAGE_KEY, {})
    return {
      selectedPathId: 'order',
      selectedStep: null,
      pageFilter: 'All',
      paths: PATHS,
      pages: PAGES.map((page) => Object.assign({}, page, stored.pages && stored.pages[page.id])),
      scripts: SCRIPTS.map((row) => Object.assign({}, row, stored.scripts && stored.scripts[row.id])),
    }
  },
  computed: {
    path: function () {
      return PATHS.find((item) => item.id === this.selectedPathId) || PATHS[0]
    },
    builtCount: function () {
      return this.pages.filter((page) => page.dev || page.qa || page.approved).length
    },
    qaCount: function () {
      return this.pages.filter((page) => page.qa && !page.approved).length
    },
    notStartedCount: function () {
      return this.pages.filter((page) => !page.dev && !page.qa && !page.approved).length
    },
    approvedCount: function () {
      return this.pages.filter((page) => page.approved).length
    },
    pathCards: function () {
      return PATHS.map((item) => {
        const linked = this.pagesForPath(item)
        const status = this.pathStatus(item)
        const counts = {
          approved: linked.filter((page) => page.approved).length,
          qa: linked.filter((page) => page.qa && !page.approved).length,
          developed: linked.filter((page) => page.dev && !page.qa && !page.approved).length,
          notStarted: linked.filter((page) => !page.dev && !page.qa && !page.approved).length,
        }
        const parts = []
        if (counts.qa) parts.push(counts.qa + ' QA')
        if (counts.developed) parts.push(counts.developed + ' developed')
        if (counts.notStarted) parts.push(counts.notStarted + ' not started')
        if (counts.approved) parts.push(counts.approved + ' approved')
        return {
          id: item.id,
          label: item.label,
          status: status,
          detail: parts.length ? parts.join(' · ') : linked.length + ' pages',
        }
      })
    },
    selectedPathStatus: function () {
      return this.pathStatus(this.path)
    },
    filteredPages: function () {
      return this.pages.filter((page) => this.pageFilter === 'All' || page.id === this.pageFilter)
    },
    filteredScripts: function () {
      return this.scripts.filter((row) => this.pageFilter === 'All' || (row.pageIds || []).includes(this.pageFilter))
    },
  },
  watch: {
    pages: { deep: true, handler: 'persist' },
    scripts: { deep: true, handler: 'persist' },
  },
  methods: {
    pagesForPath: function (path) {
      const ids = path.pageIds || []
      return this.pages.filter((page) => ids.includes(page.id))
    },
    pathStatus: function (path) {
      const linked = this.pagesForPath(path)
      if (!linked.length) return 'Not started'
      const ranks = linked.map(pageRank)
      const min = Math.min.apply(null, ranks)
      const max = Math.max.apply(null, ranks)
      if (min === max) return rankLabel(min)
      if (min === 0 && max > 0) return 'In progress'
      return rankLabel(min)
    },
    deliveryStatus: function (page) {
      return rankLabel(pageRank(page))
    },
    statusClass: function (status) {
      if (status === 'Approved') return 'bg-emerald-100 text-emerald-800'
      if (status === 'QA') return 'bg-amber-100 text-amber-800'
      if (status === 'Developed') return 'bg-sky-100 text-sky-800'
      if (status === 'In progress') return 'bg-violet-100 text-violet-800'
      return 'bg-gray-100 text-gray-600'
    },
    persist: function () {
      const pages = {}
      const scripts = {}
      this.pages.forEach((page) => {
        pages[page.id] = { dev: page.dev, qa: page.qa, approved: page.approved, klai: page.klai }
      })
      this.scripts.forEach((row) => {
        scripts[row.id] = { built: row.built, reviewed: row.reviewed }
      })
      writeStorage(STORAGE_KEY, { pages: pages, scripts: scripts })
    },
  },
}
</script>
