<script setup>
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import {
  CATEGORIES,
  PRIORITY_LABEL,
  categoryTheme,
} from '../data/devTracker'
import { useDevBoard } from '../composables/useDevBoard'
import TicketCriteriaList from './TicketCriteriaList.vue'

const { creating, closeCreate, addTicket } = useDevBoard()
const error = ref('')

const form = reactive({
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
  category: 'Technical',
  acceptanceCriteria: [],
})

function resetForm() {
  error.value = ''
  form.title = ''
  form.description = ''
  form.priority = 'medium'
  form.assignee = ''
  form.category = 'Technical'
  form.acceptanceCriteria = []
}

function segmentClass(active) {
  return active
    ? 'bg-colliers-primary text-white'
    : 'text-slate-500 hover:text-slate-800'
}

watch(creating, (open) => {
  if (open) resetForm()
})

function onKey(event) {
  if (event.key === 'Escape' && creating.value) closeCreate()
}

watch(creating, (open) => {
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function save() {
  const title = form.title.trim()
  if (!title) {
    error.value = 'Give it a title.'
    return
  }
  addTicket({
    title,
    description: form.description.trim(),
    priority: form.priority,
    assignee: form.assignee,
    category: form.category,
    acceptanceCriteria: [...form.acceptanceCriteria],
  })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="creating"
      class="fixed inset-0 z-[1100] flex items-center justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-[2px] sm:p-6"
      @click.self="closeCreate"
    >
      <form
        class="ticket-sheet my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        @submit.prevent="save"
      >
        <div class="flex items-start justify-between gap-4 px-6 pt-6 sm:px-7">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">
              New ticket
            </p>
            <input
              v-model="form.title"
              type="text"
              maxlength="120"
              autocomplete="off"
              placeholder="What needs to happen?"
              class="mt-3 w-full border-0 bg-transparent py-2 pl-0 pr-0 text-2xl font-semibold tracking-tight text-gray-900 placeholder:text-colliers-primary/35 focus:outline-none focus:ring-0"
            />
            <p v-if="error" class="mt-2 text-sm text-rose-600">{{ error }}</p>
          </div>
          <button
            type="button"
            class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-colliers-primary/50 transition hover:bg-colliers-primary/10 hover:text-colliers-primary"
            aria-label="Close"
            @click="closeCreate"
          >
            <svg viewBox="0 0 20 20" fill="none" class="h-4 w-4" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="mt-8 px-6 sm:px-7">
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Priority</p>
          <div class="inline-flex rounded-lg bg-slate-100 p-0.5">
            <button
              v-for="(label, value) in PRIORITY_LABEL"
              :key="value"
              type="button"
              class="rounded-md px-3 py-1.5 text-[12px] font-semibold transition"
              :class="segmentClass(form.priority === value)"
              @click="form.priority = value"
            >
              {{ label }}
            </button>
          </div>
        </div>

        <div class="mt-8 px-6 sm:px-7">
          <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Category</p>
          <div class="inline-flex flex-wrap rounded-lg bg-slate-100 p-0.5">
            <button
              v-for="category in CATEGORIES"
              :key="category"
              type="button"
              class="rounded-md px-3 py-1.5 text-[12px] font-semibold transition"
              :class="form.category === category ? categoryTheme(category).chip : 'text-slate-500 hover:text-slate-800'"
              @click="form.category = category"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <section class="px-6 pt-8 sm:px-7">
          <label class="block">
            <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">Description</span>
            <textarea
              v-model="form.description"
              rows="4"
              placeholder="What should be true when this is done?"
              class="mt-2 w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 text-gray-800 placeholder:text-colliers-primary/35 focus:outline-none focus:ring-0"
            />
          </label>
        </section>

        <TicketCriteriaList
          class="mx-6 mt-6 sm:mx-7"
          v-model="form.acceptanceCriteria"
          :editing="true"
        />

        <div class="flex items-center justify-end gap-3 px-6 py-5 sm:px-7">
          <button type="button" class="text-sm font-medium text-colliers-primary hover:text-colliers-primary-hover" @click="closeCreate">
            Cancel
          </button>
          <button type="submit" class="btn-primary">Create ticket</button>
        </div>
      </form>
    </div>
  </Teleport>
</template>
