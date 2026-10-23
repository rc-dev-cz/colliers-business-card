<template>
  <div
    v-if="open"
    class="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @click.self="onClose"
  >
    <div
      class="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
    >
      <header class="flex shrink-0 items-center justify-between px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
        <h2 :id="titleId" class="text-lg font-bold text-gray-900 sm:text-xl">
          {{ t('addLocation') }}
        </h2>
        <button
          type="button"
          class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          :aria-label="t('close')"
          @click="onClose"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
            />
          </svg>
        </button>
      </header>

      <div class="shrink-0 border-b border-gray-100 px-5 pb-4 sm:px-6">
        <search-field
          ref="search"
          :value="search"
          :placeholder="t('searchAddressesPlaceholder')"
          :aria-label="t('searchAddresses')"
          @input="search = $event"
        ></search-field>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-6">
        <loading-state v-if="loading" :message="t('loading')"></loading-state>
        <error-state v-else-if="error" :message="error"></error-state>
        <p
          v-else-if="search.trim() && !visibleCount"
          class="py-8 text-center text-sm text-gray-500"
        >
          {{ t('noAddressMatches') }}
        </p>
        <template v-else>
          <section v-for="group in visibleGroups" :key="group.key" class="pt-4">
            <h3
              class="sticky top-0 z-10 -mx-1 mb-2 flex items-center gap-2 bg-white px-1 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              <svg
                class="h-4 w-4 shrink-0 text-colliers-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.75"
                aria-hidden="true"
              >
                <path
                  v-if="group.key === 'personal'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
                <path
                  v-else-if="group.key === 'offices'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              <span>{{ t(group.titleKey) }}</span>
              <span
                class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium normal-case tracking-normal text-gray-600"
                >{{ group.options.length }}</span
              >
            </h3>
            <p v-if="!group.options.length" class="px-1 pb-2 text-sm text-gray-400">
              {{ t(group.emptyKey) }}
            </p>
            <ul v-else class="space-y-2">
              <li v-for="opt in group.options" :key="opt.value">
                <label
                  class="flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors"
                  :class="
                    isChecked(opt.value)
                      ? 'border-colliers-primary/40 bg-[#F3F6FB]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  "
                >
                  <input
                    type="checkbox"
                    class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
                    :checked="isChecked(opt.value)"
                    @change="toggle(opt.value)"
                  />
                  <span class="min-w-0 leading-snug">
                    <span class="block font-medium text-gray-900">{{ opt.name }}</span>
                    <span v-if="opt.detail" class="block text-gray-500">{{ opt.detail }}</span>
                  </span>
                </label>
              </li>
            </ul>
          </section>
        </template>
      </div>

      <footer
        class="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 px-5 py-4 sm:px-6"
      >
        <button
          type="button"
          class="text-left text-sm font-medium text-colliers-primary underline-offset-2 hover:underline"
          @click="goAddressBook"
        >
          + {{ t('addAddressInBook') }}
        </button>
        <div class="flex shrink-0 items-center gap-4">
          <span v-if="selectedLabel" class="text-sm text-gray-500">{{ selectedLabel }}</span>
          <button type="button" class="btn-primary min-w-[7rem]" @click="done">
            {{ t('done') }}
          </button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import LoadingState from './LoadingState.vue'
import ErrorState from './ErrorState.vue'
import SearchField from './SearchField.vue'
import { store, t, loadOffices } from '../store'
import { formatAddressLine, matchesSearch } from '../helpers/addressBook'
import { go } from '../adapters/nav'

var modalCount = 0

function byName(a, b) {
  return String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' })
}

export default {
  name: 'LocationModal',
  components: { LoadingState, ErrorState, SearchField },
  props: {
    open: { type: Boolean, default: false },
    /** Address strings already on the current split — checkboxes start checked. */
    selectedAddresses: {
      type: Array,
      default: function () {
        return []
      },
    },
    personalAddresses: {
      type: Array,
      default: function () {
        return []
      },
    },
    offices: {
      type: Array,
      default: function () {
        return []
      },
    },
  },
  data: function () {
    modalCount += 1
    return {
      titleId: 'location-modal-title-' + modalCount,
      selected: [],
      search: '',
    }
  },
  computed: {
    loading: function () {
      return !!store.officesLoading
    },
    error: function () {
      return store.officesError || ''
    },
    /**
     * My Addresses first, then Office Addresses (same split as the Address Book). An address in
     * both lists shows once, under My Addresses. A ship-to already on the group that is in neither
     * list (renamed or deleted since) shows under Other so it can still be unticked.
     */
    groups: function () {
      var seen = {}
      function rows(list) {
        var out = []
        ;(list || []).forEach(function (row) {
          var value = String(formatAddressLine(row) || '').trim()
          if (!value || seen[value]) return
          seen[value] = true
          out.push({
            value: value,
            name: String(row.addressName || '').trim() || value,
            detail: row.addressName ? value : '',
            row: row,
          })
        })
        return out.sort(byName)
      }
      var personal = rows(this.personalAddresses)
      var offices = rows(this.offices)
      var other = []
      ;(this.selectedAddresses || []).forEach(function (addr) {
        var value = String(addr || '').trim()
        if (!value || seen[value]) return
        seen[value] = true
        other.push({ value: value, name: value, detail: '', row: null })
      })
      return [
        {
          key: 'personal',
          titleKey: 'myAddresses',
          emptyKey: 'noPersonalAddressesShip',
          options: personal,
        },
        { key: 'offices', titleKey: 'officeAddresses', emptyKey: '', options: offices },
        { key: 'other', titleKey: 'otherAddresses', emptyKey: '', options: other },
      ]
    },
    visibleGroups: function () {
      var query = this.search
      var needle = String(query || '')
        .trim()
        .toLowerCase()
      var searching = Boolean(needle)
      return this.groups
        .map(function (group) {
          return Object.assign({}, group, {
            options: group.options.filter(function (opt) {
              if (!searching) return true
              if (opt.row) return matchesSearch(opt.row, query)
              return opt.value.toLowerCase().indexOf(needle) !== -1
            }),
          })
        })
        .filter(function (group) {
          // Keep My Addresses visible (with its hint) when empty, so the order never changes.
          if (group.options.length) return true
          return group.key === 'personal' && !searching
        })
    },
    visibleCount: function () {
      return this.visibleGroups.reduce(function (sum, group) {
        return sum + group.options.length
      }, 0)
    },
    selectedLabel: function () {
      if (!this.selected.length) return ''
      return t('selectedCount').replace('{n}', this.selected.length)
    },
  },
  watch: {
    open: function (open) {
      if (!open) return
      this.selected = (this.selectedAddresses || []).slice()
      this.search = ''
      loadOffices(true)
      var self = this
      this.$nextTick(function () {
        var field = self.$refs.search
        var input = field && field.$el && field.$el.querySelector('input')
        if (input) input.focus()
      })
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
    goAddressBook: function () {
      this.$emit('close')
      go('address-book')
    },
  },
}
</script>
