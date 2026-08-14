<script setup>
import { computed, nextTick, ref } from 'vue'
import { asCriteria } from '../data/devTracker'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  editing: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const adding = ref(false)
const draftNew = ref('')
const editingIndex = ref(-1)
const draftEdit = ref('')
const inputEl = ref(null)

const items = computed(() => asCriteria(props.modelValue))

function bindInput(el) {
  if (el) inputEl.value = el
}

function focusInput() {
  nextTick(() => inputEl.value?.focus())
}

function commit(list) {
  emit('update:modelValue', asCriteria(list))
}

function reset() {
  adding.value = false
  draftNew.value = ''
  editingIndex.value = -1
  draftEdit.value = ''
}

function startAdd() {
  editingIndex.value = -1
  draftEdit.value = ''
  adding.value = true
  draftNew.value = ''
  focusInput()
}

function saveNew() {
  const text = draftNew.value.trim()
  if (!text) {
    adding.value = false
    return
  }
  commit([...items.value, { text, done: false }])
  draftNew.value = ''
  adding.value = false
}

function startEdit(index) {
  adding.value = false
  editingIndex.value = index
  draftEdit.value = items.value[index]?.text || ''
  focusInput()
}

function saveEdit() {
  const index = editingIndex.value
  if (index < 0) return
  const text = draftEdit.value.trim()
  const next = [...items.value]
  if (!text) next.splice(index, 1)
  else next[index] = { ...next[index], text }
  commit(next)
  editingIndex.value = -1
  draftEdit.value = ''
}

function remove(index) {
  commit(items.value.filter((_, i) => i !== index))
  if (editingIndex.value === index) {
    editingIndex.value = -1
    draftEdit.value = ''
  }
}

function toggle(index) {
  const next = [...items.value]
  next[index] = { ...next[index], done: !next[index].done }
  commit(next)
}

defineExpose({ reset })
</script>

<template>
  <section class="rounded-xl p-4 ring-1 ring-slate-200/80">
    <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Acceptance criteria</p>
    <ul class="mt-3 space-y-2">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200/80"
      >
        <label class="flex min-w-0 flex-1 cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            class="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-colliers-primary focus:ring-colliers-primary"
            :checked="item.done"
            :aria-label="item.done ? 'Mark as not done' : 'Mark as done'"
            @change="toggle(index)"
          />
          <span
            v-if="!(editing && editingIndex === index)"
            class="min-w-0 flex-1 text-[14px] leading-6"
            :class="item.done ? 'text-slate-400 line-through' : 'text-slate-700'"
          >
            {{ item.text }}
          </span>
        </label>
        <input
          v-if="editing && editingIndex === index"
          :ref="bindInput"
          v-model="draftEdit"
          type="text"
          class="min-w-0 flex-1 rounded-md border-0 bg-white px-2 py-1 text-[14px] leading-6 text-slate-700 ring-1 ring-colliers-primary/30 focus:outline-none focus:ring-2 focus:ring-colliers-primary"
          @keydown.enter.prevent="saveEdit"
        />
        <span v-if="editing" class="flex shrink-0 items-center gap-1">
          <template v-if="editingIndex === index">
            <button
              type="button"
              class="rounded-md bg-colliers-primary px-2 py-1 text-[12px] font-semibold text-white hover:bg-colliers-primary-hover"
              @click="saveEdit"
            >
              Done
            </button>
            <button type="button" class="rounded-md px-2 py-1 text-[12px] font-medium text-slate-600 hover:bg-white" @click="reset">
              Cancel
            </button>
          </template>
          <template v-else>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[12px] font-semibold text-colliers-primary hover:bg-white"
              @click="startEdit(index)"
            >
              Edit
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-1 text-[12px] font-semibold text-rose-700 hover:bg-rose-50"
              @click="remove(index)"
            >
              Delete
            </button>
          </template>
        </span>
      </li>
      <li
        v-if="editing && adding"
        class="flex items-start gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-colliers-primary/30"
      >
        <span class="mt-1.5 h-4 w-4 shrink-0 rounded border border-slate-200" aria-hidden="true" />
        <input
          :ref="bindInput"
          v-model="draftNew"
          type="text"
          placeholder="What must be true?"
          class="min-w-0 flex-1 rounded-md border-0 bg-slate-50 px-2 py-1 text-[14px] leading-6 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-colliers-primary"
          @keydown.enter.prevent="saveNew"
        />
        <button
          type="button"
          class="rounded-md bg-colliers-primary px-2 py-1 text-[12px] font-semibold text-white hover:bg-colliers-primary-hover"
          @click="saveNew"
        >
          Add
        </button>
        <button type="button" class="rounded-md px-2 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-50" @click="reset">
          Cancel
        </button>
      </li>
    </ul>
    <p v-if="!items.length && !adding" class="mt-3 text-sm text-slate-400">None yet.</p>
    <button
      v-if="editing && !adding"
      type="button"
      class="mt-3 inline-flex items-center rounded-md px-2.5 py-1.5 text-[12px] font-semibold text-colliers-primary ring-1 ring-colliers-primary/25 hover:bg-colliers-primary/5"
      @click="startAdd"
    >
      Add
    </button>
  </section>
</template>
