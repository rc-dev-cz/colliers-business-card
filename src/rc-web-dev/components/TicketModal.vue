<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  ASSIGNEE_LABEL,
  ASSIGNEES,
  CATEGORIES,
  DEFAULT_ASSIGNEE,
  PRIORITY_LABEL,
  PRIORITY_PILL,
  READY_STATUS,
  REVIEW_LABEL,
  REVIEW_PILL,
  STATUS_COLUMNS,
  categoryTheme,
  childrenOf,
  criteriaKey,
  normalizeAssignee,
  showsReview,
  asCriteria,
} from '../data/devTracker'
import { useDevBoard } from '../composables/useDevBoard'
import TicketCriteriaList from './TicketCriteriaList.vue'

const STATUS_PILL = {
  New: 'bg-slate-100 text-slate-700',
  Ideas: 'bg-violet-100 text-violet-800',
  [READY_STATUS]: 'bg-amber-100 text-amber-900',
  'In progress': 'bg-sky-100 text-sky-800',
  QA: 'bg-teal-100 text-teal-800',
  Done: 'bg-emerald-100 text-emerald-800',
}

const props = defineProps({
  ticket: { type: Object, default: null },
})

const emit = defineEmits(['close', 'open', 'saved'])
const { tickets, merged, updateTicket, approveTicket, setReadyToWork, persistTicket, setAcceptanceCriteria } =
  useDevBoard()
const editing = ref(false)
const error = ref('')
const saving = ref(false)
const isIdea = computed(() => props.ticket?.status === 'Ideas')
const isReady = computed(() => props.ticket?.status === READY_STATUS)
const canReadyToggle = computed(() => isIdea.value || isReady.value)

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  assignee: DEFAULT_ASSIGNEE,
  category: 'Technical',
  parentId: '',
  blocked: false,
  blockedReason: '',
  notes: '',
  acceptanceCriteria: [],
})

const all = computed(() => tickets.value.map(merged))

const column = computed(() =>
  STATUS_COLUMNS.find((item) => item.id === props.ticket?.status) || STATUS_COLUMNS[0],
)

const initials = computed(() => (editing.value ? form.assignee : props.ticket?.assignee) || '?')

const children = computed(() => (props.ticket ? childrenOf(all.value, props.ticket.id) : []))

const parent = computed(() => {
  const id = props.ticket?.parentId
  if (!id) return null
  return all.value.find((item) => item.id === id) || null
})

const parentOptions = computed(() =>
  all.value.filter((item) => !item.parentId && item.id !== props.ticket?.id),
)

const dirty = computed(() => {
  if (!editing.value || !props.ticket) return false
  const ticket = props.ticket
  return (
    form.title.trim() !== (ticket.title || '') ||
    form.description.trim() !== (ticket.description || '') ||
    form.priority !== (ticket.priority || 'medium') ||
    form.assignee !== normalizeAssignee(ticket.assignee) ||
    form.category !== (ticket.category || 'Technical') ||
    (form.parentId || '') !== (ticket.parentId || '') ||
    form.blocked !== Boolean(ticket.blocked) ||
    form.blockedReason.trim() !== (ticket.blockedReason || '') ||
    form.notes.trim() !== (ticket.notes || '') ||
    (form.acceptanceCriteria || []).length !== (ticket.acceptanceCriteria || []).length ||
    criteriaKey(form.acceptanceCriteria) !== criteriaKey(ticket.acceptanceCriteria)
  )
})

function chipClass(active, on) {
  return active ? `${on} ring-2 ring-colliers-primary/30` : `${on} opacity-40 hover:opacity-90`
}

function fillForm(ticket) {
  error.value = ''
  form.title = ticket.title || ''
  form.description = ticket.description || ''
  form.priority = ticket.priority || 'medium'
  form.assignee = normalizeAssignee(ticket.assignee)
  form.category = ticket.category || 'Technical'
  form.parentId = ticket.parentId || ''
  form.blocked = Boolean(ticket.blocked)
  form.blockedReason = ticket.blockedReason || ''
  form.notes = ticket.notes || ''
  form.acceptanceCriteria = asCriteria(ticket.acceptanceCriteria)
}

async function persistAndClose() {
  if (!props.ticket || saving.value) return
  saving.value = true
  error.value = ''
  const id = props.ticket.id
  try {
    await persistTicket(id)
    emit('saved', id)
    emit('close')
  } catch (err) {
    error.value = err?.message || 'Could not save to the database.'
  } finally {
    saving.value = false
  }
}

function startEdit() {
  if (!props.ticket) return
  fillForm(props.ticket)
  editing.value = true
}

function cancelEdit() {
  if (props.ticket) fillForm(props.ticket)
  editing.value = false
  error.value = ''
}

function onCriteriaUpdate(list) {
  form.acceptanceCriteria = asCriteria(list)
  if (editing.value || !props.ticket) return
  setAcceptanceCriteria(props.ticket.id, list)
}

async function saveEdit() {
  const title = form.title.trim()
  if (!title) {
    error.value = 'Give it a title.'
    return
  }
  updateTicket(props.ticket.id, {
    title,
    description: form.description.trim(),
    priority: form.priority,
    assignee: form.assignee,
    category: form.category,
    parentId: form.parentId || null,
    blocked: form.blocked,
    blockedReason: form.blockedReason.trim(),
    notes: form.notes.trim(),
    acceptanceCriteria: [...form.acceptanceCriteria],
    fresh: false,
  })
  editing.value = false
  await persistAndClose()
}

async function saveTicket() {
  if (editing.value) {
    await saveEdit()
    return
  }
  await persistAndClose()
}

function onReadyChange(event) {
  if (!props.ticket) return
  setReadyToWork(props.ticket.id, event.target.checked)
}

function onKey(event) {
  if (event.key !== 'Escape') return
  if (editing.value) cancelEdit()
  else emit('close')
}

watch(
  () => props.ticket?.id,
  (id) => {
    editing.value = false
    error.value = ''
    saving.value = false
    if (props.ticket) fillForm(props.ticket)
    if (props.ticket) fillForm(props.ticket)
    if (id) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="ticket"
      class="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-[2px] sm:p-6"
      @click.self="emit('close')"
    >
      <article
        :key="ticket.id"
        class="ticket-sheet relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] ring-1 ring-black/5"
      >
        <div class="h-1.5" :style="{ background: column.accent }" />

        <div class="flex items-start justify-between gap-4 px-6 pt-5 sm:px-7">
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-md bg-colliers-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-colliers-primary">
                {{ ticket.id }}
              </span>
              <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="STATUS_PILL[ticket.status]">
                {{ ticket.status }}
              </span>
              <span
                v-if="ticket.blocked"
                class="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-800"
              >
                Blocked
              </span>
              <button
                v-if="showsReview(ticket)"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                :class="REVIEW_PILL[ticket.review]"
                @click.stop="approveTicket(ticket.id)"
              >
                <span class="review-bounce h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
                {{ REVIEW_LABEL[ticket.review] }}
              </button>
            </div>
            <input
              v-if="editing"
              v-model="form.title"
              type="text"
              maxlength="120"
              class="mt-2 w-full border-0 bg-transparent p-0 text-2xl font-semibold tracking-tight text-slate-900 focus:outline-none focus:ring-0"
            />
            <h2 v-else class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {{ ticket.title }}
            </h2>
            <p v-if="error" class="mt-1 text-sm text-rose-600">{{ error }}</p>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
            @click="emit('close')"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div v-if="!editing" class="mt-4 flex flex-wrap items-center gap-2 px-6 sm:px-7">
          <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold" :class="PRIORITY_PILL[ticket.priority]">
            {{ PRIORITY_LABEL[ticket.priority] || 'Medium' }} priority
          </span>
          <span class="rounded-full px-2.5 py-1 text-[11px] font-medium" :class="categoryTheme(ticket.category).chip">
            {{ ticket.category }}
          </span>
          <span class="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-colliers-primary text-[9px] font-bold text-white">
              {{ initials }}
            </span>
            {{ ASSIGNEE_LABEL[ticket.assignee] || ticket.assignee || 'Unassigned' }}
          </span>
        </div>

        <div v-else class="mt-5 space-y-4 px-6 sm:px-7">
          <div>
            <p class="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Priority</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="(label, value) in PRIORITY_LABEL"
                :key="value"
                type="button"
                class="rounded-full px-2.5 py-1 text-[11px] font-semibold transition"
                :class="chipClass(form.priority === value, PRIORITY_PILL[value])"
                @click="form.priority = value"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <label class="block">
            <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Assigned</span>
            <select
              v-model="form.assignee"
              class="w-full rounded-xl border-0 bg-colliers-primary/5 px-3 py-2.5 text-sm text-gray-900 ring-1 ring-colliers-primary/20 focus:outline-none focus:ring-2 focus:ring-colliers-primary"
            >
              <option value="">Unassigned</option>
              <option v-for="person in ASSIGNEES" :key="person" :value="person">
                {{ ASSIGNEE_LABEL[person] }}
              </option>
            </select>
          </label>

          <div>
            <p class="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Category</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="category in CATEGORIES"
                :key="category"
                type="button"
                class="rounded-full px-2.5 py-1 text-[11px] font-semibold transition"
                :class="form.category === category ? categoryTheme(category).chip : 'bg-slate-100 text-slate-500'"
                @click="form.category = category"
              >
                {{ category }}
              </button>
            </div>
          </div>

          <label class="block">
            <span class="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Parent</span>
            <select
              v-model="form.parentId"
              class="w-full rounded-xl border-0 bg-colliers-primary/5 px-3 py-2.5 text-sm text-gray-900 ring-1 ring-colliers-primary/20 focus:outline-none focus:ring-2 focus:ring-colliers-primary"
            >
              <option value="">None</option>
              <option v-for="item in parentOptions" :key="item.id" :value="item.id">
                {{ item.id }} — {{ item.title }}
              </option>
            </select>
          </label>

          <label class="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <input v-model="form.blocked" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-colliers-primary focus:ring-colliers-primary" />
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-semibold text-slate-900">Blocked</span>
              <input
                v-if="form.blocked"
                v-model="form.blockedReason"
                type="text"
                placeholder="Waiting for…"
                class="mt-2 w-full border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </span>
          </label>
        </div>

        <label
          v-if="!editing && canReadyToggle"
          class="mx-6 mt-4 flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 ring-1 sm:mx-7"
          :class="isIdea ? 'bg-violet-50 ring-violet-200' : 'bg-amber-50 ring-amber-200'"
        >
          <input
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-slate-300 text-colliers-primary focus:ring-colliers-primary"
            :checked="isReady"
            @change="onReadyChange"
          />
          <span class="min-w-0">
            <span class="block text-sm font-semibold text-slate-900">
              Ready for development — assign to me
            </span>
            <span class="mt-0.5 block text-[13px] leading-5 text-slate-600">
              {{
                isIdea
                  ? "This is an idea. Don't write code yet — check this when the requirement is approved."
                  : 'Approved and assigned to you. Uncheck to park it back in Ideas.'
              }}
            </span>
          </span>
        </label>

        <p
          v-if="!editing && ticket.blocked"
          class="mx-6 mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200 sm:mx-7"
        >
          Blocked{{ ticket.blockedReason ? `: ${ticket.blockedReason}` : '' }}
        </p>

        <p v-if="!editing && parent" class="mt-3 px-6 text-[13px] text-slate-500 sm:px-7">
          Parent
          <button type="button" class="ml-1 font-mono font-semibold text-colliers-primary hover:underline" @click="emit('open', parent.id)">
            {{ parent.id }}
          </button>
          {{ parent.title }}
        </p>

        <section class="mx-6 mt-5 rounded-xl bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-200/80 sm:mx-7">
          <label v-if="editing" class="block">
            <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Description</span>
            <textarea
              v-model="form.description"
              rows="4"
              class="mt-2 w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 text-slate-700 focus:outline-none focus:ring-0"
            />
          </label>
          <template v-else>
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Description</p>
            <p class="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">{{ ticket.description }}</p>
          </template>
        </section>

        <TicketCriteriaList
          class="mx-6 mt-4 sm:mx-7"
          v-model="form.acceptanceCriteria"
          :editing="editing"
          @update:model-value="onCriteriaUpdate"
        />

        <section v-if="editing || ticket.notes" class="mx-6 mt-4 rounded-xl p-4 ring-1 ring-slate-200/80 sm:mx-7">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Notes</p>
          <textarea
            v-if="editing"
            v-model="form.notes"
            rows="3"
            placeholder="Reminders, design notes, product comments"
            class="mt-2 w-full resize-none border-0 bg-transparent p-0 text-[14px] leading-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
          <p v-else class="mt-2 whitespace-pre-wrap text-[14px] leading-6 text-slate-600">{{ ticket.notes }}</p>
        </section>

        <section v-if="children.length" class="mx-6 mt-4 mb-1 sm:mx-7">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Children</p>
          <ul class="mt-2 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
            <li v-for="child in children" :key="child.id">
              <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50" @click="emit('open', child.id)">
                <span class="font-mono text-[12px] font-semibold text-colliers-primary">{{ child.id }}</span>
                <span class="min-w-0 flex-1 truncate text-sm text-slate-800">{{ child.title }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="STATUS_PILL[child.status]">
                  {{ child.status }}
                </span>
              </button>
            </li>
          </ul>
        </section>

        <div class="flex items-center justify-end gap-3 px-6 py-5 sm:px-7">
          <p v-if="saving" class="mr-auto text-sm font-medium text-slate-500">Saving…</p>
          <p v-else-if="editing && dirty" class="mr-auto text-sm font-medium text-amber-700">Unsaved changes</p>
          <template v-if="editing">
            <button type="button" class="text-sm font-medium text-colliers-primary hover:text-colliers-primary-hover" @click="cancelEdit">
              Cancel
            </button>
            <button type="button" class="btn-primary" :disabled="!dirty || saving" @click="saveTicket">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </template>
          <template v-else>
            <button type="button" class="text-sm font-medium text-colliers-primary hover:text-colliers-primary-hover" @click="startEdit">
              Edit ticket
            </button>
            <button type="button" class="btn-primary" :disabled="saving" @click="saveTicket">
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </template>
        </div>
      </article>
    </div>
  </Teleport>
</template>
