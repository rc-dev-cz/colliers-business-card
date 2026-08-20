<template>
  <div v-if="board.creating" class="ticket-modal-root fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-slate-900/45 p-4 backdrop-blur-[2px] sm:items-center" @click.self="closeCreate">
    <form class="ticket-sheet my-auto max-h-[min(92vh,56rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl" @submit.prevent="save">
      <div class="flex items-start justify-between gap-4 px-6 pt-6">
        <div class="min-w-0 flex-1">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-colliers-primary">New ticket</p>
          <input v-model="form.title" maxlength="120" placeholder="What needs to happen?" class="mt-3 w-full border-0 bg-transparent py-2 text-2xl font-semibold text-gray-900 focus:outline-none">
          <p v-if="error" class="mt-2 text-sm text-rose-600">{{ error }}</p>
        </div>
        <button type="button" class="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100" aria-label="Close" @click="closeCreate">×</button>
      </div>
      <div class="mt-8 px-6">
        <p class="mb-2 text-[11px] font-semibold uppercase text-colliers-primary">Priority</p>
        <div class="inline-flex rounded-lg bg-slate-100 p-0.5">
          <button v-for="(label, value) in priorityLabels" :key="value" type="button" class="rounded-md px-3 py-1.5 text-xs font-semibold" :class="segmentClass(form.priority === value)" @click="form.priority = value">{{ label }}</button>
        </div>
      </div>
      <div class="mt-6 px-6">
        <p class="mb-2 text-[11px] font-semibold uppercase text-colliers-primary">Category</p>
        <button v-for="category in categories" :key="category" type="button" class="mr-1 rounded-md px-3 py-1.5 text-xs font-semibold" :class="form.category === category ? categoryTheme(category).chip : 'bg-slate-100 text-slate-500'" @click="form.category = category">{{ category }}</button>
      </div>
      <label class="block px-6 pt-8">
        <span class="text-[11px] font-semibold uppercase text-colliers-primary">Description</span>
        <textarea v-model="form.description" rows="4" class="mt-2 w-full resize-none border-0 bg-transparent p-0 text-[15px] leading-7 focus:outline-none" placeholder="What should be true when this is done?"></textarea>
      </label>
      <ticket-criteria-list class="mx-6 mt-6" v-model="form.acceptanceCriteria" :editing="true"></ticket-criteria-list>
      <div class="flex justify-end gap-3 px-6 py-5">
        <button type="button" class="text-sm text-colliers-primary" @click="closeCreate">Cancel</button>
        <button type="submit" class="btn-primary">Create ticket</button>
      </div>
    </form>
  </div>
</template>

<script>
import { CATEGORIES, PRIORITY_LABEL, categoryTheme } from '../data/devTracker'
import { board, closeCreate, addTicket } from '../board'
import TicketCriteriaList from './TicketCriteriaList.vue'

function blankForm() {
  return { title: '', description: '', priority: 'medium', assignee: '', category: 'Technical', acceptanceCriteria: [] }
}

export default {
  name: 'TicketCreateModal',
  components: { TicketCriteriaList },
  data: function () {
    return { board: board, form: blankForm(), error: '', categories: CATEGORIES, priorityLabels: PRIORITY_LABEL }
  },
  watch: {
    'board.creating': function (open) {
      if (open) {
        this.form = blankForm()
        this.error = ''
        window.addEventListener('keydown', this.onKey)
      } else window.removeEventListener('keydown', this.onKey)
    },
  },
  beforeDestroy: function () { window.removeEventListener('keydown', this.onKey) },
  methods: {
    closeCreate: closeCreate,
    categoryTheme: categoryTheme,
    segmentClass: function (active) { return active ? 'bg-colliers-primary text-white' : 'text-slate-500 hover:text-slate-800' },
    onKey: function (event) { if (event.key === 'Escape' && board.creating) closeCreate() },
    save: function () {
      const title = this.form.title.trim()
      if (!title) {
        this.error = 'Give it a title.'
        return
      }
      addTicket(Object.assign({}, this.form, {
        title: title,
        description: this.form.description.trim(),
        acceptanceCriteria: this.form.acceptanceCriteria.slice(),
      }))
    },
  },
}
</script>
