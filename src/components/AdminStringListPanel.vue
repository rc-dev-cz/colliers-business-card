<template>
  <div class="colliers-list-panel" :class="{ 'colliers-list-panel--viewport': viewportFill }">
    <div class="mb-4 flex gap-2">
      <label class="sr-only" for="admin-string-list-add">{{ placeholder }}</label>
      <input
        id="admin-string-list-add"
        v-model="newValue"
        type="text"
        class="flex-1 rounded-[4px] border border-gray-300 bg-white px-3 py-2 text-[14px] focus:border-colliers-primary focus:outline-none focus:ring-1 focus:ring-colliers-primary"
        :placeholder="placeholder"
        @keydown.enter.prevent="onAdd"
      />
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-[4px] bg-colliers-primary px-4 py-2 text-white transition-colors hover:bg-colliers-primary-hover"
        :aria-label="addLabel"
        @click="onAdd"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>

    <div v-if="sortedItems.length" class="colliers-list-panel-scroll">
      <ul class="space-y-2">
      <li
        v-for="(item, index) in sortedItems"
        :key="item + '-' + index"
        class="colliers-list-row group"
      >
        <div v-if="editingKey === item" class="flex w-full gap-2">
          <input
            ref="editInput"
            v-model="editValue"
            type="text"
            class="flex-1 rounded-[4px] border border-colliers-primary bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-colliers-primary"
            @keydown.enter.prevent="saveEdit"
            @keydown.esc.prevent="cancelEdit"
          />
          <button
            type="button"
            class="rounded bg-colliers-primary p-1.5 text-white transition-colors hover:bg-colliers-primary-hover"
            :aria-label="t('save')"
            @click="saveEdit"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
          <button
            type="button"
            class="rounded bg-gray-200 p-1.5 text-gray-700 transition-colors hover:bg-gray-300"
            :aria-label="t('cancel')"
            @click="cancelEdit"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <template v-else>
          <span class="colliers-list-row-body text-sm text-gray-800">{{ item }}</span>
          <colliers-list-row-actions
            :edit-label="editLabel"
            :delete-label="deleteLabel"
            @edit="startEdit(item)"
            @delete="onDelete(item)"
          ></colliers-list-row-actions>
        </template>
      </li>
      </ul>
    </div>
    <p v-else class="py-8 text-center text-sm italic text-gray-500">
      {{ emptyLabel }}
    </p>
  </div>
</template>

<script>
import { t } from '../store'
import ColliersListRowActions from './ColliersListRowActions.vue'

export default {
  name: 'AdminStringListPanel',
  components: { ColliersListRowActions },
  props: {
    items: { type: Array, default: function () { return [] } },
    placeholder: { type: String, required: true },
    emptyLabel: { type: String, required: true },
    addLabel: { type: String, required: true },
    editLabel: { type: String, required: true },
    deleteLabel: { type: String, required: true },
    confirmDeleteMessage: { type: String, required: true },
    viewportFill: { type: Boolean, default: false },
  },
  data: function () {
    return {
      newValue: '',
      editingKey: null,
      editValue: '',
    }
  },
  computed: {
    sortedItems: function () {
      return this.items.slice().sort(function (a, b) {
        return String(a).localeCompare(String(b))
      })
    },
  },
  methods: {
    t: t,
    onAdd: function () {
      const value = String(this.newValue || '').trim()
      if (!value) return
      this.$emit('add', value)
      this.newValue = ''
    },
    startEdit: function (item) {
      this.editingKey = item
      this.editValue = item
      const self = this
      this.$nextTick(function () {
        const input = self.$refs.editInput
        const el = Array.isArray(input) ? input[0] : input
        if (el && el.focus) el.focus()
      })
    },
    cancelEdit: function () {
      this.editingKey = null
      this.editValue = ''
    },
    saveEdit: function () {
      const next = String(this.editValue || '').trim()
      if (!next || !this.editingKey) {
        this.cancelEdit()
        return
      }
      this.$emit('update', { oldValue: this.editingKey, newValue: next })
      this.cancelEdit()
    },
    onDelete: function (item) {
      if (window.confirm(this.confirmDeleteMessage)) {
        this.$emit('delete', item)
      }
    },
  },
}
</script>
