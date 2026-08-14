<script setup>
import { computed, ref } from 'vue'
import { CATEGORIES, PRIORITY_LABEL, PRIORITY_PILL, READY_STATUS, categoryTheme, childrenOf, isAssigned, showsReview, sortByPriority } from '../data/devTracker'
import { useDevBoard } from '../composables/useDevBoard'
import TicketModal from '../components/TicketModal.vue'

const STATUS_PILL = {
  New: 'bg-slate-100 text-slate-700',
  Ideas: 'bg-violet-100 text-violet-800',
  [READY_STATUS]: 'bg-amber-100 text-amber-900',
  'In progress': 'bg-sky-100 text-sky-800',
  QA: 'bg-teal-100 text-teal-800',
  Done: 'bg-emerald-100 text-emerald-800',
}

const { tickets, merged, setStatus } = useDevBoard()
const selectedId = ref('')
const collapsed = ref({})

const all = computed(() => tickets.value.map(merged))
const assigned = computed(() => all.value.filter(isAssigned))
const ideas = computed(() => sortByPriority(all.value.filter((ticket) => !isAssigned(ticket))))

const total = computed(() => assigned.value.length)
const completed = computed(() => assigned.value.filter((ticket) => ticket.status === 'Done').length)
const percent = computed(() => (total.value ? Math.round((completed.value / total.value) * 100) : 0))

function categoryNodes(list) {
  return CATEGORIES.map((category) => {
    const inCategory = list.filter((ticket) => ticket.category === category)
    const ids = new Set(inCategory.map((ticket) => ticket.id))
    const childIds = new Set(
      inCategory.filter((ticket) => ticket.parentId && ids.has(ticket.parentId)).map((ticket) => ticket.id),
    )
    const roots = sortByPriority(inCategory.filter((ticket) => !childIds.has(ticket.id)))
    const nodes = roots.map((ticket) => ({
      ticket,
      children: childrenOf(inCategory, ticket.id),
    }))
    return { category, nodes, count: inCategory.length, tickets: inCategory }
  }).filter((group) => group.nodes.length)
}

const groups = computed(() =>
  categoryNodes(assigned.value).map((group) => {
    const done = group.tickets.filter((ticket) => ticket.status === 'Done').length
    return {
      ...group,
      done,
      allDone: group.count > 0 && done === group.count,
      pending: group.tickets.some(showsReview),
    }
  }),
)

const ideaGroups = computed(() => categoryNodes(ideas.value))

const selectedTicket = computed(() => {
  const ticket = tickets.value.find((item) => item.id === selectedId.value)
  return ticket ? merged(ticket) : null
})

function isDone(ticket) {
  return ticket.status === 'Done'
}

function toggle(id) {
  const ticket = tickets.value.find((item) => item.id === id)
  const current = ticket ? merged(ticket).status : ''
  setStatus(id, current === 'Done' ? READY_STATUS : 'Done')
}

function openTicket(id) {
  if (tickets.value.some((ticket) => ticket.id === id)) selectedId.value = id
}

function closeTicket() {
  selectedId.value = ''
}

function isGroupOpen(category) {
  if (Object.prototype.hasOwnProperty.call(collapsed.value, category)) return !collapsed.value[category]
  const group = groups.value.find((item) => item.category === category)
  return Boolean(group && !group.allDone)
}

function toggleGroup(category) {
  collapsed.value = { ...collapsed.value, [category]: isGroupOpen(category) }
}

function isIdeasOpen() {
  if (Object.prototype.hasOwnProperty.call(collapsed.value, 'Ideas')) return !collapsed.value.Ideas
  return true
}

function toggleIdeas() {
  collapsed.value = { ...collapsed.value, Ideas: isIdeasOpen() }
}

function ideaGroupKey(category) {
  return `idea:${category}`
}

function isIdeaGroupOpen(category) {
  const key = ideaGroupKey(category)
  if (Object.prototype.hasOwnProperty.call(collapsed.value, key)) return !collapsed.value[key]
  return true
}

function toggleIdeaGroup(category) {
  const key = ideaGroupKey(category)
  collapsed.value = { ...collapsed.value, [key]: isIdeaGroupOpen(category) }
}
</script>

<template>
  <div class="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
    <div class="mb-2 flex items-baseline justify-between gap-4">
      <p class="text-sm font-medium text-gray-800">Assigned tickets</p>
      <p class="text-sm text-gray-500">{{ completed }} / {{ total }} done · {{ percent }}%</p>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-gray-100">
      <div class="h-full bg-colliers-primary transition-all" :style="{ width: percent + '%' }" />
    </div>
    <p class="mt-2 text-xs text-gray-500">
      Groups collapse when everything in them is done. Uncommitted work sits under Ideas, grouped by category, and stays off the percentage until someone owns it.
    </p>
  </div>

  <section
    v-for="group in groups"
    :key="group.category"
    class="mb-3 overflow-hidden rounded-lg border shadow-sm"
    :class="categoryTheme(group.category).block"
  >
    <button
      type="button"
      class="flex w-full items-center gap-3 px-4 py-3 text-left sm:px-5"
      :class="categoryTheme(group.category).heading"
      @click="toggleGroup(group.category)"
    >
      <span class="w-3 text-xs opacity-60">{{ isGroupOpen(group.category) ? '▾' : '▸' }}</span>
      <h2 class="flex items-center gap-1.5 text-base font-semibold">
        {{ group.category }}
        <span
          v-if="group.pending"
          class="review-bounce h-1.5 w-1.5 rounded-full bg-sky-500"
          aria-hidden="true"
        />
      </h2>
      <span class="ml-auto text-xs tabular-nums opacity-70">{{ group.done }} / {{ group.count }}</span>
      <span class="h-1.5 w-16 overflow-hidden rounded-full bg-black/10">
        <span
          class="block h-full bg-current opacity-70"
          :style="{ width: (group.count ? Math.round((group.done / group.count) * 100) : 0) + '%' }"
        />
      </span>
    </button>

    <ul v-show="isGroupOpen(group.category)" class="divide-y divide-gray-100 border-t border-gray-100">
      <li v-for="node in group.nodes" :key="node.ticket.id" class="px-4 py-2.5 sm:px-5">
        <div class="flex items-start gap-3">
          <input
            :id="node.ticket.id"
            type="checkbox"
            class="mt-1 h-4 w-4 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
            :checked="isDone(node.ticket)"
            @change="toggle(node.ticket.id)"
          />
          <div class="min-w-0 flex-1">
            <button type="button" class="flex w-full flex-wrap items-center gap-2 text-left" @click="openTicket(node.ticket.id)">
              <span
                v-if="showsReview(node.ticket)"
                class="review-bounce h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500"
                aria-hidden="true"
              />
              <span class="font-mono text-sm font-semibold text-colliers-primary">{{ node.ticket.id }}</span>
              <span class="text-sm font-medium text-gray-900">{{ node.ticket.title }}</span>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="STATUS_PILL[node.ticket.status]">
                {{ node.ticket.status }}
              </span>
              <span
                class="ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                :class="PRIORITY_PILL[node.ticket.priority] || PRIORITY_PILL.medium"
              >
                {{ PRIORITY_LABEL[node.ticket.priority] || 'Medium' }}
              </span>
            </button>
          </div>
        </div>

        <ul v-if="node.children.length" class="mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
          <li v-for="child in node.children" :key="child.id" class="flex items-start gap-3">
            <input
              :id="child.id"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
              :checked="isDone(child)"
              @change="toggle(child.id)"
            />
            <div class="min-w-0 flex-1">
              <button type="button" class="flex w-full flex-wrap items-center gap-2 text-left" @click="openTicket(child.id)">
                <span
                  v-if="showsReview(child)"
                  class="review-bounce h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500"
                  aria-hidden="true"
                />
                <span class="font-mono text-sm font-semibold text-colliers-primary">{{ child.id }}</span>
                <span class="text-sm text-gray-900">{{ child.title }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="STATUS_PILL[child.status]">
                  {{ child.status }}
                </span>
              </button>
            </div>
          </li>
        </ul>
      </li>
    </ul>
  </section>

  <section v-if="ideaGroups.length" class="mb-3 overflow-hidden rounded-lg border border-dashed border-violet-200 bg-violet-50/40">
    <button
      type="button"
      class="flex w-full items-center gap-3 px-4 py-3 text-left sm:px-5"
      @click="toggleIdeas"
    >
      <span class="w-3 text-xs text-violet-400">{{ isIdeasOpen() ? '▾' : '▸' }}</span>
      <h2 class="text-base font-semibold text-violet-950">Ideas</h2>
      <span class="ml-auto text-xs tabular-nums text-violet-700">{{ ideas.length }} unassigned</span>
    </button>
    <div v-show="isIdeasOpen()" class="space-y-2 border-t border-violet-100 p-2 sm:p-3">
      <section
        v-for="group in ideaGroups"
        :key="group.category"
        class="overflow-hidden rounded-lg border shadow-sm"
        :class="categoryTheme(group.category).block"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-2.5 text-left sm:px-5"
          :class="categoryTheme(group.category).heading"
          @click="toggleIdeaGroup(group.category)"
        >
          <span class="w-3 text-xs opacity-60">{{ isIdeaGroupOpen(group.category) ? '▾' : '▸' }}</span>
          <h3 class="text-sm font-semibold">{{ group.category }}</h3>
          <span class="ml-auto text-xs tabular-nums opacity-70">{{ group.count }}</span>
        </button>
        <ul v-show="isIdeaGroupOpen(group.category)" class="divide-y divide-gray-100 border-t border-gray-100">
          <li v-for="node in group.nodes" :key="node.ticket.id" class="px-4 py-2.5 sm:px-5">
            <button type="button" class="flex w-full flex-wrap items-center gap-2 text-left" @click="openTicket(node.ticket.id)">
              <span class="font-mono text-sm font-semibold text-colliers-primary">{{ node.ticket.id }}</span>
              <span class="text-sm font-medium text-gray-900">{{ node.ticket.title }}</span>
              <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="STATUS_PILL[node.ticket.status]">
                {{ node.ticket.status }}
              </span>
            </button>
            <ul v-if="node.children.length" class="mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
              <li v-for="child in node.children" :key="child.id">
                <button type="button" class="flex w-full flex-wrap items-center gap-2 text-left" @click="openTicket(child.id)">
                  <span class="font-mono text-sm font-semibold text-colliers-primary">{{ child.id }}</span>
                  <span class="text-sm text-gray-900">{{ child.title }}</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </section>
    </div>
  </section>

  <TicketModal :ticket="selectedTicket" @close="closeTicket" @open="selectedId = $event" @saved="closeTicket" />
</template>
