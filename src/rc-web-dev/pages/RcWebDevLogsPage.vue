<script setup>
import { computed, ref } from 'vue'
import { PRIORITY_LABEL, READY_STATUS, STATUS_COLUMNS, showsReview, assigneeAvatarClass } from '../data/devTracker'
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

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'moved', label: 'Moves' },
  { id: 'created', label: 'Created' },
  { id: 'updated', label: 'Edits' },
]

const FIELD_LABEL = {
  title: 'Title',
  description: 'Description',
  priority: 'Priority',
  category: 'Category',
  assignee: 'Assigned',
  blocked: 'Blocked',
  notes: 'Notes',
  acceptanceCriteria: 'Acceptance criteria',
}

const { tickets, logs, merged } = useDevBoard()
const filter = ref('all')
const selectedId = ref('')

const selectedTicket = computed(() => {
  const ticket = tickets.value.find((item) => item.id === selectedId.value)
  return ticket ? merged(ticket) : null
})

const filtered = computed(() => {
  if (filter.value === 'all') return logs.value
  return logs.value.filter((log) => log.type === filter.value)
})

const groups = computed(() => {
  const buckets = []
  const index = new Map()
  for (const log of filtered.value) {
    const key = dayKey(log.at)
    if (!index.has(key)) {
      const group = { key, date: dayParts(log.at), items: [] }
      index.set(key, group)
      buckets.push(group)
    }
    index.get(key).items.push(log)
  }
  return buckets.map((group) => ({
    ...group,
    pending: group.items.some((log) => showsReview(ticketFor(log))),
  }))
})

function ticketFor(log) {
  const ticket = tickets.value.find((item) => item.id === log.ticketId)
  return ticket ? merged(ticket) : null
}

function assigneeFor(log) {
  return log.assignee || ticketFor(log)?.assignee || ''
}

function avatarClass(assignee) {
  return assigneeAvatarClass(assignee)
}

function dayKey(iso) {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayParts(iso) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' })
  const month = date.toLocaleDateString(undefined, { month: 'short' })
  const day = String(date.getDate())
  const year = date.getFullYear()
  const thisYear = today.getFullYear()
  let label = `${weekday} ${day} ${month}`
  if (year !== thisYear) label += ` ${year}`
  if (sameDay(date, today)) label = `Today · ${label}`
  else if (sameDay(date, yesterday)) label = `Yesterday · ${label}`
  return { weekday, month, day, year, label }
}

function typeLabel(log) {
  if (log.type === 'created') return 'Created'
  if (log.type === 'moved') return 'Moved'
  return 'Updated'
}

function displayValue(field, value) {
  if (field === 'priority') return PRIORITY_LABEL[value] || value || '—'
  if (field === 'assignee') return value || 'Unassigned'
  if (field === 'description') {
    const text = String(value || '').trim()
    if (!text) return 'empty'
    return text.length > 72 ? `${text.slice(0, 72)}…` : text
  }
  return value || '—'
}

function accent(status) {
  return STATUS_COLUMNS.find((column) => column.id === status)?.accent || '#94a3b8'
}

function openTicket(id) {
  if (tickets.value.some((ticket) => ticket.id === id)) selectedId.value = id
}

function closeTicket() {
  selectedId.value = ''
}
</script>

<template>
  <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <p class="text-sm text-gray-500">
      {{ filtered.length }} {{ filtered.length === 1 ? 'event' : 'events' }}
      <span v-if="filter !== 'all'">· {{ logs.length }} total</span>
    </p>
    <div class="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      <button
        v-for="item in TYPE_FILTERS"
        :key="item.id"
        type="button"
        class="rounded-md px-3 py-1.5 text-sm font-medium"
        :class="
          filter === item.id
            ? 'bg-colliers-primary text-white'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        "
        @click="filter = item.id"
      >
        {{ item.label }}
      </button>
    </div>
  </div>

  <p
    v-if="!logs.length"
    class="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500"
  >
    Nothing logged yet. Creating a ticket, dragging it on the board, checking it on the roadmap, or editing it will show up here.
  </p>

  <p
    v-else-if="!filtered.length"
    class="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500"
  >
    No {{ filter }} events yet.
  </p>

  <section
    v-for="group in groups"
    :key="group.key"
    class="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
    :class="{ 'ring-1 ring-sky-200': group.pending }"
  >
    <div class="grid grid-cols-[4.5rem_minmax(0,1fr)] sm:grid-cols-[5.5rem_minmax(0,1fr)]">
      <div
        class="flex flex-col items-center justify-start border-r border-gray-100 px-2 py-4 text-center"
        :class="group.pending ? 'bg-sky-50' : 'bg-slate-50'"
      >
        <span class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {{ group.date.weekday }}
        </span>
        <span class="text-2xl font-semibold tabular-nums leading-none text-slate-900">
          {{ group.date.day }}
        </span>
        <span class="mt-1 text-[11px] font-medium text-slate-500">{{ group.date.month }}</span>
        <span
          v-if="group.pending"
          class="review-bounce mt-2 h-1.5 w-1.5 rounded-full bg-sky-500"
          aria-hidden="true"
        />
      </div>

      <div>
        <h2 class="border-b border-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900 sm:px-5">
          {{ group.date.label }}
        </h2>
        <ol class="divide-y divide-gray-100">
          <li v-for="log in group.items" :key="log.id">
            <button
              type="button"
              class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 sm:px-5"
              :class="{ 'bg-sky-50': showsReview(ticketFor(log)) }"
              @click="openTicket(log.ticketId)"
            >
              <span
                class="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                :class="avatarClass(assigneeFor(log))"
                :title="assigneeFor(log) ? `Assigned ${assigneeFor(log)}` : 'Unassigned'"
              >
                {{ assigneeFor(log) || '?' }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="flex flex-wrap items-center gap-2">
                  <span
                    v-if="showsReview(ticketFor(log))"
                    class="review-bounce h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500"
                    aria-hidden="true"
                  />
                  <span class="font-mono text-sm font-semibold text-colliers-primary">{{ log.ticketId }}</span>
                  <span class="text-sm font-medium text-gray-900">{{ log.title || 'Untitled' }}</span>
                  <span
                    v-if="ticketFor(log)?.category"
                    class="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200"
                  >
                    {{ ticketFor(log).category }}
                  </span>
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {{ typeLabel(log) }}
                  </span>
                </span>

                <span v-if="log.type === 'moved'" class="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_PILL[log.from]">
                    {{ log.from }}
                  </span>
                  <span class="text-gray-400" aria-hidden="true">→</span>
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_PILL[log.to]">
                    {{ log.to }}
                  </span>
                </span>

                <span v-else-if="log.type === 'created'" class="mt-1.5 flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
                  Added in
                  <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_PILL[log.to] || STATUS_PILL.Ideas">
                    {{ log.to || 'Ideas' }}
                  </span>
                </span>

                <span v-else class="mt-1.5 block space-y-1">
                  <span v-for="(change, index) in log.changes" :key="index" class="block text-sm text-gray-600">
                    <span class="font-medium text-gray-800">{{ FIELD_LABEL[change.field] || change.field }}</span>
                    <template v-if="change.field === 'description'">
                      updated
                    </template>
                    <template v-else>
                      <span class="mx-1 text-gray-400">{{ displayValue(change.field, change.from) }}</span>
                      <span class="text-gray-400" aria-hidden="true">→</span>
                      <span class="ml-1">{{ displayValue(change.field, change.to) }}</span>
                    </template>
                  </span>
                </span>
              </span>
              <span
                v-if="log.type === 'moved' || log.type === 'created'"
                class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                :style="{ background: accent(log.to) }"
              />
            </button>
          </li>
        </ol>
      </div>
    </div>
  </section>

  <TicketModal :ticket="selectedTicket" @close="closeTicket" @open="selectedId = $event" @saved="closeTicket" @deleted="closeTicket" />
</template>
