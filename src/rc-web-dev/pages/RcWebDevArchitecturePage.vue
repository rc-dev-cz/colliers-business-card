<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { readStorage, writeStorage } from '../../composables/useStorage'
import { PAGES, PATHS, SCRIPTS } from '../data/architecture'

const STORAGE_KEY = 'rcArchitecture'

const selectedPathId = ref('order')
const selectedStep = ref(null)
const selectedReviewPage = ref(null)
const reviewDraft = ref('')
const reviewSeverity = ref('note')
const reviewInput = ref(null)

const pageFilter = ref('All')

const stored = readStorage(STORAGE_KEY, {})
const pages = reactive(PAGES.map((page) => hydratePage(page, stored)))
const scripts = reactive(SCRIPTS.map((row) => hydrateScript(row, stored)))
const paths = PATHS

const path = computed(() => PATHS.find((item) => item.id === selectedPathId.value) || PATHS[0])
const approvedCount = computed(() => pages.filter((page) => page.approved).length)
const klaiCount = computed(() => pages.filter((page) => page.klai).length)
const showScriptPagesColumn = computed(() => pageFilter.value === 'All')
const selectedPageName = computed(() => {
  if (pageFilter.value === 'All') return null
  return pages.find((page) => page.id === pageFilter.value)?.name || null
})

const filteredPages = computed(() =>
  pages.filter((page) => pageFilter.value === 'All' || page.id === pageFilter.value),
)

const filteredScripts = computed(() =>
  scripts.filter((row) => pageFilter.value === 'All' || scriptMatchesPage(row, pageFilter.value)),
)

watch([pages, scripts], persist, { deep: true })

function hydratePage(page, saved) {
  const overlay = saved?.pages?.[page.id] || migrateScreen(saved?.screens?.[page.id])
  return {
    ...page,
    ...overlay,
    weight: page.weight,
    section: page.section,
    name: page.name,
    id: page.id,
    reviewComment: overlay?.reviewComment || '',
    reviewSeverity: overlay?.reviewSeverity === 'critical' ? 'critical' : 'note',
  }
}

function migrateScreen(screen) {
  if (!screen) return {}
  return {
    dev: Boolean(screen.dev ?? screen.development),
    qa: Boolean(screen.qa),
    klai: Boolean(screen.klai),
    approved: Boolean(screen.approved),
  }
}

function hydrateScript(row, saved) {
  const savedRow = saved?.scripts?.[row.id]
  return {
    ...row,
    weight: row.weight,
    pageIds: row.pageIds || [],
    built: savedRow?.built ?? savedRow?.tested ?? savedRow?.development ?? row.built,
    reviewed: savedRow?.reviewed ?? row.reviewed,
  }
}

function persist() {
  writeStorage(STORAGE_KEY, {
    pages: Object.fromEntries(
      pages.map((page) => [
        page.id,
        {
          dev: page.dev,
          qa: page.qa,
          approved: page.approved,
          klai: page.klai,
          reviewComment: page.reviewComment,
          reviewSeverity: page.reviewSeverity,
        },
      ]),
    ),
    scripts: Object.fromEntries(
      scripts.map((row) => [
        row.id,
        { built: row.built, reviewed: row.reviewed },
      ]),
    ),
  })
}

function roleClass(role) {
  return role === 'Admin' ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-800'
}

function methodClass(method) {
  if (method === 'GET') return 'bg-emerald-50 text-emerald-800'
  if (method === 'POST') return 'bg-sky-50 text-sky-800'
  if (method === 'PATCH') return 'bg-amber-50 text-amber-900'
  if (method === 'DELETE') return 'bg-rose-50 text-rose-800'
  return 'bg-gray-100 text-gray-600'
}

function authClass(auth) {
  if (auth === 'Admin') return 'bg-amber-100 text-amber-900'
  if (auth === 'Session') return 'bg-sky-100 text-sky-800'
  return 'bg-gray-100 text-gray-700'
}

function scriptMatchesPage(row, pageId) {
  return Array.isArray(row.pageIds) && row.pageIds.includes(pageId)
}

function scriptPageNames(row) {
  const names = new Map(pages.map((page) => [page.id, page.name]))
  return (row.pageIds || []).map((id) => names.get(id)).filter(Boolean)
}

function scriptPageSummary(row) {
  const names = scriptPageNames(row)
  if (!names.length) return { label: '—', title: '' }
  if (names.length === 1) return { label: names[0], title: names[0] }
  if (names.length === 2) return { label: names.join(' · '), title: names.join(', ') }
  return { label: `${names.length} pages`, title: names.join(', ') }
}

function weightBarStyle(weight) {
  return { width: `${Number(weight || 0) * 10}%` }
}

function deliveryStatus(page) {
  if (page.approved) return 'Approved'
  if (page.qa) return 'Ready for review'
  if (page.dev) return 'In progress'
  return 'Not started'
}

function pageStatus(page) {
  if (page.reviewComment && page.reviewSeverity === 'critical') return 'Critical'
  if (page.reviewComment) return 'Comment'
  return deliveryStatus(page)
}

function statusClass(page) {
  const status = deliveryStatus(page)
  if (status === 'Approved') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (status === 'Ready for review') return 'border-sky-200 bg-sky-50 text-sky-800'
  if (status === 'In progress') return 'border-indigo-200 bg-indigo-50 text-indigo-800'
  return 'border-gray-200 bg-white text-gray-500'
}

function pageRowClass(page) {
  if (page.approved) return 'bg-emerald-50/40'
  if (page.reviewComment && page.reviewSeverity === 'critical') return 'bg-rose-50'
  if (page.reviewComment) return 'bg-amber-50/70'
  if (deliveryStatus(page) === 'In progress') return 'bg-indigo-50/40'
  return ''
}

async function openReview(page) {
  selectedReviewPage.value = page
  reviewDraft.value = page.reviewComment || ''
  reviewSeverity.value = page.reviewSeverity === 'critical' ? 'critical' : 'note'
  await nextTick()
  reviewInput.value?.focus()
}

function closeReview() {
  selectedReviewPage.value = null
  reviewDraft.value = ''
  reviewSeverity.value = 'note'
}

function saveReview() {
  if (!selectedReviewPage.value) return
  selectedReviewPage.value.reviewComment = reviewDraft.value.trim()
  selectedReviewPage.value.reviewSeverity = reviewSeverity.value === 'critical' ? 'critical' : 'note'
  closeReview()
}
</script>

<template>
  <div class="space-y-4 pb-8">

    <!-- ================================================================ -->
    <!-- Delivery                                                         -->
    <!-- ================================================================ -->

    <section
      class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h1 class="text-xl font-semibold text-gray-900">
        Delivery
      </h1>

      <p class="mt-1 text-sm text-gray-500">
        Where each page sits, from this repo through QA, approval, and Klai.
      </p>

      <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <div class="border-l-2 border-gray-200 pl-4">
          <div
            class="text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Development
          </div>

          <p class="mt-1 text-sm text-gray-700">
            Built in this Vue repository. Local pages, UI, and behaviour.
          </p>
        </div>

        <div class="border-l-2 border-gray-200 pl-4">
          <div
            class="text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            QA
          </div>

          <p class="mt-1 text-sm text-gray-700">
            On GitHub Pages. Ready for the team to click through and review.
          </p>
        </div>

        <div class="border-l-2 border-gray-200 pl-4">
          <div
            class="text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Approved
          </div>

          <p class="mt-1 text-sm text-gray-700">
            Signed off after QA. Ready to port into Klai.
          </p>
        </div>

        <div class="border-l-2 border-gray-200 pl-4">
          <div
            class="text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Klai
          </div>

          <p class="mt-1 text-sm text-gray-700">
            Live in Klai Studio, connected to FileMaker.
          </p>
        </div>

      </div>
    </section>

    <!-- ================================================================ -->
    <!-- Summary                                                          -->
    <!-- ================================================================ -->

    <section class="grid grid-cols-2 gap-3 md:grid-cols-4">

      <div
        class="rounded-lg border border-gray-200 bg-white px-4 py-3"
      >
        <div class="text-2xl font-semibold text-gray-900">
          {{ pages.length }}
        </div>

        <div class="text-sm text-gray-500">
          Pages
        </div>
      </div>

      <div
        class="rounded-lg border border-gray-200 bg-white px-4 py-3"
      >
        <div class="text-2xl font-semibold text-gray-900">
          {{ paths.length }}
        </div>

        <div class="text-sm text-gray-500">
          Paths
        </div>
      </div>

      <div
        class="rounded-lg border border-gray-200 bg-white px-4 py-3"
      >
        <div class="text-2xl font-semibold text-gray-900">
          {{ approvedCount }}/{{ pages.length }}
        </div>

        <div class="text-sm text-gray-500">
          Approved
        </div>
      </div>

      <div
        class="rounded-lg border border-gray-200 bg-white px-4 py-3"
      >
        <div class="text-2xl font-semibold text-colliers-primary">
          {{ klaiCount }}/{{ pages.length }}
        </div>

        <div class="text-sm text-gray-500">
          Klai
        </div>
      </div>

    </section>

    <!-- ================================================================ -->
    <!-- Paths                                                            -->
    <!-- ================================================================ -->

    <section
      class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >

      <div
        class="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
      >

        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            View paths
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Choose a flow. These are the live application steps.
          </p>
        </div>

        <label class="block">

          <span
            class="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            Select path
          </span>

          <select
            v-model="selectedPathId"
            class="
              w-60
              rounded-md
              border
              border-gray-200
              bg-white
              px-3
              py-2
              text-sm
              text-gray-800
              outline-none
              transition
              hover:border-gray-300
              focus:border-gray-400
              focus:ring-0
            "
          >
            <option
              v-for="item in paths"
              :key="item.id"
              :value="item.id"
            >
              {{ item.label }}
            </option>
          </select>

        </label>

      </div>

      <div class="mb-4">
        <h3 class="text-base font-semibold text-gray-900">
          {{ path.label }}
        </h3>

        <p class="mt-1 text-sm text-gray-600">
          {{ path.note }}
        </p>
      </div>

      <div class="overflow-x-auto py-2">

        <div class="flex min-w-max items-stretch">

          <template
            v-for="(step, index) in path.steps"
            :key="`${selectedPathId}-${index}`"
          >

            <button
              type="button"
              class="
                group
                flex
                w-52
                shrink-0
                cursor-pointer
                flex-col
                rounded-lg
                border
                border-gray-200
                bg-white
                p-4
                text-left
                transition
                hover:-translate-y-0.5
                hover:border-gray-300
                hover:shadow-md
                focus:outline-none
                focus:ring-2
                focus:ring-gray-200
              "
              @click="selectedStep = step"
            >

              <div class="flex items-start justify-between gap-2">

                <span
                  class="
                    inline-flex
                    h-7
                    min-w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                    px-2
                    text-xs
                    font-bold
                    text-gray-600
                  "
                >
                  {{ index + 1 }}
                </span>

                <div class="flex gap-1">

                  <span
                    v-for="role in step.roles"
                    :key="role"
                    class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    :class="roleClass(role)"
                  >
                    {{ role }}
                  </span>

                </div>

              </div>

              <h4 class="mt-4 text-sm font-semibold text-gray-900">
                {{ step.name }}
              </h4>

              <p class="mt-1 text-xs leading-5 text-gray-600">
                {{ step.summary }}
              </p>

              <span
                class="
                  mt-auto
                  pt-4
                  text-[11px]
                  font-medium
                  text-gray-400
                  group-hover:text-gray-600
                "
              >
                View details →
              </span>

            </button>

            <div
              v-if="index < path.steps.length - 1"
              class="flex w-10 shrink-0 items-center justify-center"
              aria-hidden="true"
            >
              <span class="text-xl text-gray-300">
                →
              </span>
            </div>

          </template>

        </div>

      </div>

    </section>

    <!-- ================================================================ -->
    <!-- Pages + FileMaker                                                -->
    <!-- ================================================================ -->

    <section
      class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
    >

      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >

        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Pages and FileMaker
          </h2>

          <p class="mt-1 text-sm text-gray-500">
            Filter by page. FileMaker lists the scripts that page actually calls.
          </p>
        </div>

        <select
          v-model="pageFilter"
          class="
            rounded-md
            border
            border-gray-200
            bg-white
            px-2.5
            py-1.5
            text-xs
            text-gray-700
            outline-none
            focus:border-gray-400
            focus:ring-0
          "
        >
          <option value="All">
            Page: All
          </option>

          <option
            v-for="page in pages"
            :key="page.id"
            :value="page.id"
          >
            {{ page.name }}
          </option>
        </select>

      </div>

      <h3 class="mt-6 text-sm font-semibold text-gray-900">
        Application pages
      </h3>

      <div class="mt-4 overflow-x-auto">

        <table class="min-w-full text-left text-sm">

          <thead>
            <tr
              class="
                border-b
                border-gray-200
                text-xs
                uppercase
                tracking-wide
                text-gray-500
              "
            >
              <th class="py-2 pr-4 font-medium">
                Section
              </th>

              <th class="py-2 pr-4 font-medium">
                Page
              </th>

              <th class="w-44 px-3 py-2 font-medium">
                Weight
              </th>

              <th class="px-2 py-2 text-center font-medium">
                DEV
              </th>

              <th class="px-2 py-2 text-center font-medium">
                QA
              </th>

              <th class="px-2 py-2 text-center font-medium">
                Approved
              </th>

              <th class="px-2 py-2 text-center font-medium">
                Klai
              </th>

              <th class="py-2 pl-4 font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>

            <tr
              v-for="page in filteredPages"
              :key="page.id"
              class="border-b border-gray-100 transition-colors"
              :class="pageRowClass(page)"
            >

              <td class="py-3 pr-4 text-gray-600">
                {{ page.section }}
              </td>

              <td class="py-3 pr-4 font-medium text-gray-900">
                {{ page.name }}
              </td>

              <!-- Visual weight -->
              <td class="px-3 py-3">

                <div class="flex items-center gap-3">

                  <span
                    class="w-4 text-xs font-semibold text-gray-700"
                  >
                    {{ page.weight }}
                  </span>

                  <div
                    class="
                      h-1.5
                      w-24
                      overflow-hidden
                      rounded-full
                      bg-gray-100
                    "
                  >
                    <div
                      class="
                        h-full
                        rounded-full
                        bg-gray-700
                      "
                      :style="weightBarStyle(page.weight)"
                    ></div>
                  </div>

                </div>

              </td>

              <td class="px-2 py-3 text-center">
                <input
                  v-model="page.dev"
                  type="checkbox"
                >
              </td>

              <td class="px-2 py-3 text-center">
                <input
                  v-model="page.qa"
                  type="checkbox"
                >
              </td>

              <td class="px-2 py-3 text-center">
                <input
                  v-model="page.approved"
                  type="checkbox"
                >
              </td>

              <td class="px-2 py-3 text-center">
                <input
                  v-model="page.klai"
                  type="checkbox"
                >
              </td>

              <td class="py-3 pl-4">
                <div class="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    class="inline-flex rounded-md border px-2.5 py-1 text-xs font-medium"
                    :class="statusClass(page)"
                    @click="openReview(page)"
                  >
                    {{ deliveryStatus(page) }}
                  </button>
                  <button
                    v-if="page.reviewComment"
                    type="button"
                    class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border"
                    :class="page.reviewSeverity === 'critical'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-amber-200 bg-amber-50 text-amber-800'"
                    :title="page.reviewComment"
                    aria-label="View comment"
                    @click="openReview(page)"
                  >
                    <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M18 5.5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2.2L10 18l3.8-3.5H16a2 2 0 0 0 2-2v-7Z" />
                    </svg>
                  </button>
                </div>
              </td>

            </tr>

          </tbody>

        </table>

      </div>

      <div class="my-8 border-t border-gray-200"></div>

      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >

        <div>
          <h3 class="text-sm font-semibold text-gray-900">
            FileMaker integration
          </h3>

          <p class="mt-1 text-sm text-gray-500">
            {{ selectedPageName ? `Scripts for ${selectedPageName}.` : 'Scripts for all pages.' }}
          </p>
        </div>

      </div>

      <div class="mt-4 overflow-x-auto">

        <table class="min-w-full text-left text-sm">

          <thead>
            <tr
              class="
                border-b
                border-gray-200
                text-xs
                uppercase
                tracking-wide
                text-gray-500
              "
            >
              <th
                v-if="showScriptPagesColumn"
                class="py-2 pr-3 font-medium"
              >
                Pages
              </th>

              <th class="py-2 pr-3 font-medium">
                Script
              </th>

              <th class="w-44 px-3 py-2 font-medium">
                Weight
              </th>

              <th class="py-2 pr-3 font-medium">
                Method
              </th>

              <th class="py-2 pr-3 font-medium">
                Path
              </th>

              <th class="py-2 pr-3 font-medium">
                Auth
              </th>

              <th class="px-2 py-2 text-center font-medium">
                Built
              </th>

              <th class="px-2 py-2 text-center font-medium">
                Reviewed
              </th>
            </tr>
          </thead>

          <tbody>

            <tr
              v-if="!filteredScripts.length"
            >
              <td
                class="py-6 text-sm text-gray-500"
                :colspan="showScriptPagesColumn ? 8 : 7"
              >
                No FileMaker scripts for this page.
              </td>
            </tr>

            <tr
              v-for="row in filteredScripts"
              :key="row.id"
              class="border-b border-gray-100"
            >

              <td
                v-if="showScriptPagesColumn"
                class="py-3 pr-3 text-xs text-gray-600"
                :title="scriptPageSummary(row).title"
              >
                {{ scriptPageSummary(row).label }}
              </td>

              <td class="py-3 pr-3 font-medium text-gray-900">
                {{ row.script }}
              </td>

              <td class="px-3 py-3">

                <div class="flex items-center gap-3">

                  <span
                    class="w-4 text-xs font-semibold text-gray-700"
                  >
                    {{ row.weight }}
                  </span>

                  <div
                    class="
                      h-1.5
                      w-24
                      overflow-hidden
                      rounded-full
                      bg-gray-100
                    "
                  >
                    <div
                      class="
                        h-full
                        rounded-full
                        bg-gray-700
                      "
                      :style="weightBarStyle(row.weight)"
                    ></div>
                  </div>

                </div>

              </td>

              <td class="py-3 pr-3">

                <span
                  class="
                    rounded
                    px-1.5
                    py-0.5
                    font-mono
                    text-[11px]
                    font-semibold
                  "
                  :class="methodClass(row.method)"
                >
                  {{ row.method }}
                </span>

              </td>

              <td
                class="py-3 pr-3 font-mono text-xs text-gray-700"
              >
                {{ row.path }}
              </td>

              <td class="py-3 pr-3">

                <span
                  class="
                    rounded-full
                    px-2
                    py-0.5
                    text-[10px]
                    font-semibold
                  "
                  :class="authClass(row.auth)"
                >
                  {{ row.auth }}
                </span>

              </td>

              <td class="px-2 py-3 text-center">
                <input
                  v-model="row.built"
                  type="checkbox"
                >
              </td>

              <td class="px-2 py-3 text-center">
                <input
                  v-model="row.reviewed"
                  type="checkbox"
                >
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </section>

    <!-- ================================================================ -->
    <!-- Path Detail Modal                                                -->
    <!-- ================================================================ -->

    <div
      v-if="selectedStep"
      class="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/30
        p-4
      "
      @click.self="selectedStep = null"
    >

      <div
        class="
          w-full
          max-w-lg
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-xl
        "
      >

        <div
          class="
            flex
            items-start
            justify-between
            border-b
            border-gray-100
            p-5
          "
        >

          <div>

            <h3 class="text-lg font-semibold text-gray-900">
              {{ selectedStep.name }}
            </h3>

            <div class="mt-2 flex gap-1">

              <span
                v-for="role in selectedStep.roles"
                :key="role"
                class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :class="roleClass(role)"
              >
                {{ role }}
              </span>

            </div>

          </div>

          <button
            type="button"
            class="
              rounded-md
              px-2
              py-1
              text-gray-400
              hover:bg-gray-100
            "
            @click="selectedStep = null"
          >
            ✕
          </button>

        </div>

        <div class="space-y-5 p-5">

          <div>
            <div
              class="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Purpose
            </div>

            <p class="mt-1 text-sm text-gray-700">
              {{ selectedStep.summary }}
            </p>
          </div>

          <div>
            <div
              class="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Details
            </div>

            <ul class="mt-2 space-y-1 text-sm text-gray-700">

              <li
                v-for="detail in selectedStep.details"
                :key="detail"
              >
                • {{ detail }}
              </li>

            </ul>

          </div>

          <div>
            <div
              class="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Data source
            </div>

            <p class="mt-1 text-sm text-gray-700">
              {{ selectedStep.dataSource }}
            </p>
          </div>

          <div>
            <div
              class="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Data output
            </div>

            <p class="mt-1 text-sm text-gray-700">
              {{ selectedStep.dataOutput }}
            </p>
          </div>

          <div>
            <div
              class="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Integration
            </div>

            <p class="mt-1 font-mono text-xs text-gray-700">
              {{ selectedStep.integration }}
            </p>
          </div>

        </div>

      </div>

    </div>

    <!-- ================================================================ -->
    <!-- Review / Status Modal                                            -->
    <!-- ================================================================ -->

    <div
      v-if="selectedReviewPage"
      class="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/30
        p-4
      "
      @click.self="closeReview"
    >

      <div
        class="
          w-full
          max-w-lg
          rounded-xl
          border
          border-gray-200
          bg-white
          shadow-xl
        "
      >

        <div
          class="
            flex
            items-start
            justify-between
            border-b
            border-gray-100
            p-5
          "
        >

          <div>

            <div
              class="
                text-xs
                font-semibold
                uppercase
                tracking-wide
                text-gray-400
              "
            >
              Page review
            </div>

            <h3 class="mt-1 text-lg font-semibold text-gray-900">
              {{ selectedReviewPage.name }}
            </h3>

            <p class="mt-1 text-sm text-gray-500">
              Current status: {{ pageStatus(selectedReviewPage) }}
            </p>

          </div>

          <button
            type="button"
            class="
              rounded-md
              px-2
              py-1
              text-gray-400
              hover:bg-gray-100
            "
            @click="closeReview"
          >
            ✕
          </button>

        </div>

        <div class="p-5">

          <label class="block">

            <span class="text-sm font-medium text-gray-700">
              Review comment
            </span>

            <textarea
              ref="reviewInput"
              v-model="reviewDraft"
              rows="5"
              class="
                mt-2
                w-full
                rounded-md
                border
                border-gray-200
                px-3
                py-2
                text-sm
                outline-none
                focus:border-gray-400
                focus:ring-0
              "
              placeholder="Add feedback, an open question, or a roadblock..."
            ></textarea>

          </label>

          <fieldset class="mt-4">
            <legend class="text-sm font-medium text-gray-700">
              Severity
            </legend>
            <div class="mt-2 flex gap-4 text-sm text-gray-700">
              <label class="inline-flex items-center gap-2">
                <input v-model="reviewSeverity" type="radio" value="note">
                Note
              </label>
              <label class="inline-flex items-center gap-2">
                <input v-model="reviewSeverity" type="radio" value="critical">
                Critical
              </label>
            </div>
          </fieldset>

          <p class="mt-2 text-xs text-gray-500">
            A note highlights the row in amber until it is approved. Critical marks it red.
          </p>

          <div class="mt-5 flex justify-end gap-2">

            <button
              type="button"
              class="
                rounded-md
                border
                border-gray-200
                px-3
                py-2
                text-sm
                text-gray-600
                hover:bg-gray-50
              "
              @click="closeReview"
            >
              Cancel
            </button>

            <button
              type="button"
              class="
                rounded-md
                bg-gray-900
                px-3
                py-2
                text-sm
                font-medium
                text-white
                hover:bg-gray-800
              "
              @click="saveReview"
            >
              Save review
            </button>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>