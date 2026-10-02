<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @click.self="onClose"
  >
    <div class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
      <header class="flex shrink-0 items-center justify-between px-5 pb-2 pt-5 sm:px-6 sm:pt-6">
        <h2 :id="titleId" class="text-lg font-bold text-gray-900 sm:text-xl">
          {{ t('selectOrAddLocation') }}
        </h2>
        <button
          type="button"
          class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('close')"
          @click="onClose"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-6">
        <h3 class="mb-3 text-sm font-semibold text-gray-900">{{ t('savedAddresses') }}</h3>
        <loading-state v-if="loading" :message="t('loading')"></loading-state>
        <error-state v-else-if="error" :message="error"></error-state>
        <p v-else-if="!options.length" class="py-6 text-center text-sm text-gray-400">
          {{ t('noShipToAddresses') }}
        </p>
        <ul v-else class="max-h-64 space-y-2 overflow-y-auto pr-1">
          <li v-for="opt in options" :key="opt.value">
            <label
              class="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                :checked="isChecked(opt.value)"
                @change="toggle(opt.value)"
              />
              <span class="min-w-0 leading-snug">{{ opt.label }}</span>
            </label>
          </li>
        </ul>
      </div>

      <footer class="flex shrink-0 justify-end border-t border-gray-100 px-5 py-4 sm:px-6">
        <button type="button" class="btn-split min-w-[7rem]" @click="done">
          {{ t('done') }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import LoadingState from './LoadingState.vue'
import ErrorState from './ErrorState.vue'
import { store, t, loadOffices } from '../store'
import { formatAddressLine, officeLabel } from '../adapters/api'

var modalCount = 0

export default {
  name: 'LocationModal',
  components: { LoadingState, ErrorState },
  props: {
    open: { type: Boolean, default: false },
    /** Address strings already on the current split — checkboxes start checked. */
    selectedAddresses: { type: Array, default: function () { return [] } },
    personalAddresses: { type: Array, default: function () { return [] } },
    offices: { type: Array, default: function () { return [] } },
  },
  data: function () {
    modalCount += 1
    return {
      titleId: 'location-modal-title-' + modalCount,
      selected: [],
    }
  },
  computed: {
    loading: function () {
      return !!store.officesLoading
    },
    error: function () {
      return store.officesError || ''
    },
    options: function () {
      var self = this
      var seen = {}
      var list = []
      function push(value, label) {
        var key = String(value || '').trim()
        if (!key || seen[key]) return
        seen[key] = true
        list.push({ value: key, label: label || key })
      }
      ;(this.personalAddresses || []).forEach(function (row) {
        push(formatAddressLine(row), officeLabel(row))
      })
      ;(this.offices || []).forEach(function (row) {
        push(formatAddressLine(row), officeLabel(row))
      })
      ;(this.selectedAddresses || []).forEach(function (addr) {
        push(addr, addr)
      })
      list.sort(function (a, b) {
        var aSel = self.selected.indexOf(a.value) !== -1 ? 0 : 1
        var bSel = self.selected.indexOf(b.value) !== -1 ? 0 : 1
        if (aSel !== bSel) return aSel - bSel
        return String(a.label).localeCompare(String(b.label), undefined, { sensitivity: 'base' })
      })
      return list
    },
  },
  watch: {
    open: function (open) {
      if (!open) return
      this.selected = (this.selectedAddresses || []).slice()
      loadOffices()
    },
  },
  methods: {
    t: t,
    isChecked: function (value) {
      return this.selected.indexOf(value) !== -1
    },
    toggle: function (value) {
      if (this.isChecked(value)) {
        this.selected = this.selected.filter(function (row) {
          return row !== value
        })
        return
      }
      this.selected = this.selected.concat([value])
    },
    done: function () {
      var selected = this.selected.slice()
      this.$emit('done', selected)
    },
    onClose: function () {
      this.$emit('close')
    },
  },
}
</script>
