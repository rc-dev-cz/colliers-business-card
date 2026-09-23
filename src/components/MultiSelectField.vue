<template>
  <div class="relative" v-click-outside="close">
    <label v-if="label" class="field-label">{{ label }}</label>
    <button
      type="button"
      class="field-input flex w-full items-center justify-between text-left"
      :disabled="disabled"
      :aria-expanded="open ? 'true' : 'false'"
      @click="toggle"
    >
      <span :class="selectedValues.length ? 'text-gray-900' : 'text-gray-400'">{{ placeholder }}</span>
      <span class="ml-2 shrink-0 text-gray-400" aria-hidden="true">▾</span>
    </button>
    <div
      v-if="open"
      class="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border border-gray-200 bg-white shadow-lg"
    >
      <div class="sticky top-0 border-b border-gray-100 bg-white p-2">
        <input
          ref="search"
          v-model="query"
          type="search"
          class="field-input py-2"
          :placeholder="searchPlaceholder || placeholder"
          @click.stop
        />
      </div>
      <ul class="py-1" role="listbox">
        <li v-if="!filteredOptions.length" class="px-3 py-2 text-sm text-gray-500">{{ emptyLabel }}</li>
        <li
          v-for="option in filteredOptions"
          :key="optionValue(option)"
          class="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          role="option"
          :aria-selected="isSelected(option) ? 'true' : 'false'"
          :class="isLocked(option) ? 'cursor-not-allowed opacity-40' : ''"
          @click.stop="toggleOption(option)"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-colliers-primary focus:ring-colliers-primary"
            :checked="isSelected(option)"
            :disabled="isLocked(option)"
            tabindex="-1"
            @click.stop.prevent="toggleOption(option)"
          />
          <span>{{ optionLabel(option) }}</span>
        </li>
      </ul>
    </div>
    <div v-if="selectedValues.length" class="mt-2 flex flex-wrap gap-2">
      <span
        v-for="item in selectedValues"
        :key="item"
        class="inline-flex items-center gap-1 rounded-md bg-[#E8EEF7] px-2.5 py-1 text-sm text-[#24418A]"
      >
        {{ item }}
        <button
          type="button"
          class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded text-[#24418A] hover:bg-[#d4deef]"
          :aria-label="'Remove ' + item"
          @click="remove(item)"
        >×</button>
      </span>
    </div>
    <p v-if="hint" class="field-hint">{{ hint }}</p>
    <p v-if="error" class="field-hint text-red-600">{{ error }}</p>
  </div>
</template>

<script>
var ClickOutside = {
  bind: function (el, binding) {
    el.__clickOutsideHandler = function (event) {
      if (!el.contains(event.target)) binding.value(event)
    }
    document.addEventListener('click', el.__clickOutsideHandler)
  },
  unbind: function (el) {
    document.removeEventListener('click', el.__clickOutsideHandler)
    delete el.__clickOutsideHandler
  },
}

export default {
  name: 'MultiSelectField',
  directives: {
    'click-outside': ClickOutside,
  },
  props: {
    value: { type: Array, default: function () { return [] } },
    label: { type: String, default: '' },
    options: { type: Array, default: function () { return [] } },
    optionValueKey: { type: String, default: 'value' },
    optionLabelKey: { type: String, default: 'label' },
    placeholder: { type: String, default: '' },
    searchPlaceholder: { type: String, default: '' },
    emptyLabel: { type: String, default: 'No matches' },
    disabled: { type: Boolean, default: false },
    hint: { type: String, default: '' },
    error: { type: String, default: '' },
    max: { type: Number, default: 0 },
  },
  data: function () {
    return {
      open: false,
      query: '',
    }
  },
  computed: {
    selectedValues: function () {
      return Array.isArray(this.value) ? this.value.slice() : []
    },
    filteredOptions: function () {
      var q = String(this.query || '').trim().toLowerCase()
      var self = this
      if (!q) return this.options
      return this.options.filter(function (option) {
        return String(self.optionLabel(option)).toLowerCase().indexOf(q) !== -1
      })
    },
  },
  methods: {
    optionValue: function (option) {
      if (option && typeof option === 'object') return option[this.optionValueKey]
      return option
    },
    optionLabel: function (option) {
      if (option && typeof option === 'object') return option[this.optionLabelKey]
      return option
    },
    isSelected: function (option) {
      return this.selectedValues.indexOf(this.optionValue(option)) !== -1
    },
    isLocked: function (option) {
      return this.max > 0 && this.selectedValues.length >= this.max && !this.isSelected(option)
    },
    toggle: function () {
      if (this.disabled) return
      this.open = !this.open
      if (this.open) {
        var self = this
        this.$nextTick(function () {
          if (self.$refs.search) self.$refs.search.focus()
        })
      }
    },
    close: function () {
      this.open = false
      this.query = ''
    },
    emitValues: function (next) {
      this.$emit('input', next)
    },
    toggleOption: function (option) {
      var val = this.optionValue(option)
      var next = this.selectedValues.slice()
      var idx = next.indexOf(val)
      if (idx === -1) {
        if (this.max > 0 && next.length >= this.max) return
        next.push(val)
      } else next.splice(idx, 1)
      this.emitValues(next)
    },
    remove: function (item) {
      this.emitValues(
        this.selectedValues.filter(function (v) {
          return v !== item
        }),
      )
    },
  },
}
</script>
