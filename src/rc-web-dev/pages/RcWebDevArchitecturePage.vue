<script setup>
import { computed, reactive, ref } from 'vue'
import { readStorage, writeStorage } from '../../composables/useStorage'
import {
  AREA_TONE,
  DEFAULT_SCREENS,
  DEFAULT_SCRIPTS,
  PATHS,
  SCREENS,
  SCRIPT_TONE,
  SCRIPTS,
} from '../data/architecture'

const STORAGE_KEY = 'rcArchitecture'

const stored = readStorage(STORAGE_KEY, {})
const screens = reactive(mergeChecks(DEFAULT_SCREENS, stored?.screens))
const scripts = reactive(mergeChecks(DEFAULT_SCRIPTS, stored?.scripts))
const selectedPathId = ref(PATHS[0].id)

const path = computed(() => PATHS.find((item) => item.id === selectedPathId.value) || PATHS[0])

const developmentCount = computed(() => SCREENS.filter((row) => screens[row.id]?.development).length)
const qaCount = computed(() => SCREENS.filter((row) => screens[row.id]?.qa).length)
const klaiCount = computed(() => SCREENS.filter((row) => screens[row.id]?.klai).length)
const productionCount = computed(() =>
  SCRIPTS.filter((row) => row.group !== 'Router' && scripts[row.id]?.production).length,
)
const httpScriptCount = computed(() => SCRIPTS.filter((row) => row.group !== 'Router').length)

function mergeChecks(defaults, saved) {
  const next = {}
  for (const id of Object.keys(defaults)) {
    next[id] = { ...defaults[id], ...(saved?.[id] || {}) }
  }
  return next
}

function persist() {
  writeStorage(STORAGE_KEY, {
    screens: { ...screens },
    scripts: { ...scripts },
  })
}

function toggleScreen(id, field) {
  screens[id][field] = !screens[id][field]
  persist()
}

function toggleScript(id, field) {
  scripts[id][field] = !scripts[id][field]
  persist()
}

function methodClass(method) {
  if (method === 'GET') return 'bg-emerald-50 text-emerald-800'
  if (method === 'POST') return 'bg-sky-50 text-sky-800'
  if (method === 'PATCH') return 'bg-amber-50 text-amber-900'
  if (method === 'DELETE') return 'bg-rose-50 text-rose-800'
  return 'bg-gray-100 text-gray-600'
}

function stepTone(tone) {
  if (tone === 'auth') return 'border-slate-200 bg-slate-50'
  if (tone === 'admin') return 'border-amber-200 bg-amber-50'
  return 'border-sky-200 bg-sky-50'
}

function areaTone(area) {
  return AREA_TONE[area] || ''
}

function scriptTone(group) {
  return SCRIPT_TONE[group] || ''
}

function showArea(index) {
  return index === 0 || SCREENS[index].area !== SCREENS[index - 1].area
}

function showScriptGroup(index) {
  return index === 0 || SCRIPTS[index].group !== SCRIPTS[index - 1].group
}
</script>

<template>
  <div class="space-y-4 pb-8">
    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h1 class="text-xl font-semibold text-gray-900">Architecture</h1>
      <p class="mt-1 text-sm text-gray-600">
        Development is this Vue repo. QA is the GitHub Pages staging build. Klai is the live app.
        Checkboxes stay in this browser — GitHub Pages shares the page, not the marks.
      </p>
    </section>

    <section class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <p class="text-2xl font-semibold text-gray-900">2</p>
        <p class="text-sm text-gray-500">Roles</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <p class="text-2xl font-semibold text-gray-900">3</p>
        <p class="text-sm text-gray-500">Card products</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <p class="text-2xl font-semibold text-gray-900">{{ developmentCount }}/{{ SCREENS.length }}</p>
        <p class="text-sm text-gray-500">Development</p>
      </div>
      <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
        <p class="text-2xl font-semibold text-colliers-primary">{{ klaiCount }}/{{ SCREENS.length }}</p>
        <p class="text-sm text-gray-500">Klai</p>
      </div>
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{{ path.label }}</h2>
          <p class="mt-1 text-sm text-gray-600">{{ path.note }}</p>
        </div>
        <label class="block text-sm text-gray-600">
          Path
          <select v-model="selectedPathId" class="input-field mt-1 w-56">
            <option v-for="item in PATHS" :key="item.id" :value="item.id">
              {{ item.label }}
            </option>
          </select>
        </label>
      </div>

      <div class="flex flex-wrap items-stretch gap-y-3">
        <template v-for="(step, index) in path.steps" :key="step.id">
          <article
            tabindex="0"
            class="w-[11.5rem] rounded-md border px-3 py-2.5 outline-none ring-colliers-primary/40 hover:ring-2 focus:ring-2"
            :class="stepTone(step.tone)"
          >
            <h3 class="text-sm font-semibold text-gray-900">{{ step.name }}</h3>
            <p v-for="line in step.features" :key="line" class="text-xs text-gray-600">
              {{ line }}
            </p>
            <p class="mt-1 font-mono text-[11px] font-semibold text-gray-800">{{ step.api }}</p>
          </article>
          <div
            v-if="index < path.steps.length - 1"
            class="flex w-6 shrink-0 items-center justify-center text-gray-400"
            aria-hidden="true"
          >
            →
          </div>
        </template>
      </div>
      <p class="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-slate-200 ring-1 ring-slate-300" /> Login</span>
        <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-sky-200 ring-1 ring-sky-300" /> User home (Catalog)</span>
        <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-amber-200 ring-1 ring-amber-300" /> Admin home</span>
      </p>
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 class="text-lg font-semibold text-gray-900">Build track</h2>
      <p class="mt-1 text-sm text-gray-600">
        Check a box when that layer is done. {{ qaCount }} of {{ SCREENS.length }} on QA / staging.
      </p>
      <div class="mt-3 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th class="py-2 pr-3 font-medium">Area</th>
              <th class="py-2 pr-3 font-medium">Screen</th>
              <th class="py-2 pr-3 font-medium">Important</th>
              <th class="py-2 px-2 text-center font-medium">Development</th>
              <th class="py-2 px-2 text-center font-medium">QA</th>
              <th class="py-2 px-2 text-center font-medium">Klai</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in SCREENS"
              :key="row.id"
              class="border-b border-gray-100"
              :class="areaTone(row.area)"
            >
              <td class="py-2 pr-3 font-medium text-gray-700">
                <span v-if="showArea(index)">{{ row.area }}</span>
              </td>
              <td class="py-2 pr-3 font-medium text-gray-900">{{ row.name }}</td>
              <td class="py-2 pr-3 text-gray-600">{{ row.features }}</td>
              <td class="py-2 px-2 text-center">
                <input
                  type="checkbox"
                  :checked="screens[row.id].development"
                  :aria-label="`${row.name} Development`"
                  @change="toggleScreen(row.id, 'development')"
                >
              </td>
              <td class="py-2 px-2 text-center">
                <input
                  type="checkbox"
                  :checked="screens[row.id].qa"
                  :aria-label="`${row.name} QA`"
                  @change="toggleScreen(row.id, 'qa')"
                >
              </td>
              <td class="py-2 px-2 text-center">
                <input
                  type="checkbox"
                  :checked="screens[row.id].klai"
                  :aria-label="`${row.name} Klai`"
                  @change="toggleScreen(row.id, 'klai')"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 class="text-lg font-semibold text-gray-900">FileMaker</h2>
      <p class="mt-1 text-sm text-gray-600">
        Live in <code>BF - onApiCall - colliers-app</code>: GET /api/ping and GET /api/addresses.
        Address CRUD scripts exist in the file. Create / Update / Delete are not on the HTTP hook yet.
        Products, titles, and orders are still to add. Cart is not a folder.
        Order History needs <code>GET /api/orders</code> — each order already has the card fields so View and Repeat Order do not GET a product.
      </p>
      <div class="mt-3 overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead>
            <tr class="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <th class="py-2 pr-3 font-medium">Group</th>
              <th class="py-2 pr-3 font-medium">Script</th>
              <th class="py-2 pr-3 font-medium">Method</th>
              <th class="py-2 pr-3 font-medium">Path</th>
              <th class="py-2 px-2 text-center font-medium">Development</th>
              <th class="py-2 px-2 text-center font-medium">Production</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in SCRIPTS"
              :key="row.id"
              class="border-b border-gray-100"
              :class="scriptTone(row.group)"
            >
              <td class="py-2 pr-3 font-medium text-gray-700">
                <span v-if="showScriptGroup(index)">{{ row.group }}</span>
              </td>
              <td class="py-2 pr-3 font-medium text-gray-900">{{ row.script }}</td>
              <td class="py-2 pr-3">
                <span class="inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold" :class="methodClass(row.method)">
                  {{ row.method }}
                </span>
              </td>
              <td class="py-2 pr-3 font-mono text-xs text-gray-700">{{ row.path }}</td>
              <td class="py-2 px-2 text-center">
                <input
                  type="checkbox"
                  :checked="scripts[row.id].development"
                  :aria-label="`${row.script} Development`"
                  @change="toggleScript(row.id, 'development')"
                >
              </td>
              <td class="py-2 px-2 text-center">
                <input
                  type="checkbox"
                  :checked="scripts[row.id].production"
                  :aria-label="`${row.script} Production`"
                  @change="toggleScript(row.id, 'production')"
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-gray-500">
        {{ productionCount }} of {{ httpScriptCount }} production ready on the HTTP API.
        FileMaker does not store a cart or a shipping draft — confirm copies those into an order.
        The Router row is not HTTP: <code>WEB | Navigation | Go To</code> switches layouts
        (home/catalogue → Home [CF] Simple, cart, orders, admin).
      </p>
    </section>
  </div>
</template>
