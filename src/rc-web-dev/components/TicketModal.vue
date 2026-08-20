<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  ASSIGNEE_LABEL,
  CATEGORIES,
  DEFAULT_ASSIGNEE,
  PRIORITY_LABEL,
  PRIORITY_PILL,
  READY_STATUS,
  REVIEW_LABEL,
  REVIEW_PILL,
  STATUS_COLUMNS,
  categoryTheme,
  criteriaKey,
  normalizeAssignee,
  relatedKey,
  showsReview,
  asCriteria,
  asRelatedIds,
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

const emit = defineEmits(['close', 'open', 'saved', 'deleted'])
const { tickets, merged, updateTicket, approveTicket, persistTicket, setAcceptanceCriteria, hasUnsaved, revertUnsaved, removeTicket } =
  useDevBoard()
const editing = ref(false)
const error = ref('')
const saving = ref(false)
const confirmingDelete = ref(false)
const deleting = ref(false)

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  assignee: DEFAULT_ASSIGNEE,
  category: 'Technical',
  relatedIds: [],
  relatedPick: '',
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

const relatedTickets = computed(() => {
  if (!props.ticket) return []
  const ids = new Set(asRelatedIds(props.ticket.relatedIds, props.ticket.id))
  return all.value.filter((item) => ids.has(item.id))
})

const relatedFormTickets = computed(() => {
  const ids = new Set(form.relatedIds)
  return all.value.filter((item) => ids.has(item.id))
})

const relatedOptions = computed(() =>
  all.value.filter((item) => item.id !== props.ticket?.id && !form.relatedIds.includes(item.id)),
)

const dirty = computed(() => {
  if (!editing.value || !props.ticket) return false
  const ticket = props.ticket
  return (
    form.title.trim() !== (ticket.title || '') ||
    form.description.trim() !== (ticket.description || '') ||
    form.priority !== (ticket.priority || 'medium') ||
    form.category !== (ticket.category || 'Technical') ||
    relatedKey(form.relatedIds) !== relatedKey(ticket.relatedIds) ||
    form.blocked !== Boolean(ticket.blocked) ||
    form.blockedReason.trim() !== (ticket.blockedReason || '') ||
    form.notes.trim() !== (ticket.notes || '') ||
    (form.acceptanceCriteria || []).length !== (ticket.acceptanceCriteria || []).length ||
    criteriaKey(form.acceptanceCriteria) !== criteriaKey(ticket.acceptanceCriteria)
  )
})

const unsaved = computed(() => Boolean(props.ticket && hasUnsaved(props.ticket.id)))

const canSave = computed(() => {
  if (!props.ticket || saving.value) return false
  return dirty.value || unsaved.value
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
  form.relatedIds = asRelatedIds(ticket.relatedIds, ticket.id)
  form.relatedPick = ''
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

function cancelView() {
  if (confirmingDelete.value) {
    confirmingDelete.value = false
    return
  }
  if (props.ticket && unsaved.value) revertUnsaved(props.ticket.id)
  emit('close')
}

async function confirmRemove() {
  if (!props.ticket || deleting.value) return
  deleting.value = true
  error.value = ''
  const id = props.ticket.id
  try {
    await removeTicket(id)
    emit('deleted', id)
    emit('close')
  } catch (err) {
    error.value = err?.message || 'Could not delete the ticket.'
    confirmingDelete.value = false
  } finally {
    deleting.value = false
  }
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
  const previousRelated = asRelatedIds(props.ticket.relatedIds, props.ticket.id)
  updateTicket(props.ticket.id, {
    title,
    description: form.description.trim(),
    priority: form.priority,
    assignee: DEFAULT_ASSIGNEE,
    category: form.category,
    relatedIds: [...form.relatedIds],
    blocked: form.blocked,
    blockedReason: form.blockedReason.trim(),
    notes: form.notes.trim(),
    acceptanceCriteria: [...form.acceptanceCriteria],
    fresh: false,
  })
  editing.value = false
  const touched = new Set([props.ticket.id, ...previousRelated, ...form.relatedIds])
  saving.value = true
  error.value = ''
  try {
    for (const id of touched) await persistTicket(id)
    emit('saved', props.ticket.id)
    emit('close')
  } catch (err) {
    error.value = err?.message || 'Could not save to the database.'
  } finally {
    saving.value = false
  }
}

function addRelated() {
  const id = form.relatedPick
  if (!id || form.relatedIds.includes(id)) return
  form.relatedIds = [...form.relatedIds, id]
  form.relatedPick = ''
}

function removeRelated(id) {
  form.relatedIds = form.relatedIds.filter((item) => item !== id)
}

async function saveTicket() {
  if (!canSave.value || saving.value) return
  if (editing.value) {
    await saveEdit()
    return
  }
  await persistAndClose()
}

function onKey(event) {
  if (event.key !== 'Escape') return
  if (confirmingDelete.value) {
    confirmingDelete.value = false
    return
  }
  if (editing.value) cancelEdit()
  else cancelView()
}

watch(
  () => props.ticket?.id,
  (id) => {
    editing.value = false
    error.value = ''
    saving.value = false
    confirmingDelete.value = false
    deleting.value = false
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
      @click.self="cancelView"
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
            @click="cancelView"
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

          <div>
            <p class="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Related tickets</p>
            <div v-if="relatedFormTickets.length" class="mb-2 flex flex-wrap gap-1.5">
              <button
                v-for="item in relatedFormTickets"
                :key="item.id"
                type="button"
                class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700"
                @click="removeRelated(item.id)"
              >
                {{ item.id }}
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <select
              v-model="form.relatedPick"
              class="w-full rounded-xl border-0 bg-colliers-primary/5 px-3 py-2.5 text-sm text-gray-900 ring-1 ring-colliers-primary/20 focus:outline-none focus:ring-2 focus:ring-colliers-primary"
              @change="addRelated"
            >
              <option value="">Add related…</option>
              <option v-for="item in relatedOptions" :key="item.id" :value="item.id">
                {{ item.id }} — {{ item.title }}
              </option>
            </select>
          </div>

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

        <p
          v-if="!editing && unsaved"
          class="mx-6 mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200 sm:mx-7"
        >
          Not saved yet. Save to keep this in the database.
        </p>

        <p
          v-if="!editing && ticket.blocked"
          class="mx-6 mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200 sm:mx-7"
        >
          Blocked{{ ticket.blockedReason ? `: ${ticket.blockedReason}` : '' }}
        </p>

        <section v-if="!editing && relatedTickets.length" class="mx-6 mt-4 mb-1 sm:mx-7">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Related tickets</p>
          <ul class="mt-2 divide-y divide-slate-100 rounded-xl ring-1 ring-slate-200">
            <li v-for="item in relatedTickets" :key="item.id">
              <button type="button" class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50" @click="emit('open', item.id)">
                <span class="font-mono text-[12px] font-semibold text-colliers-primary">{{ item.id }}</span>
                <span class="min-w-0 flex-1 truncate text-sm text-slate-800">{{ item.title }}</span>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="STATUS_PILL[item.status]">
                  {{ item.status }}
                </span>
              </button>
            </li>
          </ul>
        </section>

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

        <div
          v-if="confirmingDelete"
          class="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-6"
        >
          <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl ring-1 ring-black/5">
            <p class="text-lg font-semibold text-slate-900">Are you sure?</p>
            <p class="mt-1 text-sm text-slate-600">
              Delete {{ ticket.id }} — {{ ticket.title }}. This removes it from the board and the database.
            </p>
            <div class="mt-5 flex justify-end gap-3">
              <button
                type="button"
                class="text-sm font-medium text-slate-600 hover:text-slate-900"
                :disabled="deleting"
                @click="confirmingDelete = false"
              >
                Cancel
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded bg-rose-700 px-4 py-2.5 text-[15px] font-medium text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="deleting"
                @click="confirmRemove"
              >
                {{ deleting ? 'Deleting…' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 px-6 py-5 sm:px-7">
          <button
            v-if="!editing"
            type="button"
            class="text-sm font-medium text-colliers-primary hover:text-colliers-primary-hover"
            @click="startEdit"
          >
            Edit ticket
          </button>
          <button
            v-if="!editing"
            type="button"
            class="text-sm font-medium text-rose-700 hover:text-rose-800"
            @click="confirmingDelete = true"
          >
            Delete ticket
          </button>
          <p v-if="saving" class="text-sm font-medium text-slate-500">Saving…</p>
          <p v-else-if="canSave" class="text-sm font-medium text-amber-700">Unsaved changes</p>
          <div class="ml-auto flex items-center gap-3">
            <button
              type="button"
              class="text-sm font-medium text-slate-600 hover:text-slate-900"
              @click="editing ? cancelEdit() : cancelView()"
            >
              {{ editing || unsaved ? 'Cancel' : 'Close' }}
            </button>
            <button
              type="button"
              class="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!canSave"
              @click="saveTicket"
            >
              {{ saving ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </Teleport>
</template>
