<template>
  <div>
    <label v-if="label" class="field-label">{{ label }}</label>
    <div class="flex overflow-hidden rounded border border-gray-300 focus-within:border-colliers-primary focus-within:ring-1 focus-within:ring-colliers-primary">
      <span class="flex shrink-0 items-center bg-gray-100 px-3 text-[14px] text-gray-600">+1</span>
      <input
        :value="display"
        type="tel"
        inputmode="numeric"
        autocomplete="tel-national"
        class="w-full border-0 px-3 py-2.5 text-[14px] focus:outline-none focus:ring-0"
        :placeholder="placeholder"
        maxlength="12"
        @input="onInput"
      />
    </div>
    <p v-if="hint" class="field-hint">{{ hint }}</p>
  </div>
</template>

<script>
import { digitsOnly, formatCanadianLocal } from '../helpers/validate'

export default {
  name: 'PhoneField',
  props: {
    value: { type: String, default: '' },
    label: { type: String, default: '' },
    hint: { type: String, default: '' },
    placeholder: { type: String, default: '416 555-1234' },
  },
  computed: {
    display: function () {
      const digits = digitsOnly(this.value.replace(/^\+1\s?/, ''))
      return formatCanadianLocal(digits)
    },
  },
  methods: {
    onInput: function (event) {
      const digits = digitsOnly(event.target.value)
      this.$emit('input', digits ? '+1 ' + formatCanadianLocal(digits) : '')
    },
  },
}
</script>
