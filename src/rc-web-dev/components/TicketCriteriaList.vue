<template>
  <section class="rounded-xl p-4 ring-1 ring-slate-200/80">
    <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Acceptance criteria</p>
    <ul class="mt-3 space-y-2">
      <li v-for="(item, index) in items" :key="index" class="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80">
        <input type="checkbox" class="mt-1 h-4 w-4" :checked="item.done" @change="toggle(index)">
        <input v-if="editing && editingIndex === index" ref="inputEl" v-model="draftEdit" class="min-w-0 flex-1 rounded-md px-2 py-1 ring-1 ring-colliers-primary/30" @keydown.enter.prevent="saveEdit">
        <span v-else class="min-w-0 flex-1 text-sm" :class="item.done ? 'text-slate-400 line-through' : 'text-slate-700'">{{ item.text }}</span>
        <template v-if="editing">
          <button v-if="editingIndex === index" type="button" class="text-xs font-semibold text-colliers-primary" @click="saveEdit">Done</button>
          <button v-else type="button" class="text-xs font-semibold text-colliers-primary" @click="startEdit(index)">Edit</button>
          <button type="button" class="text-xs font-semibold text-rose-700" @click="remove(index)">Delete</button>
        </template>
      </li>
      <li v-if="editing && adding" class="flex gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-colliers-primary/30">
        <input ref="inputEl" v-model="draftNew" class="min-w-0 flex-1 rounded-md px-2 py-1" placeholder="What must be true?" @keydown.enter.prevent="saveNew">
        <button type="button" class="text-xs font-semibold text-colliers-primary" @click="saveNew">Add</button>
        <button type="button" class="text-xs text-slate-600" @click="reset">Cancel</button>
      </li>
    </ul>
    <p v-if="!items.length && !adding" class="mt-3 text-sm text-slate-400">None yet.</p>
    <button v-if="editing && !adding" type="button" class="mt-3 text-xs font-semibold text-colliers-primary" @click="startAdd">Add</button>
  </section>
</template>

<script>
import { asCriteria } from '../data/devTracker'

export default {
  name: 'TicketCriteriaList',
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: {
    modelValue: { type: Array, default: function () { return [] } },
    editing: { type: Boolean, default: false },
  },
  data: function () {
    return { adding: false, draftNew: '', editingIndex: -1, draftEdit: '' }
  },
  computed: {
    items: function () { return asCriteria(this.modelValue) },
  },
  methods: {
    focusInput: function () {
      this.$nextTick(() => {
        const input = Array.isArray(this.$refs.inputEl) ? this.$refs.inputEl[0] : this.$refs.inputEl
        if (input) input.focus()
      })
    },
    commit: function (list) { this.$emit('update:modelValue', asCriteria(list)) },
    reset: function () {
      this.adding = false
      this.draftNew = ''
      this.editingIndex = -1
      this.draftEdit = ''
    },
    startAdd: function () {
      this.reset()
      this.adding = true
      this.focusInput()
    },
    saveNew: function () {
      const text = this.draftNew.trim()
      if (text) this.commit(this.items.concat({ text: text, done: false }))
      this.reset()
    },
    startEdit: function (index) {
      this.adding = false
      this.editingIndex = index
      this.draftEdit = (this.items[index] && this.items[index].text) || ''
      this.focusInput()
    },
    saveEdit: function () {
      const next = this.items.slice()
      const text = this.draftEdit.trim()
      if (!text) next.splice(this.editingIndex, 1)
      else next.splice(this.editingIndex, 1, Object.assign({}, next[this.editingIndex], { text: text }))
      this.commit(next)
      this.reset()
    },
    remove: function (index) { this.commit(this.items.filter((_, i) => i !== index)) },
    toggle: function (index) {
      const next = this.items.slice()
      next.splice(index, 1, Object.assign({}, next[index], { done: !next[index].done }))
      this.commit(next)
    },
  },
}
</script>
