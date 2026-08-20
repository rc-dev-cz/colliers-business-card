<template>
  <div v-if="ticket" class="ticket-modal-root fixed inset-0 z-[1100] flex items-start justify-center overflow-y-auto bg-slate-900/45 p-4 sm:items-center" @click.self="cancelView">
    <article class="ticket-sheet relative my-auto max-h-[min(92vh,56rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div class="h-1.5" :style="{ background: column.accent }"></div>
      <header class="flex items-start justify-between gap-4 px-6 pt-5">
        <div class="min-w-0 flex-1">
          <div class="flex gap-2"><span class="font-mono text-xs font-semibold text-colliers-primary">{{ ticket.id }}</span><span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{{ ticket.status }}</span></div>
          <input v-if="editing" v-model="form.title" class="mt-2 w-full text-2xl font-semibold focus:outline-none">
          <h2 v-else class="mt-2 text-2xl font-semibold text-slate-900">{{ ticket.title }}</h2>
          <p v-if="error" class="mt-1 text-sm text-rose-600">{{ error }}</p>
        </div>
        <button type="button" class="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100" @click="cancelView">×</button>
      </header>
      <div v-if="editing" class="mt-5 space-y-4 px-6">
        <label class="block text-xs font-semibold text-colliers-primary">Priority
          <select v-model="form.priority" class="mt-1 block w-full rounded-md border border-slate-200 p-2"><option v-for="(label, value) in priorityLabels" :key="value" :value="value">{{ label }}</option></select>
        </label>
        <label class="block text-xs font-semibold text-colliers-primary">Category
          <select v-model="form.category" class="mt-1 block w-full rounded-md border border-slate-200 p-2"><option v-for="category in categories" :key="category">{{ category }}</option></select>
        </label>
        <label class="flex items-center gap-2 text-sm"><input v-model="form.blocked" type="checkbox"> Blocked</label>
        <input v-if="form.blocked" v-model="form.blockedReason" class="w-full rounded-md border border-slate-200 p-2" placeholder="Waiting for…">
      </div>
      <section class="mx-6 mt-5 rounded-xl bg-slate-50 p-4">
        <textarea v-if="editing" v-model="form.description" rows="4" class="w-full resize-none bg-transparent focus:outline-none"></textarea>
        <template v-else><p class="text-xs font-semibold uppercase text-slate-400">Description</p><p class="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">{{ ticket.description }}</p></template>
      </section>
      <ticket-criteria-list class="mx-6 mt-4" v-model="form.acceptanceCriteria" :editing="editing" @update:modelValue="onCriteriaUpdate"></ticket-criteria-list>
      <label v-if="editing || ticket.notes" class="mx-6 mt-4 block rounded-xl p-4 ring-1 ring-slate-200">
        <span class="text-xs font-semibold uppercase text-slate-400">Notes</span>
        <textarea v-if="editing" v-model="form.notes" rows="3" class="mt-2 w-full resize-none focus:outline-none"></textarea>
        <p v-else class="mt-2 whitespace-pre-wrap text-sm text-slate-600">{{ ticket.notes }}</p>
      </label>
      <footer class="flex items-center gap-3 px-6 py-5">
        <button v-if="!editing" type="button" class="text-sm text-colliers-primary" @click="startEdit">Edit ticket</button>
        <button v-if="!editing" type="button" class="text-sm text-rose-700" @click="confirmRemove">Delete ticket</button>
        <div class="ml-auto flex gap-3">
          <button type="button" class="text-sm text-slate-600" @click="editing ? cancelEdit() : cancelView()">Cancel</button>
          <button type="button" class="btn-primary disabled:opacity-40" :disabled="saving" @click="saveTicket">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </footer>
    </article>
  </div>
</template>

<script>
import { CATEGORIES, DEFAULT_ASSIGNEE, PRIORITY_LABEL, STATUS_COLUMNS, asCriteria, asRelatedIds } from '../data/devTracker'
import { updateTicket, persistTicket, setAcceptanceCriteria, hasUnsaved, revertUnsaved, removeTicket } from '../board'
import TicketCriteriaList from './TicketCriteriaList.vue'

function formFrom(ticket) {
  return {
    title: ticket.title || '', description: ticket.description || '', priority: ticket.priority || 'medium',
    assignee: ticket.assignee || DEFAULT_ASSIGNEE, category: ticket.category || 'Technical',
    relatedIds: asRelatedIds(ticket.relatedIds, ticket.id), blocked: Boolean(ticket.blocked),
    blockedReason: ticket.blockedReason || '', notes: ticket.notes || '', acceptanceCriteria: asCriteria(ticket.acceptanceCriteria),
  }
}

export default {
  name: 'TicketModal',
  components: { TicketCriteriaList },
  props: { ticket: { type: Object, default: null } },
  data: function () {
    return { editing: false, saving: false, error: '', form: { acceptanceCriteria: [] }, categories: CATEGORIES, priorityLabels: PRIORITY_LABEL }
  },
  computed: {
    column: function () { return STATUS_COLUMNS.find((item) => item.id === this.ticket.status) || STATUS_COLUMNS[0] },
  },
  watch: {
    ticket: {
      immediate: true,
      handler: function (ticket) {
        this.editing = false
        this.error = ''
        if (ticket) this.form = formFrom(ticket)
      },
    },
  },
  methods: {
    startEdit: function () { this.form = formFrom(this.ticket); this.editing = true },
    cancelEdit: function () { this.form = formFrom(this.ticket); this.editing = false },
    cancelView: function () {
      if (hasUnsaved(this.ticket.id)) revertUnsaved(this.ticket.id)
      this.$emit('close')
    },
    onCriteriaUpdate: function (list) {
      this.form.acceptanceCriteria = asCriteria(list)
      if (!this.editing) setAcceptanceCriteria(this.ticket.id, list)
    },
    saveTicket: async function () {
      if (this.saving) return
      if (this.editing) {
        const title = this.form.title.trim()
        if (!title) { this.error = 'Give it a title.'; return }
        updateTicket(this.ticket.id, Object.assign({}, this.form, { title: title, fresh: false }))
      }
      this.saving = true
      try {
        await persistTicket(this.ticket.id)
        this.$emit('saved', this.ticket.id)
        this.$emit('close')
      } catch (error) {
        this.error = (error && error.message) || 'Could not save to the database.'
      } finally { this.saving = false }
    },
    confirmRemove: async function () {
      if (!window.confirm('Delete ' + this.ticket.id + '?')) return
      try {
        await removeTicket(this.ticket.id)
        this.$emit('deleted', this.ticket.id)
        this.$emit('close')
      } catch (error) { this.error = (error && error.message) || 'Could not delete the ticket.' }
    },
  },
}
</script>
